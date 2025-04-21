
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  dailyUsageCount: 0,
  remainingUsage: 3,
  incrementDailyUsage: () => {},
  resetPassword: async () => {},
  signInAnonymously: async () => {},
  sessionTriesRemaining: 3,
  updateProfile: async () => {},
  useSessionTry: () => 0,
  isLoading: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [dailyUsageCount, setDailyUsageCount] = useState(0);
  const [sessionTriesRemaining, setSessionTriesRemaining] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      setIsLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    };
    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      // Handle redirects based on auth state
      if (event === 'SIGNED_IN') {
        toast.success('Đăng nhập thành công!');
        navigate('/study');
      } else if (event === 'SIGNED_OUT') {
        toast.info('Bạn đã đăng xuất');
        navigate('/');
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          }
        }
      });

      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đăng ký thất bại');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đăng nhập thất bại');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đăng xuất thất bại');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gửi email đặt lại mật khẩu thất bại');
      throw error;
    }
  };

  const signInAnonymously = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        // Use a shared guest account for anonymous access
        email: 'guest@example.com',
        password: 'guestpassword123'
      });
      
      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đăng nhập ẩn danh thất bại');
      throw error;
    }
  };

  const updateProfile = async (profile: Partial<User>) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: profile
      });
      
      if (error) throw error;
      toast.success('Cập nhật hồ sơ thành công');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Cập nhật hồ sơ thất bại');
      throw error;
    }
  };

  const useSessionTry = () => {
    setSessionTriesRemaining(prev => Math.max(0, prev - 1));
    return sessionTriesRemaining;
  };

  const remainingUsage = Math.max(3 - dailyUsageCount, 0);

  const incrementDailyUsage = () => {
    setDailyUsageCount(prev => prev + 1);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user,
      signUp,
      signIn,
      signOut,
      dailyUsageCount,
      remainingUsage,
      incrementDailyUsage,
      resetPassword,
      signInAnonymously,
      sessionTriesRemaining,
      updateProfile,
      useSessionTry,
      isLoading
    }}>
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

export default AuthContext;
