import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { supabase } from '../lib/supabase'; // Make sure this path is correct

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to generate missing visual data (like avatar/initials)
  // so the rest of the UI doesn't break when switching to real Supabase users
  const mapSupabaseUserToAuthUser = (sbUser: any): AuthUser => {
    const emailStr = sbUser.email || '';
    const nameParts = emailStr.split('@')[0].replace(/[._]/g, ' ').split(' ');
    const fallbackName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Cyber Specialist';
    const fallbackInitials = nameParts.map(p => p.charAt(0).toUpperCase()).slice(0, 2).join('') || 'CS';

    return {
      id: sbUser.id,
      name: sbUser.user_metadata?.full_name || fallbackName,
      email: sbUser.email,
      role: sbUser.user_metadata?.role || 'Admin Staff',
      roleTitle: sbUser.user_metadata?.roleTitle || 'Cyber Events Operations',
      department: sbUser.user_metadata?.department || 'Operations',
      initials: fallbackInitials,
      avatarBg: 'bg-gradient-to-br from-cyan-600 to-indigo-600',
    };
  };

  // Check existing session on mount and listen for auth changes
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(mapSupabaseUserToAuthUser(session.user));
      }
      setIsLoading(false);
    };

    checkActiveSession();

    // Set up real-time listener for login/logout events across tabs
    const { data: authListener } = supabase?.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(mapSupabaseUserToAuthUser(session.user));
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    ) || { data: { subscription: null } };

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (
    email: string, 
    password: string, 
    _remember: boolean = true // Supabase handles remember automatically via local storage persistance
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    
    try {
      if (!supabase) {
        return { success: false, message: 'Supabase client is not initialized.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data?.user) {
        setUser(mapSupabaseUserToAuthUser(data.user));
        return { success: true };
      }

      return { success: false, message: 'Authentication failed.' };

    } catch (err: any) {
      return { success: false, message: err.message || 'An unexpected error occurred.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};