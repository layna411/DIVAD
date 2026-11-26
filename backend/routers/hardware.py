import time
import json
from typing import List, Set
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import SensorLog
from backend.schemas import SensorLogCreate

router = APIRouter(prefix="/api/hardware", tags=["Hardware & Sensors"])

class HardwareConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)
        for dc in dead_connections:
            self.active_connections.discard(dc)

ws_manager = HardwareConnectionManager()

@router.post("/log")
async def log_sensor_event(req: SensorLogCreate, db: Session = Depends(get_db)):
    now = req.timestamp or int(time.time() * 1000)
    log_entry = SensorLog(
        session_id=req.sessionId,
        event_type=req.eventType,
        source=req.source,
        device_id=req.deviceId,
        opcode=req.opcode,
        raw_data=req.rawData,
        timestamp=now
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    # Broadcast event to any connected WebSockets
    await ws_manager.broadcast({
        "event": req.eventType,
        "source": req.source,
        "deviceId": req.deviceId,
        "timestamp": now,
        "payload": {"opcode": req.opcode, "rawData": req.rawData}
    })

    return {"status": "recorded", "id": log_entry.id, "timestamp": now}

@router.get("/logs")
def get_sensor_logs(limit: int = 50, db: Session = Depends(get_db)):
    logs = db.query(SensorLog).order_by(SensorLog.timestamp.desc()).limit(limit).all()
    return [
        {
            "id": log.id,
            "sessionId": log.session_id,
            "eventType": log.event_type,
            "source": log.source,
            "deviceId": log.device_id,
            "opcode": log.opcode,
            "rawData": log.raw_data,
            "timestamp": log.timestamp
        }
        for log in logs
    ]

@router.get("/status")
def get_hardware_service_status():
    return {
        "service": "DIVAD Hardware Sensor Service",
        "activeWebSockets": len(ws_manager.active_connections),
        "supportedProviders": ["ble", "websocket", "simulation"],
        "esp32BleProtocol": "BLE_HARDWARE_PROTOCOL.md"
    }

@router.websocket("/ws")
async def websocket_hardware_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                parsed = json.loads(data)
                event_name = parsed.get("event")
                if event_name:
                    now = int(time.time() * 1000)
                    log_entry = SensorLog(
                        session_id=parsed.get("sessionId"),
                        event_type=event_name,
                        source=parsed.get("source", "websocket"),
                        device_id=parsed.get("deviceId", "ESP32-WS"),
                        opcode=parsed.get("opcode"),
                        raw_data=json.dumps(parsed.get("payload", {})),
                        timestamp=now
                    )
                    db.add(log_entry)
                    db.commit()

                    # Broadcast to other subscribers
                    await ws_manager.broadcast(parsed)
            except Exception as e:
                print(f"[WebSocket] Error processing message: {e}")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
