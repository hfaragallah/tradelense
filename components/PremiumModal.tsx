import React, { useState } from 'react';
import { X, Check, Zap, Star, ShieldCheck } from 'lucide-react';
import { PremiumPackage } from '../types';
import { PREMIUM_PACKAGES } from '../constants';

interface PremiumModalProps {
   isOpen: boolean;
   onClose: () => void;
   onPurchase: (pkg: PremiumPackage) => void;
   currentPoints: number;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose, onPurchase, currentPoints }) => {
   if (!isOpen) return null;

   const [processingId, setProcessingId] = useState<string | null>(null);

   const handleBuy = (pkg: PremiumPackage) => {
      setProcessingId(pkg.id);
      // Simulate network delay for effect
      setTimeout(() => {
         onPurchase(pkg);
         setProcessingId(null);
      }, 1200);
   };

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
         <div className="bg-background-secondary border border-surface rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">

            {/* Header */}
            <div className="p-8 pb-4 text-center relative">
               <button
                  onClick={onClose}
                  className="absolute top-6 right-6 text-text-muted hover:text-text-primary transition-colors"
               >
                  <X size={24} />
               </button>

               <div className="inline-flex items-center justify-center p-3 rounded-full bg-status-high/10 mb-4">
                  <Zap size={32} className="text-status-high" />
               </div>
               <h2 className="text-3xl font-black text-text-primary mb-2">Refill Your TraderLense Points</h2>
               <p className="text-text-secondary max-w-lg mx-auto">
                  Use points to unlock AI Trade Analysis, validate community insights, and access premium discussion groups.
               </p>
               <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-surface">
                  <span className="text-sm text-text-muted">Current Balance:</span>
                  <span className="font-mono font-bold text-status-high">{currentPoints} PTS</span>
               </div>
            </div>

            {/* Packages Grid */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
               {PREMIUM_PACKAGES.map((pkg) => (
                  <div
                     key={pkg.id}
                     className={`relative flex flex-col p-6 rounded-xl border-2 transition-all duration-300 hover:transform hover:-translate-y-1 ${pkg.isPopular
                           ? 'bg-gradient-to-b from-surface to-background-secondary border-status-neutral shadow-lg shadow-status-neutral/10'
                           : 'bg-background-secondary border-surface hover:border-text-muted'
                        }`}
                  >
                     {pkg.isPopular && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-status-neutral text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                           MOST POPULAR
                        </div>
                     )}

                     <div className="text-center mb-6">
                        <h3 className="text-lg font-bold text-text-primary mb-2">{pkg.name}</h3>
                        <div className="flex items-baseline justify-center gap-1">
                           <span className="text-3xl font-black text-text-primary">{pkg.points}</span>
                           <span className="text-sm font-bold text-text-muted">PTS</span>
                        </div>
                        <div className="text-sm font-medium text-status-high mt-1">${pkg.price} USD</div>
                     </div>

                     <ul className="space-y-3 mb-8 flex-1">
                        {pkg.features.map((feature, idx) => (
                           <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
                              <Check size={16} className="text-status-neutral mt-0.5 flex-shrink-0" />
                              {feature}
                           </li>
                        ))}
                     </ul>

                     <button
                        onClick={() => handleBuy(pkg)}
                        disabled={!!processingId}
                        className={`w-full py-3 rounded-lg font-bold transition-all relative overflow-hidden ${pkg.isPopular
                              ? 'bg-status-neutral hover:bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                              : 'bg-surface hover:bg-surface/80 text-text-primary border border-surface'
                           }`}
                     >
                        {processingId === pkg.id ? (
                           <div className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Processing...
                           </div>
                        ) : (
                           'Select Package'
                        )}
                     </button>
                  </div>
               ))}
            </div>

            {/* Footer / Trust */}
            <div className="bg-surface/30 p-6 border-t border-surface flex flex-col md:flex-row items-center justify-center gap-6 text-text-muted text-xs">
               <div className="flex items-center gap-2">
                  <ShieldCheck size={16} /> Secure Payment Processing
               </div>
               <div className="flex items-center gap-2">
                  <Star size={16} /> 30-Day Money Back Guarantee
               </div>
            </div>

         </div>
      </div>
   );
};