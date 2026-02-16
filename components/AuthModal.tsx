import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth?: (isRegister: boolean, email?: string) => void;
  initialEmail?: string;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuth, initialEmail = '', initialMode = 'login' }) => {
  if (!isOpen) return null;

  const { login, register, googleLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, 'New User'); // Default name for now
      }
      if (onAuth) onAuth(mode === 'register', email);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await googleLogin();
      // Google login redirects, so we might not reach here, but if we do:
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-background-secondary border border-surface rounded-2xl w-full max-w-md shadow-2xl flex flex-col relative overflow-hidden">

        {/* Decorative Header */}
        <div className="h-2 bg-gradient-to-r from-status-neutral to-status-high"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors p-2"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-status-neutral/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-status-neutral">
              <ShieldCheck size={28} />
            </div>
            <h2 className="text-2xl font-black text-text-primary mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Join TradeLens'}
            </h2>
            <p className="text-sm text-text-secondary">
              {mode === 'login'
                ? 'Sign in to access your portfolio and AI insights.'
                : 'Create an account to get 500 bonus points instantly.'}
            </p>
          </div>

          {/* Social Auth */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors mb-6 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            {mode === 'login' ? 'Sign in with Google' : 'Join with Google'}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background-secondary px-2 text-text-muted">Or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="email"
                  id="auth-email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface border border-surface rounded-xl pl-10 pr-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-status-neutral/50 transition-all"
                  placeholder="Email address"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input
                  type="password"
                  id="auth-password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface border border-surface rounded-xl pl-10 pr-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-status-neutral/50 transition-all"
                  placeholder="Password"
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-status-neutral text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Create Account'}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="ml-2 font-bold text-status-neutral hover:underline"
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
