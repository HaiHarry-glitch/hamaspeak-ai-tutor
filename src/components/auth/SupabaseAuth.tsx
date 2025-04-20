
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface SupabaseAuthProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const SupabaseAuth: React.FC<SupabaseAuthProps> = ({ onSuccess, onClose }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Đăng nhập thành công!');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !displayName) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, displayName);
      toast.success('Đăng ký thành công!');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          {activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
        </CardTitle>
        <CardDescription className="text-center">
          {activeTab === 'login' 
            ? 'Đăng nhập vào tài khoản của bạn để sử dụng đầy đủ tính năng Hamaspeak' 
            : 'Tạo tài khoản mới để bắt đầu hành trình học tiếng Anh cùng Hamaspeak'}
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="login">Đăng nhập</TabsTrigger>
          <TabsTrigger value="register">Đăng ký</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email-login" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </label>
                <Input
                  id="email-login"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password-login" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4" /> Mật khẩu
                  </label>
                  <button 
                    type="button" 
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => toast.info('Tính năng đặt lại mật khẩu sẽ sớm được cập nhật')}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <Input
                  id="password-login"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" /> Tên hiển thị
                </label>
                <Input
                  id="displayName"
                  placeholder="Tên của bạn"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email-register" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </label>
                <Input
                  id="email-register"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password-register" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Mật khẩu
                </label>
                <Input
                  id="password-register"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">Mật khẩu phải có ít nhất 6 ký tự</p>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng ký...
                  </>
                ) : (
                  'Đăng ký'
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default SupabaseAuth;
