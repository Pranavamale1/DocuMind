
from contextlib import asynccontextmanager
from app.api.auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.api.chats import router as chats_router
from app.models.chat import Chat, ChatMessage
from fastapi import FastAPI

from app.core.config import settings
from app.db.init_db import create_tables
from app.api.documents import router as documents_router

# Application startup par database tables initialize hongi.
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="RAG-Based Document Assistant API",
    lifespan=lifespan
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
          "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://docu-mind-wine.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(chats_router)

@app.get("/")
def root():
    return {
        "message": "DocuMind API is running",
        "environment": settings.ENVIRONMENT
    }
