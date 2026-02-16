import React from 'react';
import { ArrowLeft, AlertTriangle, Shield, FileText } from 'lucide-react';

interface TermsProps {
    onBack: () => void;
}

export const TermsAndConditions: React.FC<TermsProps> = ({ onBack }) => {
    return (
        <div className="max-w-4xl mx-auto p-6 animate-fade-in">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-text-muted hover:text-text-primary mb-6 transition-colors"
            >
                <ArrowLeft size={18} /> Back
            </button>

            <div className="bg-background-secondary border border-surface rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-status-neutral to-status-high p-8">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="text-white" size={32} />
                        <h1 className="text-3xl font-black text-white">Terms & Conditions</h1>
                    </div>
                    <p className="text-white/80 text-sm">Last Updated: February 2026</p>
                </div>

                {/* Important Notice */}
                <div className="p-6 bg-status-warning/10 border-l-4 border-status-warning mx-6 mt-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-status-warning flex-shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="font-bold text-status-warning mb-2">IMPORTANT TRADING DISCLAIMER</h3>
                            <p className="text-text-primary text-sm leading-relaxed">
                                TraderLense is an <strong>educational and informational platform only</strong>. All trading ideas,
                                analyses, and signals shared on this platform are for <strong>guidance purposes only</strong>.
                                You, as the user, are solely responsible for your trading decisions and outcomes.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6 md:p-8 space-y-8">
                    {/* 1. Acceptance of Terms */}
                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                            <span className="text-status-neutral">1.</span> Acceptance of Terms
                        </h2>
                        <p className="text-text-secondary leading-relaxed">
                            By accessing and using TraderLense, you accept and agree to be bound by these Terms and Conditions.
                            If you do not agree to these terms, please do not use this platform.
                        </p>
                    </section>

                    {/* 2. No Financial Advice */}
                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                            <span className="text-status-neutral">2.</span> No Financial Advice
                        </h2>
                        <div className="space-y-3 text-text-secondary leading-relaxed">
                            <p>
                                <strong className="text-text-primary">TraderLense does NOT provide financial, investment, or trading advice.</strong>
                                The content on this platform, including but not limited to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Trade ideas and signals</li>
                                <li>Technical analysis</li>
                                <li>AI-generated insights</li>
                                <li>Community opinions and votes</li>
                                <li>Charts and projections</li>
                            </ul>
                            <p>
                                are for <strong className="text-text-primary">informational and educational purposes only</strong>.
                                They should not be construed as recommendations to buy, sell, or hold any financial instrument.
                            </p>
                        </div>
                    </section>

                    {/* 3. Your Responsibility */}
                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                            <span className="text-status-neutral">3.</span> Your Responsibility
                        </h2>
                        <div className="bg-status-risk/10 border border-status-risk/20 rounded-xl p-4 mb-3">
                            <p className="text-text-primary font-bold mb-2">⚠️ YOU MAKE YOUR OWN TRADING DECISIONS</p>
                            <p className="text-text-secondary text-sm leading-relaxed">
                                You acknowledge and agree that:
                            </p>
                        </div>
                        <ul className="list-disc list-inside space-y-2 ml-4 text-text-secondary">
                            <li>You are solely responsible for your own trading decisions</li>
                            <li>You should conduct your own research and due diligence</li>
                            <li>You should consult with licensed financial professionals before trading</li>
                            <li>You understand the risks involved in trading financial instruments</li>
                            <li>You trade at your own risk and accept full responsibility for any losses</li>
                        </ul>
                    </section>

                    {/* 4. No Liability for Trading Losses */}
                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                            <span className="text-status-neutral">4.</span> No Liability for Trading Losses
                        </h2>
                        <div className="space-y-3 text-text-secondary leading-relaxed">
                            <p className="font-bold text-text-primary">
                                TraderLense, its owners, operators, contributors, and affiliates SHALL NOT BE LIABLE for:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Any trading losses or financial damages you incur</li>
                                <li>Losses resulting from following trade ideas on the platform</li>
                                <li>Damages from inaccurate information or technical errors</li>
                                <li>Missed opportunities or delayed information</li>
                                <li>Any direct, indirect, incidental, or consequential damages</li>
                            </ul>
                            <p className="mt-3">
                                <strong className="text-status-risk">Trading involves substantial risk of loss.</strong> Past
                                performance is not indicative of future results.
                            </p>
                        </div>
                    </section>

                    {/* 5. Platform Purpose */}
                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                            <span className="text-status-neutral">5.</span> Platform Purpose
                        </h2>
                        <p className="text-text-secondary leading-relaxed">
                            TraderLense is designed as a <strong className="text-text-primary">community learning platform</strong> where
                            traders can share ideas, discuss strategies, and learn from each other. All content is user-generated
                            and should be treated as opinions and perspectives, not professional advice.
                        </p>
                    </section>

                    {/* 6. User-Generated Content */}
                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                            <span className="text-status-neutral">6.</span> User-Generated Content
                        </h2>
                        <p className="text-text-secondary leading-relaxed">
                            Trade ideas and analyses posted by users represent their personal opinions only. TraderLense does not
                            verify, endorse, or guarantee the accuracy of user-generated content. Users who share trades are not
                            financial advisors and may not be qualified to provide trading advice.
                        </p>
                    </section>

                    {/* 7. AI-Generated Insights */}
                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                            <span className="text-status-neutral">7.</span> AI-Generated Analysis
                        </h2>
                        <p className="text-text-secondary leading-relaxed">
                            AI-powered analysis and insights are generated by algorithms and may contain errors or biases.
                            They should be used as <strong className="text-text-primary">one of many tools</strong> in your
                            decision-making process, not as definitive trading signals.
                        </p>
                    </section>

                    {/* 8. Risk Disclosure */}
                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                            <span className="text-status-neutral">8.</span> Risk Disclosure
                        </h2>
                        <div className="bg-background-primary border-l-4 border-status-risk p-4 rounded-r-xl">
                            <p className="text-text-secondary leading-relaxed space-y-2">
                                <strong className="block text-status-risk mb-2">HIGH-RISK WARNING:</strong>
                                Trading foreign exchange, stocks, cryptocurrencies, and other financial instruments on margin carries
                                a high level of risk and may not be suitable for all investors. The high degree of leverage can work
                                against you as well as for you. Before deciding to trade, you should carefully consider your investment
                                objectives, level of experience, and risk appetite. There is a possibility that you could sustain a loss
                                of some or all of your initial investment. You should only trade with money you can afford to lose.
                            </p>
                        </div>
                    </section>

                    {/* 9. Account and Points */}
                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                            <span className="text-status-neutral">9.</span> Platform Points & Features
                        </h2>
                        <p className="text-text-secondary leading-relaxed">
                            Points earned on TraderLense have <strong className="text-text-primary">no monetary value</strong> and
                            cannot be exchanged for money. They are used solely to unlock platform features such as AI analysis.
                            TraderLense reserves the right to modify, suspend, or terminate the points system at any time.
                        </p>
                    </section>

                    {/* 10. Modifications */}
                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                            <span className="text-status-neutral">10.</span> Modifications to Terms
                        </h2>
                        <p className="text-text-secondary leading-relaxed">
                            TraderLense reserves the right to modify these Terms and Conditions at any time. Continued use of
                            the platform after changes constitutes acceptance of the modified terms.
                        </p>
                    </section>

                    {/* 11. Contact */}
                    <section>
                        <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                            <span className="text-status-neutral">11.</span> Contact Information
                        </h2>
                        <p className="text-text-secondary leading-relaxed">
                            For questions about these Terms and Conditions, please contact us through the platform's
                            feedback system.
                        </p>
                    </section>
                </div>

                {/* Footer Acknowledgment */}
                <div className="bg-surface p-6 border-t border-surface">
                    <div className="flex items-start gap-3">
                        <Shield className="text-status-neutral flex-shrink-0 mt-1" size={20} />
                        <p className="text-text-secondary text-sm leading-relaxed">
                            By using TraderLense, you acknowledge that you have read, understood, and agree to these Terms
                            and Conditions. You confirm that you will use the platform for educational purposes and accept
                            full responsibility for your trading decisions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
