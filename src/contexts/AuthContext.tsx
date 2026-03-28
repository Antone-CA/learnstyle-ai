import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  role: 'student' | 'faculty';
  learningStyle?: 'Visual' | 'Auditory' | 'Read/Write' | 'Kinesthetic';
  confidenceScore?: number;
  assessmentDate?: string;
  assessmentHistory?: { date: string; style: string; score: number }[];
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (user: UserProfile) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
  updateProfile: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = (userData: UserProfile) => setUser(userData);
  const logout = () => setUser(null);
  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
