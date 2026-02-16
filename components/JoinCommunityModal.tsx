import React, { useState } from 'react';
import { X, Mail, Zap, CheckCircle2, TrendingUp, Globe, BarChart3, Bitcoin } from 'lucide-react';

interface JoinCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, preference: string) => void;
}

export const JoinCommunityModal: React.FC<JoinCommunityModalProps> = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [preference, setPreference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !preference) return;
    
    setIsSubmitting(true);
    // Simulate API delay
    setTimeout(() => {
      onSubmit(email, preference);
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  const markets = [
    { id: 'Crypto', icon: <Bitcoin size={18} />, label: 'Crypto' },
    { id: 'Forex', icon: <Globe size={18} />, label: 'Forex' },
    { id: 'Stocks', icon: <BarChart3 size={18} />, label: 'Stocks' },
    { id: 'Indices', icon: <TrendingUp size={18} />, label: 'Indices' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-background-secondary border border-surface rounded-2xl w-full max-w-md shadow-2xl flex flex-col relative overflow-hidden">
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-status-neutral/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="flex items-center justify-between p-6 pb-2 relative z-10">
           <div>
              <h2 className="text-2xl font-black text-text-primary flex items-center gap-2">
                Join the Hive
              </h2>
              <p className="text-sm text-text-muted mt-1">Trade smarter together.</p>
           </div>
           <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
              <X size={24} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-6 relative z-10">
           
           {/* Email Input */}
           <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Your Email</label>
              <div className="relative">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <Mail size={18} />
                 </div>
                 <input 
                   type="email" 
                   required
                   placeholder="name@example.com"
                   className="w-full bg-surface border border-surface/50 rounded-xl pl-10 pr-4 py-3 text-text-primary focus:border-status-neutral focus:ring-1 focus:ring-status-neutral outline-none transition-all"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                 />
              </div>
           </div>

           {/* Market Preference */}
           <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Preferred Market</label>
              <div className="grid grid-cols-2 gap-3">
                 {markets.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPreference(m.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-bold ${
                        preference === m.id 
                          ? 'bg-status-neutral/10 border-status-neutral text-status-neutral shadow-[0_0_10px_rgba(59,130,246,0.2)]' 
                          : 'bg-surface border-surface text-text-secondary hover:bg-surface/80 hover:border-text-muted/30'
                      }`}
                    >
                       {m.icon}
                       {m.label}
                       {preference === m.id && <CheckCircle2 size={16} className="ml-auto" />}
                    </button>
                 ))}
              </div>
           </div>

           <button 
             type="submit"
             disabled={isSubmitting || !email || !preference}
             className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
           >
              {isSubmitting ? 'Joining...' : 'Confirm & Join'}
              {!isSubmitting && <Zap size={18} fill="currentColor" />}
           </button>

           <p className="text-[10px] text-center text-text-muted">
              By joining, you agree to our Terms of Service. No spam, just alpha.
           </p>

        </form>
      </div>
    </div>
  );
};