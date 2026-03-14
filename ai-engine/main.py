from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from crew import run_trade_lens_crew
import uvicorn
import asyncer

app = FastAPI(title="TradeLens AI Agent Backend")

# Allow requests from the Vite frontend (local) and Fly.io/Custom Domains (production)
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://traderlense.com",
    "https://www.traderlense.com",
    "https://tradelense-frontend.fly.dev",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r".*", # Dynamically allow all origins (fixes Netlify custom domain CORS errors)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    asset: str
    image_base64: str | None = None # Placeholder if needed later for multimodal integration

class AnalysisResponse(BaseModel):
    report: str

@app.get("/")
async def root():
    return {"status": "ok", "message": "TradeLens AI Engine is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/test-env")
async def test_env():
    import os
    from agents import model_name
    key = os.getenv("OPENROUTER_API_KEY", "")
    key_clean = key.strip().strip("'").strip('"')
    masked_key = f"{key_clean[:4]}...{key_clean[-4:]}" if len(key_clean) > 8 else "NOT SET"
    return {
        "model": model_name,
        "api_key_status": "Set" if key_clean else "Missing",
        "api_key_masked": masked_key,
        "api_key_length": len(key_clean),
        "environment": "Production" if (os.getenv("RENDER") or os.getenv("FLY_APP_NAME")) else "Development"
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_trade(request: AnalysisRequest):
    print(f"\n--- Received Analysis Request for: {request.asset} ---")
    
    # 1. Connectivity & Auth Test
    from agents import test_openrouter_connectivity
    is_ok, msg = test_openrouter_connectivity()
    if not is_ok:
        print(f"❌ AUTH ERROR: {msg}")
        raise HTTPException(
            status_code=401, 
            detail=f"AI Authentication Failed: {msg}. Please check your OpenRouter API Key."
        )

    try:
        # 2. Run CrewAI
        print(f"Starting Multi-Agent Crew for {request.asset}...")
        # Use asyncer to run the synchronous CrewAI kickoff in a thread pool
        result = await asyncer.asyncify(run_trade_lens_crew)(request.asset)
        
        # 3. Process Result
        report_str = result.raw if hasattr(result, 'raw') else str(result)
        print("✅ Crew Analysis Complete.")
        return AnalysisResponse(report=report_str)

    except Exception as e:
        error_msg = str(e)
        print(f"❌ CRITICAL ERROR in /analyze: {error_msg}")
        import traceback
        traceback.print_exc()

        raise HTTPException(
            status_code=500, 
            detail=f"AI Engine Error: {error_msg}"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)