from crewai.tools import tool
from ddgs import DDGS

@tool("Search Market Data")
def search_tool(query: str) -> str:
    """Search the web for recent market data, news, sentiment, and crypto/stock prices."""
    try:
        results = DDGS().text(query, max_results=5)
        if not results:
            return "No recent search results found."
        
        combined_text = "\n".join([r.get('body', '') for r in results if r.get('body')])
        return combined_text
    except Exception as e:
        return f"Error performing search: {e}"
