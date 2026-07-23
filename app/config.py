from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./fraud_detection.db"
    suspicious_amount_limit: float = 10000.0
    repeated_transaction_window_minutes: int = 10
    new_account_age_days: int = 7
    unusual_hour_start: int = 0
    unusual_hour_end: int = 5

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
