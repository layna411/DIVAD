import React, { createContext, useContext, useState, useEffect } from 'react';
import { TherapistUser } from '../types';
import { DataService } from '../services/firebase/dataService';

interface AuthContextType {
  therapist: TherapistUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<TherapistUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [therapist, setTherapist] = useState<TherapistUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Logged in by default for seamless workflow
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load therapist session
    const user = DataService.getTherapistUser();
    setTherapist(user);
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  const login = async (email: string, _pass: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate auth check / Firebase auth
    await new Promise((r) => setTimeout(r, 400));
    const user = DataService.getTherapistUser();
    user.email = email;
    DataService.updateTherapistUser(user);
    setTherapist(user);
    setIsAuthenticated(true);
    setIsLoading(false);
    return true;
  };

  const logout = async () => {
    setIsAuthenticated(false);
    setTherapist(null);
  };

  const updateProfile = (partial: Partial<TherapistUser>) => {
    const updated = DataService.updateTherapistUser(partial);
    setTherapist(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        therapist,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateProfile,
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

