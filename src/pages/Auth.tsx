import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Lightbulb } from 'lucide-react';
import authLibrary from '@/assets/auth-library.jpg';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      name: isLogin ? email.split('@')[0] : name,
      email,
      role,
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex pt-16">
      {/* Left - Image Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src={authLibrary} alt="Modern library" className="absolute inset-0 h-full w-full object-cover" loading="lazy" width={640} height={960} />
        <div className="absolute inset-0 gradient-hero opacity-70" />
        <div className="relative z-10 flex flex-col justify-end p-12">
          <div className="rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 backdrop-blur-md p-6 max-w-sm">
            <Lightbulb className="h-6 w-6 text-accent mb-3" />
            <p className="text-sm text-primary-foreground/90 leading-relaxed">
              <strong className="text-primary-foreground">Did you know?</strong> Visual learners retain 65% more information when using mind maps. Find your style today.
            </p>
          </div>
        </div>
      </div>

      {/* Right - Auth Form */}
      <div className="flex flex-1 items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md shadow-elevated border-border">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">
              {isLogin ? 'Welcome Back' : 'Create Your Account'}
            </CardTitle>
            <CardDescription>
              {isLogin ? 'Sign in to your LearnStyle AI account' : 'Join thousands of smarter learners'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" required />
                </div>
              )}
              <div>
                <Label htmlFor="email">University Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@university.edu" required />
              </div>
              <div className="relative">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {!isLogin && (
                <div>
                  <Label>Role</Label>
                  <div className="mt-2 flex rounded-lg border border-border overflow-hidden">
                    {(['student', 'faculty'] as const).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
                          role === r ? 'gradient-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full gradient-primary text-primary-foreground font-semibold">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">or</span></div>
              </div>

              <Button type="button" variant="outline" className="w-full">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign in with Google
              </Button>

              <div className="text-center text-sm">
                {isLogin ? (
                  <>
                    <button type="button" className="text-primary hover:underline text-xs">Forgot Password?</button>
                    <p className="mt-2 text-muted-foreground">
                      Don't have an account?{' '}
                      <button type="button" onClick={() => setIsLogin(false)} className="text-primary font-medium hover:underline">Sign Up</button>
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setIsLogin(true)} className="text-primary font-medium hover:underline">Sign In</button>
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
