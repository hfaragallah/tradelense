import React, { useEffect, useState } from 'react';
import { TrustScoreData } from '../types';
import { ShieldCheck, Eye, Users, TrendingUp, HelpCircle, ArrowUp, Zap, Info, Shield, Award, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip as RechartsTooltip, CartesianGrid, Area, AreaChart } from 'recharts';
import { Tooltip } from './Tooltip';

interface TrustScoreProps {
  data: TrustScoreData;
}

export const TrustScore: React.FC<TrustScoreProps> = ({ data }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(data.totalScore), 300);
    return () => clearTimeout(timer);
  }, [data.totalScore]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Eye': return <Eye size={24} />;
      case 'ShieldCheck': return <ShieldCheck size={24} />;
      case 'Users': return <Users size={24} />;
      case 'TrendingUp': return <TrendingUp size={24} />;
      default: return <HelpCircle size={24} />;
    }
  };

  const getColor = (score: number) => {
    if (score >= 90) return 'text-status-high bg-status-high';
    if (score >= 70) return 'text-status-neutral bg-status-neutral';
    if (score >= 50) return 'text-status-warning bg-status-warning';
    return 'text-status-risk bg-status-risk';
  };

  // SVG Constants
  const radius = 120; // SIGNIFICANTLY LARGER
  const stroke = 18;  // Thicker stroke for impact
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Calculate progress based on animated score
  const progressOffset = circumference - (animatedScore / 1000) * circumference;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 py-8">

      {/* Header Section */}
      <div className="mb-10 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-black text-text-primary mb-3 tracking-tight flex items-center justify-center gap-4">
          <ShieldCheck className="text-status-high" size={48} strokeWidth={2.5} />
          My Trust Score
        </h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto font-medium">
          Your reputation engine. Prove your discipline, transparency, and consistency to the community.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 mb-10">

        {/* Hero Gauge Card - Takes up 5 columns */}
        <div className="lg:col-span-5 bg-background-secondary/50 backdrop-blur-sm border border-surface rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl group">

          {/* Subtle Dynamic Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-status-high/5 via-transparent to-status-neutral/5 opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-status-high/10 rounded-full blur-3xl animate-pulse-slow"></div>

          {/* Gauge Container */}
          <div className="relative mb-8 mt-2 scale-110 transform transition-transform duration-700">
            <div className="w-80 h-80 flex items-center justify-center relative">
              {/* Center Content */}
              <div className="z-10 flex flex-col items-center justify-center animate-in zoom-in duration-700 delay-100">
                <span className="text-sm font-bold text-text-muted uppercase tracking-[0.2em] mb-2 opacity-80">Current Score</span>
                <span className="text-8xl font-mono font-bold text-text-primary tracking-tighter drop-shadow-2xl tabular-nums">
                  {animatedScore}
                </span>
                <div className="flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-status-high/10 border border-status-high/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                  <Award size={14} className="text-status-high fill-current" />
                  <span className="text-xs font-bold text-status-high uppercase tracking-wider">Top {data.percentile}%</span>
                </div>
              </div>

              {/* SVG Progress Ring */}
              <svg className="absolute top-0 left-0 w-full h-full -rotate-90 filter drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
                {/* Track */}
                <circle
                  cx={radius} cy={radius} r={normalizedRadius}
                  stroke="#151A24" strokeWidth={stroke}
                  fill="transparent"
                  strokeLinecap="round"
                />
                {/* Progress Indicator */}
                <circle
                  cx={radius} cy={radius} r={normalizedRadius}
                  stroke="url(#scoreGradient)" strokeWidth={stroke}
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset: progressOffset }}
                  className="transition-all duration-[1500ms] ease-out"
                />
              </svg>
            </div>
          </div>

          <div className="w-full border-t border-surface/50 pt-6 z-10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Rank Tier</span>
              <Tooltip content="Reach 800+ score to unlock Legend tier benefits including lower fees and mentorship access.">
                <Info size={14} className="text-text-muted cursor-help" />
              </Tooltip>
            </div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-status-high via-status-neutral to-status-high bg-[length:200%_auto] animate-gradient uppercase tracking-wide">
              {data.level}
            </h2>
            <p className="text-sm text-text-muted mt-3 font-medium">
              Next Tier: <span className="text-text-primary border-b border-dashed border-text-secondary">Legend</span> (800 pts)
            </p>
          </div>
        </div>

        {/* History Chart Card - Takes up 7 columns */}
        <div className="lg:col-span-7 bg-background-secondary/50 backdrop-blur-sm border border-surface rounded-3xl p-8 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface/80 border border-surface"><Activity size={20} className="text-status-neutral" /></div>
                Performance History
              </h3>
              <p className="text-text-muted text-sm mt-1">Trust Score trajectory over the last 30 days</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-status-high block">+30 pts</span>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">This Month</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2633" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={15}
                />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0B0E14', borderColor: '#1F2633', borderRadius: '8px', color: '#E6E8EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#E6E8EB', fontWeight: 600 }}
                  cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#22C55E"
                  strokeWidth={3}
                  fill="url(#colorScore)"
                  activeDot={{ r: 6, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Trust Components - 3 Column Grid */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <Shield size={20} className="text-text-muted" /> Component Breakdown
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.components.map((comp, idx) => {
            const colorClass = getColor(comp.score);
            const bgClass = colorClass.split(' ')[1];
            const textClass = colorClass.split(' ')[0];

            return (
              <div key={idx} className="bg-background-secondary border border-surface rounded-2xl p-6 hover:border-surface/80 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl bg-surface/50 border border-surface/50 group-hover:bg-surface group-hover:border-surface transition-colors ${textClass}`}>
                    {getIcon(comp.icon)}
                  </div>
                  <span className={`text-3xl font-mono font-bold ${textClass}`}>{comp.score}</span>
                </div>

                <h4 className="font-bold text-text-primary text-lg mb-1">{comp.category}</h4>
                <div className="text-sm text-text-muted mb-4 h-10 leading-snug">{comp.description}</div>

                <div className="w-full bg-surface rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bgClass} transition-all duration-1000 ease-out`}
                    style={{ width: `${comp.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Improvement Tips */}
      <div className="bg-gradient-to-br from-status-neutral/10 via-background-secondary to-transparent border border-status-neutral/20 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-status-neutral/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h3 className="font-bold text-text-primary text-xl mb-6 flex items-center gap-3">
            <div className="p-1.5 bg-status-neutral text-white rounded-md"><ArrowUp size={18} strokeWidth={3} /></div>
            Actionable Insights
          </h3>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            {data.improvementTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-4 text-sm text-text-secondary p-3 rounded-lg hover:bg-surface/30 transition-colors list-none">
                <span className="w-2 h-2 rounded-full bg-status-neutral mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};