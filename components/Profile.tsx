import React from 'react';
import { TraderProfile } from '../types';
import { 
  TrendingUp, Activity, Award, 
  Shield, Scissors, Eye, UserPlus, UserCheck
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid } from 'recharts';

interface ProfileProps {
  profile: TraderProfile;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ profile, isFollowing, onToggleFollow }) => {
  // Helper to get badge icon
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <Shield size={16} />;
      case 'Scissors': return <Scissors size={16} />;
      case 'Eye': return <Eye size={16} />;
      default: return <Award size={16} />;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Profile Header */}
      <div className="bg-background-secondary border border-surface rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 relative">
        {/* Follow Button (Top Right on desktop, top on mobile) */}
        {onToggleFollow && (
          <div className="absolute top-4 right-4 md:top-8 md:right-8">
             <button 
                onClick={onToggleFollow}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-lg
                  ${isFollowing 
                    ? 'bg-surface text-text-muted border border-surface hover:border-text-muted' 
                    : 'bg-status-neutral text-white hover:bg-blue-600 shadow-blue-900/20'}`
                }
             >
                {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                {isFollowing ? 'Following' : 'Follow'}
             </button>
          </div>
        )}

        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center text-3xl font-bold text-text-muted border-4 border-background-primary shadow-xl overflow-hidden">
             {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
             ) : (
                profile.name.charAt(0)
             )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-status-high text-background-primary text-xs font-bold px-2 py-1 rounded-full border-2 border-background-secondary">
             {profile.reputationScore} REP
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-text-primary mb-1">{profile.name}</h1>
          <p className="text-text-muted text-sm mb-4">{profile.handle} • Joined {new Date(profile.joinedDate).toLocaleDateString()}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
             <span className="px-3 py-1 rounded-full bg-surface border border-surface text-xs text-text-secondary flex items-center gap-1">
                <TrendingUp size={12} /> Swing Trader
             </span>
             <span className="px-3 py-1 rounded-full bg-surface border border-surface text-xs text-text-secondary flex items-center gap-1">
                <Activity size={12} /> Crypto Focused
             </span>
          </div>

          {/* Badges */}
          {profile.badges && (
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {profile.badges.map(badge => (
                <div key={badge.id} className={`group relative px-3 py-1.5 rounded-lg border border-surface/50 bg-surface/20 flex items-center gap-2 ${badge.color}`}>
                   {getBadgeIcon(badge.icon)}
                   <span className="text-xs font-bold">{badge.label}</span>
                   
                   {/* Tooltip */}
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-surface border border-text-muted/20 p-2 rounded shadow-xl text-[10px] text-text-primary text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                     {badge.description}
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-8 border-t md:border-t-0 md:border-l border-surface pt-6 md:pt-0 md:pl-8">
           <div className="text-center">
              <div className="text-2xl font-mono font-bold text-status-high">{profile.winRate}%</div>
              <div className="text-xs text-text-muted uppercase tracking-wider">Win Rate</div>
           </div>
           <div className="text-center">
              <div className="text-2xl font-mono font-bold text-text-primary">{profile.riskAdjustedReturn}</div>
              <div className="text-xs text-text-muted uppercase tracking-wider">R Metric</div>
           </div>
           <div className="text-center">
              <div className="text-2xl font-mono font-bold text-text-primary">{profile.totalTrades}</div>
              <div className="text-xs text-text-muted uppercase tracking-wider">Trades</div>
           </div>
        </div>
      </div>

      {/* Main Chart Full Width */}
      <div className="bg-background-secondary border border-surface rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <Award size={18} className="text-status-neutral" /> Accuracy History
          </h3>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={profile.accuracyHistory}>
              <defs>
                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2633" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2633', borderColor: '#374151', color: '#E6E8EB' }}
                itemStyle={{ color: '#E6E8EB' }}
                cursor={{ stroke: '#3B82F6', strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorAccuracy)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};