
export interface User {
  id: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  isAnonymous: boolean;
  createdAt: string;
  lastLoginAt: string;
  speechCredits?: number;
  membershipType?: 'free' | 'premium' | 'enterprise';
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionTriesRemaining: number;
  dailyUsageCount: number;
  remainingUsage: number;
  incrementDailyUsage: () => boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<User>) => Promise<void>;
  useSessionTry: () => number;
  resetPassword: (email: string) => Promise<void>;
}
