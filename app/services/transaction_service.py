import json
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AnalysisLog, Transaction, TransactionStatus
from app.schemas import TransactionCreate
from app.services.detector import DetectionResult, SuspiciousTransactionDetector

logger = logging.getLogger("fraud_detection.analysis")


class TransactionService:
    def __init__(self, db: Session, detector: SuspiciousTransactionDetector) -> None:
        self.db = db
        self.detector = detector

    def register(self, payload: TransactionCreate) -> tuple[Transaction, DetectionResult]:
        window = timedelta(minutes=self.detector.config.repeated_transaction_window_minutes)
        recent = self.db.scalars(
            select(Transaction).where(
                Transaction.account_id == payload.account_id,
                Transaction.occurred_at >= payload.occurred_at - window,
                Transaction.occurred_at <= payload.occurred_at,
            )
        ).all()
        result = self.detector.analyze(payload, recent)
        transaction = Transaction(
            **payload.model_dump(),
            status=(TransactionStatus.suspicious if result.is_suspicious else TransactionStatus.approved),
        )
        self.db.add(transaction)
        self.db.flush()
        self.db.add(
            AnalysisLog(
                transaction_id=transaction.id,
                is_suspicious=result.is_suspicious,
                triggered_rules=json.dumps(result.triggered_rules),
            )
        )
        self.db.commit()
        self.db.refresh(transaction)
        logger.info(
            "Transação analisada: id=%s suspicious=%s rules=%s",
            transaction.id,
            result.is_suspicious,
            result.triggered_rules,
        )
        return transaction, result

    def list_transactions(self, suspicious_only: bool = False) -> list[Transaction]:
        query = select(Transaction).order_by(Transaction.occurred_at.desc())
        if suspicious_only:
            query = query.where(Transaction.status == TransactionStatus.suspicious)
        return list(self.db.scalars(query).all())

    def get_triggered_rules(self, transaction_id: int) -> list[str]:
        log = self.db.scalar(
            select(AnalysisLog)
            .where(AnalysisLog.transaction_id == transaction_id)
            .order_by(AnalysisLog.analyzed_at.desc())
        )
        return json.loads(log.triggered_rules) if log else []
