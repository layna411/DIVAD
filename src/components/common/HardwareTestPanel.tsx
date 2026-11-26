import React, { useState } from 'react';
import { useHardware } from '../../contexts/HardwareContext';
import { SensorEventType } from '../../types';
import {
  Bluetooth,
  Radio,
  Battery,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  Volume2,
  Sparkles,
} from 'lucide-react';

export const HardwareTestPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const {
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
  } = useHardware();

  const handleTrigger = (event: SensorEventType) => {
    emitSimulatedEvent(event);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-full shadow-xl font-bold text-xs transition-all transform hover:scale-105 active:scale-95 border ${
            status.isConnected
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700'
          }`}
          title="Connect Physical DIVAD Hardware over BLE"
        >
          <Bluetooth
            className={`w-4 h-4 ${
              status.isConnected ? 'text-white' : 'text-sky-400 animate-pulse'
            }`}
          />
          <span>
            {status.isConnected
              ? `DIVAD Board: Connected ${status.batteryLevel ? `(${status.batteryLevel}%)` : ''}`
              : 'Physical Board: Connect BLE'}
          </span>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status.isConnected ? 'bg-emerald-300 animate-ping' : 'bg-amber-400'
            }`}
          />
        </button>
      )}

      {/* Expanded Modal / Drawer */}
      {isOpen && (
        <div className="w-96 max-w-[calc(100vw-2rem)] bg-slate-950 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <Bluetooth className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-wide text-white">Physical DIVAD Board</h3>
                <p className="text-[10px] text-slate-400">Bluetooth Low Energy (ESP32 Controller)</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto text-xs">
            {/* Primary Physical Board Connection Card */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Hardware Status:</span>
                <span
                  className={`font-black px-2.5 py-1 rounded-full text-[10px] tracking-wider ${
                    status.isConnected
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                  }`}
                >
                  {status.isConnected ? 'BOARD CONNECTED' : 'READY TO PAIR'}
                </span>
              </div>

              {status.deviceName && (
                <div className="flex items-center justify-between text-slate-300 text-xs">
                  <span className="text-slate-400">Paired Device:</span>
                  <span className="font-mono font-bold text-sky-300">{status.deviceName}</span>
                </div>
              )}

              {status.batteryLevel !== null && (
                <div className="flex items-center justify-between text-slate-300 text-xs">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Battery Level:</span>
                  </span>
                  <span className="font-bold text-emerald-400">{status.batteryLevel}%</span>
                </div>
              )}

              {status.firmwareVersion && (
                <div className="flex items-center justify-between text-slate-300 text-xs">
                  <span className="text-slate-400">Firmware:</span>
                  <span className="font-mono text-[11px] text-slate-300">{status.firmwareVersion}</span>
                </div>
              )}

              {status.error && (
                <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-700/60 text-red-200 text-[11px] leading-relaxed">
                  {status.error}
                </div>
              )}

              {!isWebBluetoothSupported && (
                <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-600/50 text-amber-200 flex items-start space-x-2 text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>Web Bluetooth requires Google Chrome or Microsoft Edge on Windows/Android.</div>
                </div>
              )}

              {/* Main Connect / Disconnect Action Button */}
              <div className="pt-1 flex space-x-2">
                {!status.isConnected ? (
                  <button
                    onClick={() => {
                      if (providerType !== 'ble') switchProvider('ble');
                      connect();
                    }}
                    disabled={status.isScanning || !isWebBluetoothSupported}
                    className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs transition flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
                  >
                    <Radio className="w-4 h-4 animate-pulse" />
                    <span>{status.isScanning ? 'Searching for DIVAD Board...' : 'Connect Physical Board'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => disconnect()}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
                  >
                    Disconnect Board
                  </button>
                )}

                <button
                  onClick={() => sendCommand(0xa1)}
                  disabled={!status.isConnected}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 border border-slate-700 transition"
                  title="Test Physical Board Buzzer / Chime"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Physical Board 6-Section Layout Reference */}
            <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Physical Board Fasteners
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-800/60">
                  <span className="w-3 h-3 rounded-md bg-yellow-400" />
                  <span className="font-bold text-slate-200">1. Two Zippers</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-800/60">
                  <span className="w-3 h-3 rounded-md bg-[#8D6E63]" />
                  <span className="font-bold text-slate-200">2. Three Buttons</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-800/60">
                  <span className="w-3 h-3 rounded-md bg-sky-500" />
                  <span className="font-bold text-slate-200">3. Buckle Clasp</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-800/60">
                  <span className="w-3 h-3 rounded-md bg-pink-500" />
                  <span className="font-bold text-slate-200">4. Metal Snaps</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-800/60">
                  <span className="w-3 h-3 rounded-md bg-green-500" />
                  <span className="font-bold text-slate-200">5. Velcro Patch</span>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-800/60">
                  <span className="w-3 h-3 rounded-md bg-red-500" />
                  <span className="font-bold text-slate-200">6. Practice Section</span>
                </div>
              </div>
            </div>

            {/* Optional Diagnostics / Manual Sensor Calibration Accordion */}
            <div className="border-t border-slate-800 pt-3">
              <button
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 hover:text-slate-200 transition py-1"
              >
                <span>Diagnostics & Sensor Calibration</span>
                {showDiagnostics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showDiagnostics && (
                <div className="mt-3 space-y-2 pt-1 animate-fade-in">
                  <p className="text-[10px] text-slate-500">
                    Use these controls to test validation rules or when the physical board is charging:
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleTrigger('ZIPPER_CLOSED')}
                      className="p-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-bold text-[11px] text-left transition"
                    >
                      Zipper Closed (0x11)
                    </button>
                    <button
                      onClick={() => handleTrigger('BUTTON_FASTENED')}
                      className="p-2 rounded-xl bg-amber-700/10 hover:bg-amber-700/20 text-amber-300 border border-amber-700/30 font-bold text-[11px] text-left transition"
                    >
                      Button Fastened (0x01)
                    </button>
                    <button
                      onClick={() => handleTrigger('BUCKLE_LOCKED')}
                      className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold text-[11px] text-left transition"
                    >
                      Buckle Locked (0x41)
                    </button>
                    <button
                      onClick={() => handleTrigger('SNAP_CONNECTED')}
                      className="p-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold text-[11px] text-left transition"
                    >
                      Snap Connected (0x31)
                    </button>
                    <button
                      onClick={() => handleTrigger('VELCRO_ATTACHED')}
                      className="p-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/30 font-bold text-[11px] text-left transition"
                    >
                      Velcro Attached (0x21)
                    </button>
                    <button
                      onClick={() => handleTrigger('RED_FASTENER_COMPLETED')}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 font-bold text-[11px] text-left transition"
                    >
                      Red Fastener (0x51)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Live Events Stream */}
            <div className="border-t border-slate-800 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Live Board Events Log
                </span>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-4 text-slate-600 text-[11px]">
                  No sensor events yet. Operate the physical board to see live events stream here.
                </div>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono text-[10px]">
                  {history.slice(0, 10).map((evt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800/80"
                    >
                      <span className="text-sky-300 font-bold">{evt.event}</span>
                      <span className="text-slate-500">
                        {new Date(evt.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
