import React, { useState, useRef } from 'react';
import { UserSettings, TraderProfile } from '../types';
import { Save, User, Bell, Shield, Lock, Eye, Mail, Globe, CheckCircle2, ArrowLeft, CreditCard, AlertTriangle, X, Loader2, Camera } from 'lucide-react';
import { z } from 'zod';

interface SettingsProps {
  settings: UserSettings;
  profile: TraderProfile;
  onSave: (newSettings: UserSettings, newProfileData: Partial<TraderProfile>) => void;
  onBack?: () => void;
}

// Validation Schema
const SettingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 chars").max(50, "Name too long"),
  handle: z.string().min(3, "Handle must be at least 3 chars").regex(/^@?[\w_]+$/, "Handle can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(280, "Bio cannot exceed 280 characters"),
});

export const Settings: React.FC<SettingsProps> = ({ settings, profile, onSave, onBack }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'billing'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Card Update State
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [newCardData, setNewCardData] = useState({ number: '', expiry: '', cvc: '', zip: '' });
  const [isCardSaving, setIsCardSaving] = useState(false);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local State for Forms
  const [formData, setFormData] = useState({
    name: profile.name,
    handle: profile.handle,
    avatar: profile.avatar,
    email: settings.profile.email,
    bio: settings.profile.bio,
    visibility: settings.profile.visibility,
    // Notifications
    emailDigest: settings.notifications.emailDigest,
    tradeAlerts: settings.notifications.tradeAlerts,
    newFollowers: settings.notifications.newFollowers,
    mentions: settings.notifications.mentions,
    marketing: settings.notifications.marketing,
    // Appearance/Privacy
    compactMode: settings.appearance.compactMode,
    showPnL: settings.appearance.showPnL,
    // Billing
    autoRenewal: settings.billing?.autoRenewal ?? true,
    creditCardLast4: settings.billing?.creditCardLast4 || '4242',
    creditCardExpiry: settings.billing?.creditCardExpiry || '12/25'
  });

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('avatar', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setError(null);

    // Validation
    const validation = SettingsSchema.safeParse({
      name: formData.name,
      handle: formData.handle,
      email: formData.email,
      bio: formData.bio
    });

    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsSaving(true);
    // Simulate API Call
    setTimeout(() => {
      onSave({
        profile: {
          email: formData.email,
          bio: formData.bio,
          visibility: formData.visibility
        },
        notifications: {
          emailDigest: formData.emailDigest,
          tradeAlerts: formData.tradeAlerts,
          newFollowers: formData.newFollowers,
          mentions: formData.mentions,
          marketing: formData.marketing
        },
        appearance: {
          compactMode: formData.compactMode,
          showPnL: formData.showPnL
        },
        billing: {
          autoRenewal: formData.autoRenewal,
          creditCardLast4: formData.creditCardLast4,
          creditCardExpiry: formData.creditCardExpiry
        }
      }, {
        name: formData.name,
        handle: formData.handle.startsWith('@') ? formData.handle : `@${formData.handle}`,
        avatar: formData.avatar
      });
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const handleUpdateCard = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCardSaving(true);

    // Simulate Card Validation & Processing
    setTimeout(() => {
      const last4 = newCardData.number.slice(-4) || '1234';
      handleChange('creditCardLast4', last4);
      handleChange('creditCardExpiry', newCardData.expiry || '01/28');
      setIsCardSaving(false);
      setIsCardModalOpen(false);
      setNewCardData({ number: '', expiry: '', cvc: '', zip: '' }); // Reset

      // Trigger generic save to persist changes
      handleSave();
    }, 1500);
  };

  const Toggle = ({ label, checked, onChange, description }: { label: string, checked: boolean, onChange: (val: boolean) => void, description?: string }) => (
    <div className="flex items-center justify-between py-4 border-b border-surface last:border-0">
      <div>
        <div className="font-medium text-text-primary text-sm">{label}</div>
        {description && <div className="text-xs text-text-muted mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full p-1 transition-colors relative ${checked ? 'bg-status-high' : 'bg-surface border border-surface'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </button>
    </div>
  );

  return (
    <div className="animate-fade-in max-w-5xl mx-auto relative">
      <div className="mb-6 flex justify-between items-center">
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
            <SettingsIcon size={28} className="text-text-muted" /> Settings
          </h1>
          <p className="text-text-muted mt-1">Manage your account preferences and controls.</p>
          {error && (
            <div className="mt-2 p-2 bg-status-risk/10 border border-status-risk/20 rounded-lg text-status-risk text-sm font-bold flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-status-neutral hover:bg-blue-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : showSuccess ? 'Saved!' : 'Save Changes'}
          {showSuccess ? <CheckCircle2 size={18} /> : <Save size={18} />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="col-span-1 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'profile' ? 'bg-surface text-text-primary font-bold border-l-4 border-status-neutral' : 'text-text-secondary hover:bg-surface/50'}`}
          >
            <User size={18} /> Profile
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'notifications' ? 'bg-surface text-text-primary font-bold border-l-4 border-status-neutral' : 'text-text-secondary hover:bg-surface/50'}`}
          >
            <Bell size={18} /> Notifications
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'privacy' ? 'bg-surface text-text-primary font-bold border-l-4 border-status-neutral' : 'text-text-secondary hover:bg-surface/50'}`}
          >
            <Lock size={18} /> Privacy & View
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'billing' ? 'bg-surface text-text-primary font-bold border-l-4 border-status-neutral' : 'text-text-secondary hover:bg-surface/50'}`}
          >
            <CreditCard size={18} /> Billing & Plans
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-3 bg-background-secondary border border-surface rounded-xl p-6 md:p-8">

          {/* PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-xl font-bold text-text-primary mb-4 border-b border-surface pb-4">Public Profile</h2>

              {/* Avatar Upload */}
              <div className="flex items-center gap-6 mb-2">
                <div
                  className="relative group cursor-pointer w-24 h-24 rounded-full bg-surface border-2 border-surface overflow-hidden flex-shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface text-text-muted text-2xl font-bold">
                      {formData.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} className="text-white" />
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-surface border border-surface rounded-lg text-sm font-medium text-text-primary hover:bg-surface/80 transition-colors mb-2"
                  >
                    Change Avatar
                  </button>
                  <p className="text-xs text-text-muted">JPG, PNG or GIF. Max 2MB.</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Display Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-surface border border-surface/50 rounded-lg px-4 py-3 text-text-primary focus:border-status-neutral outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Handle</label>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => handleChange('handle', e.target.value)}
                    className="w-full bg-surface border border-surface/50 rounded-lg px-4 py-3 text-text-primary focus:border-status-neutral outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="w-full h-24 bg-surface border border-surface/50 rounded-lg px-4 py-3 text-text-primary focus:border-status-neutral outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-surface">
                <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Mail size={18} /> Contact Info
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full bg-surface border border-surface/50 rounded-lg px-4 py-3 text-text-primary focus:border-status-neutral outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATION SETTINGS */}
          {activeTab === 'notifications' && (
            <div className="space-y-2 animate-in fade-in">
              <h2 className="text-xl font-bold text-text-primary mb-6 border-b border-surface pb-4">Notification Preferences</h2>

              <Toggle
                label="Email Digest"
                description="Receive a weekly summary of your stats and top community trades."
                checked={formData.emailDigest}
                onChange={(v) => handleChange('emailDigest', v)}
              />
              <Toggle
                label="Trade Alerts"
                description="Get notified when shadowed trades hit entry, TP, or SL."
                checked={formData.tradeAlerts}
                onChange={(v) => handleChange('tradeAlerts', v)}
              />
              <Toggle
                label="New Followers"
                description="Notify me when someone follows my profile."
                checked={formData.newFollowers}
                onChange={(v) => handleChange('newFollowers', v)}
              />
              <Toggle
                label="Mentions & Replies"
                description="Notify me when tagged in a discussion."
                checked={formData.mentions}
                onChange={(v) => handleChange('mentions', v)}
              />
              <Toggle
                label="Marketing Updates"
                description="Receive news about TraderLense features and events."
                checked={formData.marketing}
                onChange={(v) => handleChange('marketing', v)}
              />
            </div>
          )}

          {/* PRIVACY SETTINGS */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-xl font-bold text-text-primary mb-6 border-b border-surface pb-4">Privacy & Interface</h2>

              <div className="bg-surface/20 border border-surface p-4 rounded-xl mb-6">
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Profile Visibility</label>
                <div className="flex flex-wrap gap-2">
                  {['Public', 'Followers Only', 'Private'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleChange('visibility', option)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${formData.visibility === option
                        ? 'bg-status-neutral text-white border-status-neutral'
                        : 'bg-surface text-text-secondary border-surface hover:border-text-muted'
                        }`}
                    >
                      {option === 'Public' ? <Globe size={16} /> : option === 'Private' ? <Lock size={16} /> : <User size={16} />}
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                  <Eye size={18} /> Display Options
                </h3>
                <Toggle
                  label="Show P&L on Public Profile"
                  description="Allow others to see your exact Profit & Loss numbers."
                  checked={formData.showPnL}
                  onChange={(v) => handleChange('showPnL', v)}
                />
                <Toggle
                  label="Compact Mode"
                  description="Reduce spacing in trade feeds for higher density."
                  checked={formData.compactMode}
                  onChange={(v) => handleChange('compactMode', v)}
                />
              </div>
            </div>
          )}

          {/* BILLING SETTINGS */}
          {activeTab === 'billing' && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-xl font-bold text-text-primary mb-6 border-b border-surface pb-4">Billing & Subscription</h2>

              {/* Active Plan Card */}
              <div className="bg-gradient-to-br from-status-neutral/10 to-background-secondary border border-status-neutral/30 rounded-xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-start z-10 relative">
                  <div>
                    <div className="text-xs font-bold text-status-neutral uppercase tracking-wider mb-2">Current Plan</div>
                    <h3 className="text-2xl font-black text-text-primary mb-1">Trader Pro</h3>
                    <p className="text-text-muted text-sm">$9.99 / month • 1200 Points/mo</p>
                  </div>
                  <div className="bg-status-high text-background-primary text-xs font-bold px-3 py-1 rounded-full">
                    Active
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle2 size={16} className="text-status-high" />
                  Next billing date: <span className="text-text-primary font-bold">Nov 27, 2023</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <h3 className="font-bold text-text-primary mb-2">Subscription Settings</h3>

                <div className="bg-surface/20 border border-surface rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-text-primary text-sm">Auto-Renewal</div>
                    <div className="text-xs text-text-muted mt-1">Automatically renew plan and charge payment method.</div>
                  </div>
                  <button
                    onClick={() => handleChange('autoRenewal', !formData.autoRenewal)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.autoRenewal ? 'bg-status-high' : 'bg-surface border border-text-muted'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.autoRenewal ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="bg-surface/20 border border-surface rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-surface rounded border border-surface/50">
                      <CreditCard size={20} className="text-text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-text-primary text-sm">Visa ending in {formData.creditCardLast4}</div>
                      <div className="text-xs text-text-muted">Expiry {formData.creditCardExpiry}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCardModalOpen(true)}
                    className="text-xs font-bold text-status-neutral hover:underline"
                  >
                    Update
                  </button>
                </div>

                {!formData.autoRenewal && (
                  <div className="p-4 bg-status-warning/10 border border-status-warning/20 rounded-xl text-sm text-status-warning flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Renewal Cancelled</span>
                      <p className="opacity-80 text-xs mt-1">Your subscription will end on Nov 27, 2023. You will lose access to unused rollover points.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* UPDATE CARD MODAL */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background-secondary border border-surface rounded-2xl w-full max-w-md shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-surface">
              <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <CreditCard size={20} className="text-status-neutral" /> Update Payment Method
              </h3>
              <button onClick={() => setIsCardModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateCard} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-surface border border-surface/50 rounded-lg px-4 py-3 text-text-primary focus:border-status-neutral outline-none font-mono"
                  value={newCardData.number}
                  onChange={e => setNewCardData({ ...newCardData, number: e.target.value })}
                  maxLength={19}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full bg-surface border border-surface/50 rounded-lg px-4 py-3 text-text-primary focus:border-status-neutral outline-none font-mono"
                    value={newCardData.expiry}
                    onChange={e => setNewCardData({ ...newCardData, expiry: e.target.value })}
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full bg-surface border border-surface/50 rounded-lg px-4 py-3 text-text-primary focus:border-status-neutral outline-none font-mono"
                    value={newCardData.cvc}
                    onChange={e => setNewCardData({ ...newCardData, cvc: e.target.value })}
                    maxLength={4}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Zip Code</label>
                <input
                  type="text"
                  placeholder="Billing Zip"
                  className="w-full bg-surface border border-surface/50 rounded-lg px-4 py-3 text-text-primary focus:border-status-neutral outline-none"
                  value={newCardData.zip}
                  onChange={e => setNewCardData({ ...newCardData, zip: e.target.value })}
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="flex-1 py-3 rounded-lg text-text-secondary hover:bg-surface font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCardSaving}
                  className="flex-1 py-3 rounded-lg bg-status-neutral text-white font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCardSaving ? <Loader2 size={18} className="animate-spin" /> : 'Save Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);