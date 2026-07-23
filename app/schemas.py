from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TransactionCreate(BaseModel):
    account_id: str = Field(min_length=1, max_length=100)
    destination_account_id: str = Field(min_length=1, max_length=100)
    amount: float = Field(gt=0)
    currency: str = Field(default="BRL", min_length=3, max_length=3)
    occurred_at: datetime
    destination_account_created_at: datetime | None = None

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()


class TransactionResponse(TransactionCreate):
    id: int
    status: str
    created_at: datetime
    triggered_rules: list[str] = []

    model_config = ConfigDict(from_attributes=True)


class RuleConfig(BaseModel):
    suspicious_amount_limit: float = Field(gt=0)
    repeated_transaction_window_minutes: int = Field(gt=0)
    new_account_age_days: int = Field(ge=0)
    unusual_hour_start: int = Field(ge=0, lt=24)
    unusual_hour_end: int = Field(ge=0, lt=24)


class AnalysisResult(BaseModel):
    is_suspicious: bool
    triggered_rules: list[str]
    explanations: list[str]
