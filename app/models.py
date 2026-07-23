from datetime import datetime, timezone
from enum import StrEnum

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class TransactionStatus(StrEnum):
    approved = "approved"
    suspicious = "suspicious"


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    account_id: Mapped[str] = mapped_column(String(100), index=True)
    destination_account_id: Mapped[str] = mapped_column(String(100), index=True)
    amount: Mapped[float] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(3), default="BRL")
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    destination_account_created_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(20), default=TransactionStatus.approved.value, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    analysis_logs: Mapped[list["AnalysisLog"]] = relationship(back_populates="transaction")


class AnalysisLog(Base):
    __tablename__ = "analysis_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    transaction_id: Mapped[int] = mapped_column(ForeignKey("transactions.id"), index=True)
    is_suspicious: Mapped[bool] = mapped_column(default=False)
    triggered_rules: Mapped[str] = mapped_column(Text, default="[]")
    analyzed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    transaction: Mapped[Transaction] = relationship(back_populates="analysis_logs")
