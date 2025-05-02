
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate checking for existing session on load
  useEffect(() => {
    const storedUser = localStorage.getItem('tabata_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  // Mock login - replace with Supabase integration later
  const login = async (email: string, password: string) => {
    // Simulate API call for authentication
    setLoading(true);
    
    // For demo purposes - in production use Supabase authentication
    if (email && password) {
      // Mock successful authentication
      const mockUser: User = {
        id: '1',
        email: email,
        role: email.includes('admin') ? 'admin' : email.includes('operator') ? 'operator' : 'viewer'
      };
      
      // Save to local storage for persistence
      localStorage.setItem('tabata_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsLoggedIn(true);
      setLoading(false);
    } else {
      setLoading(false);
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    localStorage.removeItem('tabata_user');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
