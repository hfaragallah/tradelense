from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from crew import run_trade_lens_crew
import uvicorn
import asyncer

app = FastAPI(title="TradeLens AI Agent Backend")

# Allow requests from the Vite frontend (local) and Netlify/Custom Domains (production)
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://traderlense.com",
    "https://www.traderlense.com",
    "https://tradelens.app",
    "https://www.tradelens.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.netlify\.app", # allow all Netlify previews
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    asset: str
    image_base64: str | None = None # Placeholder if needed later for multimodal integration

class AnalysisResponse(BaseModel):
    report: str

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_trade(request: AnalysisRequest):
    print(f"\n--- Recieved Analysis Request for: {request.asset} ---")
    try:
        # Run CrewAI synchronously in a separate thread to prevent blocking FastAPI
        print("Starting Multi-Agent Crew...")
        result = await asyncer.asyncify(run_trade_lens_crew)(request.asset)
        print("Crew Analysis Complete.")
        
        # Ensure we return a string representation
        report_str = result.raw if hasattr(result, 'raw') else str(result)
        return AnalysisResponse(report=report_str)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
