import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ Configuration Error: VITE_GEMINI_API_KEY is missing in .env");
    process.exit(1);
}

// Mock Trade and TimeHorizon/TradeType
const TradeType = { LONG: 'LONG', SHORT: 'SHORT' };
const TimeHorizon = {
    SCALP: 'Scalp (Minutes)',
    INTRADAY: 'Intraday (Hours)',
    SWING: 'Swing (Days)',
    POSITION: 'Position (Weeks)'
};

// Simplified version of the service logic for testing
async function testAnalyzeTrade() {
    const trade = {
        id: 'test-123',
        asset: 'BTC/USDT',
        market: 'Crypto',
        type: TradeType.LONG,
        entryRange: [42000, 42500],
        stopLoss: 41000,
        takeProfit: [45000, 48000],
        timeHorizon: TimeHorizon.SWING,
        rationale: "Breaking out of a bull flag on the 4H timeframe. RSI is consolidating near 50, showing room for upward momentum.",
        confidenceScore: 75
    };

    console.log(`🚀 Testing AI Analysis for: ${trade.asset} (${trade.type})`);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    ROLE:
    You are an institutional-grade trading intelligence AI.
    Your job is to validate the trade idea below across simulated external sentiment and market intelligence.
    Return a JSON object with the specified structure.

    CONTEXT:
    - Asset: ${trade.asset} (${trade.market})
    - Trade Type: ${trade.type}
    - Technicals: Entry ${trade.entryRange.join('-')}, SL ${trade.stopLoss}, TP ${trade.takeProfit.join(',')}
    - User Rationale: "${trade.rationale}"
    - Crowd Confidence: ${trade.confidenceScore}/100

    OUTPUT FORMAT:
    {
      "currentStatus": {
        "decision": "ENTER" | "WAIT" | "HIGH RISK" | "AVOID",
        "marketPosition": "string",
        "riskNote": "string",
        "keyPrinciple": "string"
      },
      "governance": {
        "sentimentScore": number,
        "sentimentVerdict": "Bullish" | "Bearish" | "Neutral",
        "confidenceLevel": "High" | "Medium" | "Low",
        "externalSignals": [
           { "source": "TradingView Sentiment", "signal": "Bullish"|"Bearish"|"Neutral", "strength": "Strong"|"Moderate"|"Weak" }
        ],
        "crowdRiskWarning": "string"
      },
      "sellCriteria": { "setupName": "string", "triggerType": "string", "checklist": ["string"], "outcome": "string" },
      "buyCriteria": { "setupName": "string", "triggerType": "string", "checklist": ["string"], "outcome": "string" },
      "riskDiscipline": { "stopLossComment": "string", "riskRewardQuality": "string", "behavioralNote": "string" },
      "actionRules": { "rule1": "string", "rule2": "string", "recommendation": "string" },
      "alternativeScenario": { "setupName": "string", "triggerType": "string", "entry": "string", "stopLoss": "string", "takeProfit": "string", "rationale": "string" }
    }
  `;

    try {
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        const result = JSON.parse(text);

        console.log("\n✅ AI RESPONSE RECEIVED:");
        console.log(JSON.stringify(result, null, 2));

        // Basic Validation
        const requiredSections = ['currentStatus', 'governance', 'sellCriteria', 'buyCriteria', 'riskDiscipline', 'actionRules', 'alternativeScenario'];
        const missing = requiredSections.filter(section => !result[section]);

        if (missing.length === 0) {
            console.log("\n🎉 SUCCESS: All rich report sections are present.");
        } else {
            console.log(`\n❌ FAILURE: Missing sections: ${missing.join(', ')}`);
        }

    } catch (error) {
        console.error("❌ TEST FAILED:", error);
    }
}

testAnalyzeTrade();
