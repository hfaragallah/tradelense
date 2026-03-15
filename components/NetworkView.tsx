import React, { useState, useEffect } from 'react';
import { TraderProfile } from '../types';
import { Users, UserPlus, UserCheck, Shield, TrendingUp, Search } from 'lucide-react';
import { getFollowers, getFollowing, getProfile } from '../services/appwrite';

interface NetworkViewProps {
  currentUserProfile: TraderProfile;
  onSelectUser: (user: TraderProfile) => void;
  onToggleFollow: (traderId: string) => void;
  followedTraders: string[];
}

export const NetworkView: React.FC<NetworkViewProps> = ({ 
  currentUserProfile, 
  onSelectUser, 
  onToggleFollow,
  followedTraders 
}) => {
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');
  const [followingList, setFollowingList] = useState<TraderProfile[]>([]);
  const [followersList, setFollowersList] = useState<TraderProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNetwork = async () => {
      setIsLoading(true);
      try {
        // Fetch Following
        const followingRes = await getFollowing(currentUserProfile.id);
        const followingProfiles = await Promise.all(
          followingRes.documents.map(async (doc: any) => {
            const profile = await getProfile(doc.followingId);
            return profile as unknown as TraderProfile;
          })
        );
        setFollowingList(followingProfiles.filter(p => p !== null));

        // Fetch Followers
        const followersRes = await getFollowers(currentUserProfile.id);
        const followersProfiles = await Promise.all(
          followersRes.documents.map(async (doc: any) => {
            const profile = await getProfile(doc.followerId);
            return profile as unknown as TraderProfile;
          })
        );
        setFollowersList(followersProfiles.filter(p => p !== null));
      } catch (error) {
        console.error("Error fetching network:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNetwork();
  }, [currentUserProfile.id, followedTraders]); // Re-fetch when follow state changes

  const listToShow = activeTab === 'following' ? followingList : followersList;

  return (
    <div className="animate-fade-in space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
          <Users size={32} className="text-status-neutral" /> My Network
        </h1>
        <p className="text-text-muted">Manage your connections and discover top-performing traders.</p>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-surface">
        <button
          onClick={() => setActiveTab('following')}
          className={`px-8 py-4 text-sm font-bold transition-all relative ${
            activeTab === 'following' ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Following ({followingList.length})
          {activeTab === 'following' && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-status-neutral rounded-t-full shadow-[0_-4px_10px_rgba(59,130,246,0.3)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('followers')}
          className={`px-8 py-4 text-sm font-bold transition-all relative ${
            activeTab === 'followers' ? 'text-text-primary' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Followers ({followersList.length})
          {activeTab === 'followers' && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-status-neutral rounded-t-full shadow-[0_-4px_10px_rgba(59,130,246,0.3)]" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-text-muted animate-pulse">
            <Users size={48} className="mb-4 opacity-20" />
            <p>Loading your network...</p>
          </div>
        ) : listToShow.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-background-secondary border border-surface rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 text-text-muted">
               <Search size={32} />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">
              {activeTab === 'following' ? "You aren't following anyone yet" : "No followers yet"}
            </h3>
            <p className="text-text-muted max-w-sm mb-6">
              {activeTab === 'following' 
                ? "Search for top traders and follow them to see their analysis in your feed." 
                : "Share your analyses and participate in the hub to grow your reputation!"}
            </p>
          </div>
        ) : (
          listToShow.map(user => (
            <div 
              key={user.id}
              className="bg-background-secondary border border-surface rounded-xl p-4 flex items-center gap-4 hover:border-status-neutral/30 transition-all cursor-pointer group"
              onClick={() => onSelectUser(user)}
            >
              <div className="w-12 h-12 rounded-full bg-surface border border-surface overflow-hidden flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-text-muted uppercase text-xl">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                   <h4 className="font-bold text-text-primary truncate">{user.name}</h4>
                   <span className="text-xs text-text-muted truncate">{user.handle}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                   <div className="flex items-center gap-1 text-[10px] font-bold text-status-high uppercase tracking-tighter">
                      <Shield size={10} /> {user.reputationScore} Rep
                   </div>
                   <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted uppercase tracking-tighter">
                      <TrendingUp size={10} /> {user.winRate}% WR
                   </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFollow(user.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  followedTraders.includes(user.id)
                    ? 'bg-surface text-text-muted border border-surface hover:border-text-muted'
                    : 'bg-status-neutral text-white hover:bg-blue-600'
                }`}
              >
                {followedTraders.includes(user.id) ? (
                  <>
                    <UserCheck size={14} /> Following
                  </>
                ) : (
                  <>
                    <UserPlus size={14} /> Follow
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
