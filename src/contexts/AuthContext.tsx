
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

const LOCAL_STORAGE_KEY = 'hamaspeak_auth';
const SESSION_TRIES_KEY = 'hamaspeak_session_tries';
const MAX_SESSION_TRIES = 3;
const DAILY_USAGE_KEY = 'hamaspeak_daily_usage';
const MAX_FREE_USAGE = 3;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTriesRemaining, setSessionTriesRemaining] = useState(MAX_SESSION_TRIES);
  const [dailyUsageCount, setDailyUsageCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          const supabaseUser = session.user;
          
          // Convert Supabase user to our app's user format
          const appUser: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || undefined,
            displayName: supabaseUser.user_metadata.displayName || supabaseUser.email?.split('@')[0] || 'User',
            photoURL: supabaseUser.user_metadata.avatar_url,
            isAnonymous: false,
            createdAt: supabaseUser.created_at,
            lastLoginAt: new Date().toISOString(),
            speechCredits: 100,
            membershipType: 'free'
          };
          
          setSession(session);
          setUser(appUser);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appUser));
        } else {
          setUser(null);
          setSession(null);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        const supabaseUser = data.session.user;
        
        const appUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || undefined,
          displayName: supabaseUser.user_metadata.displayName || supabaseUser.email?.split('@')[0] || 'User',
          photoURL: supabaseUser.user_metadata.avatar_url,
          isAnonymous: false,
          createdAt: supabaseUser.created_at,
          lastLoginAt: new Date().toISOString(),
          speechCredits: 100,
          membershipType: 'free'
        };
        
        setUser(appUser);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appUser));
      }
      setIsLoading(false);
    });

    // Load session tries
    const savedTries = localStorage.getItem(SESSION_TRIES_KEY);
    if (savedTries) {
      try {
        setSessionTriesRemaining(parseInt(savedTries, 10));
      } catch (error) {
        console.error('Error parsing session tries:', error);
        localStorage.removeItem(SESSION_TRIES_KEY);
        setSessionTriesRemaining(MAX_SESSION_TRIES);
      }
    } else {
      setSessionTriesRemaining(MAX_SESSION_TRIES);
    }

    // Load daily usage
    const today = new Date().toDateString();
    const savedUsage = localStorage.getItem(DAILY_USAGE_KEY);
    
    if (savedUsage) {
      try {
        const { date, count } = JSON.parse(savedUsage);
        if (date === today) {
          setDailyUsageCount(count);
        } else {
          localStorage.setItem(DAILY_USAGE_KEY, JSON.stringify({ date: today, count: 0 }));
          setDailyUsageCount(0);
        }
      } catch (error) {
        console.error('Error parsing daily usage:', error);
        localStorage.removeItem(DAILY_USAGE_KEY);
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(SESSION_TRIES_KEY, sessionTriesRemaining.toString());
    }
  }, [sessionTriesRemaining, isLoading]);

  const incrementDailyUsage = () => {
    if (!user) {
      const today = new Date().toDateString();
      const newCount = dailyUsageCount + 1;
      localStorage.setItem(DAILY_USAGE_KEY, JSON.stringify({ date: today, count: newCount }));
      setDailyUsageCount(newCount);
      return newCount <= MAX_FREE_USAGE;
    }
    return true;
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            displayName,
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Đăng ký thành công!',
        description: 'Vui lòng kiểm tra email của bạn để xác nhận tài khoản.',
      });

    } catch (error) {
      console.error('Error during sign up:', error);
      toast({
        title: 'Đăng ký thất bại',
        description: error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi đăng ký.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: 'Đăng nhập thành công!',
        description: `Chào mừng trở lại!`,
      });
      
    } catch (error) {
      console.error('Error during sign in:', error);
      toast({
        title: 'Đăng nhập thất bại',
        description: error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi đăng nhập.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInAnonymously = async () => {
    try {
      setIsLoading(true);
      const now = new Date().toISOString();
      const anonUser: User = {
        id: Math.random().toString(36).substring(2, 15),
        displayName: `Guest_${Math.floor(Math.random() * 1000)}`,
        isAnonymous: true,
        createdAt: now,
        lastLoginAt: now,
        speechCredits: 10,
        membershipType: 'free'
      };
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(anonUser));
      setUser(anonUser);
      
      toast({
        title: 'Đăng nhập ẩn danh thành công',
        description: 'Bạn đã đăng nhập với tư cách khách.',
      });
    } catch (error) {
      console.error('Error during anonymous sign in:', error);
      toast({
        title: 'Đăng nhập thất bại',
        description: error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi đăng nhập.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setUser(null);
      setSession(null);
      
      toast({
        title: 'Đăng xuất thành công',
        description: 'Bạn đã đăng xuất.',
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      toast({
        title: 'Đăng xuất thất bại',
        description: error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi đăng xuất.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profile: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      // Update Supabase user metadata if authenticated with Supabase
      if (session) {
        const { error } = await supabase.auth.updateUser({
          data: {
            displayName: profile.displayName,
            avatar_url: profile.photoURL
          }
        });
        
        if (error) throw error;
      }
      
      const updatedUser = { ...user, ...profile };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast({
        title: 'Cập nhật hồ sơ thành công',
        description: 'Thông tin của bạn đã được cập nhật.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Cập nhật thất bại',
        description: error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi cập nhật hồ sơ.',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      toast({
        title: 'Đặt lại mật khẩu',
        description: `Chúng tôi đã gửi email đặt lại mật khẩu đến ${email}`,
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Đặt lại mật khẩu thất bại',
        description: error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi đặt lại mật khẩu.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const useSessionTry = () => {
    if (user) return sessionTriesRemaining;
    const newTriesRemaining = Math.max(0, sessionTriesRemaining - 1);
    setSessionTriesRemaining(newTriesRemaining);
    return newTriesRemaining;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    sessionTriesRemaining,
    dailyUsageCount,
    remainingUsage: user ? Infinity : Math.max(0, MAX_FREE_USAGE - dailyUsageCount),
    incrementDailyUsage,
    signUp,
    signIn,
    signInAnonymously,
    signOut,
    updateProfile,
    useSessionTry,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
