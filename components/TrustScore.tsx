import React from 'react';
import { TrustScoreData } from '../types';
import { ShieldCheck, Eye, Users, TrendingUp, HelpCircle, ArrowUp, Zap, Info } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { Tooltip } from './Tooltip';

interface TrustScoreProps {
  data: TrustScoreData;
}

export const TrustScore: React.FC<TrustScoreProps> = ({ data }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Eye': return <Eye size={20} />;
      case 'ShieldCheck': return <ShieldCheck size={20} />;
      case 'Users': return <Users size={20} />;
      case 'TrendingUp': return <TrendingUp size={20} />;
      default: return <HelpCircle size={20} />;
    }
  };

  const getColor = (score: number) => {
    if (score >= 90) return 'text-status-high bg-status-high';
    if (score >= 70) return 'text-status-neutral bg-status-neutral';
    if (score >= 50) return 'text-status-warning bg-status-warning';
    return 'text-status-risk bg-status-risk';
  };

  // SVG Constants
  const radius = 80; // Increased size slightly
  const stroke = 12; // Thicker stroke
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Assume max score 1000 for calculation
  const progressOffset = circumference - (data.totalScore / 1000) * circumference;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <ShieldCheck className="text-status-high" size={28} /> 
          My Trust Score
          <Tooltip content="A proprietary metric (0-1000) evaluating your transparency, discipline, and community value. Higher scores unlock lower fees and mentorship roles.">
             <Info size={18} className="text-text-muted cursor-help hover:text-text-primary" />
          </Tooltip>
        </h1>
        <p className="text-text-muted">Your reputation in the TradeLens ecosystem. Built on honesty, not just profit.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        
        {/* Main Score Card */}
        <div className="md:col-span-1 bg-background-secondary border border-surface rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-lg">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-status-high to-status-neutral opacity-50"></div>
          
          {/* Gauge Container */}
          <div className="relative mb-6 mt-4">
             <div className="w-52 h-52 flex items-center justify-center relative">
                {/* Center Content */}
                <div className="z-10 flex flex-col items-center justify-center animate-in zoom-in duration-500">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Trust Score</span>
                    <span className="text-6xl font-mono font-bold text-text-primary tracking-tighter drop-shadow-2xl">{data.totalScore}</span>
                    <div className="flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-status-high/10 border border-status-high/20">
                       <Zap size={10} className="text-status-high fill-current" />
                       <span className="text-[10px] font-bold text-status-high">Top {data.percentile}%</span>
                    </div>
                </div>

                {/* SVG Progress */}
                <svg className="absolute top-0 left-0 w-full h-full -rotate-90 filter drop-shadow-lg" viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
                   {/* Track */}
                   <circle 
                     cx={radius} cy={radius} r={normalizedRadius} 
                     stroke="#1F2633" strokeWidth={stroke} 
                     fill="transparent" 
                     strokeLinecap="round"
                   />
                   {/* Progress Indicator */}
                   <circle 
                     cx={radius} cy={radius} r={normalizedRadius} 
                     stroke="#22C55E" strokeWidth={stroke} 
                     fill="transparent" 
                     strokeLinecap="round"
                     strokeDasharray={circumference + ' ' + circumference}
                     style={{ strokeDashoffset: progressOffset }}
                     className="transition-all duration-1000 ease-out"
                   />
                </svg>
             </div>
          </div>
          
          <div className="w-full border-t border-surface pt-6 mt-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Current Level</span>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-status-high to-status-neutral uppercase tracking-wide mt-1">
                {data.level}
            </h2>
            <p className="text-xs text-text-muted mt-2 max-w-[200px] mx-auto">
               Maintain score above 800 to reach <span className="text-text-primary font-bold">Legend</span> status.
            </p>
          </div>
        </div>

        {/* Chart Card */}
        <div className="md:col-span-2 bg-background-secondary border border-surface rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <TrendingUp size={18} className="text-text-muted" /> Score History
             </h3>
             <span className="text-xs font-bold text-status-high bg-status-high/10 px-2 py-1 rounded">+30 pts this month</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2633" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10} 
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1F2633', borderColor: '#374151', color: '#E6E8EB' }}
                  itemStyle={{ color: '#E6E8EB' }}
                  cursor={{ stroke: '#3B82F6', strokeWidth: 1 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#22C55E" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#1F2633', stroke: '#22C55E', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#22C55E' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Component Breakdown */}
      <h2 className="text-lg font-bold text-text-primary mb-4">Trust Components</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {data.components.map((comp, idx) => {
          const colorClass = getColor(comp.score);
          const bgClass = colorClass.split(' ')[1];
          const textClass = colorClass.split(' ')[0];
          
          return (
            <div key={idx} className="bg-background-secondary border border-surface rounded-xl p-5 hover:border-surface/80 transition-colors">
               <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg bg-surface ${textClass}`}>
                        {getIcon(comp.icon)}
                     </div>
                     <div>
                        <h4 className="font-bold text-text-primary">{comp.category}</h4>
                        <div className="text-xs text-text-muted">{comp.description}</div>
                     </div>
                  </div>
                  <span className={`text-xl font-mono font-bold ${textClass}`}>{comp.score}</span>
               </div>
               <div className="w-full bg-surface rounded-full h-2 mt-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${bgClass}`} 
                    style={{ width: `${comp.score}%` }} 
                  />
               </div>
            </div>
          );
        })}
      </div>

      {/* Improvement Tips */}
      <div className="bg-gradient-to-br from-status-neutral/10 to-transparent border border-status-neutral/20 rounded-xl p-6">
         <h3 className="font-bold text-status-neutral mb-4 flex items-center gap-2">
            <ArrowUp size={20} /> How to Improve
         </h3>
         <ul className="space-y-3">
            {data.improvementTips.map((tip, i) => (
               <li key={i} className="flex items-start gap-3 text-sm text-text-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-neutral mt-2 flex-shrink-0"></span>
                  {tip}
               </li>
            ))}
         </ul>
      </div>

    </div>
  );
};