from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import os

# Internal
import request_utils

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok"}

@router.get("/batch")
async def batch_endpoint():
    return await request_utils.batch_call()

def create_app() -> FastAPI:
    """
    Creates the app and applies necessary middleware.

    Returns:
        FastAPI: The created FastAPI app instance.
    """
    app = FastAPI(title="Unearth API", description="Backend API for Unearth application", version="1.0.0")

    # Probably not going to be necessary if using same origin for front end and back end.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

    # mount your router(s) under a common prefix
    app.include_router(router, prefix="/api")
    return app