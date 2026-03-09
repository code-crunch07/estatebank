'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Loader2, Shield, ArrowRight } from 'lucide-react';


export default function DashboardLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    // Set a timeout to prevent infinite loading (10 seconds max)
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setError('Login request timed out. Please try again.');
      toast.error('Login request timed out');
    }, 10000);

    try {
      // Authentication logs removed for security - no PII in logs
      
      // Try API login first (production)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();

      if (response.ok && data.success) {
        clearTimeout(timeoutId);
        
        // Cookie is already set by API (httpOnly, secure)
        // Verify authentication before redirecting to ensure cookie is readable
        try {
          const verifyResponse = await fetch('/api/auth/verify', {
            credentials: 'include',
          });
          const verifyData = await verifyResponse.json();
          
          if (verifyData.success && verifyData.data?.authenticated) {
            toast.success('Login successful! Redirecting to dashboard...');
            router.replace('/dashboard');
          } else {
            // Cookie wasn't set properly, wait a bit and try again
            setTimeout(async () => {
              const retryResponse = await fetch('/api/auth/verify', {
                credentials: 'include',
              });
              const retryData = await retryResponse.json();
              
              if (retryData.success && retryData.data?.authenticated) {
                toast.success('Login successful! Redirecting to dashboard...');
                router.replace('/dashboard');
              } else {
                setIsLoading(false);
                setError('Login successful but verification failed. Please try again.');
                toast.error('Verification failed after login');
              }
            }, 300);
          }
        } catch (verifyError) {
          // Verification failed, but login succeeded - redirect anyway
          // Middleware will catch if cookie isn't set
          toast.success('Login successful! Redirecting to dashboard...');
          router.replace('/dashboard');
        }
      } else {
        clearTimeout(timeoutId);
        setIsLoading(false);
        const errorMsg = data.error || 'Invalid email or password';
        console.error('Login failed:', errorMsg, data);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      setIsLoading(false);
      const errorMessage = error.message || 'Invalid email or password. Please try again.';
      console.error('Login error:', error);
      setError(errorMessage);
      toast.error(`Login failed: ${errorMessage}`);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
      {/* Clean background with subtle gradient */}
      <div className="absolute inset-0">
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/95" />
        
        {/* Subtle animated gradient orbs using primary color */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg shadow-primary/30 mb-4 border border-white/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">EstateBANK.in</h1>
            <p className="text-white/80 text-sm">Admin Dashboard</p>
          </div>

          {/* Login Card */}
          <Card className="w-full shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl overflow-hidden">
            {/* Decorative top border using primary color */}
            <div className="h-1 bg-primary" />
            
            <CardHeader className="text-center space-y-3 pb-6 pt-8">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
                Sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 animate-shake">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                        <span className="text-red-600 dark:text-red-400 text-xs font-bold">!</span>
                      </div>
                    </div>
                    <p className="flex-1">{error}</p>
                  </div>
                )}
                
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@estatebank.in"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError('');
                      }}
                      className="pl-10 h-12 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError('');
                      }}
                      className="pl-10 pr-10 h-12 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg shadow-lg shadow-primary/50 hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>
              
              {/* Footer Links */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                  Need help?{' '}
                  <Link 
                    href="/contact" 
                    className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                  >
                    Contact Support
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Security Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-white/70">
              <Shield className="w-4 h-4" />
              <span>Secure Login • Encrypted Connection</span>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}




