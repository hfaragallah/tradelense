import React, { useState } from 'react';
import { SEO } from '../components/SEO';
import { Link } from 'react-router-dom';
import { ArrowLeft, LifeBuoy, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitContactForm } from '../services/appwrite';

const HelpCenterPage: React.FC = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');
        
        try {
            await submitContactForm(formData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error: any) {
            console.error(error);
            setStatus('error');
            setErrorMessage(error.message || 'Failed to submit form. Please try again.');
        }
    };

    return (
        <>
            <SEO title="Help Center" description="Get support and answers for TraderLense." />
            <div className="min-h-screen bg-background text-text-primary p-8">
                <div className="max-w-4xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>

                    <header className="mb-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-6 text-purple-400">
                            <LifeBuoy size={32} />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            Need assistance with your account or have a feature request? We are here to help.
                        </p>
                    </header>

                    <div className="grid md:grid-cols-12 gap-12">
                        {/* FAQ Side */}
                        <div className="md:col-span-5 space-y-6">
                            <h2 className="text-2xl font-bold mb-6">Quick Answers</h2>
                            <div className="bg-background-secondary border border-surface rounded-xl p-6">
                                <h3 className="font-bold mb-2">How do I earn Reputation?</h3>
                                <p className="text-sm text-text-secondary">Reputation is earned when your published trades reach their take profit targets, and when the community upvotes your analysis.</p>
                            </div>
                            <div className="bg-background-secondary border border-surface rounded-xl p-6">
                                <h3 className="font-bold mb-2">Are my trades public?</h3>
                                <p className="text-sm text-text-secondary">Yes, TraderLense is a transparent platform. All published trades are tracked publicly to ensure Leaderboard integrity.</p>
                            </div>
                            <div className="bg-background-secondary border border-surface rounded-xl p-6">
                                <h3 className="font-bold mb-2">Can I delete a losing trade?</h3>
                                <p className="text-sm text-text-secondary">No. To prevent stat manipulation, trades cannot be deleted once published. They serve as a verifiable track record.</p>
                            </div>
                        </div>

                        {/* Contact Form Side */}
                        <div className="md:col-span-7">
                            <div className="bg-background-secondary border border-status-neutral/30 rounded-2xl p-8 shadow-xl">
                                <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
                                
                                {status === 'success' ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                                        <CheckCircle2 size={64} className="text-status-success mb-4" />
                                        <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                                        <p className="text-text-secondary">We've received your inquiry and will get back to you shortly.</p>
                                        <button 
                                            onClick={() => setStatus('idle')}
                                            className="mt-6 px-6 py-2 bg-surface hover:bg-surface/80 rounded-lg transition-colors"
                                        >
                                            Send Another Message
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-text-secondary">Name</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={formData.name}
                                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                                    className="w-full bg-background border border-surface rounded-lg px-4 py-2.5 focus:outline-none focus:border-status-neutral transition-colors"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-text-secondary">Email</label>
                                                <input 
                                                    type="email" 
                                                    required
                                                    value={formData.email}
                                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                                    className="w-full bg-background border border-surface rounded-lg px-4 py-2.5 focus:outline-none focus:border-status-neutral transition-colors"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text-secondary">Subject</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={formData.subject}
                                                onChange={e => setFormData({...formData, subject: e.target.value})}
                                                className="w-full bg-background border border-surface rounded-lg px-4 py-2.5 focus:outline-none focus:border-status-neutral transition-colors"
                                                placeholder="How can we help?"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-text-secondary">Message</label>
                                            <textarea 
                                                required
                                                rows={5}
                                                value={formData.message}
                                                onChange={e => setFormData({...formData, message: e.target.value})}
                                                className="w-full bg-background border border-surface rounded-lg px-4 py-2.5 focus:outline-none focus:border-status-neutral transition-colors resize-none"
                                                placeholder="Describe your issue or request..."
                                            />
                                        </div>

                                        {status === 'error' && (
                                            <div className="flex items-start gap-2 text-status-danger bg-status-danger/10 p-3 rounded-lg text-sm">
                                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                                <p>{errorMessage}</p>
                                            </div>
                                        )}

                                        <button 
                                            type="submit" 
                                            disabled={status === 'loading'}
                                            className="w-full bg-status-neutral hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {status === 'loading' ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <Send size={18} />
                                                    Send Message
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HelpCenterPage;
