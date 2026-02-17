import React, { useState } from 'react';
import { LayoutDashboard, TrendingUp, Users, Activity, ShieldCheck, Medal, MessageSquare, Search, Bell, Menu, X, LogOut, User, Settings, Plus, Zap, LogIn } from 'lucide-react';
import { TraderProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
  unreadCount?: number;
  userProfile: TraderProfile | null; // Null indicates guest
  isGuest: boolean;
  onOpenPremium: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeView,
  onNavigate,
  unreadCount = 0,
  userProfile,
  isGuest,
  onOpenPremium,
  onOpenAuth,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  const NavIcons = () => (
    <div className="flex items-center gap-1 md:gap-6">
      <NavItem
        icon={<LayoutDashboard size={22} />}
        label="Feed"
        active={activeView === 'feed'}
        onClick={() => handleNavClick('feed')}
      />
      <NavItem
        icon={<MessageSquare size={22} />}
        label="Social"
        active={activeView === 'social'}
        onClick={() => handleNavClick('social')}
      />
      <NavItem
        icon={<TrendingUp size={22} />}
        label="Shadow"
        active={activeView === 'shadow'}
        onClick={() => handleNavClick('shadow')}
      />
      <NavItem
        icon={<Medal size={22} />}
        label="Rank"
        active={activeView === 'leaderboard'}
        onClick={() => handleNavClick('leaderboard')}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background-primary text-text-primary font-sans antialiased selection:bg-surface selection:text-status-high">

      {/* Fixed Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-background-secondary border-b border-surface z-50 px-4">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">

          {/* Logo & Search */}
          <div className="flex items-center gap-4 md:gap-8 flex-1">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleNavClick('feed')}
            >
              <img src="/logo.svg" alt="TraderLense" className="w-8 h-8" />
              <span className="hidden md:block text-xl font-bold tracking-tight text-text-primary">TraderLense</span>
            </div>

            <div className="hidden md:flex items-center bg-surface/50 border border-surface rounded-full px-4 py-1.5 w-64 focus-within:border-status-neutral focus-within:bg-surface transition-all group">
              <Search size={16} className="text-text-muted mr-2 group-focus-within:text-text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search trades, assets..."
                className="bg-transparent border-none outline-none text-sm text-text-primary w-full placeholder:text-text-muted"
              />
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center">
            <NavIcons />
            <div className="h-8 w-px bg-surface mx-6"></div>

            {isGuest ? (
              // GUEST MODE NAV RIGHT
              <div className="flex items-center gap-4">
                <button
                  onClick={onOpenAuth}
                  className="text-sm font-bold text-text-secondary hover:text-text-primary transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-5 py-2 bg-status-high text-background-primary font-bold rounded-lg hover:bg-green-400 transition-colors shadow-lg shadow-green-900/20 flex items-center gap-2"
                >
                  Join Now
                </button>
              </div>
            ) : (
              // LOGGED IN NAV RIGHT
              <>
                {/* Points Indicator */}
                <div className="flex items-center gap-1 mr-4 bg-surface/50 rounded-full pl-3 pr-1 py-1 border border-surface/50 hover:border-status-high/50 transition-colors group">
                  <Zap size={14} className="text-status-high group-hover:animate-pulse" />
                  <span className="font-mono text-sm font-bold text-text-primary mr-2">{userProfile?.points || 0}</span>
                  <button
                    onClick={onOpenPremium}
                    className="w-6 h-6 rounded-full bg-status-high text-background-primary flex items-center justify-center hover:bg-green-400 transition-colors"
                    title="Buy Points"
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>

                <button
                  onClick={() => handleNavClick('notifications')}
                  className={`relative p-2.5 rounded-full transition-all duration-200 ${activeView === 'notifications' ? 'bg-surface text-text-primary shadow-inner' : 'text-text-muted hover:text-text-primary hover:bg-surface/50'}`}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-status-risk rounded-full ring-2 ring-background-secondary animate-pulse"></span>
                  )}
                </button>

                <button
                  onClick={() => handleNavClick('settings')}
                  className={`ml-2 p-2.5 rounded-full transition-all duration-200 ${activeView === 'settings' ? 'bg-surface text-text-primary shadow-inner' : 'text-text-muted hover:text-text-primary hover:bg-surface/50'}`}
                >
                  <Settings size={20} />
                </button>

                <button
                  onClick={onLogout}
                  className="ml-2 p-2.5 rounded-full text-text-muted hover:text-status-risk hover:bg-surface/50 transition-all duration-200"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>

                {/* User Profile Summary */}
                <div className="ml-6 flex items-center gap-4">

                  {/* Reputation Pill */}
                  <div
                    className="hidden lg:flex items-center gap-3 cursor-pointer group pl-6 border-l border-surface"
                    onClick={() => handleNavClick('trust')}
                  >
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider group-hover:text-status-high transition-colors">
                        {userProfile?.badges?.[0]?.label || 'Rank'}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono font-bold text-sm text-text-primary">{userProfile?.reputationScore || 0}</span>
                        <span className="text-[10px] font-medium text-text-secondary">RP</span>
                      </div>
                    </div>

                    {/* Styled Icon Container */}
                    <div className="w-9 h-9 rounded-xl bg-surface/50 border border-surface group-hover:border-status-high/30 flex items-center justify-center transition-all shadow-sm group-hover:shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                      <ShieldCheck size={18} className="text-status-high" />
                    </div>
                  </div>

                  {/* Avatar */}
                  <button
                    onClick={() => handleNavClick('profile')}
                    className="relative group"
                  >
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 overflow-hidden ${activeView === 'profile' ? 'border-status-neutral shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' : 'border-transparent group-hover:border-surface ring-2 ring-surface'}`}>
                      {userProfile?.avatar ? (
                        <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <span className="font-bold text-sm text-text-primary bg-surface w-full h-full flex items-center justify-center">{userProfile?.name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    {/* Status Indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-status-high border-2 border-background-secondary rounded-full"></div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-text-primary p-2 hover:bg-surface rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background-secondary/95 backdrop-blur-sm pt-20 px-4 md:hidden animate-in fade-in slide-in-from-top-5 duration-200 overflow-y-auto">
          {/* Mobile Profile Summary */}
          {isGuest ? (
            <div className="bg-surface border border-surface rounded-xl p-6 mb-6 text-center">
              <h3 className="text-xl font-bold text-text-primary mb-2">Guest Mode</h3>
              <p className="text-text-muted text-sm mb-4">Join TraderLense to unlock full access.</p>
              <button
                onClick={() => { onOpenAuth(); setIsMobileMenuOpen(false); }}
                className="w-full py-3 bg-status-high text-background-primary font-bold rounded-lg"
              >
                Log In / Sign Up
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-5 mb-6 bg-gradient-to-br from-surface to-background-secondary rounded-2xl border border-surface shadow-lg">
              <div className="w-14 h-14 rounded-full border-2 border-surface flex items-center justify-center overflow-hidden shadow-inner">
                {userProfile?.avatar ? (
                  <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-xl text-text-primary">{userProfile?.name?.charAt(0) || '?'}</span>
                )}
              </div>
              <div>
                <div className="font-bold text-lg text-text-primary">{userProfile?.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 bg-status-high/10 px-2 py-0.5 rounded-md border border-status-high/20">
                    <ShieldCheck size={12} className="text-status-high" />
                    <span className="text-xs font-bold text-status-high">{userProfile?.reputationScore} Rep</span>
                  </div>
                  <div className="flex items-center gap-1 bg-surface px-2 py-0.5 rounded-md border border-surface/50">
                    <Zap size={12} className="text-status-high" />
                    <span className="text-xs font-bold text-text-primary">{userProfile?.points} Pts</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pb-8">
            {!isGuest && (
              <button
                onClick={() => { onOpenPremium(); setIsMobileMenuOpen(false); }}
                className="flex items-center justify-center gap-2 p-3 mb-2 rounded-xl bg-status-high text-background-primary font-bold shadow-lg shadow-green-900/20"
              >
                <Zap size={18} fill="currentColor" /> Top Up Points
              </button>
            )}

            <button
              onClick={() => handleNavClick('feed')}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface/50 active:bg-surface text-text-primary font-bold transition-colors"
            >
              <LayoutDashboard size={20} className="text-status-neutral" /> Trade Feed
            </button>
            <button
              onClick={() => handleNavClick('social')}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface/50 active:bg-surface text-text-primary font-bold transition-colors"
            >
              <MessageSquare size={20} className="text-purple-400" /> Social Hub
            </button>
            <button
              onClick={() => handleNavClick('shadow')}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface/50 active:bg-surface text-text-primary font-bold transition-colors"
            >
              <TrendingUp size={20} className="text-status-high" /> Shadow Dashboard
            </button>
            <button
              onClick={() => handleNavClick('leaderboard')}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface/50 active:bg-surface text-text-primary font-bold transition-colors"
            >
              <Medal size={20} className="text-status-warning" /> Leaderboard
            </button>

            <div className="h-px bg-surface my-2 mx-4"></div>

            <button
              onClick={() => handleNavClick('profile')}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface/50 active:bg-surface text-text-primary font-medium transition-colors"
            >
              <User size={20} className="text-text-muted" /> My Profile
            </button>
            <button
              onClick={() => handleNavClick('trust')}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface/50 active:bg-surface text-text-primary font-medium transition-colors"
            >
              <ShieldCheck size={20} className="text-text-muted" /> Trust Score
            </button>

            <button
              onClick={() => handleNavClick('notifications')}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface/50 active:bg-surface text-text-primary font-medium justify-between transition-colors"
            >
              <div className="flex items-center gap-4">
                <Bell size={20} className="text-text-muted" /> Notifications
              </div>
              {unreadCount > 0 && (
                <span className="bg-status-risk text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{unreadCount}</span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('settings')}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface/50 active:bg-surface text-text-primary font-medium transition-colors"
            >
              <Settings size={20} className="text-text-muted" /> Settings
            </button>

            {!isGuest && (
              <button
                onClick={onLogout}
                className="flex items-center gap-4 p-4 text-text-muted font-medium hover:text-status-risk transition-colors mt-4"
              >
                <LogOut size={20} /> Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area - Centered Container */}
      <div className="pt-20 pb-8 px-0 md:px-4 max-w-7xl mx-auto">
        {children}
      </div>

    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all relative group
        ${active
          ? 'text-text-primary'
          : 'text-text-muted hover:text-text-primary'
        }`}
    >
      <div className="relative p-1">
        {icon}
        {active && (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-status-neutral shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
        )}
      </div>
      <span className="text-[10px] font-medium hidden lg:block opacity-80 group-hover:opacity-100 transition-opacity">{label}</span>

      {/* Hover Indicator */}
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-text-primary scale-x-0 group-hover:scale-x-50 transition-transform origin-center lg:hidden"></span>
    </button>
  );
};