from fastapi import FastAPI
from CloudYCC.backend.app.api.api import api_router

app = FastAPI(title="CloudYCC Project")

# 전체 라우터 등록
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "CloudYCC Backend Running"}