// Settings Interface
export interface UserSettings {
  profile: {
    email: string;
    bio: string;
    visibility: 'Public' | 'Followers Only' | 'Private';
  };
  notifications: {
    emailDigest: boolean;
    tradeAlerts: boolean;
    newFollowers: boolean;
    mentions: boolean;
    marketing: boolean;
  };
  appearance: {
    compactMode: boolean;
    showPnL: boolean;
  };
  billing: {
    autoRenewal: boolean;
    creditCardLast4: string;
    creditCardExpiry: string;
  };
}

// Enums
export enum TradeType {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export enum TimeHorizon {
  SCALP = 'Scalp (Minutes)',
  INTRADAY = 'Intraday (Hours)',
  SWING = 'Swing (Days)',
  POSITION = 'Position (Weeks)'
}

export enum RationaleTag {
  TECHNICAL = 'Technical',
  FUNDAMENTAL = 'Fundamental',
  SENTIMENT = 'Sentiment',
  MACRO = 'Macro',
  ONCHAIN = 'On-Chain'
}

export enum DiscussionTag {
  GENERAL = 'General',
  MACRO = 'Macro',
  PSYCHOLOGY = 'Psychology',
  STRATEGY = 'Strategy',
  CRYPTO = 'Crypto',
  FOREX = 'Forex'
}

export enum ValidationType {
  AGREE = 'AGREE',
  DISAGREE = 'DISAGREE',
  WAIT = 'WAIT',
  OVEREXTENDED = 'OVEREXTENDED'
}

export enum NotificationType {
  ALERT = 'ALERT',
  TRADE = 'TRADE',
  SOCIAL = 'SOCIAL',
  SYSTEM = 'SYSTEM'
}

// Domain Interfaces
export interface Trade {
  id: string;
  authorId: string;
  authorName: string;
  authorReputation: number;
  asset: string;
  market: string;
  type: TradeType;
  entryRange: [number, number];
  stopLoss: number;
  takeProfit: number[];
  timeHorizon: TimeHorizon;
  rationale: string;
  rationaleTags: RationaleTag[];
  confidenceScore: number;
  crowd: {
    agree: number;
    disagree: number;
    wait: number;
    totalVotes: number;
  };
  timestamp: string;
  imageUrl?: string;
  isShadowed?: boolean;
  aiReportsCount?: number;
}

export interface TraderProfile {
  id: string;
  name: string;
  handle: string;
  email?: string;
  avatar?: string;
  isAdmin?: boolean; // Added Admin Flag
  reputationScore: number;
  points: number;
  joinedDate: string;
  winRate: number;
  riskAdjustedReturn: number;
  totalTrades: number;
  badges: {
    id: string;
    label: string;
    icon: string; // 'Shield' | 'Scissors' | 'Eye' | 'Award'
    color: string;
    description: string;
  }[];
  accuracyHistory: { date: string; accuracy: number }[];
  biasInsights?: string[];
}

export interface CampaignJoiner {
  id: string;
  email: string;
  preference: string; // Crypto, Forex, etc.
  timestamp: string;
  source: string; // 'LetsTradeTogether'
}

export interface AIAnalysisResult {
  currentStatus: {
    decision: 'ENTER' | 'WAIT' | 'HIGH RISK' | 'AVOID';
    marketPosition: string; // e.g., "Bullish"
    riskNote: string; // The "Primary Risk" note
    keyPrinciple: string;
    suggestedExecutionLevel?: string;
    suggestedStopLoss?: string;
    suggestedRiskReward?: string;
    confidenceScore?: number;
  };
  alternativeScenario: {
    invalidationTrigger: string; // "If price breaks below/above X.XXXX"
    biasShift: string;
    nextProbableMove: string;
    entry: string;
    stopLoss: string;
    takeProfit: string;
    rationale: string;
  };
  riskDiscipline: string[]; // List of rules
  actionProtocol: string; // One sentence clear command
  translatedData?: {
    currentStatus: {
      decision: string;
      keyPrinciple: string;
    };
    alternativeScenario: {
      biasShift: string;
      nextProbableMove: string;
      rationale: string;
    };
    riskDiscipline: string[];
    actionProtocol: string;
  };
  error?: string;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}


export interface MarketPulse {
  sentiment: 'Greed' | 'Bullish' | 'Fear' | 'Bearish' | 'Neutral';
  riskLevel: 'Extreme' | 'High' | 'Moderate' | 'Low';
  insight: string;
}

export interface LeaderboardEntry {
  rank: number;
  traderId: string;
  name: string;
  reputation: number;
  disciplineScore: number;
  avoidanceRate: number;
}

export interface TrustScoreData {
  totalScore: number;
  level: string;
  percentile: number;
  history: { date: string; score: number }[];
  components: {
    category: string;
    score: number;
    icon: string;
    description: string;
  }[];
  improvementTips: string[];
}

export interface DiscussionComment {
  id: string;
  authorName: string;
  authorReputation: number;
  content: string;
  timestamp: string;
}

export interface DiscussionPost {
  id: string;
  authorName: string;
  authorReputation: number;
  title: string;
  content: string;
  tag: DiscussionTag;
  timestamp: string;
  upvotes: number;
  commentCount: number;
  isPinned: boolean;
  imageUrl?: string;
  comments?: DiscussionComment[];
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionLink?: string;
}

export interface PremiumPackage {
  id: string;
  name: string;
  points: number;
  price: number;
  features: string[];
  isPopular?: boolean;
}

export interface TradeImageAnalysisResult {
  asset: string;
  market: string;
  type: TradeType;
  entry: number;
  entryMax?: number; // Optional range
  stopLoss: number;
  takeProfit: number[];
  rationale: string;
  timeHorizon: TimeHorizon;
  rationaleTags: RationaleTag[];
}