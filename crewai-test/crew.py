from crewai import Crew
from agents import researcher, writer
from tasks import research_task, write_task

def run(topic):
    crew = Crew(
        agents=[researcher, writer],
        tasks=[research_task, write_task],
        verbose=True
    )
    result = crew.kickoff(inputs={"topic": topic})
    return result
