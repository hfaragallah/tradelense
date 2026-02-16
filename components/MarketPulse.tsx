import React from 'react';
import { MarketPulse as MarketPulseType } from '../types';
import { Zap, AlertTriangle, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface MarketPulseProps {
  data: MarketPulseType;
}

export const MarketPulse: React.FC<MarketPulseProps> = ({ data }) => {
  const getSentimentIcon = () => {
    switch (data.sentiment) {
      case 'Greed':
      case 'Bullish': return <TrendingUp size={16} className="text-status-high" />;
      case 'Fear':
      case 'Bearish': return <TrendingDown size={16} className="text-status-risk" />;
      default: return <Minus size={16} className="text-text-muted" />;
    }
  };

  const getRiskColor = () => {
    switch (data.riskLevel) {
      case 'Extreme':
      case 'High': return 'text-status-risk';
      case 'Moderate': return 'text-status-warning';
      default: return 'text-status-high';
    }
  };

  return (
    <div className="bg-background-secondary border border-surface rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-surface flex justify-between items-center">
         <h2 className="font-bold text-text-primary flex items-center gap-2 text-sm">
           <Zap size={16} className="text-status-neutral" /> Market Pulse
         </h2>
         <Tooltip content="Real-time aggregation of sentiment analysis, VIX volatility, and global order flow funding rates.">
            <Info size={14} className="text-text-muted cursor-help hover:text-text-primary transition-colors" />
         </Tooltip>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
           <span className="text-xs text-text-secondary">Sentiment</span>
           <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-text-primary">
              {getSentimentIcon()}
              {data.sentiment}
           </div>
        </div>

        <div className="flex items-center justify-between">
           <span className="text-xs text-text-secondary">Risk Level</span>
           <div className={`flex items-center gap-1.5 font-mono text-sm font-bold ${getRiskColor()}`}>
              <AlertTriangle size={14} />
              {data.riskLevel}
           </div>
        </div>

        <div className="pt-3 border-t border-surface/50">
           <p className="text-xs text-text-muted leading-relaxed">
             "{data.insight}"
           </p>
        </div>
        
        <button className="w-full py-2 text-xs font-medium text-status-neutral hover:bg-surface/50 rounded transition-colors border border-transparent hover:border-surface">
           View Full Report
        </button>
      </div>
    </div>
  );
};