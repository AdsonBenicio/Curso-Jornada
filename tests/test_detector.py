from datetime import datetime, timezone
from types import SimpleNamespace

from app.services.detector import DetectionConfig, SuspiciousTransactionDetector


def transaction(**overrides):
    values = {
        "account_id": "A-1",
        "destination_account_id": "B-1",
        "amount": 100.0,
        "occurred_at": datetime(2026, 7, 22, 14, 0, tzinfo=timezone.utc),
        "destination_account_created_at": None,
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def test_detects_high_amount():
    result = SuspiciousTransactionDetector(DetectionConfig(suspicious_amount_limit=1000)).analyze(
        transaction(amount=1001), []
    )
    assert result.is_suspicious
    assert result.triggered_rules == ["high_amount"]


def test_detects_repeated_transaction_in_window():
    current = transaction()
    previous = transaction(occurred_at=datetime(2026, 7, 22, 13, 55, tzinfo=timezone.utc))
    result = SuspiciousTransactionDetector().analyze(current, [previous])
    assert "repeated_transaction" in result.triggered_rules


def test_detects_new_destination_and_unusual_hour():
    current = transaction(
        occurred_at=datetime(2026, 7, 22, 2, 30, tzinfo=timezone.utc),
        destination_account_created_at=datetime(2026, 7, 20, 2, 30, tzinfo=timezone.utc),
    )
    result = SuspiciousTransactionDetector().analyze(current, [])
    assert result.is_suspicious
    assert set(result.triggered_rules) == {"new_destination_account", "unusual_hour"}


def test_approves_normal_transaction():
    result = SuspiciousTransactionDetector().analyze(transaction(), [])
    assert not result.is_suspicious
    assert result.triggered_rules == []
