from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Protocol


class TransactionLike(Protocol):
    account_id: str
    destination_account_id: str
    amount: float
    occurred_at: datetime
    destination_account_created_at: datetime | None


@dataclass
class DetectionConfig:
    suspicious_amount_limit: float = 10000.0
    repeated_transaction_window_minutes: int = 10
    new_account_age_days: int = 7
    unusual_hour_start: int = 0
    unusual_hour_end: int = 5


@dataclass
class DetectionResult:
    is_suspicious: bool
    triggered_rules: list[str]
    explanations: list[str]


class SuspiciousTransactionDetector:
    def __init__(self, config: DetectionConfig | None = None) -> None:
        self.config = config or DetectionConfig()

    def analyze(self, transaction: TransactionLike, recent_transactions: list[TransactionLike]) -> DetectionResult:
        rules: list[str] = []
        explanations: list[str] = []
        if transaction.amount > self.config.suspicious_amount_limit:
            rules.append("high_amount")
            explanations.append(f"Valor acima do limite de {self.config.suspicious_amount_limit:.2f}.")

        window_start = transaction.occurred_at - timedelta(
            minutes=self.config.repeated_transaction_window_minutes
        )
        repeated = any(
            item.account_id == transaction.account_id
            and item.destination_account_id == transaction.destination_account_id
            and item.amount == transaction.amount
            and window_start <= item.occurred_at <= transaction.occurred_at
            for item in recent_transactions
        )
        if repeated:
            rules.append("repeated_transaction")
            explanations.append("Transação igual encontrada no intervalo configurado.")

        created_at = transaction.destination_account_created_at
        if created_at is not None:
            account_age = transaction.occurred_at - created_at
            if timedelta(0) <= account_age <= timedelta(days=self.config.new_account_age_days):
                rules.append("new_destination_account")
                explanations.append("Conta de destino foi criada recentemente.")

        hour = transaction.occurred_at.hour
        if self._is_unusual_hour(hour):
            rules.append("unusual_hour")
            explanations.append("Transação realizada em horário considerado incomum.")

        return DetectionResult(bool(rules), rules, explanations)

    def _is_unusual_hour(self, hour: int) -> bool:
        start = self.config.unusual_hour_start
        end = self.config.unusual_hour_end
        return start <= hour < end if start <= end else hour >= start or hour < end
