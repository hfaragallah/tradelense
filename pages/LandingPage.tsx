import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ArrowRight, BarChart2, ShieldCheck, Users, Zap, Globe, Cpu } from 'lucide-react';

const LandingPage: React.FC = () => {
    return (
        <>
            <SEO
                title="Home"
                description="TraderLense - The AI-Powered Social Trading Platform. Validate ideas, track bias, and trade with swarm intelligence."
                url="https://traderlense.app"
            />

            {/* Navbar (Landing Page Specific) */}
            <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                                TL
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                TraderLense
                            </span>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <Link to="/ai-tools" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">AI Tools</Link>
                                <Link to="/insights" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Market Insights</Link>
                                <Link to="/blog" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Blog</Link>
                                <Link to="/app" className="px-4 py-2 rounded-lg bg-status-neutral text-white text-sm font-bold hover:bg-blue-600 transition-colors">
                                    Launch App
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-16">
                {/* HERO SECTION */}
                <section className="relative overflow-hidden pt-20 pb-32">
                    {/* Background Elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-status-neutral/10 border border-status-neutral/20 text-status-neutral text-xs font-bold mb-6 animate-fade-in">
                            <Zap size={12} />
                            <span>Now with AI Bias Detection</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black text-text-primary tracking-tight mb-8 leading-tight">
                            Trade Smarter with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">
                                Swarm Intelligence
                            </span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-xl text-text-secondary mb-10 leading-relaxed">
                            Validate your trading ideas against the crowd, detect your psychological biases with AI, and track your true performance.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/app" className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                                Start Trading Now <ArrowRight size={20} />
                            </Link>
                            <Link to="/ai-tools" className="w-full sm:w-auto px-8 py-4 bg-surface border border-surface text-text-primary rounded-xl font-bold text-lg hover:bg-surface/80 transition-all">
                                Explore AI Tools
                            </Link>
                        </div>

                        {/* Mockup / Visual */}
                        <div className="mt-20 relative mx-auto max-w-5xl rounded-2xl border border-surface bg-background-secondary/50 backdrop-blur shadow-2xl overflow-hidden p-4">
                            <div className="aspect-video bg-background rounded-xl overflow-hidden relative">
                                {/* Abstract Representation of Dashboard */}
                                <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background"></div>
                                <div className="absolute inset-x-20 top-20 bottom-0 bg-surface/20 rounded-t-xl border-t border-l border-r border-surface/30"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-text-muted font-mono">Interactive Dashboard Preview</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES GRID */}
                <section className="py-24 bg-background-secondary border-t border-surface">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-text-primary mb-4">Why Top Traders Choose TraderLense</h2>
                            <p className="text-text-secondary max-w-2xl mx-auto">It's not just about charts. It's about understanding the market sentiment and your own psychology.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="p-8 rounded-2xl bg-background border border-surface hover:border-status-neutral/50 transition-colors group">
                                <div className="w-12 h-12 rounded-lg bg-status-neutral/10 flex items-center justify-center text-status-neutral mb-6 group-hover:scale-110 transition-transform">
                                    <Users size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-text-primary mb-3">Crowd Consensus</h3>
                                <p className="text-text-secondary">Stop guessing. See exactly what thousands of other traders think about a specific setup before you enter.</p>
                            </div>

                            {/* Feature 2 */}
                            <div className="p-8 rounded-2xl bg-background border border-surface hover:border-purple-500/50 transition-colors group">
                                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                                    <Cpu size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-text-primary mb-3">AI Bias Detection</h3>
                                <p className="text-text-secondary">Our AI analyzes your trading patterns to flag psychological biases like FOMO, revenge trading, and overconfidence.</p>
                            </div>

                            {/* Feature 3 */}
                            <div className="p-8 rounded-2xl bg-background border border-surface hover:border-green-500/50 transition-colors group">
                                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
                                    <ShieldCheck size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-text-primary mb-3">Verified Track Record</h3>
                                <p className="text-text-secondary">Build a reputation that actually means something. All trades are tracked and verified on an immutable ledger.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SEO CONTENT SECTION (Hidden logic but visible for users/crawlers) */}
                <section className="py-24">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-text-primary mb-8">Master the Markets with Advanced Analytics</h2>
                        <div className="prose prose-invert mx-auto text-left">
                            <p>
                                In today's fast-paced financial markets, having an edge is everything. TraderLense provides that edge by combining
                                <strong> real-time crowd sentiment analysis</strong> with <strong>AI-driven psychological profiling</strong>.
                            </p>
                            <p>
                                Whether you are trading Forex, Crypto, or Equities, understanding the "why" behind the move is just as important as the move itself.
                                Our platform aggregates data from thousands of verified traders to give you a clear picture of market conviction.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-t border-surface">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h2 className="text-4xl font-bold text-white mb-6">Ready to upgrade your trading?</h2>
                        <p className="text-xl text-indigo-200 mb-10">Join 10,000+ traders validating their ideas every day.</p>
                        <Link to="/app" className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-900 rounded-full font-bold text-lg hover:scale-105 transition-transform">
                            Join for Free <ArrowRight className="ml-2" />
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 bg-background border-t border-surface text-center text-text-muted">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex justify-center gap-8 mb-8">
                            <Link to="/ai-tools" className="hover:text-text-primary">AI Tools</Link>
                            <Link to="/insights" className="hover:text-text-primary">Insights</Link>
                            <Link to="/blog" className="hover:text-text-primary">Blog</Link>
                            <a href="#" className="hover:text-text-primary">Terms</a>
                            <a href="#" className="hover:text-text-primary">Privacy</a>
                        </div>
                        <p>© 2024 TraderLense. All rights reserved.</p>
                    </div>
                </footer>
            </main>
        </>
    );
};

export default LandingPage;
