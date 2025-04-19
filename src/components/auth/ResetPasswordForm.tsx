
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập địa chỉ email.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await resetPassword(email);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi đặt lại mật khẩu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-6 space-y-6 shadow-lg">
      {isSuccess ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-100 p-3 rounded-full">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h2 className="text-xl font-semibold">Kiểm tra email của bạn</h2>
          <p className="text-gray-600">
            Chúng tôi đã gửi một email đến {email} với hướng dẫn đặt lại mật khẩu.
          </p>
          {onBack && (
            <Button 
              onClick={onBack} 
              variant="outline" 
              className="mt-4"
            >
              Quay lại đăng nhập
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {onBack && (
              <button
                onClick={onBack}
                type="button"
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Quay lại đăng nhập
              </button>
            )}
            <h1 className="text-2xl font-bold">Quên mật khẩu?</h1>
            <p className="text-gray-500">
              Nhập email của bạn và chúng tôi sẽ gửi cho bạn hướng dẫn đặt lại mật khẩu.
            </p>
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
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Gửi hướng dẫn đặt lại mật khẩu'
              )}
            </Button>
          </form>
        </>
      )}
    </Card>
  );
};

export default ResetPasswordForm;
