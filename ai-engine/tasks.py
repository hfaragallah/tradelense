from crewai import Task
from textwrap import dedent

def create_tasks(asset: str, agents_dict: dict):
    intelligence_analyst = agents_dict["intelligence_analyst"]
    risk_manager = agents_dict["risk_manager"]
    advisor = agents_dict["advisor"]

    analysis_task = Task(
        description=dedent(f"""
            Analyze {asset} from a multi-dimensional perspective:
            1. Market Intelligence: Scan news, social sentiment, and crowd positioning.
            2. Technical Analysis: Identify trend, support/resistance, and liquidity zones.
            3. Execution Levels: Propose precise Entry, Stop Loss, and Take Profit levels with brief reasoning for each.
        """),
        expected_output="A comprehensive report containing sentiment, trend direction, precise entry/SL/TP levels with a one-sentence reason for each level.",
        agent=intelligence_analyst
    )

    risk_validation_task = Task(
        description=dedent(f"""
            Review the analysis for {asset} for validity and safety.
            1. Check risk/reward ratio and validate the technical setup.
            2. Identify economic risks or volatility spikes likely to impact the trade.
            3. Final Verdict: Decide if the trade is ENTER, WAIT, or AVOID with a confidence percentage.
            4. Assign a Market Bias: Bullish, Bearish, or Neutral.
            5. Generate 3-4 concise discipline rules for this specific setup.
        """),
        expected_output="A risk verdict (ENTER/WAIT/AVOID), confidence %, market bias, and a list of discipline rules.",
        agent=risk_manager
    )

    compilation_task = Task(
        description=dedent(f"""
            Compile the final Trading Report for {asset} based on the analysis and risk profile.
            Write as if you are a senior trading advisor speaking directly to the trader.
            Use clear, actionable language. Avoid jargon.
            
            IMPORTANT RULES:
            - If verdict is WAIT or AVOID, do NOT show Entry, SL, TP, or Potential Profit.
            - All levels must be mathematically consistent.
            - Keep explanations concise (1-2 sentences each).
            - The Action Protocol must sound natural and instructional, like a mentor giving direct advice.

            The final report MUST contain ONLY these exact sections:

            Expert Intro
            [Write 1-2 sentences like a senior trader. Explain the overall market condition and what opportunity or risk exists. Be specific.]

            Strategic Decision
            Decision: [ENTER / WAIT / AVOID]
            Confidence: [XX%]
            Market Bias: [Bullish / Bearish / Neutral]

            Recommended Trade Setup
            [Write 1-2 sentences explaining the setup clearly.]
            Entry: [exact level]
            Entry Reason: [one sentence explaining why this level]
            Stop Loss: [exact level]
            Stop Loss Reason: [one sentence explaining the invalidation]
            Take Profit: [exact level]
            Take Profit Reason: [one sentence explaining the target]
            Potential Profit: [~X% estimated]

            Scenario Explanation
            IMPORTANT: Each scenario MUST reference the specific Entry, Stop Loss, and Take Profit levels from "Recommended Trade Setup" above. Use the actual numbers.
            Scenario 1 – Expected Move
            [1-2 sentences. Describe the primary bullish/bearish move. Example: "If price holds above [Entry] and momentum continues, the market is likely to push toward [Take Profit]."]
            Scenario 2 – Alternative Move
            [1-2 sentences. Describe what happens if the trade fails. Example: "If price breaks below [Stop Loss], the structure becomes invalid and a deeper move toward [next key level] is possible."]
            Scenario 3 – Sideways Market
            [1-2 sentences. Describe consolidation between [Entry] and [Stop Loss]. Example: "Price may consolidate between [Entry] and [Stop Loss] before choosing direction. Patience is required."]

            Risk & Discipline Protocol
            [3-4 bullet points starting with a dash]

            Action Protocol
            [ONE sentence, direct and instructional. Examples: "Enter near the defined level and follow the stop strictly." / "Wait for confirmation before entering." / "Stand aside. The market conditions are not favorable."]
        """),
        expected_output="The exact formatted 6-section report. No extra text, no preamble.",
        agent=advisor
    )

    return [analysis_task, risk_validation_task, compilation_task]
