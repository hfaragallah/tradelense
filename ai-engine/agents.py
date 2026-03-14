import os
import litellm
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

# 1. API Key Sanitization
raw_key = os.getenv("OPENROUTER_API_KEY", "")
openrouter_key = raw_key.strip().strip("'").strip('"')

# 2. Model Configuration (Must use openrouter/ prefix for LiteLLM)
def format_model(m):
    m = m.strip().strip("'").strip('"')
    if not m:
        return "openrouter/google/gemini-2.0-flash-001"
    if not m.startswith("openrouter/"):
        return f"openrouter/{m}"
    return m

model_name = format_model(os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-001"))
large_model_name = format_model(os.getenv("OPENROUTER_LARGE_MODEL", "google/gemini-2.0-flash-001"))

# 3. LiteLLM Environment Configuration
os.environ["OPENROUTER_API_KEY"] = openrouter_key
os.environ["LITELLM_LOG"] = "INFO" # Helpful for debugging

if not openrouter_key:
    print("CRITICAL: OPENROUTER_API_KEY is not set in environment or is empty!")
else:
    masked_key = f"{openrouter_key[:6]}...{openrouter_key[-6:]}" if len(openrouter_key) > 12 else "***"
    print(f"DEBUG: OPENROUTER_API_KEY detected. Length: {len(openrouter_key)}")
    print(f"DEBUG: Key Masked: {masked_key}")
    print(f"DEBUG: Using Model: {model_name}")

# Extra headers to identify the application
extra_headers = {
    "HTTP-Referer": "https://traderlense.com",
    "X-Title": "TradeLense AI"
}

def get_llm(model=model_name):
    """
    Returns a CrewAI LLM configured for OpenRouter via LiteLLM.
    """
    return LLM(
        model=model,
        base_url="https://openrouter.ai/api/v1",
        api_key=openrouter_key,
        max_tokens=4096,
        extra_headers=extra_headers,
        timeout=120 # CrewAI tasks can be slow
    )

def test_openrouter_connectivity():
    """
    Quickly verifies the OpenRouter API key and model access.
    """
    if not openrouter_key:
        return False, "API Key is missing."
    
    try:
        # Minimal test call to check authentication
        litellm.completion(
            model=model_name,
            messages=[{"role": "user", "content": "ping"}],
            api_key=openrouter_key,
            base_url="https://openrouter.ai/api/v1",
            max_tokens=1
        )
        return True, "Authentication Successful"
    except Exception as e:
        return False, str(e)


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
        llm=get_llm(large_model_name)
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
        llm=get_llm()
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
        llm=get_llm(large_model_name)
    )
