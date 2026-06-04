from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Unearth API", description="Backend API for Unearth application", version="1.0.0")

# Probably not going to be necessary if using same origin for front end and back end. May be nice to have anyway for local development/testing.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}