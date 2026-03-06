from crewai import Task
from agents import researcher, writer

research_task = Task(
    description="Research the given topic: {topic}",
    expected_output="A detailed summary of the topic.",
    agent=researcher
)

write_task = Task(
    description="Write an article based on the research. Topic: {topic}",
    expected_output="A well-written article.",
    agent=writer
)
