from langchain_community.tools import DuckDuckGoSearchRun
from crewai.tools import tool

# Create a simple search tool for the Market Research agent 
search_engine = DuckDuckGoSearchRun()

@tool("Search Market Data")
def search_tool(query: str) -> str:
    """Search the web for recent market data, news, sentiment, and crypto/stock prices."""
    try:
        return search_engine.run(query)
    except Exception as e:
        return f"Error performing search: {e}"
