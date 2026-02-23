import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { TradeCard } from '../components/TradeCard';
import { TradeDetail } from '../components/TradeDetail';
import { Profile } from '../components/Profile';
import { Leaderboard } from '../components/Leaderboard';
import { MarketPulse } from '../components/MarketPulse';
import { TrustScore } from '../components/TrustScore';
import { SocialHub } from '../components/SocialHub';
import { DiscussionDetail } from '../components/DiscussionDetail';
import { CreateTradeModal } from '../components/CreateTradeModal';
import { CreateDiscussionModal } from '../components/CreateDiscussionModal';
import { JoinCommunityModal } from '../components/JoinCommunityModal';
import { Notifications } from '../components/Notifications';
import { Settings } from '../components/Settings';
import { PremiumModal } from '../components/PremiumModal';
import { AdminPanel } from '../components/AdminPanel';
import { AuthModal } from '../components/AuthModal';
import { MOCK_TRADES, MOCK_PROFILE, MOCK_LEADERBOARD, MOCK_PULSE, MOCK_TRUST_DATA, MOCK_DISCUSSIONS, MOCK_NOTIFICATIONS, DEFAULT_SETTINGS } from '../constants';
import { Trade, RationaleTag, DiscussionPost, TraderProfile, DiscussionTag, ValidationType, Notification, NotificationType, UserSettings, PremiumPackage, CampaignJoiner } from '../types';
import { Filter, Plus, ShieldCheck, MapPin, Hash, Bookmark, MoreHorizontal, SlidersHorizontal, ChevronDown, AlertCircle, CheckCircle2, XCircle, UserPlus, UserCheck, Users, BarChart2, ThumbsUp, ThumbsDown, HelpCircle, AlertTriangle, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, createProfile } from '../services/appwrite';
import { initGA, logPageView } from '../services/analytics';
import { SEO } from '../components/SEO';

