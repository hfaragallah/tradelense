import { GoogleGenerativeAI } from "@google/generative-ai";
import { Trade, AIAnalysisResult, TimeHorizon } from "../types";

// Helper to safely get API key
const getApiKey = (): string | undefined => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
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
    You are TraderLense AI, a conservative, risk-aware trading assistant for a freemium platform.
    
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
    
    You MUST return a JSON object with EXACTLY the following structure. 
    Every field is required. Do not omit any field.

    {
      "currentStatus": {
        "decision": "ENTER" | "WAIT" | "HIGH RISK",
        "marketPosition": "string describing where we are",
        "riskNote": "string describing why this might fail",
        "keyPrinciple": "one short maxim"
      },
      "sellCriteria": {
        "setupName": "string",
        "triggerType": "string",
        "checklist": ["string", "string", "string"],
        "outcome": "string"
      },
      "buyCriteria": {
        "setupName": "string",
        "triggerType": "string",
        "checklist": ["string", "string", "string"],
        "outcome": "string"
      },
      "riskDiscipline": {
        "stopLossComment": "string",
        "riskRewardQuality": "string",
        "behavioralNote": "string"
      },
      "actionRules": {
        "rule1": "string",
        "rule2": "string",
        "recommendation": "string"
      }
    }
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const response = await model.generateContent(prompt);
    const text = response.response.text();

    // Clean up markdown block if present
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();

    const parsed = JSON.parse(cleanText);

    // Normalize the response to ensure all fields exist
    const result: AIAnalysisResult = {
      currentStatus: {
        decision: parsed?.currentStatus?.decision || 'WAIT',
        marketPosition: parsed?.currentStatus?.marketPosition || 'Unknown',
        riskNote: parsed?.currentStatus?.riskNote || 'Unable to assess risk.',
        keyPrinciple: parsed?.currentStatus?.keyPrinciple || 'Capital preservation first.',
      },
      sellCriteria: {
        setupName: parsed?.sellCriteria?.setupName || 'Bearish Scenario',
        triggerType: parsed?.sellCriteria?.triggerType || 'Price Action',
        checklist: Array.isArray(parsed?.sellCriteria?.checklist) ? parsed.sellCriteria.checklist : ['Monitor for breakdown', 'Watch for volume decline', 'Check support levels'],
        outcome: parsed?.sellCriteria?.outcome || 'Exit position',
      },
      buyCriteria: {
        setupName: parsed?.buyCriteria?.setupName || 'Bullish Scenario',
        triggerType: parsed?.buyCriteria?.triggerType || 'Price Action',
        checklist: Array.isArray(parsed?.buyCriteria?.checklist) ? parsed.buyCriteria.checklist : ['Wait for confirmation', 'Check momentum', 'Verify volume'],
        outcome: parsed?.buyCriteria?.outcome || 'Enter position',
      },
      riskDiscipline: {
        stopLossComment: parsed?.riskDiscipline?.stopLossComment || 'Review stop loss placement.',
        riskRewardQuality: parsed?.riskDiscipline?.riskRewardQuality || 'Evaluate risk-reward ratio.',
        behavioralNote: parsed?.riskDiscipline?.behavioralNote || 'Stay disciplined.',
      },
      actionRules: {
        rule1: parsed?.actionRules?.rule1 || 'Follow your trading plan.',
        rule2: parsed?.actionRules?.rule2 || 'Do not adjust stop loss emotionally.',
        recommendation: parsed?.actionRules?.recommendation || 'Proceed with caution.',
      },
    };

    console.log("AI Analysis normalized result:", result);
    return result;

  } catch (error: any) {
    console.error("Analysis service interruption:", error);
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