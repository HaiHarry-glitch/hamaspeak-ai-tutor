
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
  onSwitchToReset?: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ 
  onSuccess, 
  onSwitchToSignUp,
  onSwitchToReset
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signInAnonymously } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await signIn(email, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi đăng nhập.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      await signInAnonymously();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi đăng nhập ẩn danh.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6 shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        <p className="text-gray-500">Nhập thông tin đăng nhập của bạn để tiếp tục</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-sm font-medium">
              Mật khẩu
            </label>
            {onSwitchToReset && (
              <button
                type="button"
                onClick={onSwitchToReset}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Quên mật khẩu?
              </button>
            )}
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang đăng nhập...
            </>
          ) : (
            'Đăng nhập'
          )}
        </Button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Hoặc</span>
        </div>
      </div>
      
      <Button
        type="button"
        variant="outline"
        onClick={handleAnonymousSignIn}
        className="w-full"
        disabled={isSubmitting}
      >
        Tiếp tục với tư cách khách
      </Button>
      
      {onSwitchToSignUp && (
        <p className="text-center text-sm">
          Chưa có tài khoản?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Đăng ký
          </button>
        </p>
      )}
    </Card>
  );
};

export default SignInForm;
