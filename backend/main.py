from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import Base, engine
from routes.documents import router as documents_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Document Editor API",
    version="1.0.0",
    description="FastAPI backend for document editing, sharing, and text file uploads.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents_router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}
