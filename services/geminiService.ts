import { GoogleGenerativeAI } from "@google/generative-ai";
import { Trade, AIAnalysisResult, TimeHorizon } from "../types";

// Helper to safely get API key
const getApiKey = (): string | undefined => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    console.error("DEBUG: GEMINI_API_KEY is missing. Check your .env file and restart the server.");
  }
  return key;
};


export const analyzeTrade = async (trade: Trade): Promise<AIAnalysisResult | null> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("AI Service unavailable: Missing configuration.");
    return {
      currentStatus: {
        decision: 'WAIT',
        marketPosition: 'Unknown',
        riskNote: 'Missing API Key configuration.',
        keyPrinciple: 'Capital preservation first.',
      },
      alternativeScenario: {
        invalidationTrigger: '',
        biasShift: '',
        nextProbableMove: '',
        entry: '',
        stopLoss: '',
        takeProfit: '',
        rationale: ''
      },
      riskDiscipline: [],
      actionProtocol: '',
      error: "AI Service unavailable: Looking for Configuration."
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
ROLE:
    You are an institutional - grade trading intelligence AI.
    Your job is not only to analyze charts, but to validate the trade idea across multiple external sentiment and market intelligence sources before issuing a verdict.
    Capital preservation is priority.

  STEP 1: External Intelligence Validation(Simulated)
    Since you cannot access real - time external data, you must SIMULATE a realistic "Market Scan" based on the chart's technical context (${trade.asset} - ${trade.timeHorizon}).
    Infer plausible signals for:
  - TradingView Sentiment
    - Social Media Buzz(Twitter / Reddit)
      - Order Book Depth(Bid / Ask walls)
        - Funding Rates(if Crypto)

    STEP 2: Sentiment Alignment Scoring
    Calculate a Sentiment Alignment Score(0 - 100) starting at 50:
+20 if majority external sources align with technical bias
  - 20 if majority contradict
    - 30 if overcrowded trade detected
      - 20 if funding extreme or liquidation risk high

    STEP 3: Master Decision Rule
    Generate a Final Verdict based on:
- ENTER: Confidence ≥ 65 % AND Sentiment Score ≥ 55 AND No major news risk.
    - WAIT: Signals conflict OR Sentiment diverges OR Volatility unstable.
    - HIGH RISK: positioning is extreme or liquidation risk detected.
    - AVOID: Crowd is one - sided OR Funding extreme OR Low confidence(<60%).

    OUTPUT FORMAT:
    Return a JSON object with EXACTLY this structure:
{
  "currentStatus": {
    "decision": "ENTER" | "WAIT" | "HIGH RISK" | "AVOID",
    "marketPosition": "string (e.g. Bullish, Bearish)",
    "riskNote": "string (Short Primary Risk phrase)",
    "keyPrinciple": "string",
    "suggestedExecutionLevel": "string (Price)",
    "suggestedStopLoss": "string (Price)",
    "suggestedRiskReward": "string (Ratio like 1:2.5)",
    "confidenceScore": number (0-100)
  },
  "alternativeScenario": {
    "invalidationTrigger": "string (If price breaks below/above X.XXXX)",
    "biasShift": "string",
    "nextProbableMove": "string",
    "entry": "string (Price)",
    "stopLoss": "string (Price)",
    "takeProfit": "string (Price)",
    "rationale": "string (Reason for this trade)"
  },
  "riskDiscipline": ["string (rule 1)", "string (rule 2)", "string (rule 3)", "string (rule 4)"],
  "actionProtocol": "string (One clear command)"
}

CONTROL RULES:
- Strategic Decision must be calculated first.
- All sections must support the Strategic Decision.
- Risk & Discipline rules: "Do not move stop loss.", "Do not add to losing position.", "Risk per trade must not exceed X%.", "Exit immediately if invalidation level breaks."
- Action Protocol patterns:
    "Execute at defined level and follow stop strictly." (If ENTER)
    "Monitor breakout above/below [Price] before engaging." (If WAIT)
    "Stand aside. Preserve capital." (If AVOID)
- No emotional language. Maximum 5 lines per section.

CONTEXT:
- Asset: ${trade.asset} (${trade.market})
- Trade Type: ${trade.type}
- Technicals: Entry ${trade.entryRange.join('-')}, SL ${trade.stopLoss}, TP ${trade.takeProfit.join(',')}
- User Rationale: "${trade.rationale}"
  - Crowd Confidence: ${trade.confidenceScore}/100
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
    const cleanText = text.replace(/```json\n ?|\n ? ```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    return {
      currentStatus: {
        decision: parsed?.currentStatus?.decision || 'WAIT',
        marketPosition: parsed?.currentStatus?.marketPosition || 'Unknown',
        riskNote: parsed?.currentStatus?.riskNote || 'N/A',
        keyPrinciple: parsed?.currentStatus?.keyPrinciple || 'Capital preservation first.',
        suggestedExecutionLevel: parsed?.currentStatus?.suggestedExecutionLevel,
        suggestedStopLoss: parsed?.currentStatus?.suggestedStopLoss,
        suggestedRiskReward: parsed?.currentStatus?.suggestedRiskReward,
        confidenceScore: parsed?.currentStatus?.confidenceScore || 50
      },
      alternativeScenario: {
        invalidationTrigger: parsed?.alternativeScenario?.invalidationTrigger || '',
        biasShift: parsed?.alternativeScenario?.biasShift || '',
        nextProbableMove: parsed?.alternativeScenario?.nextProbableMove || '',
        entry: parsed?.alternativeScenario?.entry || '',
        stopLoss: parsed?.alternativeScenario?.stopLoss || '',
        takeProfit: parsed?.alternativeScenario?.takeProfit || '',
        rationale: parsed?.alternativeScenario?.rationale || ''
      },
      riskDiscipline: Array.isArray(parsed?.riskDiscipline) ? parsed.riskDiscipline : [],
      actionProtocol: parsed?.actionProtocol || '',
      usageMetadata: response.response.usageMetadata ? {
        promptTokenCount: response.response.usageMetadata.promptTokenCount,
        candidatesTokenCount: response.response.usageMetadata.candidatesTokenCount,
        totalTokenCount: response.response.usageMetadata.totalTokenCount
      } : undefined
    };

  } catch (error: any) {
    console.error("Analysis service interruption:", error);
    return {
      currentStatus: { decision: 'WAIT', marketPosition: 'Error', riskNote: 'Analysis failed', keyPrinciple: 'Error' },
      alternativeScenario: { invalidationTrigger: '', biasShift: '', nextProbableMove: '', entry: '', stopLoss: '', takeProfit: '', rationale: '' },
      riskDiscipline: [],
      actionProtocol: '',
      error: error.message || "AI Analysis Failed. Please try again."
    };
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
- asset: The ticker symbol(e.g., BTC / USD, EURUSD, AAPL).Normalize to uppercase.
    - market: One of["Crypto", "Forex", "Stocks", "Commodities"].Infer from the asset.
    - type: "LONG" or "SHORT".Look for "Long Position" or "Short Position" tools, or infer from price action relative to entry / targets.
    - entry: The entry price.
    - entryMax: (Optional) If an entry zone is depicted, the upper bound.
    - stopLoss: The stop loss price.
    - takeProfit: An array of take profit prices(e.g., [100.5, 102.0]).
    - rationale: A brief technical summary(max 2 sentences) describing the setup seen(e.g., "Breakout retest with bullish divergence").
    - timeHorizon: One of["Scalp (Minutes)", "Intraday (Hours)", "Swing (Days)", "Position (Weeks)"].Infer from the chart timeframe(e.g., 1m / 5m -> Scalp, 15m / 1H / 4H -> Intraday / Swing, 1D / 1W -> Position).
    - rationaleTags: An array of up to 3 tags from["Technical", "Fundamental", "Sentiment", "Macro", "On-Chain"].Mostly "Technical" for charts.
    
    Ensure strict JSON format.Do not use markdown blocks.
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

export const translateAnalysis = async (analysis: AIAnalysisResult): Promise<NonNullable<AIAnalysisResult['translatedData']> | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `
    ROLE:
    You are a professional Egyptian financial translator. 
    Translate the following trade analysis report into Arabic using an Egyptian professional trading dialect.
    Terms:
    - ENTER -> دخول
    - WAIT -> انتظار
    - AVOID -> تجنب
    - HIGH RISK -> مخاطرة عالية
    - Entry -> نقطة الدخول
    - Stop Loss -> وقف الخسارة
    - Target -> الهدف / أخذ الربح
    
    Keep the tone professional but tailored to the Egyptian market context.

    DATA TO TRANSLATE:
    1. Decision: ${analysis.currentStatus.decision}
    2. Key Principle: ${analysis.currentStatus.keyPrinciple}
    3. Alternative Bias Shift: ${analysis.alternativeScenario.biasShift}
    4. Alternative Move: ${analysis.alternativeScenario.nextProbableMove}
    5. Alternative Rationale: ${analysis.alternativeScenario.rationale}
    6. Rules: ${analysis.riskDiscipline.join(' | ')}
    7. Action: ${analysis.actionProtocol}

    RETURN JSON FORMAT EXACTLY (Do not include any other text):
    {
      "currentStatus": { "decision": "...", "keyPrinciple": "..." },
      "alternativeScenario": { "biasShift": "...", "nextProbableMove": "...", "rationale": "..." },
      "riskDiscipline": ["...", "..."],
      "actionProtocol": "..."
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Translation failed:", error);
    return null;
  }
};