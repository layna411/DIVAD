import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HardwareProvider } from './contexts/HardwareContext';
import { SessionProvider } from './contexts/SessionContext';
import { WelcomePage } from './pages/WelcomePage';
import { ActivitySelectionPage } from './pages/ActivitySelectionPage';
import { SessionPage } from './pages/SessionPage';
import { TherapistDashboardPage } from './pages/TherapistDashboardPage';
import { HardwareTestPanel } from './components/common/HardwareTestPanel';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HardwareProvider>
          <SessionProvider>
            <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-amber-400 selection:text-slate-900 flex flex-col justify-between">
              <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/activities" element={<ActivitySelectionPage />} />
                <Route path="/session" element={<SessionPage />} />
                <Route path="/therapist" element={<TherapistDashboardPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              {/* Hardware Simulation & ESP32 BLE Testing Floating Panel */}
              <HardwareTestPanel />
            </div>
          </SessionProvider>
        </HardwareProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

