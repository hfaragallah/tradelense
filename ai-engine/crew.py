from crewai import Crew, Process
from agents import (
    get_intelligence_analyst,
    get_risk_manager_agent,
    get_final_advisor_agent
)
from tasks import create_tasks

def run_trade_lens_crew(asset: str) -> str:
    """Instantiates and runs the optimized 3-agent Crew for TradeLens."""
    print(f"Starting Multi-Agent Trade Analysis for: {asset}")
    
    agents_dict = {
        "intelligence_analyst": get_intelligence_analyst(),
        "risk_manager": get_risk_manager_agent(),
        "advisor": get_final_advisor_agent()
    }
    
    tasks = create_tasks(asset, agents_dict)
    
    crew = Crew(
        agents=list(agents_dict.values()),
        tasks=tasks,
        process=Process.sequential, 
        verbose=True
    )
    
    result = crew.kickoff()
    return result

if __name__ == "__main__":
    import sys
    asset_query = sys.argv[1] if len(sys.argv) > 1 else "Bitcoin (BTC)"
    print(run_trade_lens_crew(asset_query))
