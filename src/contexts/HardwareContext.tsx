import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { HardwareStatus, SensorEvent, SensorEventType } from '../types';
import { HardwareManager, SensorEventCallback } from '../hardware/HardwareManager';
import { SimulatedHardwareManager } from '../hardware/SimulatedHardwareManager';
import { BluetoothHardwareManager } from '../hardware/BluetoothHardwareManager';
import { WebSocketHardwareManager } from '../hardware/WebSocketHardwareManager';

interface HardwareContextType {
  manager: HardwareManager;
  status: HardwareStatus;
  history: SensorEvent[];
  providerType: 'simulation' | 'ble' | 'websocket';
  isWebBluetoothSupported: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  switchProvider: (type: 'simulation' | 'ble' | 'websocket') => Promise<void>;
  emitSimulatedEvent: (event: SensorEventType, payload?: Record<string, any>) => void;
  sendCommand: (cmd: number | string | Uint8Array) => Promise<boolean>;
  clearHistory: () => void;
  subscribeToEvents: (cb: SensorEventCallback) => () => void;
}

const HardwareContext = createContext<HardwareContextType | undefined>(undefined);

export const HardwareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check Web Bluetooth support
  const isWebBluetoothSupported = typeof navigator !== 'undefined' && 'bluetooth' in navigator;

  // Default to original physical BLE hardware manager
  const [providerType, setProviderType] = useState<'simulation' | 'ble' | 'websocket'>('ble');
  const managerRef = useRef<HardwareManager>(new BluetoothHardwareManager());
  const [status, setStatus] = useState<HardwareStatus>(managerRef.current.getStatus());
  const [history, setHistory] = useState<SensorEvent[]>([]);
  const listenersRef = useRef<Set<SensorEventCallback>>(new Set());

  // Setup listeners on active manager
  const bindManagerListeners = useCallback((mgr: HardwareManager) => {
    const unsubStatus = mgr.onStatusChange((newStatus) => {
      setStatus({ ...newStatus });
    });

    const unsubEvent = mgr.onEvent((event) => {
      setHistory(mgr.getEventHistory());
      // Broadcast to all active subscribers
      listenersRef.current.forEach((cb) => {
        try {
          cb(event);
        } catch (e) {
          console.error('[HardwareContext] Subscriber error:', e);
        }
      });
    });

    return () => {
      unsubStatus();
      unsubEvent();
    };
  }, []);

  useEffect(() => {
    const unbind = bindManagerListeners(managerRef.current);
    setStatus(managerRef.current.getStatus());
    setHistory(managerRef.current.getEventHistory());
    return () => unbind();
  }, [bindManagerListeners]);

  const switchProvider = async (type: 'simulation' | 'ble' | 'websocket') => {
    // Disconnect current
    await managerRef.current.disconnect();

    let newMgr: HardwareManager;
    if (type === 'ble') {
      newMgr = new BluetoothHardwareManager();
    } else if (type === 'websocket') {
      newMgr = new WebSocketHardwareManager();
    } else {
      newMgr = new SimulatedHardwareManager(true);
    }

    managerRef.current = newMgr;
    setProviderType(type);
    bindManagerListeners(newMgr);
    setStatus(newMgr.getStatus());
    setHistory(newMgr.getEventHistory());
  };

  const connect = async (): Promise<boolean> => {
    return await managerRef.current.connect();
  };

  const disconnect = async (): Promise<void> => {
    await managerRef.current.disconnect();
  };

  const emitSimulatedEvent = (event: SensorEventType, payload?: Record<string, any>) => {
    managerRef.current.emitSimulatedEvent(event, payload);
  };

  const sendCommand = async (cmd: number | string | Uint8Array): Promise<boolean> => {
    return await managerRef.current.sendCommand(cmd);
  };

  const clearHistory = () => {
    managerRef.current.clearEventHistory();
    setHistory([]);
  };

  const subscribeToEvents = (cb: SensorEventCallback) => {
    listenersRef.current.add(cb);
    return () => {
      listenersRef.current.delete(cb);
    };
  };

  return (
    <HardwareContext.Provider
      value={{
        manager: managerRef.current,
        status,
        history,
        providerType,
        isWebBluetoothSupported,
        connect,
        disconnect,
        switchProvider,
        emitSimulatedEvent,
        sendCommand,
        clearHistory,
        subscribeToEvents,
      }}
    >
      {children}
    </HardwareContext.Provider>
  );
};

export const useHardware = (): HardwareContextType => {
  const context = useContext(HardwareContext);
  if (!context) {
    throw new Error('useHardware must be used within a HardwareProvider');
  }
  return context;
};

