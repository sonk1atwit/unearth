from fastapi import FastAPI, Request

# Internal
from client import UnearthClient
from config import Config

async def lifespan(app: FastAPI):

    conf = Config.read_env()
    cli = UnearthClient(conf)

    await cli.connect()

    app.state.client = cli

    yield

    await cli.disconnect()

app = FastAPI(title="Unearth API", description="Backend API for Unearth application", version="1.0.0", lifespan=lifespan)

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/batch")
async def batch_request(request: Request, service_type: str, query: str):
    await request.app.state.client.validate_request(request)
    return await request.app.state.client.batch_call(service_type, query)
