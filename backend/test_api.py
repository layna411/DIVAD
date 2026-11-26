import subprocess
import time
import urllib.request
import json
import sys

def run_tests():
    print("[Test] Starting FastAPI server on http://127.0.0.1:8000 ...")
    proc = subprocess.Popen([sys.executable, "-m", "backend.run_server"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(3)

    try:
        # 1. Health
        with urllib.request.urlopen("http://127.0.0.1:8000/api/health") as resp:
            health = json.loads(resp.read().decode())
            print("1. HEALTH CHECK:", health)

        # 2. Demo Login
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/auth/demo-login",
            data=b"{}",
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            auth_data = json.loads(resp.read().decode())
            user = auth_data.get("user", {})
            token = auth_data.get("token")
            print(f"2. AUTH SUCCESS: {user.get('displayName')} ({user.get('email')}) | JWT: {token[:20]}...")

        # 3. Children from MySQL
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/children",
            headers={"Authorization": f"Bearer {token}"}
        )
        with urllib.request.urlopen(req) as resp:
            children = json.loads(resp.read().decode())
            print(f"3. CHILDREN IN MYSQL: Retrieved {len(children)} profiles:")
            for c in children:
                print(f"   * {c['name']} - Age {c['age']} | Baseline: Level {c['baselineAssistanceLevel']} | Lang: {c['preferredLanguage']}")

        # 4. Save New Session
        session_payload = json.dumps({
            "id": f"session_test_{int(time.time())}",
            "childId": children[0]["id"],
            "therapistId": user.get("uid"),
            "language": "en",
            "startTime": int(time.time() * 1000),
            "status": "completed",
            "selectedActivities": ["zipper-1", "button-1"],
            "totalStars": 3,
            "badgesEarned": ["Zip Master", "Button Champ"],
            "attempts": [
                {
                    "activityId": "zipper-1",
                    "stepNumber": 1,
                    "timestamp": int(time.time() * 1000),
                    "isCorrect": True,
                    "assistanceLevel": 2,
                    "sensorEventType": "ZIPPER_CLOSED",
                    "durationSeconds": 14,
                    "feedbackGiven": "Great job closing the zipper!"
                }
            ],
            "notes": "Excellent bilateral hand use and zipper pull completion."
        }).encode("utf-8")

        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/sessions",
            data=session_payload,
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            saved_session = json.loads(resp.read().decode())
            print(f"4. SESSION PERSISTENCE: Saved session '{saved_session['id']}' to MySQL with {len(saved_session['attempts'])} attempt(s).")

        # 5. Hardware Status & Sensor Event Log
        log_payload = json.dumps({
            "sessionId": saved_session["id"],
            "eventType": "BUTTON_FASTENED",
            "source": "ble",
            "deviceId": "DIVAD-ESP32-88F4",
            "opcode": 1,
            "rawData": '{"state":"fastened","section":"brown"}'
        }).encode("utf-8")

        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/hardware/log",
            data=log_payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            log_res = json.loads(resp.read().decode())
            print(f"5. BLE SENSOR LOGGED IN MYSQL: Event ID #{log_res['id']} at {log_res['timestamp']}")

        print("\n--> ALL PYTHON + MYSQL BACKEND TESTS PASSED WITH 100% SUCCESS <--")
    finally:
        proc.terminate()

if __name__ == "__main__":
    run_tests()
