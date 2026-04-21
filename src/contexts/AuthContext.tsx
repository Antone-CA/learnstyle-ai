import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authAPI, profileAPI, assessmentAPI, type APIUser } from '@/lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  learningStyle?: 'Visual' | 'Auditory' | 'Read/Write' | 'Kinesthetic';
  matchPercentage?: number;
  lastScore?: number;
  assessmentDate?: string;
  streak?: number;
  lessonsCompleted?: number;
  courseCompletion?: number;
  varkScores?: { Visual: number; Auditory: number; 'Read/Write': number; Kinesthetic: number };
  assessmentHistory?: { date: string; style: string; score: number }[];
  createdAt?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserProfile | null;
  accounts: UserProfile[];
  login: (email: string, password: string) => Promise<UserProfile | null>;
  signup: (name: string, email: string, password: string, role: UserProfile['role']) => Promise<UserProfile | null>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeAssessment: (learningStyle: string, varkScores: Record<string, number>, matchPercentage: number, score: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  accounts: [],
  login: async () => null,
  signup: async () => null,
  logout: () => {},
  updateProfile: async () => {},
  completeAssessment: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface LocalAccount extends UserProfile {
  password: string;
}

const LOCAL_ACCOUNTS_KEY = 'demoAccounts';

const DEFAULT_LOCAL_ACCOUNTS: LocalAccount[] = [
  {
    id: 'demo-student',
    name: 'Demo Student',
    email: 'student@test.com',
    password: 'password123',
    role: 'student',
    streak: 4,
    lessonsCompleted: 12,
    courseCompletion: 38,
  },
  {
    id: 'demo-instructor',
    name: 'Demo Instructor',
    email: 'instructor@test.com',
    password: 'instructor123',
    role: 'instructor',
  },
  {
    id: 'demo-admin',
    name: 'Demo Admin',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
  },
];

function toUserProfile(account: LocalAccount): UserProfile {
  const { password: _password, ...profile } = account;
  return profile;
}

function readLocalAccounts(): LocalAccount[] {
  const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(DEFAULT_LOCAL_ACCOUNTS));
    return DEFAULT_LOCAL_ACCOUNTS;
  }

  try {
    const parsed = JSON.parse(raw) as LocalAccount[];
    return parsed;
  } catch {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(DEFAULT_LOCAL_ACCOUNTS));
    return DEFAULT_LOCAL_ACCOUNTS;
  }
}

function writeLocalAccounts(accounts: LocalAccount[]): void {
  localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Request failed. Please try again.';
}

function isNetworkError(message: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('failed to fetch') ||
    normalized.includes('networkerror') ||
    normalized.includes('network request failed') ||
    normalized.includes('load failed')
  );
}

function apiUserToProfile(u: APIUser): UserProfile {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    role: u.role,
    learningStyle: u.learning_style as UserProfile['learningStyle'],
    matchPercentage: u.match_percentage,
    lastScore: u.last_score,
    assessmentDate: u.assessment_date,
    streak: u.streak,
    lessonsCompleted: u.lessons_completed,
    courseCompletion: u.course_completion,
    varkScores: u.varkScores,
    assessmentHistory: u.assessmentHistory,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<UserProfile[]>([]);

  useEffect(() => {
    const localAccounts = readLocalAccounts();
    setAccounts(localAccounts.map(toUserProfile));

    const savedUser = localStorage.getItem('currentUser');
    const token = localStorage.getItem('access_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      profileAPI.get().then(apiUser => {
        const profile = apiUserToProfile(apiUser);
        setUser(profile);
        localStorage.setItem('currentUser', JSON.stringify(profile));
      }).catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('currentUser');
        setUser(null);
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile | null> => {
    try {
      const res = await authAPI.login(email, password);
      localStorage.setItem('access_token', res.access);
      localStorage.setItem('refresh_token', res.refresh);
      const profile = apiUserToProfile(res.user);
      setUser(profile);
      localStorage.setItem('currentUser', JSON.stringify(profile));
      return profile;
    } catch (error) {
      const message = getErrorMessage(error);
      const localAccounts = readLocalAccounts();
      const localAccount = localAccounts.find(
        (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
      );

      if (localAccount) {
        const profile = toUserProfile(localAccount);
        setUser(profile);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.setItem('currentUser', JSON.stringify(profile));
        return profile;
      }

      if (isNetworkError(message)) {
        throw new Error('Cannot reach auth server. Check backend connection or use a local demo account.');
      }

      throw new Error(message);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserProfile['role']): Promise<UserProfile | null> => {
    try {
      const res = await authAPI.register(name, email, password, role);
      localStorage.setItem('access_token', res.access);
      localStorage.setItem('refresh_token', res.refresh);
      const profile = apiUserToProfile(res.user);
      setUser(profile);
      localStorage.setItem('currentUser', JSON.stringify(profile));
      return profile;
    } catch (error) {
      const message = getErrorMessage(error);
      if (!isNetworkError(message)) {
        throw new Error(message);
      }

      const localAccounts = readLocalAccounts();
      const exists = localAccounts.some(
        (account) => account.email.toLowerCase() === email.toLowerCase()
      );
      if (exists) {
        throw new Error('Email is already registered.');
      }

      const newAccount: LocalAccount = {
        id: `local-${Date.now()}`,
        name,
        email,
        password,
        role,
        streak: 0,
        lessonsCompleted: 0,
        courseCompletion: 0,
      };
      const nextAccounts = [...localAccounts, newAccount];
      writeLocalAccounts(nextAccounts);
      setAccounts(nextAccounts.map(toUserProfile));

      const profile = toUserProfile(newAccount);
      setUser(profile);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.setItem('currentUser', JSON.stringify(profile));
      return profile;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    const backendUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) backendUpdates['first_name'] = updates.name.split(' ')[0];
    if (updates.streak !== undefined) backendUpdates['streak'] = updates.streak;
    if (updates.lessonsCompleted !== undefined) backendUpdates['lessons_completed'] = updates.lessonsCompleted;
    if (updates.courseCompletion !== undefined) backendUpdates['course_completion'] = updates.courseCompletion;

    try {
      const apiUser = await profileAPI.patch(backendUpdates as Partial<APIUser>);
      const updated = apiUserToProfile(apiUser);
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    } catch {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    }
  };

  const completeAssessment = async (
    learningStyle: string,
    varkScores: Record<string, number>,
    matchPercentage: number,
    score: number
  ): Promise<void> => {
    try {
      const apiUser = await assessmentAPI.submit({ learningStyle, matchPercentage, score, varkScores });
      const updated = apiUserToProfile(apiUser);
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    } catch {
      if (!user) return;
      const updated: UserProfile = {
        ...user,
        learningStyle: learningStyle as UserProfile['learningStyle'],
        matchPercentage,
        lastScore: score,
        assessmentDate: new Date().toISOString().split('T')[0],
        varkScores: varkScores as UserProfile['varkScores'],
      };
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn: !!user,
      user,
      accounts,
      login,
      signup,
      logout,
      updateProfile,
      completeAssessment,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
