from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from crew import run_trade_lens_crew
import uvicorn
import asyncer
import sqlite3
import json
import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

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

# --- Database Setup ---
# --- Database Setup ---
import os
# Use persistent storage path if running on Fly.io (where /data usually is mounted)
if os.path.exists("/data"):
    DB_PATH = "/data/trades.db"
else:
    DB_PATH = "trades.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT,
            name TEXT,
            handle TEXT UNIQUE,
            avatar_url TEXT,
            reputation INTEGER,
            points INTEGER,
            is_admin BOOLEAN,
            created_at TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            author_id TEXT,
            author_name TEXT,
            author_handle TEXT,
            author_avatar TEXT,
            title TEXT,
            content TEXT,
            tag TEXT,
            upvotes INTEGER DEFAULT 0,
            comment_count INTEGER DEFAULT 0,
            is_pinned BOOLEAN DEFAULT 0,
            comments TEXT,
            created_at TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trades (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            author_name TEXT,
            author_reputation INTEGER,
            asset TEXT,
            market TEXT,
            type TEXT,
            entry_min REAL,
            entry_max REAL,
            stop_loss REAL,
            take_profit TEXT,
            time_horizon TEXT,
            description TEXT,
            tags TEXT,
            confidence_score INTEGER,
            crowd TEXT,
            created_at TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- Models ---
class PostCreate(BaseModel):
    author_id: str
    author_name: str
    author_handle: str
    author_avatar: Optional[str] = None
    title: str
    content: str
    tag: str

class PostResponse(BaseModel):
    id: str
    author_id: str
    author_name: str
    author_handle: str
    author_avatar: Optional[str]
    title: str
    content: str
    tag: str
    upvotes: int
    comment_count: int
    is_pinned: bool
    comments: List[dict]
    created_at: str

class TradeCreate(BaseModel):
    user_id: str
    author_name: str
    author_reputation: int
    asset: str
    market: str
    type: str
    entry_min: float
    entry_max: float
    stop_loss: float
    take_profit: List[float]
    time_horizon: str
    description: str
    tags: List[str]
    confidence: int

class UserCreate(BaseModel):
    id: str
    email: str
    name: str
    handle: str
    avatar_url: Optional[str] = None
    reputation: int = 10
    points: int = 500
    is_admin: bool = False

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    handle: str
    avatar_url: Optional[str]
    reputation: int
    points: int
    is_admin: bool
    created_at: str

class TradeResponse(BaseModel):
    id: str
    user_id: str
    author_name: str
    author_reputation: int
    asset: str
    market: str
    type: str
    entry_min: float
    entry_max: float
    stop_loss: float
    take_profit: List[float]
    time_horizon: str
    description: str
    tags: List[str]
    confidence: int
    crowd: dict
    created_at: str

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

@app.get("/trades", response_model=List[TradeResponse])
async def get_trades():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM trades ORDER BY created_at DESC")
        rows = cursor.fetchall()
        
        trades = []
        for row in rows:
            trades.append(TradeResponse(
                id=row["id"],
                user_id=row["user_id"],
                author_name=row["author_name"],
                author_reputation=row["author_reputation"],
                asset=row["asset"],
                market=row["market"],
                type=row["type"],
                entry_min=row["entry_min"],
                entry_max=row["entry_max"],
                stop_loss=row["stop_loss"],
                take_profit=json.loads(row["take_profit"]),
                time_horizon=row["time_horizon"],
                description=row["description"],
                tags=json.loads(row["tags"]),
                confidence=row["confidence_score"],
                crowd=json.loads(row["crowd"]),
                created_at=row["created_at"]
            ))
        conn.close()
        return trades
    except Exception as e:
        print(f"Error fetching trades: {e}")
        return []

@app.post("/trades", response_model=TradeResponse)
async def create_trade(trade: TradeCreate):
    try:
        trade_id = f"t_{uuid.uuid4().hex[:8]}"
        created_at = datetime.utcnow().isoformat()
        crowd = {"agree": 0, "disagree": 0, "wait": 0, "totalVotes": 0}
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO trades (
                id, user_id, author_name, author_reputation, asset, market, type, 
                entry_min, entry_max, stop_loss, take_profit, time_horizon, 
                description, tags, confidence_score, crowd, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            trade_id, trade.user_id, trade.author_name, trade.author_reputation,
            trade.asset, trade.market, trade.type, trade.entry_min, trade.entry_max,
            trade.stop_loss, json.dumps(trade.take_profit), trade.time_horizon,
            trade.description, json.dumps(trade.tags), trade.confidence,
            json.dumps(crowd), created_at
        ))
        conn.commit()
        conn.close()
        
        return TradeResponse(
            id=trade_id,
            user_id=trade.user_id,
            author_name=trade.author_name,
            author_reputation=trade.author_reputation,
            asset=trade.asset,
            market=trade.market,
            type=trade.type,
            entry_min=trade.entry_min,
            entry_max=trade.entry_max,
            stop_loss=trade.stop_loss,
            take_profit=trade.take_profit,
            time_horizon=trade.time_horizon,
            description=trade.description,
            tags=trade.tags,
            confidence=trade.confidence,
            crowd=crowd,
            created_at=created_at
        )
    except Exception as e:
        print(f"Error creating trade: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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

@app.post("/api/users", response_model=UserResponse)
async def sync_user(user: UserCreate):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT * FROM users WHERE id = ?", (user.id,))
        existing = cursor.fetchone()
        
        created_at = datetime.utcnow().isoformat()
        
        if existing:
            # Update
            cursor.execute('''
                UPDATE users SET 
                    email = ?, name = ?, handle = ?, avatar_url = ?, 
                    reputation = ?, points = ?, is_admin = ?
                WHERE id = ?
            ''', (user.email, user.name, user.handle, user.avatar_url, 
                  user.reputation, user.points, user.is_admin, user.id))
            created_at = existing[8] # Keep original created_at index 8 based on schema
        else:
            # Insert
            cursor.execute('''
                INSERT INTO users (id, email, name, handle, avatar_url, reputation, points, is_admin, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (user.id, user.email, user.name, user.handle, user.avatar_url, 
                  user.reputation, user.points, user.is_admin, created_at))
            
        conn.commit()
        conn.close()
        
        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            handle=user.handle,
            avatar_url=user.avatar_url,
            reputation=user.reputation,
            points=user.points,
            is_admin=user.is_admin,
            created_at=created_at
        )
    except Exception as e:
        print(f"Error syncing user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users", response_model=List[UserResponse])
async def get_users():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users ORDER BY reputation DESC")
        rows = cursor.fetchall()
        
        users = []
        for row in rows:
            users.append(UserResponse(
                id=row["id"], email=row["email"], name=row["name"], 
                handle=row["handle"], avatar_url=row["avatar_url"],
                reputation=row["reputation"], points=row["points"],
                is_admin=bool(row["is_admin"]), created_at=row["created_at"]
            ))
        conn.close()
        return users
    except Exception as e:
        print(f"Error fetching users: {e}")
        return []

@app.get("/api/users/{handle}", response_model=UserResponse)
async def get_user_by_handle(handle: str):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE handle = ?", (handle,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
            
        return UserResponse(
            id=row["id"], email=row["email"], name=row["name"], 
            handle=row["handle"], avatar_url=row["avatar_url"],
            reputation=row["reputation"], points=row["points"],
            is_admin=bool(row["is_admin"]), created_at=row["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching user by handle: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/id/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: str):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            raise HTTPException(status_code=404, detail="User not found")
            
        return UserResponse(
            id=row["id"], email=row["email"], name=row["name"], 
            handle=row["handle"], avatar_url=row["avatar_url"],
            reputation=row["reputation"], points=row["points"],
            is_admin=bool(row["is_admin"]), created_at=row["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching user by id: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/posts", response_model=List[PostResponse])
async def get_posts():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM posts ORDER BY created_at DESC")
        rows = cursor.fetchall()
        
        posts = []
        for row in rows:
            posts.append(PostResponse(
                id=row["id"],
                author_id=row["author_id"],
                author_name=row["author_name"],
                author_handle=row["author_handle"],
                author_avatar=row["author_avatar"],
                title=row["title"],
                content=row["content"],
                tag=row["tag"],
                upvotes=row["upvotes"],
                comment_count=row["comment_count"],
                is_pinned=bool(row["is_pinned"]),
                comments=json.loads(row["comments"]),
                created_at=row["created_at"]
            ))
        conn.close()
        return posts
    except Exception as e:
        print(f"Error fetching posts: {e}")
        return []

@app.post("/api/posts", response_model=PostResponse)
async def create_post(post: PostCreate):
    try:
        post_id = f"p_{uuid.uuid4().hex[:8]}"
        created_at = datetime.utcnow().isoformat()
        comments = []
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO posts (
                id, author_id, author_name, author_handle, author_avatar,
                title, content, tag, upvotes, comment_count, is_pinned,
                comments, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post_id, post.author_id, post.author_name, post.author_handle,
            post.author_avatar, post.title, post.content, post.tag,
            0, 0, False, json.dumps(comments), created_at
        ))
        conn.commit()
        conn.close()
        
        return PostResponse(
            id=post_id,
            author_id=post.author_id,
            author_name=post.author_name,
            author_handle=post.author_handle,
            author_avatar=post.author_avatar,
            title=post.title,
            content=post.content,
            tag=post.tag,
            upvotes=0,
            comment_count=0,
            is_pinned=False,
            comments=comments,
            created_at=created_at
        )
    except Exception as e:
        print(f"Error creating post: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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