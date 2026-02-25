import React, { useState, useMemo } from 'react';
import { Trade, TradeType, AIAnalysisResult } from '../types';
import { analyzeTrade, translateAnalysis } from '../services/geminiService';
import {
  ArrowLeft, Target, ShieldAlert, BadgeCheck, Eye, Share2, AlertOctagon, Cpu, Loader2, Play, Tag, Activity, ArrowDownRight, ArrowUpRight, Lock, Zap, LogIn, Info, Scale, Shield, AlertCircle, AlertTriangle, Languages
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, Line, YAxis, XAxis, Tooltip as RechartsTooltip, CartesianGrid, ReferenceLine, ComposedChart, Bar, Cell } from 'recharts';
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
  const [isTranslating, setIsTranslating] = useState(false);
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
      if (result.error) {
        setErrorAi(result.error);
        setAiAnalysis(null);
      } else {
        setAiAnalysis(result);
      }
    } else {
      setErrorAi("Analysis service unavailable. Please try again later.");
    }
    setLoadingAi(false);
  };

  const handleTranslate = async () => {
    if (!aiAnalysis || isTranslating) return;

    setIsTranslating(true);
    setErrorAi(null); // Clear previous errors

    try {
      const translatedData = await translateAnalysis(aiAnalysis);
      if (translatedData) {
        setAiAnalysis({
          ...aiAnalysis,
          translatedData
        });
      } else {
        throw new Error("فشلت الترجمة. حاول مرة أخرى.");
      }
    } catch (error: any) {
      console.error("Translation error:", error);
      setErrorAi(error.message || "Failed to translate. Please try again.");
    } finally {
      setIsTranslating(false);
    }
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
    const upper = text.toUpperCase();
    if (upper === 'AVOID') return 'text-white bg-red-600 border-red-500 shadow-lg shadow-red-900/40 ring-2 ring-red-500/20 font-black';
    if (upper === 'HIGH RISK' || upper.includes('SELL') || upper.includes('SHORT')) return 'text-status-risk bg-status-risk/10 border-status-risk/20 font-bold';
    if (upper === 'ENTER' || upper === 'BUY' || upper.includes('LONG')) return 'text-status-high bg-status-high/10 border-status-high/20 font-bold';
    if (upper.includes('WAIT')) return 'text-status-warning bg-status-warning/10 border-status-warning/20 font-bold';
    return 'text-text-primary bg-surface border-surface';
  };

  const isLong = trade.type === TradeType.LONG;
  const isRisky = trade.confidenceScore < 50;

  // --- CHART DATA GENERATION (OHLC) ---
  const chartData = useMemo(() => {
    // Generate mock OHLC data for the chart
    const data = [];
    const points = 30; // Number of candles
    const volatility = Math.abs(trade.entryRange[0] - trade.stopLoss) * 0.5; // Volatility relative to stop distance

    // Determine trend based on trade type
    const startPrice = trade.entryRange[0];
    const endPrice = trade.takeProfit[0];
    const totalMove = endPrice - startPrice;

    for (let i = 0; i < points; i++) {
      const trend = (totalMove / points) * i; // Linear trend component
      const randomMove = (Math.random() - 0.5) * volatility;

      const open = i === 0 ? startPrice : data[i - 1].close;
      const close = startPrice + trend + randomMove;

      const high = Math.max(open, close) + Math.random() * (volatility * 0.5);
      const low = Math.min(open, close) - Math.random() * (volatility * 0.5);

      data.push({
        name: i,
        date: new Date(Date.now() + i * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        open,
        high,
        low,
        close,
        bodyRange: [Math.min(open, close), Math.max(open, close)],
        wickRange: [low, high],
        isBullish: close >= open
      });
    }

    // Determine domain for Y-axis
    const allHighs = data.map(d => d.high);
    const allLows = data.map(d => d.low);
    // Include critical levels in domain
    const minPrice = Math.min(...allLows, trade.stopLoss);
    const maxPrice = Math.max(...allHighs, ...trade.takeProfit);

    let range = maxPrice - minPrice;
    if (range === 0) range = maxPrice * 0.01;
    if (range === 0) range = 1;

    const domain = [minPrice - (range * 0.1), maxPrice + (range * 0.1)];

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
          <div className="flex-1 w-full relative z-10 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData.data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isLong ? '#22C55E' : '#EF4444'} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={isLong ? '#22C55E' : '#EF4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} strokeOpacity={0.2} />
                <XAxis dataKey="i" hide />
                <YAxis
                  domain={chartData.domain}
                  orientation="right"
                  tick={{ fill: '#9AA4B2', fontSize: 11, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                  tickFormatter={(val: number) => val.toFixed(2)}
                />
                <RechartsTooltip
                  content={({ active, payload: p }: any) => {
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
                  label={{ value: 'SL', position: 'insideRight', fill: '#EF4444', fontSize: 10, fontWeight: 'bold' }}
                />
                <ReferenceLine
                  y={trade.entryRange[0]}
                  stroke="#9AA4B2"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  label={{ value: 'ENTRY', position: 'insideRight', fill: '#9AA4B2', fontSize: 10 }}
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

                {/* Candlestick Rendering - Standard Bar Implementation */}
                {/* Wick Layer - Thin bar from Low to High */}
                <Bar
                  dataKey="wickRange"
                  barSize={1}
                  animationDuration={1500}
                >
                  {chartData.data.map((entry, index) => (
                    <Cell key={`wick-${index}`} fill={entry.isBullish ? '#22C55E' : '#EF4444'} />
                  ))}
                </Bar>

                {/* Body Layer - Thicker bar from Open to Close */}
                <Bar
                  dataKey="bodyRange"
                  barSize={8}
                  animationDuration={1500}
                >
                  {chartData.data.map((entry, index) => (
                    <Cell key={`body-${index}`} fill={entry.isBullish ? '#22C55E' : '#EF4444'} />
                  ))}
                </Bar>

                {/* High/Low range hidden but needed for domain */}
                <Line type="monotone" dataKey="high" stroke="none" dot={false} activeDot={false} />
                <Line type="monotone" dataKey="low" stroke="none" dot={false} activeDot={false} />
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
            {aiAnalysis && !aiAnalysis.translatedData && (
              <button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-status-neutral/10 border border-status-neutral/20 text-status-neutral text-sm font-bold hover:bg-status-neutral/20 transition-all disabled:opacity-50"
              >
                {isTranslating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Languages size={16} />
                )}
                ترجمة للعربية
              </button>
            )}
            {aiAnalysis?.translatedData && (
              <button
                onClick={() => setAiAnalysis({ ...aiAnalysis, translatedData: undefined })}
                className="text-xs font-bold text-text-muted hover:text-text-primary transition-colors underline"
              >
                Show English
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
            <div className="animate-fade-in space-y-8">
              {/* 1. Decision Hero Section */}
              <div className={`rounded-2xl p-8 border border-surface shadow-2xl relative overflow-hidden bg-background-primary/50 backdrop-blur-sm`}>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Cpu size={120} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6 opacity-80">
                    <Zap size={18} className="text-status-neutral" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-text-primary">Strategic Decision</span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className={`px-8 py-6 rounded-xl border-2 transition-all ${getDecisionColor(aiAnalysis.currentStatus?.decision || '')} flex flex-col items-center justify-center min-w-[220px] shadow-lg`}>
                      <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Decision: {aiAnalysis.currentStatus?.decision}</span>
                      <h2 className="text-5xl font-black tracking-tighter italic">{aiAnalysis.currentStatus?.decision || 'WAIT'}</h2>
                    </div>

                    <div className="flex-1">
                      <p className="text-2xl font-medium text-text-primary leading-tight tracking-tight">
                        {aiAnalysis.translatedData?.currentStatus.keyPrinciple || aiAnalysis.currentStatus?.keyPrinciple || 'Capital preservation first.'}
                      </p>
                      {aiAnalysis.translatedData && (
                        <p className="text-xs font-bold text-status-neutral mt-2 uppercase tracking-widest">
                          Decision: {aiAnalysis.translatedData.currentStatus.decision}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Metrics Table (The Image Design) */}
              <div className="bg-background-primary/30 border border-surface rounded-2xl overflow-hidden">
                <div className="grid grid-cols-1 divide-y divide-surface/50">
                  {/* Confidence Row */}
                  <div className="flex justify-between items-center p-5 group hover:bg-surface/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-status-high/10 flex items-center justify-center text-status-high">
                        <BadgeCheck size={18} />
                      </div>
                      <span className="text-sm font-bold text-text-secondary">Confidence</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-status-high/60">{aiAnalysis.currentStatus.confidenceScore}%</span>
                      <span className="text-lg font-black text-status-high tracking-tight">
                        {aiAnalysis.currentStatus.marketPosition}
                      </span>
                    </div>
                  </div>

                  {/* Execution Level Row */}
                  <div className="flex justify-between items-center p-5 group hover:bg-surface/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-status-neutral/10 flex items-center justify-center text-status-neutral">
                        <Play size={18} className="rotate-90" />
                      </div>
                      <span className="text-sm font-bold text-text-secondary">Execution Level</span>
                    </div>
                    <div className="flex items-center gap-6 font-mono">
                      <span className="text-sm font-bold text-text-muted line-through opacity-50">{trade.entryRange[0]}</span>
                      <span className="text-lg font-black text-status-warning tracking-tight">
                        {aiAnalysis.currentStatus.suggestedExecutionLevel || trade.entryRange[0]}
                      </span>
                    </div>
                  </div>

                  {/* Stop Loss Row */}
                  <div className="flex justify-between items-center p-5 group hover:bg-surface/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-status-risk/10 flex items-center justify-center text-status-risk">
                        <ShieldAlert size={18} />
                      </div>
                      <span className="text-sm font-bold text-text-secondary">Stop Loss</span>
                    </div>
                    <div className="flex items-center gap-6 font-mono">
                      <span className="text-sm font-bold text-text-muted line-through opacity-50">{trade.stopLoss}</span>
                      <span className="text-lg font-black text-status-high tracking-tight">
                        {aiAnalysis.currentStatus.suggestedStopLoss || trade.stopLoss}
                      </span>
                    </div>
                  </div>

                  {/* Risk/Reward Row */}
                  <div className="flex justify-between items-center p-5 group hover:bg-surface/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text-primary">
                        <Scale size={18} />
                      </div>
                      <span className="text-sm font-bold text-text-secondary">Risk/Reward</span>
                    </div>
                    <div className="flex items-center gap-6 font-mono">
                      <span className="text-sm font-bold text-text-muted opacity-50">1:{((Math.abs(trade.takeProfit[0] - trade.entryRange[0])) / Math.abs(trade.entryRange[0] - trade.stopLoss)).toFixed(1)}</span>
                      <span className="text-lg font-black text-status-neutral tracking-tight">
                        {aiAnalysis.currentStatus.suggestedRiskReward || `1:${((Math.abs(trade.takeProfit[0] - trade.entryRange[0])) / Math.abs(trade.entryRange[0] - trade.stopLoss)).toFixed(1)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* 3. Alternative Scenario */}
                <div className="bg-background-secondary border border-surface rounded-2xl p-6 shadow-sm flex flex-col w-full">
                  <h3 className="text-sm font-black uppercase tracking-widest text-text-primary mb-6 flex items-center gap-2">
                    <Activity size={18} className="text-status-neutral" /> Alternative Scenario
                  </h3>
                  <div className="space-y-6 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-surface/30 rounded-xl border border-surface/50">
                        <p className="text-xs font-bold text-text-muted uppercase mb-1">Trigger</p>
                        <p className="text-sm font-medium text-text-primary leading-relaxed">
                          {aiAnalysis.alternativeScenario.invalidationTrigger}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-status-neutral/5 rounded-xl border border-status-neutral/20 text-center">
                          <p className="text-[10px] font-black text-text-muted uppercase mb-1">Entry</p>
                          <p className="text-lg font-mono font-bold text-status-neutral">{aiAnalysis.alternativeScenario.entry}</p>
                        </div>
                        <div className="p-3 bg-status-risk/5 rounded-xl border border-status-risk/20 text-center">
                          <p className="text-[10px] font-black text-text-muted uppercase mb-1">Stop Loss</p>
                          <p className="text-lg font-mono font-bold text-status-risk">{aiAnalysis.alternativeScenario.stopLoss}</p>
                        </div>
                        <div className="p-3 bg-status-high/5 rounded-xl border border-status-high/20 text-center">
                          <p className="text-[10px] font-black text-text-muted uppercase mb-1">Target</p>
                          <p className="text-lg font-mono font-bold text-status-high">{aiAnalysis.alternativeScenario.takeProfit}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-surface/30 rounded-xl border border-surface/50">
                      <p className="text-xs font-bold text-text-muted uppercase mb-2">Rationale</p>
                      <p className="text-base font-medium text-text-secondary leading-relaxed italic">
                        "{aiAnalysis.translatedData?.alternativeScenario.rationale || aiAnalysis.alternativeScenario.rationale}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-surface/30 rounded-xl border border-surface/50">
                        <p className="text-xs font-bold text-text-muted uppercase mb-1">Bias Shift</p>
                        <p className="text-sm font-bold text-status-risk">
                          {aiAnalysis.translatedData?.alternativeScenario.biasShift || aiAnalysis.alternativeScenario.biasShift}
                        </p>
                      </div>
                      <div className="p-4 bg-surface/30 rounded-xl border border-surface/50">
                        <p className="text-xs font-bold text-text-muted uppercase mb-1">Probable Move</p>
                        <p className="text-sm font-bold text-status-neutral">
                          {aiAnalysis.translatedData?.alternativeScenario.nextProbableMove || aiAnalysis.alternativeScenario.nextProbableMove}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Risk & Discipline Protocol */}
                <div className="bg-surface/20 border border-surface rounded-2xl p-8 flex flex-col w-full">
                  <h3 className="text-xs font-black uppercase tracking-widest text-text-primary mb-6 flex items-center gap-2">
                    <Shield size={16} className="text-status-neutral" /> Risk & Discipline Protocol
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {(aiAnalysis.translatedData?.riskDiscipline || aiAnalysis.riskDiscipline).map((rule, idx) => (
                      <li key={idx} className="flex gap-4 text-sm font-bold text-text-secondary items-center p-4 bg-surface/30 rounded-xl border border-surface/50 transition-all hover:border-status-neutral/30 group">
                        <span className="w-2 h-2 rounded-full bg-status-neutral shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:scale-125 transition-transform" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 5. Action Protocol */}
              <div className="bg-status-neutral rounded-2xl p-6 shadow-xl shadow-blue-900/20 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <Activity size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/70">Action Protocol</h4>
                    <p className="text-lg font-bold text-white tracking-tight">
                      {aiAnalysis.translatedData?.actionProtocol || aiAnalysis.actionProtocol}
                    </p>
                  </div>
                </div>
                <div className="h-8 w-px bg-white/10 hidden md:block"></div>
                <div className="text-xs font-bold text-white/60 tracking-widest uppercase">
                  Safety First • Capital Preservation
                </div>
              </div>

              {/* Token Usage Stats */}
              {aiAnalysis.usageMetadata && (
                <div className="text-[10px] text-text-muted mt-4 text-center font-mono opacity-60">
                  AI ENGINE v2.0 • {aiAnalysis.usageMetadata.totalTokenCount} TOKENS PROCESSED
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};