import { GoogleGenerativeAI } from "@google/generative-ai";
import { Trade, AIAnalysisResult, TimeHorizon } from "../types";

// Helper to safely get API key
const getApiKey = (): string | undefined => {
  const key = import.meta.env.GEMINI_API_KEY;
  if (!key) {
    console.error("DEBUG: GEMINI_API_KEY is missing. Check your .env file and restart the server.");
  } else {
    console.log("DEBUG: GEMINI_API_KEY is present.");
  }
  return key;
};

export const analyzeTrade = async (trade: Trade): Promise<AIAnalysisResult | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    // Fail silently in production logging, don't expose to UI
    console.warn("AI Service unavailable: Missing configuration.");
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
    You are TradeLens AI, a conservative, risk-aware trading assistant for a freemium platform.
    
    MISSION:
    - Reduce emotional trading (FOMO, revenge trading).
    - Encourage discipline and capital preservation.
    - Act as an objective "Risk Manager", NOT a signal provider.
    - EFFICIENCY MODE: The user pays points for this. Be concise. Focus on what could go wrong (invalidation).

    CONTEXT:
    - Current Market Pulse: "Uncertainty / Mixed Signals" (Assume generic unless specific data provided).
    - Trade Setup: ${trade.asset} (${trade.market}) - ${trade.type}
    - Entry: ${trade.entryRange.join(' - ')} | SL: ${trade.stopLoss} | TP: ${trade.takeProfit.join(', ')}
    - Rationale: "${trade.rationale}"
    - Crowd Confidence: ${trade.confidenceScore}/100

    INSTRUCTIONS:
    Generate a JSON "Trade Confirmation Report". Tone must be calm, professional, and educational.

    1. **Current Status**:
       - decision: "ENTER" (Only if A+ setup), "WAIT" (If unclear/early), "HIGH RISK" (If extended/emotional).
       - marketPosition: Where are we? (e.g., "Mid-Range", "Key Resistance").
       - riskNote: Why might this fail? (e.g., "Buying into resistance", "Stop loss too tight").
       - keyPrinciple: One short maxim relevant to this specific risk (e.g., "Preserve capital > Chasing yield").
    
    2. **Sell/Bearish Checklist** (Even if Long, what validates the Bears?):
       - setupName: Bearish structure name.
       - triggerType: What triggers a sell?
       - checklist: 3 specific invalidation signs.
       - outcome: Result if bears win.

    3. **Buy/Bullish Checklist** (Even if Short, what validates the Bulls?):
       - setupName: Bullish structure name.
       - triggerType: What triggers a buy?
       - checklist: 3 specific confirmation signs.
       - outcome: Result if bulls win.

    4. **Risk & Discipline Notes**:
       - stopLossComment: Critique the SL placement (Technical/Arbitrary?).
       - riskRewardQuality: Comment on the R:R ratio (Is it worth the risk?).
       - behavioralNote: Detect potential FOMO or emotion in the rationale.

    5. **Action Protocol**:
       - rule1: Conditional rule (If X -> Y).
       - rule2: Secondary rule.
       - recommendation: Final conservative summary.
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    if (!text) return null;

    const result = JSON.parse(text) as AIAnalysisResult;

    // Attach usage metadata if available
    if (response.response.usageMetadata) {
      result.usageMetadata = {
        promptTokenCount: response.response.usageMetadata.promptTokenCount || 0,
        candidatesTokenCount: response.response.usageMetadata.candidatesTokenCount || 0,
        totalTokenCount: response.response.usageMetadata.totalTokenCount || 0
      };
    }

    return result;

  } catch (error) {
    // Security Best Practice: Do not log or return raw error details that might expose internal structure or keys
    console.error("Analysis service interruption.");
    return null;
  }
};

// New function to analyze trade screenshot
export const analyzeTradeImage = async (base64Image: string): Promise<import("../types").TradeImageAnalysisResult | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("AI Service unavailable: Missing configuration.");
    return null;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Extract base64 data (remove header if present)
  // Expected format: "data:image/jpeg;base64,..."
  const base64Data = base64Image.split(',')[1] || base64Image;

  const prompt = `
    Analyze this trading chart image and extract the trade setup details.
    
    Return a JSON object with the following fields:
    - asset: The ticker symbol (e.g., BTC/USD, EURUSD, AAPL). Normalize to uppercase.
    - market: One of ["Crypto", "Forex", "Stocks", "Commodities"]. Infer from the asset.
    - type: "LONG" or "SHORT". Look for "Long Position" or "Short Position" tools, or infer from price action relative to entry/targets.
    - entry: The entry price.
    - entryMax: (Optional) If an entry zone is depicted, the upper bound.
    - stopLoss: The stop loss price.
    - takeProfit: An array of take profit prices (e.g., [100.5, 102.0]).
    - rationale: A brief technical summary (max 2 sentences) describing the setup seen (e.g., "Breakout retest with bullish divergence").
    - timeHorizon: One of ["Scalp (Minutes)", "Intraday (Hours)", "Swing (Days)", "Position (Weeks)"]. Infer from the chart timeframe (e.g., 1m/5m -> Scalp, 15m/1H/4H -> Intraday/Swing, 1D/1W -> Position).
    - rationaleTags: An array of up to 3 tags from ["Technical", "Fundamental", "Sentiment", "Macro", "On-Chain"]. Mostly "Technical" for charts.
    
    Ensure strict JSON format. Do not use markdown blocks.
  `;

  try {
    // using gemini-1.5-flash-latest for speed and multimodal capabilities
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg", // Assuming JPEG/PNG, Flash handles generic images well
      },
    };

    const response = await model.generateContent([prompt, imagePart]);
    const text = response.response.text();
    if (!text) return null;

    console.log("AI Image Analysis:", text); // Debugging

    const result = JSON.parse(text) as import("../types").TradeImageAnalysisResult;

    // Normalize TimeHorizon
    const horizonMap: Record<string, string> = {
      "Scalp": "Scalp (Minutes)", "Minutes": "Scalp (Minutes)",
      "Intraday": "Intraday (Hours)", "Hours": "Intraday (Hours)",
      "Swing": "Swing (Days)", "Days": "Swing (Days)",
      "Position": "Position (Weeks)", "Weeks": "Position (Weeks)"
    };

    // Try to find a match if exact match fails
    if (result.timeHorizon && !Object.values(TimeHorizon).includes(result.timeHorizon)) {
      for (const [key, value] of Object.entries(horizonMap)) {
        if (result.timeHorizon.includes(key)) {
          result.timeHorizon = value as any;
          break;
        }
      }
    }

    // Normalize Tags (Capitalize first letter)
    if (result.rationaleTags) {
      result.rationaleTags = result.rationaleTags.map((tag: string) => {
        // Map common lowercase to Enum
        const normalized = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
        // Special case for On-Chain if needed, but 'Technical' etc work
        if (tag.toLowerCase().includes('chain')) return "On-Chain";
        return normalized;
      }) as any[];
    }

    return result;

  } catch (error) {
    console.error("Image analysis failed:", error);
    return null;
  }
};