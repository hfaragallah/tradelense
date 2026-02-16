import React from 'react';
import { SEO } from '../components/SEO';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cpu } from 'lucide-react';

const AIToolsPage: React.FC = () => {
    return (
        <>
            <SEO
                title="AI Tools"
                description="Advanced AI trading tools for bias detection and market analysis."
            />

            <div className="min-h-screen bg-background text-text-primary p-8">
                <div className="max-w-4xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>

                    <header className="mb-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-6 text-purple-400">
                            <Cpu size={32} />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">AI Trading Suite</h1>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            Unlock the power of artificial intelligence to analyze your trading psychology and market conditions.
                        </p>
                    </header>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Tool 1 */}
                        <div className="p-6 bg-background-secondary border border-surface rounded-xl hover:border-purple-500/50 transition-all cursor-pointer group">
                            <div className="h-40 bg-surface/50 rounded-lg mb-4 flex items-center justify-center text-text-muted group-hover:text-text-primary transition-colors">
                                Visualization Placeholder
                            </div>
                            <h3 className="text-xl font-bold mb-2">Bias Detector</h3>
                            <p className="text-text-secondary text-sm">Upload your trade history to detect recurring psychological patterns like revenge trading or hesitation.</p>
                        </div>

                        {/* Tool 2 */}
                        <div className="p-6 bg-background-secondary border border-surface rounded-xl hover:border-blue-500/50 transition-all cursor-pointer group">
                            <div className="h-40 bg-surface/50 rounded-lg mb-4 flex items-center justify-center text-text-muted group-hover:text-text-primary transition-colors">
                                Visualization Placeholder
                            </div>
                            <h3 className="text-xl font-bold mb-2">Scenario Simulator</h3>
                            <p className="text-text-secondary text-sm">Run "what-if" scenarios on historical data to see how your strategy would have performed.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIToolsPage;
