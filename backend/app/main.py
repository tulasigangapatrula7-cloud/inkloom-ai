from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .db import init_indexes
from .routers import auth, brands, submissions

@asynccontextmanager
async def lifespan(_):
    await init_indexes()
    yield

app = FastAPI(title="InkLoom AI API", lifespan=lifespan)
app.add_middleware(CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth.router)
app.include_router(brands.router)
app.include_router(submissions.router)

@app.get("/api/health")
async def health():
    return {"status": "ok", "ai_configured": bool(settings.gemini_api_key)}
