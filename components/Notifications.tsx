import React, { useState } from 'react';
import { Notification, NotificationType } from '../types';
import { Bell, MessageCircle, AlertTriangle, Settings, CheckCheck, TrendingUp, Info, ArrowLeft, Filter } from 'lucide-react';

interface NotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigateSettings: () => void;
  onBack?: () => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onNavigateSettings,
  onBack
}) => {
  const [filter, setFilter] = useState<NotificationType | 'ALL'>('ALL');

  const filteredNotifications = notifications.filter(n => 
    filter === 'ALL' ? true : n.type === filter
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.ALERT: return <AlertTriangle size={18} className="text-status-warning" />;
      case NotificationType.SOCIAL: return <MessageCircle size={18} className="text-status-neutral" />;
      case NotificationType.TRADE: return <TrendingUp size={18} className="text-status-high" />;
      case NotificationType.SYSTEM: return <Info size={18} className="text-text-muted" />;
      default: return <Bell size={18} />;
    }
  };

  const NavButton = ({ type, label, icon }: { type: NotificationType | 'ALL', label: string, icon: React.ReactNode }) => (
    <button 
      onClick={() => setFilter(type)}
      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
        filter === type 
          ? 'bg-surface text-text-primary font-bold border-l-4 border-status-neutral' 
          : 'text-text-secondary hover:bg-surface/50'
      }`}
    >
      {icon}
      <span>{label}</span>
      {type === 'ALL' && unreadCount > 0 && (
         <span className="ml-auto text-xs bg-status-risk text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
      )}
    </button>
  );

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-text-muted hover:text-text-primary mb-2 transition-colors"
            >
              <ArrowLeft size={18} /> Back to Dashboard
            </button>
          )}
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Bell className="text-status-neutral" size={28} /> Notifications
          </h1>
          <p className="text-text-muted mt-1">Stay updated on alerts, social interactions, and system events.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-surface border border-surface rounded-lg transition-colors"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
          <button 
            onClick={onNavigateSettings}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-surface border border-surface rounded-lg transition-colors"
          >
            <Settings size={16} /> Preferences
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="col-span-1 space-y-2">
           <div className="mb-2 px-4 text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <Filter size={12} /> Filters
           </div>
           <NavButton type="ALL" label="All Notifications" icon={<Bell size={18} />} />
           <NavButton type={NotificationType.ALERT} label="Price Alerts" icon={<AlertTriangle size={18} />} />
           <NavButton type={NotificationType.TRADE} label="Trade Updates" icon={<TrendingUp size={18} />} />
           <NavButton type={NotificationType.SOCIAL} label="Social & Mentions" icon={<MessageCircle size={18} />} />
           <NavButton type={NotificationType.SYSTEM} label="System" icon={<Info size={18} />} />
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3 bg-background-secondary border border-surface rounded-xl p-6 md:p-8 min-h-[500px]">
           
           <h2 className="text-xl font-bold text-text-primary mb-6 border-b border-surface pb-4">
              {filter === 'ALL' ? 'Recent Activity' : `${filter.charAt(0) + filter.slice(1).toLowerCase().replace('_', ' ')} Notifications`}
           </h2>

           <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
                    <Bell size={32} />
                </div>
                <h3 className="text-text-primary font-bold">No notifications found</h3>
                <p className="text-text-muted text-sm mt-1">You're all caught up for this category.</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div 
                  key={notification.id}
                  onClick={() => onMarkAsRead(notification.id)}
                  className={`relative p-5 rounded-xl border transition-all cursor-pointer group flex gap-4
                    ${notification.isRead 
                      ? 'bg-background-secondary border-transparent hover:bg-surface/30' 
                      : 'bg-surface/20 border-status-neutral/30 hover:border-status-neutral/50'
                    }`}
                >
                  {!notification.isRead && (
                    <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-status-neutral animate-pulse"></div>
                  )}
                  
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-surface border border-surface/50 mt-1`}>
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm font-bold ${notification.isRead ? 'text-text-secondary' : 'text-text-primary'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-text-muted whitespace-nowrap ml-4">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {notification.message}
                    </p>
                    
                    {notification.actionLink && (
                       <div className="mt-3">
                          <span className="text-xs font-bold text-status-neutral hover:underline">View Details</span>
                       </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};