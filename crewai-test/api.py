from fastapi import FastAPI
from crew import run

app = FastAPI()

@app.get("/ai-report")
def ai_report(topic: str):
    result = run(topic)
    return {"result": result.raw if hasattr(result, 'raw') else str(result)}
