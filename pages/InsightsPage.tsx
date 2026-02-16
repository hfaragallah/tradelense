import React from 'react';
import { SEO } from '../components/SEO';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart2 } from 'lucide-react';

const InsightsPage: React.FC = () => {
    return (
        <>
            <SEO
                title="Market Insights"
                description="Real-time market analysis and swarm intelligence data."
            />

            <div className="min-h-screen bg-background text-text-primary p-8">
                <div className="max-w-4xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>

                    <header className="mb-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-6 text-green-400">
                            <BarChart2 size={32} />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Market Insights</h1>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            Deep dive into market trends backed by swarm intelligence and data analytics.
                        </p>
                    </header>

                    <div className="p-12 bg-background-secondary border border-surface rounded-xl text-center">
                        <p className="text-text-muted">Live market data integration coming soon...</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InsightsPage;