// --- Left Sidebar Component (Identity & Nav) ---
const LeftSidebar = ({
  profile,
  activeView,
  onNavigate,
  socialFilter,
  setSocialFilter,
  selectedDiscussion,
  selectedTrade,
  userVote,
  onVote,
  onJoinClick,
  isGuest
}: {
  profile: TraderProfile | null,
  activeView: string,
  onNavigate: (v: string) => void,
  socialFilter: DiscussionTag | 'All',
  setSocialFilter: (t: DiscussionTag | 'All') => void,
  selectedDiscussion: DiscussionPost | null,
  selectedTrade: Trade | null,
  userVote: ValidationType | null,
  onVote: (t: ValidationType) => void,
  onJoinClick: () => void,
  isGuest: boolean
}) => {

  // Dynamic Crowd Calculation Helper
  const getDisplayMetrics = () => {
    if (!selectedTrade) return { agree: 0, disagree: 0, wait: 0, totalVotes: 0, score: 0 };
    return {
      ...selectedTrade.crowd,
      score: selectedTrade.confidenceScore
    };
  };

  const metrics = getDisplayMetrics();

  return (
    <div className="space-y-4 sticky top-24">
      {/* Identity Card OR Crowd Consensus (Trade) */}
      {activeView === 'detail' && selectedTrade ? (
        // --- Crowd Consensus & Validation (Trade) ---
        <div className="bg-background-secondary border border-surface rounded-xl p-5 shadow-sm animate-fade-in">
          <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
            <BarChart2 size={18} className="text-status-neutral" /> Crowd Consensus
          </h3>

          <div className="mb-6">
            <div className="flex justify-between text-xs text-text-muted mb-2">
              <span>Confidence</span>
              <span className={`font-bold ${metrics.totalVotes === 0 ? 'text-text-muted' : metrics.score >= 75 ? 'text-status-high' : metrics.score >= 50 ? 'text-status-warning' : 'text-status-risk'}`}>
                {metrics.totalVotes === 0 ? 'No votes yet' : `${metrics.score}%`}
              </span>
            </div>

            {/* Bars */}
            <div className="w-full bg-surface rounded-full h-2 overflow-hidden flex mb-2">
              {metrics.totalVotes > 0 ? (
                <>
                  <div className="bg-status-high h-full transition-all duration-500" style={{ width: `${(metrics.agree / metrics.totalVotes) * 100}%` }}></div>
                  <div className="bg-status-risk h-full transition-all duration-500" style={{ width: `${(metrics.disagree / metrics.totalVotes) * 100}%` }}></div>
                  <div className="bg-status-neutral h-full transition-all duration-500" style={{ width: `${(metrics.wait / metrics.totalVotes) * 100}%` }}></div>
                </>
              ) : (
                <div className="bg-surface h-full w-full"></div>
              )}
            </div>

            <div className="flex justify-between text-[10px] text-text-muted mt-2">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-high"></span> {metrics.agree}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-risk"></span> {metrics.disagree}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-neutral"></span> {metrics.wait}</span>
            </div>
          </div>

          {/* Voting Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4 pt-4 border-t border-surface">
            <button
              onClick={() => onVote(ValidationType.AGREE)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all
                  ${userVote === ValidationType.AGREE
                  ? 'bg-status-high/20 border-status-high text-status-high'
                  : 'bg-surface border-surface text-text-secondary hover:bg-surface/80'}`}
            >
              <ThumbsUp size={16} className="mb-1" />
              <span className="text-[10px] font-bold">Agree</span>
            </button>

            <button
              onClick={() => onVote(ValidationType.DISAGREE)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all
                  ${userVote === ValidationType.DISAGREE
                  ? 'bg-status-risk/20 border-status-risk text-status-risk'
                  : 'bg-surface border-surface text-text-secondary hover:bg-surface/80'}`}
            >
              <ThumbsDown size={16} className="mb-1" />
              <span className="text-[10px] font-bold">Disagree</span>
            </button>

            <button
              onClick={() => onVote(ValidationType.WAIT)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all
                  ${userVote === ValidationType.WAIT
                  ? 'bg-status-neutral/20 border-status-neutral text-status-neutral'
                  : 'bg-surface border-surface text-text-secondary hover:bg-surface/80'}`}
            >
              <HelpCircle size={16} className="mb-1" />
              <span className="text-[10px] font-bold">Wait</span>
            </button>

            <button
              onClick={() => onVote(ValidationType.OVEREXTENDED)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all
                  ${userVote === ValidationType.OVEREXTENDED
                  ? 'bg-status-warning/20 border-status-warning text-status-warning'
                  : 'bg-surface border-surface text-text-secondary hover:bg-surface/80'}`}
            >
              <AlertTriangle size={16} className="mb-1" />
              <span className="text-[10px] font-bold">Risky</span>
            </button>
          </div>

          <div className="space-y-2 border-t border-surface pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Total Votes</span>
              <span className="text-xs font-bold text-text-primary">{metrics.totalVotes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Market</span>
              <span className="text-xs font-bold text-text-primary">{selectedTrade.market}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Time Horizon</span>
              <span className="text-xs font-bold text-text-primary">{selectedTrade.timeHorizon.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      ) : (
        // --- Default Identity Card ---
        <div className="bg-background-secondary border border-surface rounded-xl overflow-hidden shadow-sm relative group">
          <div className="h-16 bg-gradient-to-r from-status-neutral to-blue-900 opacity-80"></div>
          <div className="px-4 pb-4">
            <div className="relative -mt-8 mb-3">
              <div className="w-16 h-16 rounded-full bg-background-secondary p-1">
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center font-bold text-xl text-text-primary border border-surface overflow-hidden">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    isGuest ? (
                      <Users size={28} className="text-text-muted" />
                    ) : (
                      profile?.name?.charAt(0) || '?'
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="mb-4">
              {isGuest ? (
                <>
                  <h3 className="font-bold text-lg text-text-primary">Guest Viewer</h3>
                  <p className="text-xs text-text-muted">Sign up to build your reputation</p>
                  <button
                    onClick={onJoinClick}
                    className="mt-3 w-full py-2 bg-status-neutral text-white rounded-lg text-xs font-bold"
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  <h3 className="font-bold text-lg text-text-primary hover:underline cursor-pointer" onClick={() => onNavigate('profile')}>
                    {profile?.name}
                  </h3>
                  <p className="text-xs text-text-muted">{profile?.handle}</p>
                </>
              )}
            </div>

            {!isGuest && (
              <>
                <div className="py-3 border-t border-surface flex justify-between text-xs cursor-pointer hover:bg-surface/30 -mx-4 px-4 transition-colors" onClick={() => onNavigate('trust')}>
                  <span className="text-text-secondary">Trust Score</span>
                  <span className="font-bold text-status-high">{profile?.reputationScore}</span>
                </div>
                <div className="py-3 border-t border-surface flex justify-between text-xs cursor-pointer hover:bg-surface/30 -mx-4 px-4 transition-colors">
                  <span className="text-text-secondary">Profile Views</span>
                  <span className="font-bold text-text-primary">142</span>
                </div>

                <div className="pt-3 border-t border-surface text-xs font-semibold text-text-primary flex items-center gap-1">
                  <Bookmark size={12} className="text-text-muted" /> Saved Items
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Secondary Nav / Groups / Filters */}
      <div className="bg-background-secondary border border-surface rounded-xl p-4 shadow-sm hidden md:block">
        {activeView === 'social' ? (
          <>
            <h4 className="text-xs font-bold text-text-primary mb-3 flex items-center gap-2">
              <Filter size={12} /> Discussion Topics
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => setSocialFilter('All')}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${socialFilter === 'All' ? 'bg-status-neutral text-white font-bold' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}
              >
                All Topics
              </button>
              {Object.values(DiscussionTag).map(tag => (
                <button
                  key={tag}
                  onClick={() => setSocialFilter(tag)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${socialFilter === tag ? 'bg-status-neutral text-white font-bold' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h4 className="text-xs font-bold text-text-primary mb-3">Recent</h4>
            <ul className="space-y-3 text-xs text-text-secondary">
              <li className="flex items-center gap-2 hover:text-text-primary cursor-pointer"><Hash size={14} /> macro-economics</li>
              <li className="flex items-center gap-2 hover:text-text-primary cursor-pointer"><Hash size={14} /> btc-halving</li>
              <li className="flex items-center gap-2 hover:text-text-primary cursor-pointer"><Hash size={14} /> psychology</li>
            </ul>
            <div className="mt-4 pt-3 border-t border-surface">
              <h4 className="text-xs font-bold text-status-neutral hover:underline cursor-pointer">Discover Groups</h4>
            </div>
          </>
        )}
      </div>

      {activeView === 'social' && (
        <div className="bg-gradient-to-br from-status-neutral/10 to-transparent border border-status-neutral/20 rounded-xl p-5 hidden md:block">
          <h4 className="font-bold text-status-neutral text-sm mb-2">Community Rule #1</h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            "Critique the idea, not the person." Reputation scores are impacted by constructive participation.
          </p>
        </div>
      )}

      {/* Admin Access Button - Only for Admins */}
      {profile?.isAdmin && !isGuest && (
        <button
          onClick={() => onNavigate('admin')}
          className="hidden md:flex w-full items-center justify-center gap-2 p-3 bg-surface/30 border border-surface/50 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface hover:border-text-muted/30 transition-all text-xs font-bold uppercase tracking-wider"
        >
          <Shield size={14} /> Admin Panel
        </button>
      )}

      {/* Feed Banner - "Let's trade together as one" */}
      {activeView === 'feed' && (
        <div
          onClick={onJoinClick}
          className="relative overflow-hidden rounded-xl shadow-xl animate-fade-in hidden md:block group cursor-pointer mt-2 transform transition-all hover:scale-[1.02]"
        >
          {/* Ad Background with Gradient */}
          <div className="absolute inset-0 bg-gradient-to-bl from-indigo-600 via-purple-600 to-indigo-800"></div>

          {/* Abstract Shapes/Texture */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>

          <div className="relative z-10 p-6 flex flex-col items-center text-center">
            <div className="mb-3 p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg group-hover:rotate-12 transition-transform duration-500">
              <Users size={28} className="text-white drop-shadow-md" />
            </div>

            <h3 className="text-xl font-black text-white leading-none mb-2 drop-shadow-lg tracking-tight">
              Let's Trade<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200">Together As One</span>
            </h3>

            <p className="text-xs text-indigo-100 font-medium mb-5 opacity-90 max-w-[200px]">
              Join the swarm intelligence revolution.
            </p>

            <button className="w-full py-3 bg-white text-indigo-700 text-xs font-black uppercase tracking-widest rounded-lg shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group-hover:gap-3">
              Join <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
};

// --- Right Sidebar Component (Widgets) ---
const RightSidebar = ({
  pulse,
  leaderboard,
  activeView,
  profile,
  followedTraders,
  onFollow,
  selectedDiscussion,
  selectedTrade,
  isGuest
}: {
  pulse: any,
  leaderboard: any[],
  activeView: string,
  profile: TraderProfile | null,
  followedTraders: string[],
  onFollow: (id: string) => void,
  selectedDiscussion: DiscussionPost | null,
  selectedTrade: Trade | null,
  isGuest: boolean
}) => {

  // Custom Profile Sidebar Logic
  if (!isGuest && profile && (activeView === 'profile' || activeView === 'settings')) {
    return (
      <div className="space-y-4 sticky top-24">
        {/* Personal Bias Detector Widget */}
        {profile.biasInsights && profile.biasInsights.length > 0 && (
          <div className="bg-background-secondary border border-surface rounded-xl p-5 relative overflow-hidden shadow-sm animate-fade-in">
            <div className="absolute top-0 right-0 w-16 h-16 bg-status-neutral/10 rounded-bl-full -mr-8 -mt-8"></div>
            <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
              <AlertCircle size={18} className="text-status-neutral" /> Bias Detector
            </h3>
            <ul className="space-y-3">
              {profile.biasInsights.map((insight, i) => (
                <li key={i} className="text-xs text-text-secondary bg-surface/50 p-2 rounded border-l-2 border-status-neutral">
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stats Widgets */}
        <div className="bg-background-secondary border border-surface rounded-xl p-6 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-2 text-text-muted">
            <CheckCircle2 size={18} className="text-status-high" />
            <span className="text-xs uppercase tracking-wider font-semibold">Best Streak</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">8 Trades</div>
        </div>

        <div className="bg-background-secondary border border-surface rounded-xl p-6 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3 mb-2 text-text-muted">
            <XCircle size={18} className="text-status-risk" />
            <span className="text-xs uppercase tracking-wider font-semibold">Max Drawdown</span>
          </div>
          <div className="text-2xl font-bold text-text-primary">-12.4%</div>
        </div>

        {/* Simple Footer */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 px-4 text-[10px] text-text-muted justify-center text-center mt-4">
          <a href="#" className="hover:underline">Share Profile</a>
          <a href="#" className="hover:underline">Report</a>
          <span>TraderLense © 2024</span>
        </div>
      </div>
    );
  }

  // Default Dashboard Logic (Applies to Feed, Social, Detail, etc.)
  return (
    <div className="space-y-4 sticky top-24">
      {/* Market Pulse Widget */}
      <MarketPulse data={pulse} />

      {/* Leaderboard Snippet */}
      <div className="bg-background-secondary border border-surface rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-surface flex justify-between items-center">
          <h2 className="font-bold text-text-primary text-sm">Top Traders</h2>
        </div>
        <div className="p-2">
          {leaderboard.slice(0, 3).map((entry, idx) => {
            const isFollowing = followedTraders.includes(entry.traderId);
            return (
              <div key={idx} className="flex items-center gap-3 p-2 hover:bg-surface/50 rounded-lg cursor-pointer transition-colors group">
                <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center font-bold text-xs text-text-muted border border-surface">
                  {entry.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-text-primary truncate">{entry.name}</div>
                  <div className="text-[10px] text-text-muted flex items-center gap-1">
                    <ShieldCheck size={10} /> {entry.reputation} Rep
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFollow(entry.traderId);
                  }}
                  className={`text-xs font-semibold px-2 py-1 rounded border transition-colors ${isFollowing
                    ? 'border-status-neutral bg-status-neutral/10 text-status-neutral'
                    : 'border-status-neutral/30 text-status-neutral hover:bg-status-neutral/10'}`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
          <button className="w-full mt-2 text-xs text-text-muted hover:text-text-primary py-2">
            View All Leaders
          </button>
        </div>
      </div>

      {/* Footer Links */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 px-4 text-[10px] text-text-muted justify-center text-center">
        <a href="#" className="hover:underline">About</a>
        <a href="#" className="hover:underline">Guidelines</a>
        <a href="#" className="hover:underline">Privacy & Terms</a>
        <a href="#" className="hover:underline">Help Center</a>
        <span>TraderLense © 2024</span>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  // Simple State-based routing
  const [currentView, setCurrentView] = useState<'feed' | 'detail' | 'shadow' | 'profile' | 'leaderboard' | 'trust' | 'social' | 'discussion-detail' | 'notifications' | 'settings' | 'admin'>('feed');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState<DiscussionPost | null>(null);

  // Initialize GA and Track Page Views
  useEffect(() => {
    try {
      initGA();
    } catch (error) {
      console.warn('GA Initialization Failed:', error);
    }
  }, []);

  useEffect(() => {
    try {
      logPageView(`/${currentView}`);
    } catch (error) {
      console.warn('GA Log Page View Failed:', error);
    }
  }, [currentView]);

  // Auth State
  const { user, logout } = useAuth(); // Use Auth Context
  const [isGuest, setIsGuest] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialEmail, setAuthModalInitialEmail] = useState('');
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [userProfile, setUserProfile] = useState<TraderProfile | null>(null); // Null if guest



  // Campaign State
  const [campaignJoins, setCampaignJoins] = useState<CampaignJoiner[]>([
    { id: 'cj_1', email: 'early_access@example.com', preference: 'Crypto', timestamp: new Date(Date.now() - 86400000).toISOString(), source: 'LetsTradeTogether' },
    { id: 'cj_2', email: 'forex_trader@example.com', preference: 'Forex', timestamp: new Date(Date.now() - 3600000).toISOString(), source: 'LetsTradeTogether' }
  ]);

  // Voting State (Lifted from TradeDetail)
  const [userVote, setUserVote] = useState<ValidationType | null>(null);

  // Data State
  const [trades, setTrades] = useState<Trade[]>(MOCK_TRADES);
  const [discussions, setDiscussions] = useState<DiscussionPost[]>(MOCK_DISCUSSIONS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Follow State
  const [followedTraders, setFollowedTraders] = useState<string[]>([]);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Sync Auth State with App State
  useEffect(() => {
    // DEBUG: Force Mock Profile for AI Testing
    setIsGuest(false);
    setUserProfile(MOCK_PROFILE);

    /*
    if (user && user.$id && user.email) {
      setIsGuest(false);
      // Fetch or Create Profile
      const syncProfile = async () => {
        try {
          const existingProfile = await getProfile(user.$id);
          if (existingProfile) {
            // Map Appwrite Document to TraderProfile
            setUserProfile(existingProfile as unknown as TraderProfile); // Type casting for now, ideally map fields
          } else {
            // Create New Profile (Preserve Mock Logic)
            const ADMIN_EMAILS = ['heshamfaragallah@gmail.com', 'hesham-farag@outlook.com'];
            const isHeshamAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
            const newProfile: TraderProfile = {
              id: user.$id,
              name: user.name || (isHeshamAdmin ? 'Hesham Admin' : 'New Trader'),
              handle: isHeshamAdmin ? '@hesham_admin' : `@user_${user.$id.substring(0, 5)}`,
              email: user.email,
              isAdmin: isHeshamAdmin,
              reputationScore: isHeshamAdmin ? 999 : 10,
              points: isHeshamAdmin ? 50000 : 500,
              joinedDate: new Date().toISOString(),
              winRate: 0,
              riskAdjustedReturn: 0,
              totalTrades: 0,
              badges: [],
              accuracyHistory: [],
            };

            try {
              // Send to Appwrite with userId field (required by Profiles collection schema)
              const appwriteProfileData = {
                userId: user.$id,
                handle: newProfile.handle,
                bio: '', // Optional field
                reputationScore: newProfile.reputationScore,
                isAdmin: newProfile.isAdmin,
              };
              await createProfile(appwriteProfileData);
              setUserProfile(newProfile);


              // Add Welcome Notification
              const welcomeNotif: Notification = {
                id: `n_${Date.now()}`,
                type: NotificationType.SYSTEM,
                title: isHeshamAdmin ? 'Welcome Super Admin' : 'Welcome Bonus!',
                message: isHeshamAdmin
                  ? 'You have full administrative access to the platform.'
                  : 'You have received 500 points for joining TraderLense. Use them to unlock AI insights.',
                timestamp: new Date().toISOString(),
                isRead: false
              };
              setNotifications(prev => [welcomeNotif, ...prev]);

            } catch (err) {
              console.error("Failed to create profile", err);
            }
          }
        } catch (err) {
          console.error("Failed to sync profile", err);
        }
      };
      syncProfile();
    } else {
      setIsGuest(true);
      setUserProfile(null);
    }
    */
  }, [user]);
  const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Filter & Sort State
  const [rationaleFilter, setRationaleFilter] = useState<RationaleTag | 'All'>('All');
  const [socialFilter, setSocialFilter] = useState<DiscussionTag | 'All'>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'newest' | 'discussed'>('rating');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  // --- Auth Handlers ---
  const handleAuth = (isRegister: boolean, email?: string) => {
    // This is now largely handled by syncProfile useEffect
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      // ignore API errors — still clear local state
    }
    setIsGuest(true);
    setUserProfile(null);
    setCurrentView('feed');
  };

  const requireAuth = (action: () => void) => {
    if (isGuest) {
      setIsAuthModalOpen(true);
    } else {
      action();
    }
  };

  // Navigation Handler
  const handleNavigate = (view: string) => {
    // Protected Routes
    if (['settings', 'notifications', 'profile', 'admin'].includes(view)) {
      if (isGuest) {
        setIsAuthModalOpen(true);
        return;
      }
    }

    setCurrentView(view as any);
    if (view !== 'detail') {
      setSelectedTrade(null);
      setUserVote(null); // Reset vote on nav
    }
    if (view !== 'discussion-detail') setSelectedDiscussion(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Points Management
  const handleDeductPoints = (amount: number): boolean => {
    if (userProfile && userProfile.points >= amount) {
      setUserProfile(prev => prev ? ({ ...prev, points: prev.points - amount }) : null);
      return true;
    }
    return false;
  };

  const handlePurchasePoints = (pkg: PremiumPackage) => {
    if (userProfile) {
      setUserProfile(prev => prev ? ({ ...prev, points: prev.points + pkg.points }) : null);
      setIsPremiumModalOpen(false);
    }
  };

  const handleJoinCommunity = (email: string, preference: string) => {
    console.log(`Joined with email: ${email} and preference: ${preference}`);
    // 1. Add to Campaign List
    const newJoiner: CampaignJoiner = {
      id: `cj_${Date.now()}`,
      email,
      preference,
      timestamp: new Date().toISOString(),
      source: 'LetsTradeTogether'
    };
    setCampaignJoins(prev => [newJoiner, ...prev]);

    // 2. Trigger registration flow via Auth
    setAuthModalInitialEmail(email);
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const handleVote = (type: ValidationType) => {
    requireAuth(() => {
      if (!selectedTrade) return;

      const prevVote = userVote;
      const newVote = prevVote === type ? null : type; // toggle off if same

      // Helper to get the crowd key for a vote type
      const getCrowdKey = (v: ValidationType): 'agree' | 'disagree' | 'wait' => {
        switch (v) {
          case ValidationType.AGREE: return 'agree';
          case ValidationType.DISAGREE: return 'disagree';
          case ValidationType.WAIT: return 'wait';
          case ValidationType.OVEREXTENDED: return 'disagree';
        }
      };

      const getVoteWeight = (v: ValidationType): number => {
        switch (v) {
          case ValidationType.AGREE: return 100;
          case ValidationType.DISAGREE: return 0;
          case ValidationType.WAIT: return 50;
          case ValidationType.OVEREXTENDED: return 20;
        }
      };

      // Clone current crowd data
      const newCrowd = { ...selectedTrade.crowd };
      let totalWeight = selectedTrade.confidenceScore * selectedTrade.crowd.totalVotes;

      // Remove previous vote if switching
      if (prevVote) {
        const prevKey = getCrowdKey(prevVote);
        newCrowd[prevKey] = Math.max(0, newCrowd[prevKey] - 1);
        newCrowd.totalVotes = Math.max(0, newCrowd.totalVotes - 1);
        totalWeight -= getVoteWeight(prevVote);
      }

      // Add new vote (if not toggling off)
      if (newVote) {
        const newKey = getCrowdKey(newVote);
        newCrowd[newKey] += 1;
        newCrowd.totalVotes += 1;
        totalWeight += getVoteWeight(newVote);
      }

      const newScore = newCrowd.totalVotes > 0 ? Math.round(totalWeight / newCrowd.totalVotes) : 0;

      // Update trade in state
      const updatedTrade = { ...selectedTrade, crowd: newCrowd, confidenceScore: newScore };
      setSelectedTrade(updatedTrade);
      setTrades(prev => prev.map(t => t.id === selectedTrade.id ? updatedTrade : t));
      setUserVote(newVote);
    });
  };

  // Follow Handler
  const handleToggleFollow = (traderId: string) => {
    requireAuth(() => {
      setFollowedTraders(prev =>
        prev.includes(traderId)
          ? prev.filter(id => id !== traderId)
          : [...prev, traderId]
      );
    });
  };

  // Trade Selection
  const handleTradeClick = (trade: Trade) => {
    setSelectedTrade(trade);
    setUserVote(null); // Reset vote when opening new trade
    setCurrentView('detail');
  };

  // Discussion Selection
  const handleDiscussionClick = (post: DiscussionPost) => {
    setSelectedDiscussion(post);
    setCurrentView('discussion-detail');
  };

  // Shadow Action
  const handleShadowTrade = (id: string) => {
    requireAuth(() => {
      setTrades(prev => prev.map(t =>
        t.id === id ? { ...t, isShadowed: true } : t
      ));
      if (selectedTrade && selectedTrade.id === id) {
        setSelectedTrade({ ...selectedTrade, isShadowed: true });
      }
    });
  };

  const handleCreateTrade = (tradeData: Omit<Trade, 'id' | 'timestamp' | 'confidenceScore' | 'crowd'>) => {
    requireAuth(() => {
      const newTrade: Trade = {
        ...tradeData,
        id: `t${Date.now()}`,
        timestamp: new Date().toISOString(),
        confidenceScore: 0,
        crowd: {
          agree: 0,
          disagree: 0,
          wait: 0,
          totalVotes: 0
        }
      };
      setTrades([newTrade, ...trades]);
    });
  };

  const handleCreateDiscussion = (postData: Omit<DiscussionPost, 'id' | 'timestamp' | 'upvotes' | 'commentCount'>) => {
    requireAuth(() => {
      const newPost: DiscussionPost = {
        ...postData,
        id: `d${Date.now()}`,
        timestamp: new Date().toISOString(),
        upvotes: 0,
        commentCount: 0,
        isPinned: false,
        comments: []
      };
      setDiscussions([newPost, ...discussions]);
      // Auto-switch filter to the new post's tag so the user sees it immediately
      setSocialFilter(newPost.tag);
    });
  };

  const handleTogglePin = (id: string) => {
    requireAuth(() => {
      const updateDiscussions = (prev: DiscussionPost[]) => prev.map(post =>
        post.id === id ? { ...post, isPinned: !post.isPinned } : post
      );

      setDiscussions(updateDiscussions);
      if (selectedDiscussion?.id === id) {
        setSelectedDiscussion(prev => prev ? { ...prev, isPinned: !prev.isPinned } : null);
      }
    });
  };

  const [upvotedPosts, setUpvotedPosts] = useState<Set<string>>(new Set());

  const handleUpvote = (postId: string) => {
    requireAuth(() => {
      const alreadyUpvoted = upvotedPosts.has(postId);
      const delta = alreadyUpvoted ? -1 : 1;

      setUpvotedPosts(prev => {
        const next = new Set(prev);
        if (alreadyUpvoted) next.delete(postId);
        else next.add(postId);
        return next;
      });

      setDiscussions(prev => prev.map(post =>
        post.id === postId ? { ...post, upvotes: (post.upvotes || 0) + delta } : post
      ));

      if (selectedDiscussion?.id === postId) {
        setSelectedDiscussion(prev =>
          prev ? { ...prev, upvotes: (prev.upvotes || 0) + delta } : null
        );
      }
    });
  };

  const handleAddComment = (postId: string, content: string) => {
    requireAuth(() => {
      const newComment = {
        id: `c${Date.now()}`,
        authorName: userProfile?.name || 'User',
        authorReputation: userProfile?.reputationScore || 0,
        content,
        timestamp: new Date().toISOString()
      };

      const updateDiscussions = (prev: DiscussionPost[]) => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...(post.comments || []), newComment],
            commentCount: (post.commentCount || 0) + 1
          };
        }
        return post;
      });

      setDiscussions(updateDiscussions);
      if (selectedDiscussion?.id === postId) {
        setSelectedDiscussion(prev => prev ? {
          ...prev,
          comments: [...(prev.comments || []), newComment],
          commentCount: (prev.commentCount || 0) + 1
        } : null);
      }
    });
  };

  // Notification Handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Settings Handler
  const handleSaveSettings = (newSettings: UserSettings, newProfileData: Partial<TraderProfile>) => {
    setSettings(newSettings);
    setUserProfile(prev => prev ? ({ ...prev, ...newProfileData }) : null);
  };

  // Filter & Sort Logic
  const filteredTrades = trades.filter(trade => {
    if (rationaleFilter === 'All') return true;
    return trade.rationaleTags.includes(rationaleFilter);
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    if (sortBy === 'discussed') return b.crowd.totalVotes - a.crowd.totalVotes;
    return b.confidenceScore - a.confidenceScore; // default 'rating'
  });

  // Unread Count for Layout
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- Main Content Renderer ---
  const renderContent = () => {
    switch (currentView) {
      // NOTE: Admin Panel is handled at the root return level now to bypass Layout.
      case 'admin':
        return null;

      case 'detail':
        return selectedTrade ? (
          <TradeDetail
            trade={selectedTrade}
            onBack={() => setCurrentView('feed')}
            onShadow={handleShadowTrade}
            userPoints={userProfile?.points || 0}
            onDeductPoints={handleDeductPoints}
            onOpenPremium={() => setIsPremiumModalOpen(true)}
            isGuest={isGuest}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        ) : <div>Trade not found</div>;

      case 'discussion-detail':
        return selectedDiscussion ? (
          <DiscussionDetail
            post={selectedDiscussion}
            onBack={() => setCurrentView('social')}
            onTogglePin={handleTogglePin}
            onAddComment={handleAddComment}
            onUpvote={handleUpvote}
            isUpvoted={upvotedPosts.has(selectedDiscussion.id)}
          />
        ) : <div>Discussion not found</div>;

      case 'profile':
        return userProfile ? (
          <Profile
            profile={userProfile}
            isFollowing={followedTraders.includes(userProfile.id)}
            onToggleFollow={() => handleToggleFollow(userProfile.id)}
          />
        ) : null; // Should be protected by navigation guard

      case 'leaderboard':
        return <Leaderboard
          entries={MOCK_LEADERBOARD}
          followedTraders={followedTraders}
          onFollow={handleToggleFollow}
        />;

      case 'trust':
        return <TrustScore data={MOCK_TRUST_DATA} />;

      case 'social':
        return <SocialHub
          posts={discussions}
          selectedTag={socialFilter}
          onNewDiscussion={() => requireAuth(() => setIsDiscussionModalOpen(true))}
          onTogglePin={handleTogglePin}
          onDiscussionClick={handleDiscussionClick}
          onUpvote={handleUpvote}
          upvotedPosts={upvotedPosts}
        />;

      case 'notifications':
        return <Notifications
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onNavigateSettings={() => handleNavigate('settings')}
          onBack={() => handleNavigate('feed')}
        />;

      case 'settings':
        return userProfile ? (
          <Settings
            settings={settings}
            profile={userProfile}
            onSave={handleSaveSettings}
            onBack={() => handleNavigate('feed')}
          />
        ) : null;

      case 'shadow':
        const shadowedTrades = trades.filter(t => t.isShadowed);
        return (
          <div className="animate-fade-in">
            <div className="mb-6 bg-background-secondary border border-surface rounded-xl p-6">
              <h1 className="text-2xl font-bold text-text-primary">Shadow Portfolio</h1>
              <p className="text-text-muted">Track trades without capital risk.</p>
            </div>
            {shadowedTrades.length === 0 ? (
              <div className="bg-background-secondary border border-surface rounded-xl p-12 text-center">
                <p className="text-text-muted mb-4">You aren't shadowing any trades yet.</p>
                <button
                  onClick={() => setCurrentView('feed')}
                  className="px-4 py-2 bg-status-neutral hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Browse Feed
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {shadowedTrades.map(trade => (
                  <TradeCard key={trade.id} trade={trade} onClick={handleTradeClick} />
                ))}
              </div>
            )}
          </div>
        );

      case 'feed':
      default:
        return (
          <div className="animate-fade-in">

            {/* Create Post Widget (Like LinkedIn) */}
            <div className="bg-background-secondary border border-surface rounded-xl p-4 mb-6 shadow-sm">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center font-bold text-text-primary border border-surface flex-shrink-0 overflow-hidden text-text-muted">
                  {userProfile?.avatar ? (
                    <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    userProfile?.name?.charAt(0) || <Users size={18} />
                  )}
                </div>
                <button
                  onClick={() => requireAuth(() => setIsCreateOpen(true))}
                  className="flex-1 bg-surface border border-surface rounded-full px-6 text-left text-text-muted text-sm hover:bg-surface/80 transition-colors"
                >
                  Share a new trade setup...
                </button>
              </div>
              <div className="flex justify-between items-center mt-3 pl-16 pr-2">
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 text-text-muted hover:text-text-primary text-xs font-medium" onClick={() => requireAuth(() => setIsCreateOpen(true))}>
                    <ShieldCheck size={16} className="text-status-neutral" /> Verified Trade
                  </button>
                  <button className="flex items-center gap-2 text-text-muted hover:text-text-primary text-xs font-medium" onClick={() => handleNavigate('social')}>
                    <MoreHorizontal size={16} className="text-text-muted" /> Discussion
                  </button>
                </div>
              </div>
            </div>

            {/* Filter & Sort Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

              {/* Horizontal Scrollable Topic Filters */}
              <div className="flex-1 overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar touch-pan-x">
                <div className="flex items-center gap-2 flex-nowrap min-w-full">
                  <button
                    onClick={() => setRationaleFilter('All')}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${rationaleFilter === 'All'
                      ? 'bg-status-neutral text-white border-status-neutral'
                      : 'bg-background-secondary text-text-secondary border-surface hover:border-text-muted hover:text-text-primary'
                      }`}
                  >
                    All
                  </button>
                  {Object.values(RationaleTag).map(tag => (
                    <button
                      key={tag}
                      onClick={() => setRationaleFilter(tag)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${rationaleFilter === tag
                        ? 'bg-status-neutral text-white border-status-neutral'
                        : 'bg-background-secondary text-text-secondary border-surface hover:border-text-muted hover:text-text-primary'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="relative hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-px bg-surface mx-2"></div>
                  <button
                    onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                  >
                    <SlidersHorizontal size={14} />
                    <span>Sort: </span>
                    <span className="text-text-primary font-bold">
                      {sortBy === 'rating' ? 'Top Rated' : sortBy === 'newest' ? 'Newest' : 'Most Active'}
                    </span>
                    <ChevronDown size={12} className={`transition-transform duration-200 ${isSortMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {isSortMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-background-secondary border border-surface rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-1">
                      <button
                        onClick={() => { setSortBy('rating'); setIsSortMenuOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-xs hover:bg-surface transition-colors flex items-center justify-between ${sortBy === 'rating' ? 'text-status-neutral bg-surface/30 font-bold' : 'text-text-secondary'}`}
                      >
                        Top Rated
                        {sortBy === 'rating' && <CheckCircle2 size={14} />}
                      </button>
                      <button
                        onClick={() => { setSortBy('newest'); setIsSortMenuOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-xs hover:bg-surface transition-colors flex items-center justify-between ${sortBy === 'newest' ? 'text-status-neutral bg-surface/30 font-bold' : 'text-text-secondary'}`}
                      >
                        Newest First
                        {sortBy === 'newest' && <CheckCircle2 size={14} />}
                      </button>
                      <button
                        onClick={() => { setSortBy('discussed'); setIsSortMenuOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-xs hover:bg-surface transition-colors flex items-center justify-between ${sortBy === 'discussed' ? 'text-status-neutral bg-surface/30 font-bold' : 'text-text-secondary'}`}
                      >
                        Most Active
                        {sortBy === 'discussed' && <CheckCircle2 size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Backdrop to close */}
                {isSortMenuOpen && (
                  <div className="fixed inset-0 z-10" onClick={() => setIsSortMenuOpen(false)}></div>
                )}
              </div>
            </div>

            {filteredTrades.length === 0 ? (
              <div className="text-center py-12 text-text-muted bg-background-secondary rounded-xl border border-surface">
                No trades found matching your filters.
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTrades.map(trade => (
                  <TradeCard
                    key={trade.id}
                    trade={trade}
                    onClick={handleTradeClick}
                  />
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  const isFullPage = currentView === 'settings' || currentView === 'notifications';

  // --- SPECIAL ADMIN VIEW (NO LAYOUT) ---
  if (currentView === 'admin' && userProfile?.isAdmin) {
    return <AdminPanel onNavigateBack={() => handleNavigate('feed')} onLogout={handleLogout} campaignJoins={campaignJoins} />;
  }

  return (
    <>
      <SEO
        title="Dashboard"
        description="Your AI-powered trading command center."
        url="https://traderlense.com/app"
      />
      <Layout
        activeView={currentView}
        onNavigate={handleNavigate}
        unreadCount={unreadCount}
        userProfile={userProfile}
        isGuest={isGuest}
        onOpenPremium={() => setIsPremiumModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        trades={trades}
        onSearchSelect={(trade) => {
          setSelectedTrade(trade);
          setCurrentView('detail');
        }}
      >
        {/* 3-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Left Column - Navigation & Identity (Hidden on Mobile) */}
          {!isFullPage && currentView !== 'trust' && (
            <aside className="hidden md:block md:col-span-3">
              <LeftSidebar
                profile={userProfile}
                activeView={currentView}
                onNavigate={handleNavigate}
                socialFilter={socialFilter}
                setSocialFilter={setSocialFilter}
                selectedDiscussion={selectedDiscussion}
                selectedTrade={selectedTrade}
                userVote={userVote}
                onVote={handleVote}
                onJoinClick={() => isGuest ? setIsAuthModalOpen(true) : setIsJoinModalOpen(true)}
                isGuest={isGuest}
              />
            </aside>
          )}

          {/* Center Column - Main Content */}
          <main className={`col-span-1 min-h-[80vh] ${isFullPage
            ? 'md:col-span-12'
            : currentView === 'trust'
              ? 'md:col-span-9'
              : 'md:col-span-9 lg:col-span-6'
            }`}>
            {renderContent()}
          </main>

          {/* Right Column - Widgets (Hidden on Tablet/Mobile) */}
          {!isFullPage && (
            <aside className="hidden lg:block lg:col-span-3">
              <RightSidebar
                pulse={MOCK_PULSE}
                leaderboard={MOCK_LEADERBOARD}
                activeView={currentView}
                profile={userProfile}
                followedTraders={followedTraders}
                onFollow={handleToggleFollow}
                selectedDiscussion={selectedDiscussion}
                selectedTrade={selectedTrade}
                isGuest={isGuest}
              />
            </aside>
          )}

        </div>

        <CreateTradeModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreateTrade}
        />
        <CreateDiscussionModal
          isOpen={isDiscussionModalOpen}
          onClose={() => setIsDiscussionModalOpen(false)}
          onSubmit={handleCreateDiscussion}
        />
        <PremiumModal
          isOpen={isPremiumModalOpen}
          onClose={() => setIsPremiumModalOpen(false)}
          onPurchase={handlePurchasePoints}
          currentPoints={userProfile?.points || 0}
        />
        <JoinCommunityModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onSubmit={handleJoinCommunity}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuth={handleAuth}
          initialEmail={authModalInitialEmail}
          initialMode={authModalMode}
        />
      </Layout>
    </>
  );
};

export default Dashboard;