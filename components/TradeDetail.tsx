import React, { useState, useMemo } from 'react';
import { Trade, TradeType, AIAnalysisResult } from '../types';
import { analyzeTrade } from '../services/geminiService';
import {
  ArrowLeft, Target, ShieldAlert, BadgeCheck, Eye, Share2, AlertOctagon, Cpu, Loader2, Play, Tag, Activity, ArrowDownRight, ArrowUpRight, Lock, Zap, LogIn, Info, Scale
} from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Bar, YAxis, XAxis, Tooltip as RechartsTooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Tooltip } from './Tooltip';

interface TradeDetailProps {
  trade: Trade;
  onBack: () => void;
  onShadow: (id: string) => void;
  userPoints: number;
  onDeductPoints: (amount: number) => boolean; // Returns true if successful
  onOpenPremium: () => void;
  isGuest: boolean;
  onOpenAuth: () => void;
}

// Custom Candle Shape Component
const Candle = (props: any) => {
  const { x, y, width, height, payload, yAxis } = props;

  // Defensive check: Ensure we have necessary data and scale function
  if (!payload || !yAxis || typeof yAxis.scale !== 'function') {
    return null;
  }

  const { open, close, high, low } = payload;

  // Guard against missing payload values
  if (open === undefined || close === undefined || high === undefined || low === undefined) {
    return null;
  }

  // Calculate coordinates using the Y-axis scale function
  const yHigh = yAxis.scale(high);
  const yLow = yAxis.scale(low);
  const yOpen = yAxis.scale(open);
  const yClose = yAxis.scale(close);

  const isUp = close >= open;
  // Compliant colors: Green #22C55E, Red #EF4444
  const color = isUp ? '#22C55E' : '#EF4444';

  // Body Dimensions
  const bodyTop = Math.min(yOpen, yClose);
  const bodyHeight = Math.max(Math.abs(yOpen - yClose), 2); // Ensure visibility
  const cx = x + width / 2;

  return (
    <g className="animate-in fade-in duration-700">
      {/* Wick */}
      <line
        x1={cx} y1={yHigh}
        x2={cx} y2={yLow}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Body */}
      <rect
        x={x}
        y={bodyTop}
        width={width}
        height={bodyHeight}
        fill={color}
        stroke="none"
        rx={1}
      />
    </g>
  );
};

