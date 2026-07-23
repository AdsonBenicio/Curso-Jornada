from fastapi import APIRouter, Request

from app.schemas import RuleConfig
from app.services.detector import DetectionConfig, SuspiciousTransactionDetector

router = APIRouter(prefix="/config", tags=["Configuração"])


@router.get("/rules", response_model=RuleConfig)
def get_rules(request: Request) -> DetectionConfig:
    return request.app.state.detector.config


@router.put("/rules", response_model=RuleConfig)
def update_rules(payload: RuleConfig, request: Request) -> DetectionConfig:
    request.app.state.detector.config = DetectionConfig(**payload.model_dump())
    return request.app.state.detector.config
