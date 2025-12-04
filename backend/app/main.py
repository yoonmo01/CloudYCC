from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings  # 있으면
from .db.session import engine
from .db.base import Base
from .routers import api_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="CloudYCC Project",
        version="0.1.0",
    )

    # CORS 설정 (프론트 React랑 통신)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # 개발 단계에서만 *
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # DB 초기화 (필요하면)
    Base.metadata.create_all(bind=engine)

    # 라우터 등록
    app.include_router(api_router, prefix="/api")

    return app


app = create_app()
