import React from 'react';
import { Trade, TradeType } from '../types';
import { ArrowUpRight, ArrowDownRight, Clock, Shield, BarChart2, Tag } from 'lucide-react';

interface TradeCardProps {
  trade: Trade;
  onClick: (trade: Trade) => void;
}

export const TradeCard: React.FC<TradeCardProps> = ({ trade, onClick }) => {
  const isLong = trade.type === TradeType.LONG;
  
  // Confidence Color Logic
  const getConfidenceColor = (score: number) => {
    if (score >= 75) return 'text-status-high';
    if (score >= 50) return 'text-status-warning';
    return 'text-status-risk';
  };

  const getConfidenceBg = (score: number) => {
    if (score >= 75) return 'bg-status-high/10 border-status-high/20';
    if (score >= 50) return 'bg-status-warning/10 border-status-warning/20';
    return 'bg-status-risk/10 border-status-risk/20';
  };

  return (
    <div 
      onClick={() => onClick(trade)}
      className="group bg-background-secondary border border-surface hover:border-text-muted/40 rounded-xl p-5 cursor-pointer transition-all duration-200 mb-4"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isLong ? 'bg-status-high/10 text-status-high' : 'bg-status-risk/10 text-status-risk'}`}>
            {isLong ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              {trade.asset} 
              <span className="text-xs font-normal text-text-muted bg-surface px-1.5 py-0.5 rounded border border-surface">
                {trade.market}
              </span>
            </h3>
            <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
              <span>{trade.authorName}</span>
              <span className="w-1 h-1 rounded-full bg-text-muted"></span>
              <span className="flex items-center gap-1 text-status-neutral">
                <Shield size={10} /> {trade.authorReputation} Rep
              </span>
            </div>
          </div>
        </div>
        
        <div className={`flex flex-col items-end px-3 py-1.5 rounded-lg border ${getConfidenceBg(trade.confidenceScore)}`}>
          <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Confidence</span>
          <span className={`text-xl font-bold font-mono ${getConfidenceColor(trade.confidenceScore)}`}>
            {trade.confidenceScore}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col">
          <span className="text-xs text-text-muted mb-1">Entry</span>
          <span className="font-mono text-sm text-text-primary">{trade.entryRange[0]} - {trade.entryRange[1]}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-muted mb-1">Stop Loss</span>
          <span className="font-mono text-sm text-status-risk">{trade.stopLoss}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-text-muted mb-1">Target</span>
          <span className="font-mono text-sm text-status-high">{trade.takeProfit[trade.takeProfit.length - 1]}</span>
        </div>
      </div>

      {trade.imageUrl && (
        <div className="mb-4 rounded-lg overflow-hidden border border-surface relative aspect-video">
           <img src={trade.imageUrl} alt={`${trade.asset} chart`} className="w-full h-full object-cover" />
        </div>
      )}

      <p className="text-text-secondary text-sm line-clamp-2 mb-3 leading-relaxed">
        {trade.rationale}
      </p>

      {/* Rationale Tags */}
      {trade.rationaleTags && trade.rationaleTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {trade.rationaleTags.map((tag, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface text-[10px] text-text-secondary border border-surface/50">
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-surface">
        <div className="flex items-center gap-4 text-xs font-medium text-text-muted">
          <span className="flex items-center gap-1">
            <Clock size={14} /> {trade.timeHorizon}
          </span>
          <span className="flex items-center gap-1">
            <BarChart2 size={14} /> {trade.crowd.totalVotes} Votes
          </span>
        </div>
        
        {/* Simple Sentiment Bar */}
        <div className="flex h-1.5 w-32 rounded-full overflow-hidden bg-surface">
          <div style={{ width: `${(trade.crowd.agree / trade.crowd.totalVotes) * 100}%` }} className="bg-status-high" />
          <div style={{ width: `${(trade.crowd.wait / trade.crowd.totalVotes) * 100}%` }} className="bg-status-neutral" />
          <div style={{ width: `${(trade.crowd.disagree / trade.crowd.totalVotes) * 100}%` }} className="bg-status-risk" />
        </div>
      </div>
    </div>
  );
};