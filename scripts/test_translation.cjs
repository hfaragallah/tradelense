const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
    console.error("Missing VITE_GEMINI_API_KEY");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash-latest',
    generationConfig: {
        responseMimeType: "application/json",
    }
});

const mockAnalysis = {
    currentStatus: {
        decision: "ENTER",
        keyPrinciple: "Strong support level at 1.2500 with increasing volume.",
        riskNote: "Overcrowded positioning"
    },
    alternativeScenario: {
        biasShift: "Bearish",
        nextProbableMove: "Drop to 1.2400",
        rationale: "If the breakout fails, a liquidity sweep below the wick is likely.",
        entry: "1.2500",
        stopLoss: "1.2450",
        takeProfit: "1.2650"
    },
    riskDiscipline: ["Maintain 1:2 Risk/Reward ratio", "No revenge trading"],
    actionProtocol: "Execute at market price and follow stop-loss strictly."
};

async function testTranslation() {
    console.log("Starting translation test...");
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
    1. Decision: ${mockAnalysis.currentStatus.decision}
    2. Key Principle: ${mockAnalysis.currentStatus.keyPrinciple}
    3. Alternative Bias Shift: ${mockAnalysis.alternativeScenario.biasShift}
    4. Alternative Move: ${mockAnalysis.alternativeScenario.nextProbableMove}
    5. Alternative Rationale: ${mockAnalysis.alternativeScenario.rationale}
    6. Rules: ${mockAnalysis.riskDiscipline.join(' | ')}
    7. Action: ${mockAnalysis.actionProtocol}

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
        console.log("Raw Response:", text);
        const parsed = JSON.parse(text);
        console.log("Parsed Successfully:", parsed);
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testTranslation();
