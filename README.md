# SuspeitaBank API

API REST para registrar transações bancárias e identificar operações potencialmente suspeitas por regras configuráveis.

## Arquitetura

```text
app/
  controllers/          Rotas HTTP e conversão de respostas
  services/             Casos de uso e motor de detecção
  config.py             Configuração por variáveis de ambiente
  db.py                 Engine, sessão e criação das tabelas
  models.py             Entidades SQLAlchemy: Transaction e AnalysisLog
  schemas.py            Contratos de entrada e saída da API
  main.py               Inicialização do FastAPI
```

A aplicação usa SQLite por padrão (`fraud_detection.db`). O serviço de transações consulta operações recentes, executa o detector, persiste a transação e registra um `AnalysisLog` com as regras acionadas.

## Executar

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

A documentação interativa fica em <http://127.0.0.1:8000/docs>.

Para configurar outro banco ou regras, copie `.env.example` para `.env` e altere os valores. As variáveis disponíveis são `DATABASE_URL`, `SUSPICIOUS_AMOUNT_LIMIT`, `REPEATED_TRANSACTION_WINDOW_MINUTES`, `NEW_ACCOUNT_AGE_DAYS`, `UNUSUAL_HOUR_START` e `UNUSUAL_HOUR_END`.

## Endpoints

- `POST /transactions`: registra e analisa uma transação.
- `GET /transactions`: lista todas; use `?suspicious_only=true` para filtrar.
- `GET /transactions/suspicious`: lista somente suspeitas.
- `GET /config/rules`: consulta a configuração atual.
- `PUT /config/rules`: atualiza as regras em memória.
- `GET /health`: verifica disponibilidade.

### Exemplo de transação normal

```json
{
  "account_id": "ACC-100",
  "destination_account_id": "ACC-200",
  "amount": 250.5,
  "currency": "BRL",
  "occurred_at": "2026-07-22T14:30:00Z",
  "destination_account_created_at": "2025-01-10T10:00:00Z"
}
```

Resposta esperada: `status: "approved"` e `triggered_rules: []`.

### Exemplo suspeito

```json
{
  "account_id": "ACC-100",
  "destination_account_id": "ACC-NEW",
  "amount": 25000,
  "currency": "BRL",
  "occurred_at": "2026-07-22T02:30:00Z",
  "destination_account_created_at": "2026-07-20T02:30:00Z"
}
```

Esse exemplo aciona `high_amount`, `new_destination_account` e `unusual_hour`. Uma segunda chamada idêntica dentro de 10 minutos também acionará `repeated_transaction`.

### Configurar regras

```json
{
  "suspicious_amount_limit": 5000,
  "repeated_transaction_window_minutes": 15,
  "new_account_age_days": 3,
  "unusual_hour_start": 0,
  "unusual_hour_end": 6
}
```

A alteração feita por `PUT /config/rules` vale até o processo ser reiniciado. Para configuração permanente, use variáveis de ambiente.

## Fluxo de análise

1. O controller valida o JSON com Pydantic.
2. O serviço busca transações recentes da mesma conta.
3. O detector executa as regras independentes.
4. Se uma ou mais regras forem acionadas, o status vira `suspicious`.
5. Transação e log detalhado são gravados em uma única operação.
6. A resposta retorna as regras acionadas para auditoria imediata.

## Como adicionar uma regra

1. Adicione uma verificação em `SuspiciousTransactionDetector.analyze`.
2. Use um identificador estável em `triggered_rules`.
3. Adicione uma explicação legível em `explanations`.
4. Inclua um teste positivo e um caso que não acione a regra em `tests/test_detector.py`.
5. Se a regra exigir configuração, adicione o campo em `DetectionConfig`, `Settings` e `RuleConfig`.

## Testes

```powershell
python -m pytest -q
```

Os testes unitários cobrem valor alto, repetição, conta nova, horário incomum e transação normal.

## Frontend

O dashboard React fica em `frontend/` e funciona conectado à API ou em modo demonstração com dados mockados quando a API não estiver disponível.

```powershell
cd frontend
npm install
npm run dev
```

Abra <http://127.0.0.1:5173>. Para conectar a outra URL de backend, crie `frontend/.env` com `VITE_API_URL=http://localhost:8000`.

As páginas do frontend são:

- Dashboard com indicadores, gráfico de fluxo e radar de risco.
- Lista paginada com busca, status e filtro de suspeitas.
- Detalhes com regras acionadas e histórico da conta.
- Cadastro validado de novas transações.
- Configuração dos limites e janelas de detecção.
