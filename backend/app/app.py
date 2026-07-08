from fastapi import FastAPI, Request

# Internal
from client import UnearthClient
from config import Config

async def lifespan(app: FastAPI):

    conf = Config
    cli = UnearthClient(conf)

    await cli.connect()

    app.state.client = cli

    yield

    await cli.disconnect()

app = FastAPI(title="Unearth API", description="Backend API for Unearth application", version="1.0.0", lifespan=lifespan)

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/batch-user")
async def batch_user(request: Request, service_type: str, query: str):
    return await request.app.state.client.scanner_batch_call(service_type, query, False)

@app.get("/api/batch-email")
async def batch_email(request: Request, service_type: str, query: str):
    return await request.app.state.client.scanner_batch_call(service_type, query, True)
