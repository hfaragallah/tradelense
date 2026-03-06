from crewai import Agent

researcher = Agent(
    role="Research Specialist",
    goal="Find useful information",
    backstory="Expert researcher",
    verbose=True
)

writer = Agent(
    role="Content Writer",
    goal="Write clear content",
    backstory="Professional writer",
    verbose=True
)
