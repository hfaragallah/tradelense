import React from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, Shield, MinusCircle, UserPlus, UserCheck } from 'lucide-react';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  followedTraders: string[];
  onFollow: (id: string) => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, followedTraders, onFollow }) => {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
           <Trophy className="text-status-warning" size={28} /> Discipline Leaderboard
        </h1>
        <p className="text-text-muted">Ranking traders by risk management and avoidance of bad trades. Not profit.</p>
      </div>

      {/* MOBILE VIEW: Card Layout (< md) */}
      <div className="md:hidden space-y-4">
        {entries.map((entry) => {
          const isFollowing = followedTraders.includes(entry.traderId);
          return (
            <div key={entry.traderId} className="bg-background-secondary border border-surface rounded-xl p-5 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold font-mono text-sm shadow-inner
                        ${entry.rank === 1 ? 'bg-status-warning text-background-primary' : 
                          entry.rank === 2 ? 'bg-gray-300 text-background-primary' :
                          entry.rank === 3 ? 'bg-amber-700 text-white' : 'text-text-secondary bg-surface border border-surface'}
                      `}>
                        {entry.rank}
                      </div>
                      <div>
                          <div className="font-bold text-text-primary text-lg">{entry.name}</div>
                          <div className="text-xs text-text-muted">@{entry.name.toLowerCase()}</div>
                      </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onFollow(entry.traderId);
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                      ${isFollowing 
                        ? 'bg-surface text-text-muted border border-surface hover:border-text-muted' 
                        : 'bg-status-neutral text-white hover:bg-blue-600 shadow-sm'}`
                    }
                  >
                    {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                  </button>
               </div>

               <div className="grid grid-cols-3 gap-2">
                  <div className="bg-surface/30 rounded-lg p-2 text-center border border-surface/50">
                     <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold block mb-1">Reputation</span>
                     <span className="inline-flex items-center gap-1 text-sm font-bold text-status-neutral">
                        <Shield size={12} /> {entry.reputation}
                     </span>
                  </div>
                  <div className="bg-surface/30 rounded-lg p-2 text-center border border-surface/50">
                     <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold block mb-1">Discipline</span>
                     <span className="text-sm font-bold font-mono text-status-high">{entry.disciplineScore}</span>
                  </div>
                  <div className="bg-surface/30 rounded-lg p-2 text-center border border-surface/50">
                     <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold block mb-1">Avoidance</span>
                     <span className="inline-flex items-center gap-1 text-sm font-bold text-text-primary">
                        <MinusCircle size={12} className="text-text-muted" /> {entry.avoidanceRate}%
                     </span>
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP VIEW: Table Layout (>= md) */}
      <div className="hidden md:block bg-background-secondary border border-surface rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-surface/50 text-xs text-text-muted uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Rank</th>
              <th className="p-4 font-semibold">Trader</th>
              <th className="p-4 font-semibold text-right">Reputation</th>
              <th className="p-4 font-semibold text-right">Discipline Score</th>
              <th className="p-4 font-semibold text-right">Avoidance Rate</th>
              <th className="p-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface">
            {entries.map((entry) => {
              const isFollowing = followedTraders.includes(entry.traderId);
              return (
              <tr key={entry.traderId} className="hover:bg-surface/30 transition-colors group cursor-pointer">
                <td className="p-4">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold font-mono shadow-sm
                    ${entry.rank === 1 ? 'bg-status-warning text-background-primary' : 
                      entry.rank === 2 ? 'bg-gray-300 text-background-primary' :
                      entry.rank === 3 ? 'bg-amber-700 text-white' : 'text-text-secondary bg-surface border border-surface'}
                  `}>
                    {entry.rank}
                  </div>
                </td>
                <td className="p-4">
                  <div className="font-bold text-text-primary">{entry.name}</div>
                  <div className="text-xs text-text-muted">@{entry.name.toLowerCase()}</div>
                </td>
                <td className="p-4 text-right">
                   <span className="inline-flex items-center gap-1 text-sm font-medium text-status-neutral">
                     <Shield size={14} /> {entry.reputation}
                   </span>
                </td>
                <td className="p-4 text-right">
                   <div className="flex flex-col items-end">
                      <span className="text-lg font-bold font-mono text-status-high">{entry.disciplineScore}</span>
                      <span className="text-[10px] text-text-muted">POINTS</span>
                   </div>
                </td>
                <td className="p-4 text-right">
                   <div className="flex flex-col items-end">
                      <span className="text-sm font-bold font-mono text-text-primary flex items-center gap-1">
                        <MinusCircle size={14} className="text-text-muted" /> {entry.avoidanceRate}%
                      </span>
                   </div>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onFollow(entry.traderId);
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                      ${isFollowing 
                        ? 'bg-surface text-text-muted border border-surface hover:border-text-muted' 
                        : 'bg-status-neutral text-white hover:bg-blue-600 shadow-sm'}`
                    }
                  >
                    {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};