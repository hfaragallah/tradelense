import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { updateRecovery } from '../services/appwrite';
import { SEO } from '../components/SEO';

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const query = new URLSearchParams(location.search);
    const userId = query.get('userId');
    const secret = query.get('secret');

    useEffect(() => {
        if (!userId || !secret) {
            setError('Invalid or expired reset link. Please request a new one.');
        }
    }, [userId, secret]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (!userId || !secret) {
            setError('Invalid reset token.');
            return;
        }

        setIsLoading(true);
        try {
            await updateRecovery(userId, secret, password);
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err: any) {
            console.error('Reset password error:', err);
            setError(err.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-4">
            <SEO 
                title="Reset Password | TraderLense" 
                description="Securely reset your TraderLense account password."
            />

            <div className="w-full max-w-md bg-background-secondary border border-surface rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <div className="h-2 bg-gradient-to-r from-status-neutral to-status-high"></div>
                
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-status-neutral/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-status-neutral">
                            {isSuccess ? <CheckCircle2 size={32} /> : <Lock size={32} />}
                        </div>
                        <h1 className="text-2xl font-black text-text-primary mb-2">
                            {isSuccess ? 'Password Reset!' : 'Secure Reset'}
                        </h1>
                        <p className="text-sm text-text-secondary">
                            {isSuccess 
                                ? 'Your password has been updated successfully. Redirecting you to login...' 
                                : 'Almost there! Set a strong new password for your account.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-start gap-3">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!isSuccess && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-background-primary border border-surface rounded-xl pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-status-neutral/50 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-background-primary border border-surface rounded-xl pl-10 pr-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-status-neutral/50 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !userId || !secret}
                                className="w-full py-3 bg-status-neutral text-white font-bold rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {isLoading ? 'Updating...' : 'Save New Password'}
                            </button>
                        </form>
                    )}

                    <button
                        onClick={() => navigate('/')}
                        className="w-full mt-6 flex items-center justify-center gap-2 text-sm font-bold text-text-muted hover:text-text-primary transition-colors"
                    >
                        <ArrowLeft size={16} /> Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
