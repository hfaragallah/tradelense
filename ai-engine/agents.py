import os
from crewai import Agent, LLM
from dotenv import load_dotenv
from tools import search_tool

# Load the .env only if it exists (local development)
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path, override=True)
    print("DEBUG: Local .env loaded")
else:
    print("DEBUG: No local .env found, using system environment variables")

# Configure OpenRouter via LiteLLM
raw_key = os.getenv("OPENROUTER_API_KEY", "")
openrouter_key = raw_key.strip().strip("'").strip('"')
raw_model = os.getenv("OPENROUTER_MODEL", "openrouter/google/gemini-2.0-flash-001").strip().strip("'").strip('"')

# Ensure we use LiteLLM's explicit 'openrouter/' prefix.
# Using 'openai/' prefix with OpenRouter's base_url often causes "OpenAIException - User not found"
# on server environments like Render.com because LiteLLM's OpenAI provider logic
# doesn't always handle the OpenRouter-specific auth/headers correctly.
if raw_model.startswith("openai/"):
    model_name = raw_model.replace("openai/", "openrouter/", 1)
elif not raw_model.startswith("openrouter/"):
    model_name = f"openrouter/{raw_model}"
else:
    model_name = raw_model

if not openrouter_key:
    print("CRITICAL: OPENROUTER_API_KEY is not set in environment!")
else:
    masked_key = f"{openrouter_key[:4]}...{openrouter_key[-4:]}" if len(openrouter_key) > 8 else "***"
    print(f"DEBUG: Using Model: {model_name}")
    print(f"DEBUG: API Key detected (Masked): {masked_key}")

# Force LiteLLM to use the correct key for the OpenRouter provider
os.environ["OPENROUTER_API_KEY"] = openrouter_key or ""

# We remove the forced OpenAI overrides to prevent confusion in LiteLLM's routing
# This ensures that when we use 'openrouter/' prefix, LiteLLM doesn't try to use
# any existing OpenAI credentials or base URLs.
for key in ["OPENAI_API_BASE", "OPENAI_API_KEY"]:
    if key in os.environ:
        del os.environ[key]

# Add standard OpenRouter headers to avoid server IP blocks
extra_headers = {
    "HTTP-Referer": "https://tradelense.netlify.app",
    "X-Title": "TradeLense AI"
}

llm = LLM(
    model=model_name,
    base_url="https://openrouter.ai/api/v1",
    api_key=openrouter_key,
    max_tokens=2048,
    extra_headers=extra_headers
)

def get_intelligence_analyst():
    """Combines Research, Data Aggregation, and Technical Analysis."""
    return Agent(
        role="Senior Market Intelligence & Technical Analyst",
        goal="Perform comprehensive market research and technical analysis for {asset} to identify entry/exit levels and market sentiment.",
        backstory="A dual-specialist with expertise in both quantitative sentiment analysis and deep price action structure. "
                  "You scan sentiment from multiple sources and identify precise support/resistance, liquidity zones, and trend direction. "
                  "You provide raw technical data and market mood in one comprehensive output.",
        verbose=True,
        allow_delegation=False,
        tools=[search_tool],
        llm=llm
    )

def get_risk_manager_agent():
    """Combines Validation and Risk Management."""
    return Agent(
        role="Risk & Compliance Manager",
        goal="Validate trade setups and enforce strict risk protocols based on volatility and economic climate.",
        backstory="A veteran risk officer who scrutinizes all trade ideas. You check risk-to-reward ratios, volatility risks, and "
                  "potential liquidity sweeps. You generate the discipline protocol and verify if a trade is worth the capital. "
                  "Your word is final on whether a trade is ENTER, WAIT, or AVOID.",
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

def get_final_advisor_agent():
    """Compiles the final actionable report."""
    return Agent(
        role="Strategic Hedge Fund Advisor",
        goal="Compile insights into a final, actionable, and professionally formatted trading report.",
        backstory="A high-level advisor who takes validated technicals and risk protocols to produce a clear directive. "
                  "You ensure the report is concise, free of contradictions, and follows the strict markdown format required by the UI.",
        verbose=True,
        allow_delegation=False,
        llm=llm
    )
