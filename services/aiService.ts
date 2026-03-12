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
        .replace(/^```markdown\n?/, '')
        .replace(/^```\n?/, '')
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

    const lines = cleanedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let currentSection = "";
    let setupLines: string[] = [];
    let scenarioSubSection = "";

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // --- Section detection ---
        if (line === "Expert Intro" || line.startsWith("Expert Intro")) {
            currentSection = "expert_intro";
            continue;
        } else if (line === "Strategic Decision" || line.startsWith("Strategic Decision")) {
            currentSection = "strategic_decision";
            continue;
        } else if (line === "Recommended Trade Setup" || line.startsWith("Recommended Trade Setup")) {
            currentSection = "trade_setup";
            setupLines = [];
            continue;
        } else if (line === "Scenario Explanation" || line.startsWith("Scenario Explanation")) {
            // Finalize setup section if lines were buffered
            if (setupLines.length > 0) {
                report.tradeSetup = parseSetupLines(setupLines);
            }
            currentSection = "scenarios";
            scenarioSubSection = "";
            continue;
        } else if (line === "Risk & Discipline Protocol" || line.startsWith("Risk & Discipline Protocol") || line.includes("Risk & Discipline")) {
            currentSection = "risk_discipline";
            continue;
        } else if (line === "Action Protocol" || line.startsWith("Action Protocol")) {
            currentSection = "action_protocol";
            continue;
        }

        // --- Sub-section detection for scenarios ---
        if (currentSection === "scenarios") {
            if (line.includes("Scenario 1") || line.includes("Expected Move")) {
                scenarioSubSection = "expected";
                continue;
            } else if (line.includes("Scenario 2") || line.includes("Alternative Move")) {
                scenarioSubSection = "alternative";
                continue;
            } else if (line.includes("Scenario 3") || line.includes("Sideways")) {
                scenarioSubSection = "sideways";
                continue;
            }
        }

        // --- Content parsing ---
        if (currentSection === "expert_intro") {
            report.expertIntro += (report.expertIntro ? " " : "") + line;

        } else if (currentSection === "strategic_decision") {
            if (line.startsWith("Decision:")) {
                const dec = line.split("Decision:")[1].trim().toUpperCase();
                if (dec.includes("ENTER")) report.strategicDecision.decision = "ENTER";
                else if (dec.includes("AVOID")) report.strategicDecision.decision = "AVOID";
                else report.strategicDecision.decision = "WAIT";
            } else if (line.startsWith("Confidence:")) {
                const scoreMatch = line.match(/\d+/);
                if (scoreMatch) report.strategicDecision.confidenceScore = parseInt(scoreMatch[0], 10);
            } else if (line.startsWith("Market Bias:")) {
                const bias = line.split("Market Bias:")[1].trim();
                report.strategicDecision.marketBias = bias;
            }

        } else if (currentSection === "trade_setup") {
            setupLines.push(line);

        } else if (currentSection === "scenarios") {
            if (scenarioSubSection === "expected") {
                report.scenarios.expected += (report.scenarios.expected ? " " : "") + line;
            } else if (scenarioSubSection === "alternative") {
                report.scenarios.alternative += (report.scenarios.alternative ? " " : "") + line;
            } else if (scenarioSubSection === "sideways") {
                report.scenarios.sideways += (report.scenarios.sideways ? " " : "") + line;
            }

        } else if (currentSection === "risk_discipline") {
            const cleaned = line.replace(/^[-*•\d.]+\s*/, "").trim();
            if (cleaned) report.riskDiscipline.push(cleaned);

        } else if (currentSection === "action_protocol") {
            report.actionProtocol += (report.actionProtocol ? " " : "") + line;
        }
    }

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
