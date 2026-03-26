import React from 'react';
import { SEO } from '../components/SEO';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const PrivacyTermsPage: React.FC = () => {
    return (
        <>
            <SEO title="Privacy & Terms" description="Legal agreements and privacy policies." />
            <div className="min-h-screen bg-background text-text-primary p-8">
                <div className="max-w-4xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>

                    <header className="mb-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-500/20 to-gray-500/20 flex items-center justify-center mx-auto mb-6 text-slate-400">
                            <ShieldCheck size={32} />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Privacy & Terms</h1>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            Please read these terms carefully before using TraderLense.
                        </p>
                    </header>

                    <div className="prose prose-invert max-w-none bg-background-secondary p-8 rounded-2xl border border-surface">
                        <h2 className="text-2xl font-bold text-white mb-4">Terms of Service</h2>
                        <p className="text-text-secondary mb-6 leading-relaxed">
                            By accessing or using TraderLense, you agree to be bound by these Terms. 
                            The content provided on TraderLense is for informational and educational purposes only. 
                            None of the AI analysis, crowd sentiment, or user-published trades should be construed as financial advice. 
                            Trading cryptocurrencies and stocks involves significant risk of loss and is not suitable for every investor.
                        </p>

                        <h2 className="text-2xl font-bold text-white mb-4 mt-8">Privacy Policy</h2>
                        <p className="text-text-secondary mb-6 leading-relaxed">
                            We respect your privacy. We collect minimal personal data required for authentication and platform functionality.
                            Your public trades, reputation scores, and forum discussions are visible to other users.
                            We do not sell your personal data to third parties. Our AI analysis models do not train on your private, unshared data.
                        </p>

                        <h2 className="text-2xl font-bold text-white mb-4 mt-8">User Content</h2>
                        <p className="text-text-secondary mb-6 leading-relaxed">
                            You retain all rights to the intellectual property of your analyses. However, by publishing a trade or post globally, 
                            you grant TraderLense a non-exclusive license to display, distribute, and reproduce this content in connection with providing the services.
                        </p>

                        <div className="mt-8 pt-8 border-t border-surface text-sm text-text-muted">
                            Last Updated: March 2026
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrivacyTermsPage;
