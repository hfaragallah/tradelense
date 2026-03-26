import React from 'react';
import { SEO } from '../components/SEO';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpenCheck } from 'lucide-react';

const GuidelinesPage: React.FC = () => {
    return (
        <>
            <SEO title="Community Guidelines" description="Rules and best practices for the TraderLense community." />
            <div className="min-h-screen bg-background text-text-primary p-8">
                <div className="max-w-4xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>

                    <header className="mb-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-6 text-green-400">
                            <BookOpenCheck size={32} />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Community Guidelines</h1>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            How to contribute effectively and safely to the TraderLense ecosystem.
                        </p>
                    </header>

                    <div className="space-y-6">
                        <div className="bg-background-secondary border border-surface rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-4 text-white">1. Be Constructive</h2>
                            <p className="text-text-secondary">When reviewing other trades, provide actionable and logical feedback. Blindly dismissing a trade setup without providing technical or fundamental reasons will negatively impact your reputation score over time.</p>
                        </div>

                        <div className="bg-background-secondary border border-surface rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-4 text-white">2. No Financial Advice</h2>
                            <p className="text-text-secondary">TraderLense is strictly an educational and data analytics platform. Do not post guarantees of returns or solicit investments from other users. All trade calls are hypothetical studies.</p>
                        </div>

                        <div className="bg-background-secondary border border-surface rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-4 text-white">3. Maintain Accountability</h2>
                            <p className="text-text-secondary">Do not delete losing trades to pad your statistics. Our AI system monitors for manipulation of historical tracking. Transparency is the core pillar of our Leaderboard.</p>
                        </div>

                        <div className="bg-background-secondary border border-surface rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-4 text-white">4. Respect the Community</h2>
                            <p className="text-text-secondary">Zero tolerance for harassment, spam, or abusive language. We foster an environment of professional traders engaged in rigorous, but respectful, debate.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GuidelinesPage;
