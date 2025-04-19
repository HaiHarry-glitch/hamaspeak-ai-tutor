
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types/auth';
import { useToast } from '@/hooks/use-toast';

const LOCAL_STORAGE_KEY = 'hamaspeak_auth';
const SESSION_TRIES_KEY = 'hamaspeak_session_tries';
const MAX_SESSION_TRIES = 3;

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionTriesRemaining, setSessionTriesRemaining] = useState(MAX_SESSION_TRIES);
  const { toast } = useToast();

  useEffect(() => {
    // Load user from localStorage
    const loadUser = () => {
      const savedUser = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      }

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

      setIsLoading(false);
    };

    loadUser();
  }, []);

  useEffect(() => {
    // Save session tries to localStorage when it changes
    if (!isLoading) {
      localStorage.setItem(SESSION_TRIES_KEY, sessionTriesRemaining.toString());
    }
  }, [sessionTriesRemaining, isLoading]);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setIsLoading(true);
      // In a real app, we'd call an API here
      const now = new Date().toISOString();
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        displayName,
        isAnonymous: false,
        createdAt: now,
        lastLoginAt: now,
        speechCredits: 100,
        membershipType: 'free'
      };
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
      
      toast({
        title: 'Đăng ký thành công!',
        description: 'Chào mừng bạn đến với Hamaspeak.',
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
      // In a real app, we'd validate credentials against a backend
      
      // Mock authentication - in a real app this would be an API call
      const now = new Date().toISOString();
      const mockUser: User = {
        id: Math.random().toString(36).substring(2, 15),
        email,
        displayName: email.split('@')[0],
        isAnonymous: false,
        createdAt: now,
        lastLoginAt: now,
        speechCredits: 100,
        membershipType: 'free'
      };
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
      
      toast({
        title: 'Đăng nhập thành công!',
        description: `Chào mừng trở lại, ${mockUser.displayName}!`,
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
      // Create anonymous user
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
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setUser(null);
      
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
      // In a real app, we'd call an API here
      
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
    if (user) return sessionTriesRemaining; // If user is logged in, no session tries are consumed
    
    const newTriesRemaining = Math.max(0, sessionTriesRemaining - 1);
    setSessionTriesRemaining(newTriesRemaining);
    return newTriesRemaining;
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    sessionTriesRemaining,
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
