import logging

from fastapi import FastAPI

from app.config import settings
from app.controllers import config, transactions
from app.db import create_tables
from app.services.detector import DetectionConfig, SuspiciousTransactionDetector

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")

from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="SuspeitaBank API",
    description="API para registrar e analisar transações bancárias suspeitas.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.state.detector = SuspiciousTransactionDetector(
    DetectionConfig(
        suspicious_amount_limit=settings.suspicious_amount_limit,
        repeated_transaction_window_minutes=settings.repeated_transaction_window_minutes,
        new_account_age_days=settings.new_account_age_days,
        unusual_hour_start=settings.unusual_hour_start,
        unusual_hour_end=settings.unusual_hour_end,
    )
)


@app.on_event("startup")
def startup() -> None:
    create_tables()


@app.get("/health", tags=["Sistema"])
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(transactions.router)
app.include_router(config.router)
