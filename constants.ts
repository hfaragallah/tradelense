import { 
  UserSettings, Trade, TradeType, TimeHorizon, RationaleTag, 
  TraderProfile, MarketPulse, LeaderboardEntry, TrustScoreData, 
  DiscussionPost, DiscussionTag, Notification, NotificationType, 
  PremiumPackage 
} from './types';

export const DEFAULT_SETTINGS: UserSettings = {
  profile: {
    email: 'alex@tradelens.app',
    bio: 'Swing trader focused on crypto and macro trends. Risk management first.',
    visibility: 'Public'
  },
  notifications: {
    emailDigest: true,
    tradeAlerts: true,
    newFollowers: false,
    mentions: true,
    marketing: false
  },
  appearance: {
    compactMode: false,
    showPnL: true
  },
  billing: {
    autoRenewal: true,
    creditCardLast4: '4242',
    creditCardExpiry: '12/25'
  }
};

export const MOCK_PROFILE: TraderProfile = {
  id: 'u_me',
  name: 'Alex Trader',
  handle: '@alextrades',
  isAdmin: true, // Enabled Admin Access
  reputationScore: 85,
  points: 500,
  joinedDate: '2023-01-15',
  winRate: 62,
  riskAdjustedReturn: 2.4,
  totalTrades: 142,
  badges: [
    { id: 'b1', label: 'Disciplined', icon: 'Shield', color: 'text-status-high', description: 'Consistently respects stop losses.' },
    { id: 'b2', label: 'Macro Eye', icon: 'Eye', color: 'text-purple-400', description: 'High accuracy on timeframe > 1 week.' }
  ],
  accuracyHistory: [
    { date: 'Jan', accuracy: 55 },
    { date: 'Feb', accuracy: 58 },
    { date: 'Mar', accuracy: 52 },
    { date: 'Apr', accuracy: 60 },
    { date: 'May', accuracy: 63 },
    { date: 'Jun', accuracy: 61 },
    { date: 'Jul', accuracy: 65 }
  ],
  biasInsights: [
    "Tendency to short tech stocks during earnings week (Contrarian Bias).",
    "Exits winning trades 15% earlier than optimal targets."
  ]
};

export const MOCK_TRADES: Trade[] = [
  {
    id: 't1',
    authorId: 'u_1',
    authorName: 'Sarah Jenkins',
    authorReputation: 92,
    asset: 'BTC/USD',
    market: 'Crypto',
    type: TradeType.LONG,
    entryRange: [42000, 42500],
    stopLoss: 41200,
    takeProfit: [44000, 45500],
    timeHorizon: TimeHorizon.SWING,
    rationale: "Classic retest of the weekly breakout level. RSI resetting on the 4H timeframe. Funding rates have neutralized, suggesting leverage flush is complete.",
    rationaleTags: [RationaleTag.TECHNICAL, RationaleTag.SENTIMENT],
    confidenceScore: 88,
    crowd: { agree: 145, disagree: 12, wait: 30, totalVotes: 187 },
    timestamp: new Date().toISOString(),
    aiReportsCount: 42
  },
  {
    id: 't2',
    authorId: 'u_2',
    authorName: 'Macro Mike',
    authorReputation: 78,
    asset: 'EUR/USD',
    market: 'Forex',
    type: TradeType.SHORT,
    entryRange: [1.085, 1.088],
    stopLoss: 1.092,
    takeProfit: [1.075],
    timeHorizon: TimeHorizon.POSITION,
    rationale: "ECB dovishness increasing compared to Fed. DXY showing strength at support. Expecting a breakdown of the bear flag structure.",
    rationaleTags: [RationaleTag.MACRO, RationaleTag.TECHNICAL],
    confidenceScore: 72,
    crowd: { agree: 45, disagree: 40, wait: 15, totalVotes: 100 },
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    aiReportsCount: 15
  }
];

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, traderId: 'u_1', name: 'Sarah Jenkins', reputation: 92, disciplineScore: 98, avoidanceRate: 94 },
  { rank: 2, traderId: 'u_3', name: 'Quant Daddy', reputation: 89, disciplineScore: 95, avoidanceRate: 91 },
  { rank: 3, traderId: 'u_4', name: 'Safe Hands', reputation: 88, disciplineScore: 93, avoidanceRate: 89 },
  { rank: 4, traderId: 'u_5', name: 'Chart Master', reputation: 85, disciplineScore: 88, avoidanceRate: 85 },
  { rank: 5, traderId: 'u_6', name: 'Risk Manager', reputation: 82, disciplineScore: 85, avoidanceRate: 82 }
];

