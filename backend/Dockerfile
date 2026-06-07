FROM python:3.11-slim

WORKDIR /app

# Install build deps if needed
RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# build command (Windows)
# docker build -t unearth-backend:latest -f backend/Dockerfile backend

# general use run command (Windows)
# docker run --env-file backend/.env -p 8000:8000 unearth-backend:latest