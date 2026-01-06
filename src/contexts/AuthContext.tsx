import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Define types that match what the app expects (or close to it)
export interface User {
  id: string;
  user_id: string;
  email?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username?: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const checkUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Auth check failed", error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await api.auth.login({ email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);

      toast({
        title: "Welcome!",
        description: "Successfully signed in to TeamNeuron.",
      });
      return { error: null };
    } catch (error: any) {
      return { error: error };
    }
  };

  const signUp = async (email: string, password: string, username?: string, fullName?: string) => {
    try {
      const data = await api.auth.signup({ email, password, username, fullName });
      localStorage.setItem('token', data.token);
      setUser(data.user);

      toast({
        title: "Welcome!",
        description: "Account created successfully.",
      });
      return { error: null };
    } catch (error: any) {
      return { error: error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
