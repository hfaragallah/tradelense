import React from 'react';
import { SEO } from '../components/SEO';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';

const BlogPage: React.FC = () => {
    return (
        <>
            <SEO
                title="Blog"
                description="Latest news, trading strategies, and platform updates."
            />

            <div className="min-h-screen bg-background text-text-primary p-8">
                <div className="max-w-4xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>

                    <header className="mb-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mx-auto mb-6 text-orange-400">
                            <BookOpen size={32} />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">TraderLense Blog</h1>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            Educational resources, strategy breakdowns, and community highlights.
                        </p>
                    </header>

                    <div className="grid gap-8">
                        <article className="p-8 bg-background-secondary border border-surface rounded-xl hover:border-status-neutral/50 transition-colors cursor-pointer">
                            <span className="text-xs text-status-neutral font-bold mb-2 block">STRATEGY</span>
                            <h2 className="text-2xl font-bold mb-3">How to Use Crowd Sentiment to Time Entries</h2>
                            <p className="text-text-secondary mb-4">Learn how top traders use the consensus score to avoid false breakouts and confirm reversals.</p>
                            <span className="text-sm text-text-muted">Read more →</span>
                        </article>

                        <article className="p-8 bg-background-secondary border border-surface rounded-xl hover:border-status-neutral/50 transition-colors cursor-pointer">
                            <span className="text-xs text-purple-400 font-bold mb-2 block">PSYCHOLOGY</span>
                            <h2 className="text-2xl font-bold mb-3">5 Signs You Are Revenge Trading</h2>
                            <p className="text-text-secondary mb-4">Our AI analysis shows that 60% of losses occur after a winning streak. Here is why.</p>
                            <span className="text-sm text-text-muted">Read more →</span>
                        </article>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlogPage;