export const TradeDetail: React.FC<TradeDetailProps> = ({
  trade,
  onBack,
  onShadow,
  userPoints,
  onDeductPoints,
  onOpenPremium,
  isGuest,
  onOpenAuth
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [errorAi, setErrorAi] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const ANALYSIS_COST = 100;

  const handleAiAnalysis = async () => {
    if (isGuest) {
      onOpenAuth();
      return;
    }

    if (userPoints < ANALYSIS_COST) {
      onOpenPremium();
      return;
    }

    if (!onDeductPoints(ANALYSIS_COST)) return;

    setLoadingAi(true);
    setErrorAi(null);
    const result = await analyzeTrade(trade);
    if (result) {
      setAiAnalysis(result);
    } else {
      setErrorAi("Analysis failed. Please check your API Key quota or enable billing in Google Cloud.");
    }
    setLoadingAi(false);
  };

  const handleShare = () => {
    const text = `TraderLense Verdict:\nAsset: ${trade.asset}\nConfidence: ${trade.confidenceScore}%\nCrowd: ${trade.crowd.agree} Agree vs ${trade.crowd.disagree} Disagree\nLink: tradelens.app/t/${trade.id}`;
    navigator.clipboard.writeText(text);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  // Helper for status color
  const getDecisionColor = (text: string) => {
    if (!text) return 'text-text-primary bg-surface border-surface';
    if (text.toUpperCase().includes('WAIT')) return 'text-status-warning bg-status-warning/10 border-status-warning/20';
    if (text.toUpperCase().includes('ENTER') || text.toUpperCase().includes('BUY') || text.toUpperCase().includes('LONG')) return 'text-status-high bg-status-high/10 border-status-high/20';
    if (text.toUpperCase().includes('SELL') || text.toUpperCase().includes('SHORT') || text.toUpperCase().includes('HIGH RISK')) return 'text-status-risk bg-status-risk/10 border-status-risk/20';
    return 'text-text-primary bg-surface border-surface';
  };

  const isLong = trade.type === TradeType.LONG;
  const isRisky = trade.confidenceScore < 50;

  // --- CHART DATA GENERATION (OHLC) ---
  const chartConfig = useMemo(() => {
    const entry = (trade.entryRange[0] + trade.entryRange[1]) / 2;
    const sl = trade.stopLoss;
    const tp = trade.takeProfit[0];

    // Simulate price action context
    const data = [];
    let currentOpen = entry;

    // Calculate realistic volatility based on the trade's risk range
    const riskRange = Math.abs(entry - sl);
    const rewardRange = Math.abs(tp - entry);
    const volatility = riskRange * 0.15; // 15% of risk per candle

    // Bias direction based on trade type, but with noise
    const direction = isLong ? 1 : -1;
    const drift = (rewardRange / 50) * direction; // Slight drift towards TP

    // Generate 40 candles
    for (let i = 0; i < 40; i++) {
      // Random walk component
      const noise = (Math.random() - 0.5) * volatility * 2;
      const change = drift + noise;

      const close = currentOpen + change;

      // Generate high/low wicks
      // High must be >= max(open, close)
      // Low must be <= min(open, close)
      const bodyMax = Math.max(currentOpen, close);
      const bodyMin = Math.min(currentOpen, close);

      const high = bodyMax + Math.random() * (volatility * 0.5);
      const low = bodyMin - Math.random() * (volatility * 0.5);

      data.push({
        i,
        open: currentOpen,
        close,
        high,
        low
      });

      currentOpen = close;
    }

    // Calculate domain padding for Y-Axis
    const allHighs = [...data.map(d => d.high), tp, entry];
    const allLows = [...data.map(d => d.low), sl, entry];

    const maxPrice = Math.max(...allHighs);
    const minPrice = Math.min(...allLows);
    const range = maxPrice - minPrice;

    const domain = [minPrice - (range * 0.1), maxPrice + (range * 0.1)];

    // Debug logging
    console.log('📊 Chart Config Generated:', {
      dataPoints: data.length,
      firstCandle: data[0],
      lastCandle: data[data.length - 1],
      domain,
      entry,
      sl,
      tp
    });

    return { data, domain };
  }, [trade, isLong]);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-text-muted hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Back to Feed
      </button>

      {/* Warning Banner */}
      {isRisky && (
        <div className="mb-6 p-4 bg-status-risk/10 border border-status-risk/30 rounded-xl flex items-start gap-3">
          <AlertOctagon className="text-status-risk flex-shrink-0 mt-0.5" size={24} />
          <div>
            <h3 className="text-status-risk font-bold text-lg">⚠️ You Should NOT Take This Trade</h3>
            <p className="text-text-secondary text-sm">
              74% of top traders would skip this trade. The crowd consensus is highly skeptical due to conflicting signals.
            </p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-background-secondary border border-surface rounded-xl p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold tracking-wider uppercase border 
                ${isLong
                  ? 'bg-status-high/10 text-status-high border-status-high/20'
                  : 'bg-status-risk/10 text-status-risk border-status-risk/20'}`}>
                {trade.type}
              </span>
              <span className="text-text-muted text-sm">{trade.market}</span>
            </div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">{trade.asset}</h1>
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <span>Posted by</span>
              <span className="text-text-primary font-medium">{trade.authorName}</span>
              <span className="text-text-muted">• {new Date(trade.timestamp).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-lg bg-surface border border-surface hover:bg-surface/80 text-text-muted hover:text-text-primary transition-all relative"
              title="Share Verdict"
            >
              <Share2 size={18} />
              {shareCopied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-status-high text-background-primary text-xs font-bold px-2 py-1 rounded">
                  Copied!
                </span>
              )}
            </button>
            <button
              onClick={() => onShadow(trade.id)}
              disabled={trade.isShadowed}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all
                ${trade.isShadowed
                  ? 'bg-surface text-text-muted cursor-not-allowed'
                  : 'bg-status-neutral hover:bg-blue-600 text-white shadow-lg shadow-blue-900/20'}`}
            >
              {trade.isShadowed ? (
                <>
                  <BadgeCheck size={18} /> Shadowing
                </>
              ) : (
                <>
                  <Eye size={18} /> Shadow Trade
                </>
              )}
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-surface">
          <div>
            <div className="text-xs text-text-muted mb-1 flex items-center gap-1">
              Entry Zone <Play size={12} className="rotate-90" />
            </div>
            <div className="text-lg font-mono font-medium text-text-primary">
              {trade.entryRange[0]} - {trade.entryRange[1]}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1 flex items-center gap-1">
              Stop Loss <ShieldAlert size={12} />
            </div>
            <div className="text-lg font-mono font-medium text-status-risk">
              {trade.stopLoss}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1 flex items-center gap-1">
              Take Profit <Target size={12} />
            </div>
            <div className="text-lg font-mono font-medium text-status-high">
              {trade.takeProfit.join(', ')}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1 flex items-center gap-1">
              Risk / Reward
              <Tooltip content="Potential profit relative to potential loss. A 1:2 ratio means risking $1 to make $2.">
                <Info size={12} className="cursor-help hover:text-text-primary transition-colors" />
              </Tooltip>
            </div>
            <div className="text-lg font-mono font-medium text-text-primary">
              1:{((Math.abs(trade.takeProfit[0] - trade.entryRange[0])) / Math.abs(trade.entryRange[0] - trade.stopLoss)).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Analysis Content (Full Width) */}
      <div className="space-y-6">

        {/* Visual Chart Section */}
        <div className="bg-background-secondary border border-surface rounded-xl p-6 h-[450px] flex flex-col relative overflow-hidden shadow-inner">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#9AA4B2 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          </div>

          <div className="flex justify-between items-center mb-4 relative z-10">
            <h3 className="font-bold text-text-primary flex items-center gap-2">
              <Activity size={18} className="text-status-neutral" /> Scenario Projection
              <Tooltip content="A Monte Carlo simulation of potential price paths based on current volatility and the trade's risk parameters.">
                <Info size={14} className="text-text-muted cursor-help hover:text-text-primary transition-colors" />
              </Tooltip>
            </h3>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-status-high shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span> Target
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-status-risk shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span> Stop
              </span>
            </div>
          </div>

          {/* Chart Container */}
          <div className="flex-1 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartConfig.data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} strokeOpacity={0.2} />
                <XAxis dataKey="i" hide />
                <YAxis
                  domain={chartConfig.domain}
                  orientation="right"
                  tick={{ fill: '#9AA4B2', fontSize: 11, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                  tickFormatter={(val) => val.toFixed(2)}
                />
                <RechartsTooltip
                  content={({ active, payload: p }) => {
                    if (active && p && p.length) {
                      const d = p[0].payload;
                      return (
                        <div className="bg-background-secondary border border-surface p-3 rounded-lg shadow-xl text-xs font-mono z-50">
                          <div className="mb-2 text-text-muted font-bold border-b border-surface pb-1">Period {d.i + 1}</div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <span className="text-text-secondary">Open:</span> <span className="text-text-primary text-right">{d.open.toFixed(2)}</span>
                            <span className="text-text-secondary">High:</span> <span className="text-text-primary text-right">{d.high.toFixed(2)}</span>
                            <span className="text-text-secondary">Low:</span> <span className="text-text-primary text-right">{d.low.toFixed(2)}</span>
                            <span className="text-text-secondary">Close:</span> <span className={`text-right ${d.close >= d.open ? 'text-status-high' : 'text-status-risk'}`}>{d.close.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ fill: '#1F2633', opacity: 0.4 }}
                />

                {/* Trade Levels */}
                <ReferenceLine
                  y={trade.stopLoss}
                  stroke="#EF4444"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  label={{ value: `SL`, position: 'insideRight', fill: '#EF4444', fontSize: 10, fontWeight: 'bold' }}
                />
                <ReferenceLine
                  y={trade.entryRange[0]}
                  stroke="#9AA4B2"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  label={{ value: `ENTRY`, position: 'insideRight', fill: '#9AA4B2', fontSize: 10 }}
                />
                {trade.takeProfit.map((tp, i) => (
                  <ReferenceLine
                    key={i}
                    y={tp}
                    stroke="#22C55E"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{ value: `TP${i + 1}`, position: 'insideRight', fill: '#22C55E', fontSize: 10, fontWeight: 'bold' }}
                  />
                ))}

                {/* Candlestick Series */}
                <Bar
                  dataKey="close"
                  shape={<Candle />}
                  barSize={8}
                  animationDuration={1500}
                  isAnimationActive={true}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Fallback Image Overlay */}
          {trade.imageUrl && (
            <div className="absolute inset-0 z-20 bg-background-secondary flex items-center justify-center p-1 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
              <img src={trade.imageUrl} alt="Trade Setup" className="w-full h-full object-contain rounded-lg" />
            </div>
          )}
        </div>

        {/* Rationale */}
        <section className="bg-background-secondary border border-surface rounded-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary">Trader Rationale</h2>
          </div>

          {trade.rationaleTags && trade.rationaleTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {trade.rationaleTags.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-surface text-xs font-medium text-text-secondary border border-surface/50">
                  <Tag size={12} /> {tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-text-secondary leading-relaxed whitespace-pre-line text-lg">
            {trade.rationale}
          </p>
        </section>

        {/* AI Analysis - Trade Confirmation Report Layout */}
        <section className="bg-background-secondary border border-surface rounded-xl p-6 md:p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <Cpu size={24} className="text-status-neutral" /> Trade Confirmation Report
            </h2>
            {!aiAnalysis && !loadingAi && (
              <button
                onClick={handleAiAnalysis}
                className={`px-5 py-2.5 rounded-lg border transition-all font-bold text-sm flex items-center gap-2 shadow-lg
                    ${!isGuest && userPoints >= ANALYSIS_COST
                    ? 'bg-status-neutral text-white border-status-neutral hover:bg-blue-600 shadow-blue-900/20'
                    : 'bg-surface text-text-muted border-surface hover:border-status-neutral/50'
                  }`}
              >
                {isGuest ? (
                  <>
                    <LogIn size={16} /> Sign In to Analyze
                  </>
                ) : (
                  <>
                    {userPoints >= ANALYSIS_COST ? <Zap size={16} fill="currentColor" /> : <Lock size={16} />}
                    {userPoints >= ANALYSIS_COST ? `Generate Analysis` : `Unlock Analysis`}
                    <span className={`text-xs ml-1 font-normal opacity-80 ${userPoints < ANALYSIS_COST ? 'text-status-risk' : ''}`}>
                      ({ANALYSIS_COST} pts)
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {loadingAi && (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <Loader2 size={32} className="animate-spin mb-3 text-status-neutral" />
              <p className="text-sm">Evaluating structure and confirmation signals...</p>
            </div>
          )}

          {errorAi && (
            <div className="flex flex-col items-center justify-center py-12 text-status-risk animate-in fade-in">
              <AlertOctagon size={32} className="mb-3" />
              <p className="font-bold">Analysis Unavailable</p>
              <p className="text-sm text-text-muted mt-1">{errorAi}</p>
            </div>
          )}

          {aiAnalysis && (
            <div className="animate-fade-in space-y-6">

              {/* 1. Hero Verdict Section */}
              <div className={`rounded-xl p-6 border-2 ${getDecisionColor(aiAnalysis.currentStatus.decision)}`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2 block">Strategic Decision</span>
                    <h2 className="text-4xl font-black tracking-tight">{aiAnalysis.currentStatus.decision}</h2>
                  </div>
                  <div className="h-12 w-px bg-current opacity-20 hidden md:block"></div>
                  <div className="flex-1">
                    <p className="text-lg font-medium opacity-90 italic">"{aiAnalysis.currentStatus.keyPrinciple}"</p>
                  </div>
                </div>
              </div>

              {/* 2. Market Context Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface/30 rounded-xl p-4 border border-surface flex items-center justify-between">
                  <span className="text-text-muted text-sm">Market Position</span>
                  <span className="font-bold text-text-primary">{aiAnalysis.currentStatus.marketPosition}</span>
                </div>
                <div className="bg-surface/30 rounded-xl p-4 border border-surface flex items-center justify-between">
                  <span className="text-text-muted text-sm">Risk Note</span>
                  <span className="font-bold text-status-warning">{aiAnalysis.currentStatus.riskNote}</span>
                </div>
              </div>

              {/* 3. Scenarios (Buy/Sell) */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Bearish Card */}
                <div className="bg-background-secondary border border-surface rounded-xl overflow-hidden flex flex-col hover:border-status-risk/30 transition-colors">
                  <div className="p-4 bg-status-risk/10 border-b border-status-risk/10">
                    <h3 className="font-bold text-status-risk flex items-center gap-2">
                      <ArrowDownRight size={20} /> Bearish Invalidation
                    </h3>
                  </div>
                  <div className="p-5 flex-1 space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Setup</span>
                      <div className="font-medium text-text-primary">{aiAnalysis.sellCriteria.setupName}</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Trigger</span>
                      <div className="font-medium text-text-primary">{aiAnalysis.sellCriteria.triggerType}</div>
                    </div>
                    <div className="bg-surface/50 rounded-lg p-3">
                      <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider mb-2 block">Checklist</span>
                      <ul className="space-y-2">
                        {aiAnalysis.sellCriteria.checklist.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-status-risk flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="p-3 bg-surface/30 border-t border-surface text-xs text-text-muted">
                    <span className="font-bold text-status-risk">Outcome:</span> {aiAnalysis.sellCriteria.outcome}
                  </div>
                </div>

                {/* Bullish Card */}
                <div className="bg-background-secondary border border-surface rounded-xl overflow-hidden flex flex-col hover:border-status-high/30 transition-colors">
                  <div className="p-4 bg-status-high/10 border-b border-status-high/10">
                    <h3 className="font-bold text-status-high flex items-center gap-2">
                      <ArrowUpRight size={20} /> Bullish Confirmation
                    </h3>
                  </div>
                  <div className="p-5 flex-1 space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Setup</span>
                      <div className="font-medium text-text-primary">{aiAnalysis.buyCriteria.setupName}</div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Trigger</span>
                      <div className="font-medium text-text-primary">{aiAnalysis.buyCriteria.triggerType}</div>
                    </div>
                    <div className="bg-surface/50 rounded-lg p-3">
                      <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider mb-2 block">Checklist</span>
                      <ul className="space-y-2">
                        {aiAnalysis.buyCriteria.checklist.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-status-high flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="p-3 bg-surface/30 border-t border-surface text-xs text-text-muted">
                    <span className="font-bold text-status-high">Outcome:</span> {aiAnalysis.buyCriteria.outcome}
                  </div>
                </div>
              </div>

              {/* 4. Risk & Discipline Notes (NEW) */}
              {aiAnalysis.riskDiscipline && (
                <div className="bg-surface/20 border border-surface rounded-xl p-6">
                  <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                    <Scale size={16} className="text-status-neutral" /> Risk & Discipline Protocol
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Stop Loss Analysis</span>
                      <p className="text-sm text-text-secondary border-l-2 border-status-risk pl-3">
                        {aiAnalysis.riskDiscipline.stopLossComment}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">R:R Quality</span>
                      <p className="text-sm text-text-secondary border-l-2 border-status-high pl-3">
                        {aiAnalysis.riskDiscipline.riskRewardQuality}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Behavioral Check</span>
                      <p className="text-sm text-text-secondary border-l-2 border-status-warning pl-3">
                        {aiAnalysis.riskDiscipline.behavioralNote}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Action Rules */}
              <div className="bg-background-primary border border-surface rounded-xl p-6">
                <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <Activity size={16} className="text-status-neutral" /> Action Protocol
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 bg-surface/30 rounded-lg">
                    <span className="font-mono text-status-neutral font-bold text-xl">01</span>
                    <p className="text-sm text-text-secondary font-medium">{aiAnalysis.actionRules.rule1}</p>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-surface/30 rounded-lg">
                    <span className="font-mono text-status-neutral font-bold text-xl">02</span>
                    <p className="text-sm text-text-secondary font-medium">{aiAnalysis.actionRules.rule2}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-surface flex justify-between items-center">
                  <span className="text-xs font-bold text-text-muted uppercase">Final Recommendation</span>
                  <span className="text-lg font-bold text-text-primary">{aiAnalysis.actionRules.recommendation}</span>
                </div>
              </div>

              {/* Token Usage Stats */}
              {aiAnalysis.usageMetadata && (
                <div className="text-[10px] text-text-muted mt-4 text-center font-mono opacity-60">
                  AI Token Usage: {aiAnalysis.usageMetadata.totalTokenCount} ({aiAnalysis.usageMetadata.promptTokenCount} In / {aiAnalysis.usageMetadata.candidatesTokenCount} Out)
                </div>
              )}

            </div>
          )}
        </section>
      </div>
    </div>
  );
};