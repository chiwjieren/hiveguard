from pydantic import BaseModel

class AuditRequest(BaseModel):
    txHash: str
    targetContract: str
    payloadData: str

class AgentBreakdown(BaseModel):
    agent_402_a: int
    agent_402_b: int
    agent_402_c: int

class AuditResponse(BaseModel):
    txHash: str
    consensusScore: int
    breakdown: AgentBreakdown
    action: str

class RecordScoresRequest(BaseModel):
    txHash: str
    agent_402_a: int
    agent_402_b: int
    agent_402_c: int

class RecordScoresResponse(BaseModel):
    txHash: str
    recorded: bool
    txReceiptHash: str | None = None
    error: str | None = None