export const MOCK_PULSE: MarketPulse = {
  sentiment: 'Fear',
  riskLevel: 'Moderate',
  insight: "Market participants are hedging downside risk ahead of CPI data. VIX is elevating. Recommend reducing position sizing by 30% until volatility stabilizes."
};

export const MOCK_TRUST_DATA: TrustScoreData = {
  totalScore: 850,
  level: 'Guardian',
  percentile: 5,
  history: [
    { date: 'Week 1', score: 720 },
    { date: 'Week 2', score: 750 },
    { date: 'Week 3', score: 780 },
    { date: 'Week 4', score: 820 },
    { date: 'Current', score: 850 }
  ],
  components: [
    { category: 'Transparency', score: 95, icon: 'Eye', description: 'Open sharing of P&L and history.' },
    { category: 'Risk Control', score: 88, icon: 'ShieldCheck', description: 'Adherence to stop losses.' },
    { category: 'Crowd Value', score: 72, icon: 'Users', description: 'Helpful contributions to discussions.' },
    { category: 'Consistency', score: 85, icon: 'TrendingUp', description: 'Stable performance over time.' }
  ],
  improvementTips: [
    "Participate in 3 more discussions this week to boost Crowd Value.",
    "Maintain your current risk sizing for another 2 weeks to reach 'Veteran' consistency status."
  ]
};

export const MOCK_DISCUSSIONS: DiscussionPost[] = [
  {
    id: 'd1',
    authorName: 'Sarah Jenkins',
    authorReputation: 92,
    title: 'Why the 4-Year Cycle might be broken',
    content: "With the introduction of ETFs, the liquidity dynamics have fundamentally changed. We are seeing flows that don't correlate with previous halving cycles...",
    tag: DiscussionTag.CRYPTO,
    timestamp: new Date().toISOString(),
    upvotes: 45,
    commentCount: 12,
    isPinned: true,
    comments: [
      { id: 'c1', authorName: 'Tom', authorReputation: 60, content: 'Interesting take, but supply shock is supply shock.', timestamp: new Date().toISOString() }
    ]
  },
  {
    id: 'd2',
    authorName: 'Macro Mike',
    authorReputation: 78,
    title: 'Yield Curve Inversion: recession imminent?',
    content: "The 2s10s curve has been inverted for record duration. Historically this predicts a recession within 18 months. Are we different this time?",
    tag: DiscussionTag.MACRO,
    timestamp: new Date(Date.now() - 10000000).toISOString(),
    upvotes: 28,
    commentCount: 5,
    isPinned: false
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: NotificationType.ALERT,
    title: 'Stop Loss Warning',
    message: 'Your shadowed trade on ETH/USD is approaching invalidation level.',
    timestamp: new Date().toISOString(),
    isRead: false
  },
  {
    id: 'n2',
    type: NotificationType.SOCIAL,
    title: 'New Reply',
    message: 'Sarah Jenkins replied to your comment on "Macro Trends".',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isRead: false
  },
  {
    id: 'n3',
    type: NotificationType.TRADE,
    title: 'Trade Target Hit',
    message: 'BTC/USD trade by Alex reached TP1.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isRead: true
  }
];

export const PREMIUM_PACKAGES: PremiumPackage[] = [
  {
    id: 'p_starter',
    name: 'Starter Pack',
    points: 500,
    price: 4.99,
    features: ['5 AI Analyses', 'Basic Discussions', 'Shadow 3 Trades']
  },
  {
    id: 'p_pro',
    name: 'Pro Trader',
    points: 1200,
    price: 9.99,
    isPopular: true,
    features: ['12 AI Analyses', 'Priority Discussions', 'Unlimited Shadowing', 'Risk Badges']
  },
  {
    id: 'p_whale',
    name: 'Whale Tier',
    points: 3000,
    price: 19.99,
    features: ['30 AI Analyses', 'Private Groups', 'Direct Mentorship Access', 'Beta Features']
  }
];