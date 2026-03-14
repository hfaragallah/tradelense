import { Trade } from "../types";

// Environment variable check - MUST use import.meta.env for Vite
const BACKEND_BASE_URL = import.meta.env.VITE_AI_BACKEND_URL;

export interface CrewAIReport {
    expertIntro: string;
    strategicDecision: {
        decision: "ENTER" | "WAIT" | "AVOID";
        confidenceScore: number;
        marketBias: "Bullish" | "Bearish" | "Neutral" | string;
    };
    tradeSetup?: {
        explanation: string;
        entryLevel: string;
        entryReason: string;
        stopLoss: string;
        stopLossReason: string;
        takeProfit: string;
        takeProfitReason: string;
        potentialProfit: string;
    };
    scenarios: {
        expected: string;
        alternative: string;
        sideways: string;
    };
    riskDiscipline: string[];
    actionProtocol: string;
    rawReport: string;
}

export const analyzeTradeWithCrew = async (trade: Trade): Promise<CrewAIReport> => {
    // 1. URL Construction (No fallback as per instructions)
    const baseUrl = (BACKEND_BASE_URL || "").replace(/\/$/, "");
    const fetchUrl = `${baseUrl}/analyze`;

    console.log("📡 [AI Engine] API_URL:", fetchUrl);

    // 2. Timeout Handling (e.g., 60 seconds for CrewAI)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout

    try {
        if (!baseUrl) {
            throw new Error("VITE_AI_BACKEND_URL is not defined in environment variables.");
        }

        const response = await fetch(fetchUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                asset: `${trade.asset} (${trade.market}) - Time Horizon: ${trade.timeHorizon} - Bias: ${trade.type} - Rationale: ${trade.rationale}`
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ AI Backend Error (${response.status}):`, errorText);
            throw new Error(`AI Backend returned ${response.status}: ${errorText || 'Internal Server Error'}`);
        }

        const data = await response.json();
        const rawReport = data.report || "";
        console.log("✅ Raw AI Report Recieved:", rawReport.substring(0, 100) + "...");

        const parsedReport = parseReport(rawReport);
        return parsedReport;

    } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            console.error("❌ AI Analysis Timeout after 90 seconds");
            throw new Error("Analysis timed out. The AI engine is taking too long to respond. Please try again.");
        }

        console.error("❌ CrewAI Analysis failed:", error);

        // Detailed error reporting
        const errorMessage = error.message || "Unknown connection error";
        throw new Error(`AI Service Unavailable: ${errorMessage}. Check console for details.`);
    }
};

const parseReport = (reportText: string): CrewAIReport => {
    // Strip markdown code blocks if the AI wrapped the response
    let cleanedText = reportText
        .replace(/^```(markdown|json)?\n?/, '')
        .replace(/\n?```$/, '')
        .trim();

    const report: CrewAIReport = {
        expertIntro: "",
        strategicDecision: {
            decision: "WAIT",
            confidenceScore: 0,
            marketBias: "Neutral"
        },
        tradeSetup: undefined,
        scenarios: {
            expected: "",
            alternative: "",
            sideways: ""
        },
        riskDiscipline: [],
        actionProtocol: "",
        rawReport: reportText
    };

    // Helper to clean headers and find sections
    const getSectionContent = (text: string, sectionName: string, nextSections: string[]): string => {
        const escapedSection = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match headers like "Expert Intro", "### Expert Intro", "**Expert Intro**", etc.
        const sectionRegex = new RegExp(`(?:^|\\n)[#\\s\\*]*${escapedSection}[#\\s\\*\\:]*\\n?([\\s\\S]*?)(?=\\n[#\\s\\*]*(?:${nextSections.join('|')})|$)`, 'i');
        const match = text.match(sectionRegex);
        return match ? match[1].trim() : "";
    };

    const headers = [
        "Expert Intro",
        "Strategic Decision",
        "Recommended Trade Setup",
        "Scenario Explanation",
        "Risk & Discipline Protocol",
        "Action Protocol"
    ];

    // 1. Expert Intro
    report.expertIntro = getSectionContent(cleanedText, "Expert Intro", headers.slice(1));

    // 2. Strategic Decision
    const decisionContent = getSectionContent(cleanedText, "Strategic Decision", headers.slice(2));
    if (decisionContent) {
        const decisionMatch = decisionContent.match(/Decision:\s*(\w+)/i);
        if (decisionMatch) {
            const dec = decisionMatch[1].toUpperCase();
            if (dec.includes("ENTER")) report.strategicDecision.decision = "ENTER";
            else if (dec.includes("AVOID")) report.strategicDecision.decision = "AVOID";
            else report.strategicDecision.decision = "WAIT";
        }
        const confidenceMatch = decisionContent.match(/Confidence:\s*(\d+)%/i);
        if (confidenceMatch) report.strategicDecision.confidenceScore = parseInt(confidenceMatch[1], 10);

        const biasMatch = decisionContent.match(/Market Bias:\s*([\w\s]+)/i);
        if (biasMatch) report.strategicDecision.marketBias = biasMatch[1].trim();
    }

    // 3. Recommended Trade Setup
    const setupContent = getSectionContent(cleanedText, "Recommended Trade Setup", headers.slice(3));
    if (setupContent) {
        const setupLines = setupContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        report.tradeSetup = parseSetupLines(setupLines);
    }

    // 4. Scenario Explanation
    const scenarioContent = getSectionContent(cleanedText, "Scenario Explanation", headers.slice(4));
    if (scenarioContent) {
        const expectedRegex = /(?:Scenario 1|Expected Move)[#\s\*\-\:]*([\s\S]*?)(?=\n(?:Scenario 2|Alternative Move|Scenario 3|Sideways Market)|$)/i;
        const alternativeRegex = /(?:Scenario 2|Alternative Move)[#\s\*\-\:]*([\s\S]*?)(?=\n(?:Scenario 3|Sideways Market)|$)/i;
        const sidewaysRegex = /(?:Scenario 3|Sideways Market)[#\s\*\-\:]*([\s\S]*?)$/i;

        const expectedMatch = scenarioContent.match(expectedRegex);
        const alternativeMatch = scenarioContent.match(alternativeRegex);
        const sidewaysMatch = scenarioContent.match(sidewaysRegex);

        if (expectedMatch) report.scenarios.expected = expectedMatch[1].trim().replace(/^[#\s\*\-\:]+/, '');
        if (alternativeMatch) report.scenarios.alternative = alternativeMatch[1].trim().replace(/^[#\s\*\-\:]+/, '');
        if (sidewaysMatch) report.scenarios.sideways = sidewaysMatch[1].trim().replace(/^[#\s\*\-\:]+/, '');
    }

    // 5. Risk & Discipline Protocol
    const riskContent = getSectionContent(cleanedText, "Risk & Discipline Protocol", headers.slice(5));
    if (riskContent) {
        report.riskDiscipline = riskContent
            .split('\n')
            .map(l => l.trim().replace(/^[-*•\d.]+\s*/, ""))
            .filter(l => l.length > 0);
    }

    // 6. Action Protocol
    report.actionProtocol = getSectionContent(cleanedText, "Action Protocol", []);

    // Fallbacks
    if (!report.expertIntro) report.expertIntro = "Market analysis complete. Review the setup carefully before acting.";
    if (!report.actionProtocol) report.actionProtocol = "Stand aside pending manual review.";
    if (report.riskDiscipline.length === 0) report.riskDiscipline.push("Follow standard risk protocols.");

    return report;
};

// Helper: parse the trade setup section lines
function parseSetupLines(lines: string[]): CrewAIReport['tradeSetup'] {
    const setup: NonNullable<CrewAIReport['tradeSetup']> = {
        explanation: "",
        entryLevel: "",
        entryReason: "",
        stopLoss: "",
        stopLossReason: "",
        takeProfit: "",
        takeProfitReason: "",
        potentialProfit: ""
    };

    for (const line of lines) {
        if (line.startsWith("Entry:") && !line.startsWith("Entry Reason")) {
            setup.entryLevel = line.split("Entry:")[1].trim();
        } else if (line.startsWith("Entry Reason:")) {
            setup.entryReason = line.split("Entry Reason:")[1].trim();
        } else if (line.startsWith("Stop Loss:") && !line.startsWith("Stop Loss Reason")) {
            setup.stopLoss = line.split("Stop Loss:")[1].trim();
        } else if (line.startsWith("Stop Loss Reason:")) {
            setup.stopLossReason = line.split("Stop Loss Reason:")[1].trim();
        } else if (line.startsWith("Take Profit:") && !line.startsWith("Take Profit Reason")) {
            setup.takeProfit = line.split("Take Profit:")[1].trim();
        } else if (line.startsWith("Take Profit Reason:")) {
            setup.takeProfitReason = line.split("Take Profit Reason:")[1].trim();
        } else if (line.startsWith("Potential Profit:")) {
            setup.potentialProfit = line.split("Potential Profit:")[1].trim();
        } else if (!line.includes(":") || line.endsWith(".") || line.endsWith(",")) {
            // Likely the explanation paragraph
            setup.explanation += (setup.explanation ? " " : "") + line;
        }
    }
    return setup;
}
