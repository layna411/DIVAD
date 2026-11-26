import React, { createContext, useContext, useState, useEffect } from 'react';
import { TherapistUser } from '../types';
import { AuthService } from '../services/firebase/authService';

interface AuthContextType {
  therapist: TherapistUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isConfigError: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, pass: string, name: string, organization?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginAsDemo: () => Promise<boolean>;
  startOfflineSession: (name?: string, email?: string) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [therapist, setTherapist] = useState<TherapistUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigError, setIsConfigError] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to Firebase Authentication state
    const unsubscribe = AuthService.subscribeAuthState((user) => {
      setTherapist(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      setIsConfigError(false);
      const user = await AuthService.login(email, pass);
      setTherapist(user);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.warn('[AuthContext] Login error:', err);
      let msg = err.message || 'Login failed';
      if (err.code === 'auth/configuration-not-found' || msg.includes('configuration-not-found') || msg.includes('CONFIG_NOT_FOUND')) {
        setIsConfigError(true);
        msg = 'Authentication service is currently initializing. Please try again or use Instant Demo Sign-In.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No therapist account found with this email.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please try again later.';
      }
      setError(msg);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (
    email: string,
    pass: string,
    name: string,
    organization?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      setIsConfigError(false);
      const user = await AuthService.register(email, pass, name, organization);
      setTherapist(user);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      console.warn('[AuthContext] Registration error:', err);
      let msg = err.message || 'Registration failed';
      if (err.code === 'auth/configuration-not-found' || msg.includes('configuration-not-found') || msg.includes('CONFIG_NOT_FOUND')) {
        setIsConfigError(true);
        msg = 'Authentication service is currently initializing. Please try again or use Instant Demo Sign-In.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setError(msg);
      setIsLoading(false);
      return false;
    }
  };

  const startOfflineSession = (name: string = 'Dr. Sarah Mitchell, OTR/L', email: string = 'therapist@simats.edu') => {
    const offlineUser: TherapistUser = {
      uid: `local_therapist_${Date.now()}`,
      email,
      displayName: name,
      role: 'therapist',
      organization: 'SIMATS Pediatric Occupational Therapy Center',
    };
    localStorage.setItem('divad_offline_therapist', JSON.stringify(offlineUser));
    setTherapist(offlineUser);
    setError(null);
    setIsConfigError(false);
    setIsLoading(false);
  };

  const loginAsDemo = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      setIsConfigError(false);
      const user = await AuthService.loginAsDemo();
      setTherapist(user);
      setIsLoading(false);
      return true;
    } catch {
      startOfflineSession('Dr. Sarah Mitchell, OTR/L', 'therapist@simats.edu');
      return true;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await AuthService.logout();
    setTherapist(null);
    setIsLoading(false);
  };

  const resetPassword = async (email: string) => {
    setError(null);
    await AuthService.resetPassword(email);
  };

  const clearError = () => {
    setError(null);
    setIsConfigError(false);
  };

  return (
    <AuthContext.Provider
      value={{
        therapist,
        isAuthenticated: !!therapist,
        isLoading,
        error,
        isConfigError,
        login,
        register,
        logout,
        resetPassword,
        loginAsDemo,
        startOfflineSession,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
