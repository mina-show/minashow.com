import React, { createContext, useContext, useState } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  church?: string;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_USERS: Record<string, { user: User; password: string }> = {
  'customer@demo.com': {
    password: 'demo123',
    user: {
      id: 'u1',
      name: 'Mary Hanna',
      email: 'customer@demo.com',
      church: 'St. Mark Church',
      role: 'customer',
    },
  },
  'admin@minashow.com': {
    password: 'admin123',
    user: {
      id: 'admin1',
      name: 'Minashow Admin',
      email: 'admin@minashow.com',
      role: 'admin',
    },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    const record = DEMO_USERS[email.toLowerCase()];
    if (record && record.password === password) {
      setUser(record.user);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAdmin: user?.role === 'admin', isLoggedIn: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
