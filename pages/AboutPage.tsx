import React from 'react';
import { SEO } from '../components/SEO';
import { Link } from 'react-router-dom';
import { ArrowLeft, Info, Target, Users, Shield } from 'lucide-react';

const AboutPage: React.FC = () => {
    return (
        <>
            <SEO title="About Us" description="Learn about Tradelense and our mission to democratize trading Intelligence." />
            <div className="min-h-screen bg-background text-text-primary p-8">
                <div className="max-w-4xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors">
                        <ArrowLeft size={20} /> Back to Home
                    </Link>

                    <header className="mb-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-6 text-blue-400">
                            <Info size={32} />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">About TraderLense</h1>
                        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                            Democratizing elite trading intelligence through AI and crowd-sourced consensus.
                        </p>
                    </header>

                    <div className="space-y-8">
                        <section className="bg-background-secondary border border-surface rounded-2xl p-8 hover:border-status-neutral/30 transition-all">
                            <div className="flex items-center gap-4 mb-4">
                                <Target className="text-status-neutral" size={24} />
                                <h2 className="text-2xl font-bold">Our Mission</h2>
                            </div>
                            <p className="text-text-secondary leading-relaxed">
                                Our mission is to bridge the gap between retail traders and institutional intelligence. We believe that by combining advanced AI analysis with the collective wisdom of thousands of verified traders, we can provide an unparalleled edge in the market. 
                            </p>
                        </section>

                        <div className="grid md:grid-cols-2 gap-8">
                            <section className="bg-background-secondary border border-surface rounded-2xl p-8 hover:border-status-neutral/30 transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                    <Users className="text-status-neutral" size={24} />
                                    <h3 className="text-xl font-bold">Community Driven</h3>
                                </div>
                                <p className="text-text-secondary leading-relaxed text-sm">
                                    Our Leaderboard and Reputation systems ensure that high-quality analysis bubbles to the top, filtering out the noise of traditional social media.
                                </p>
                            </section>
                            
                            <section className="bg-background-secondary border border-surface rounded-2xl p-8 hover:border-status-neutral/30 transition-all">
                                <div className="flex items-center gap-4 mb-4">
                                    <Shield className="text-status-neutral" size={24} />
                                    <h3 className="text-xl font-bold">Transparent Analytics</h3>
                                </div>
                                <p className="text-text-secondary leading-relaxed text-sm">
                                    Every trade published is tracked and verified. Our shadowing feature ensures strict accountability for historical performance.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AboutPage;
