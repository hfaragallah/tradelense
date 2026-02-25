
import { analyzeTrade } from '../services/geminiService';
import { Trade, TimeHorizon, TradeType, RationaleTag } from '../types';

const mockTrade: Trade = {
    id: 'test-id',
    authorId: 'test-user',
    authorName: 'Test Trader',
    authorReputation: 100,
    asset: 'BTC',
    market: 'Crypto',
    type: TradeType.LONG,
    entryRange: [50000, 51000],
    stopLoss: 48000,
    takeProfit: [55000, 60000],
    rationale: 'Double bottom on 4H chart with bullish divergence on RSI.',
    rationaleTags: [RationaleTag.TECHNICAL],
    confidenceScore: 85,
    crowd: {
        agree: 10,
        disagree: 2,
        wait: 1,
        totalVotes: 13
    },
    timeHorizon: TimeHorizon.SWING,
    timestamp: new Date().toISOString()
};

async function test() {
    console.log('--- Testing AI Trade Report Generation ---');
    try {
        const result = await analyzeTrade(mockTrade);
        if (result) {
            console.log('SUCCESS: AI Report Generated');
            console.log('Decision:', result.currentStatus.decision);
            console.log('Sentiment Score:', result.governance?.sentimentScore);
            console.log('Keys:', Object.keys(result));
            if (result.error) {
                console.warn('AI reported an error:', result.error);
            }
        } else {
            console.error('FAILURE: No result returned from analyzeTrade');
        }
    } catch (error) {
        console.error('EXCEPTION during test:', error);
    }
}

test();
