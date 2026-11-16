import React, { useState } from 'react';
import { useHardware } from '../../contexts/HardwareContext';
import { SensorEventType } from '../../types';
import {
  Cpu,
  Bluetooth,
  Radio,
  Wifi,
  Battery,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  Volume2,
} from 'lucide-react';

export const HardwareTestPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
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
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-full shadow-lg font-medium text-sm transition-all transform hover:scale-105 active:scale-95 border ${
            status.isConnected
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400'
              : 'bg-slate-800 hover:bg-slate-900 text-slate-200 border-slate-700'
          }`}
          title="Open Hardware Simulation & BLE Testing Panel"
        >
          {providerType === 'ble' ? (
            <Bluetooth className="w-4 h-4 text-sky-400 animate-pulse" />
          ) : providerType === 'websocket' ? (
            <Wifi className="w-4 h-4 text-amber-400" />
          ) : (
            <Cpu className="w-4 h-4 text-emerald-300" />
          )}
          <span>
            {providerType === 'ble' ? 'BLE' : providerType === 'websocket' ? 'WebSocket' : 'Simulated'} Hardware:{' '}
            {status.isConnected ? 'Connected' : 'Offline'}
          </span>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              status.isConnected ? 'bg-emerald-300 animate-ping' : 'bg-red-400'
            }`}
          />
        </button>
      )}

      {/* Expanded Modal / Drawer */}
      {isOpen && (
        <div className="w-96 max-w-[calc(100vw-2rem)] bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm tracking-wide text-white">ESP32 Hardware Panel</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto text-xs">
            {/* Communication Provider Switcher */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Hardware Provider
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-800 rounded-xl border border-slate-700">
                <button
                  onClick={() => switchProvider('simulation')}
                  className={`py-1.5 rounded-lg font-medium transition ${
                    providerType === 'simulation'
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Simulation
                </button>
                <button
                  onClick={() => switchProvider('ble')}
                  className={`py-1.5 rounded-lg font-medium transition flex items-center justify-center space-x-1 ${
                    providerType === 'ble'
                      ? 'bg-sky-500 text-slate-950 font-semibold shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Bluetooth className="w-3.5 h-3.5" />
                  <span>BLE (ESP32)</span>
                </button>
                <button
                  onClick={() => switchProvider('websocket')}
                  className={`py-1.5 rounded-lg font-medium transition ${
                    providerType === 'websocket'
                      ? 'bg-purple-500 text-slate-950 font-semibold shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  WebSocket
                </button>
              </div>

              {!isWebBluetoothSupported && providerType === 'ble' && (
                <div className="mt-2 p-2 rounded-lg bg-amber-950/80 border border-amber-600/50 text-amber-200 flex items-start space-x-2 text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>Web Bluetooth is not supported in this browser. Use Chrome/Edge on Desktop/Android.</div>
                </div>
              )}
            </div>

            {/* Connection Status Box */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Connection Status:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    status.isConnected
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                      : 'bg-red-900/60 text-red-300 border border-red-500/40'
                  }`}
                >
                  {status.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>

              {status.deviceName && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Device Name:</span>
                  <span className="font-mono text-[11px] text-amber-300">{status.deviceName}</span>
                </div>
              )}

              {status.batteryLevel !== null && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Battery:</span>
                  </span>
                  <span className="font-bold text-emerald-400">{status.batteryLevel}%</span>
                </div>
              )}

              {status.firmwareVersion && (
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Firmware:</span>
                  <span className="font-mono text-[10px] text-slate-300">{status.firmwareVersion}</span>
                </div>
              )}

              {status.error && (
                <div className="p-2 rounded bg-red-950/80 border border-red-700 text-red-200 text-[11px]">
                  {status.error}
                </div>
              )}

              {/* Connect / Disconnect Buttons */}
              <div className="pt-1 flex space-x-2">
                {!status.isConnected ? (
                  <button
                    onClick={() => connect()}
                    disabled={status.isScanning}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center justify-center space-x-1"
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>{status.isScanning ? 'Connecting...' : 'Connect Hardware'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => disconnect()}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
                  >
                    Disconnect Device
                  </button>
                )}
                <button
                  onClick={() => sendCommand(0xA1)}
                  disabled={!status.isConnected}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 disabled:opacity-40"
                  title="Test Hardware Buzzer / Melodic Chime"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Manual Sensor Triggering Controls (Matching Physical Sections) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Simulate Board Sensors
                </span>
                <span className="text-[10px] text-amber-400">Click to emit event</span>
              </div>

              <div className="space-y-2">
                {/* Yellow Section - Zipper */}
                <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wide">
                    Yellow Section (Zippers)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleTrigger('ZIPPER_CLOSED')}
                      className="px-2 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition"
                    >
                      ZIPPER_CLOSED
                    </button>
                    <button
                      onClick={() => handleTrigger('ZIPPER_OPENED')}
                      className="px-2 py-1.5 rounded bg-amber-900/60 hover:bg-amber-900 text-amber-200 font-medium text-[11px] border border-amber-700/50 transition"
                    >
                      ZIPPER_OPENED
                    </button>
                  </div>
                </div>

                {/* Brown Section - Buttons */}
                <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-600/50 space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wide">
                    Brown Section (3 Buttons)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleTrigger('BUTTON_FASTENED')}
                      className="px-2 py-1.5 rounded bg-amber-700 hover:bg-amber-600 text-white font-bold text-[11px] transition"
                    >
                      BUTTON_FASTENED
                    </button>
                    <button
                      onClick={() => handleTrigger('BUTTON_UNFASTENED')}
                      className="px-2 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-[11px] border border-stone-600 transition"
                    >
                      BUTTON_UNFASTENED
                    </button>
                  </div>
                </div>

                {/* Blue Section - Buckle */}
                <div className="p-2 rounded-xl bg-sky-950/40 border border-sky-500/40 space-y-1.5">
                  <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wide">
                    Blue Section (Buckle)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleTrigger('BUCKLE_LOCKED')}
                      className="px-2 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] transition"
                    >
                      BUCKLE_LOCKED
                    </button>
                    <button
                      onClick={() => handleTrigger('BUCKLE_UNLOCKED')}
                      className="px-2 py-1.5 rounded bg-sky-900/60 hover:bg-sky-900 text-sky-200 font-medium text-[11px] border border-sky-700/50 transition"
                    >
                      BUCKLE_UNLOCKED
                    </button>
                  </div>
                </div>

                {/* Pink Section - Snaps */}
                <div className="p-2 rounded-xl bg-pink-950/40 border border-pink-500/40 space-y-1.5">
                  <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wide">
                    Pink Section (Snaps)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleTrigger('SNAP_CONNECTED')}
                      className="px-2 py-1.5 rounded bg-pink-500 hover:bg-pink-400 text-slate-950 font-bold text-[11px] transition"
                    >
                      SNAP_CONNECTED
                    </button>
                    <button
                      onClick={() => handleTrigger('SNAP_DISCONNECTED')}
                      className="px-2 py-1.5 rounded bg-pink-900/60 hover:bg-pink-900 text-pink-200 font-medium text-[11px] border border-pink-700/50 transition"
                    >
                      SNAP_DISCONNECTED
                    </button>
                  </div>
                </div>

                {/* Green Section - Velcro */}
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-1.5">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">
                    Green Section (Velcro)
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleTrigger('VELCRO_ATTACHED')}
                      className="px-2 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition"
                    >
                      VELCRO_ATTACHED
                    </button>
                    <button
                      onClick={() => handleTrigger('VELCRO_DETACHED')}
                      className="px-2 py-1.5 rounded bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 font-medium text-[11px] border border-emerald-700/50 transition"
                    >
                      VELCRO_DETACHED
                    </button>
                  </div>
                </div>

                {/* Red Section - Practice */}
                <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-1.5">
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wide">
                    Red Section (Bonus Fastener)
                  </span>
                  <button
                    onClick={() => handleTrigger('RED_FASTENER_COMPLETED')}
                    className="w-full px-2 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition"
                  >
                    RED_FASTENER_COMPLETED
                  </button>
                </div>
              </div>
            </div>

            {/* Event History Stream */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Live Sensor Event Log ({history.length})
                </span>
                <button
                  onClick={clearHistory}
                  className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>

              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 max-h-36 overflow-y-auto font-mono text-[10px] space-y-1">
                {history.length === 0 ? (
                  <div className="text-slate-500 text-center py-3">No sensor events recorded yet</div>
                ) : (
                  history.slice(0, 15).map((ev, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-0.5 border-b border-slate-900 text-slate-300"
                    >
                      <span className="text-amber-400 font-semibold">{ev.event}</span>
                      <span className="text-slate-500 text-[9px]">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

