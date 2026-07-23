from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas import TransactionCreate, TransactionResponse
from app.services.detector import SuspiciousTransactionDetector
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["Transações"])


def get_detector(request: Request) -> SuspiciousTransactionDetector:
    return request.app.state.detector


def response_for(transaction, service: TransactionService) -> TransactionResponse:
    return TransactionResponse(
        **{field: getattr(transaction, field) for field in TransactionCreate.model_fields},
        id=transaction.id,
        status=transaction.status,
        created_at=transaction.created_at,
        triggered_rules=service.get_triggered_rules(transaction.id),
    )


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    detector: SuspiciousTransactionDetector = Depends(get_detector),
) -> TransactionResponse:
    service = TransactionService(db, detector)
    transaction, _ = service.register(payload)
    return response_for(transaction, service)


@router.get("", response_model=list[TransactionResponse])
def list_transactions(
    suspicious_only: bool = False,
    db: Session = Depends(get_db),
    detector: SuspiciousTransactionDetector = Depends(get_detector),
) -> list[TransactionResponse]:
    service = TransactionService(db, detector)
    return [response_for(item, service) for item in service.list_transactions(suspicious_only)]


@router.get("/suspicious", response_model=list[TransactionResponse])
def list_suspicious(
    db: Session = Depends(get_db),
    detector: SuspiciousTransactionDetector = Depends(get_detector),
) -> list[TransactionResponse]:
    service = TransactionService(db, detector)
    return [response_for(item, service) for item in service.list_transactions(True)]
