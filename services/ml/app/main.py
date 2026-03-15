from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Qiraa ML Service", version="1.0.0", docs_url="/ml/v1/docs")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/ml/v1/health")
async def health():
    return {"status": "ok"}