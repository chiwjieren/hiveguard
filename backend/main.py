from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
from dotenv import load_dotenv

from models import AuditRequest, AuditResponse, AgentBreakdown, RecordScoresRequest, RecordScoresResponse
from agents.code_reviewer import score_code
from agents.social_scanner import score_social
from agents.fork_simulator import score_simulation
from record_scores import record_agent_scores_on_chain

load_dotenv()

app = FastAPI(title="HiveGuard AI Swarm Consensus Module Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RPC_CACHE = {}
CACHE_TTL = 60

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/v1/audit")
async def execute_swarm_audit(payload: AuditRequest):
    """
    Execute parallel AI agent audit and return consensus score.
    Agents run concurrently: Code Review, Social Scan, Fork Simulation.
    Consensus = (code * 0.4) + (social * 0.2) + (sim * 0.4)
    """
    try:
        score_a = score_code(payload.targetContract)
        score_b = score_social(payload.targetContract)
        score_c = score_simulation(payload.targetContract, payload.payloadData)

        consensus_score = int((score_a * 0.4) + (score_b * 0.2) + (score_c * 0.4))
        action = "PASS" if consensus_score >= 75 else "REVERT"

        return AuditResponse(
            txHash=payload.txHash,
            consensusScore=consensus_score,
            breakdown=AgentBreakdown(
                agent_402_a=score_a,
                agent_402_b=score_b,
                agent_402_c=score_c
            ),
            action=action
        )
    except Exception as e:
        print(f"Audit error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/record-scores")
async def record_scores_endpoint(payload: RecordScoresRequest):
    """
    Record individual agent scores to HiveGuardEngine contract.
    Called by frontend after audit to make scores immutable & auditable.
    """
    try:
        result = record_agent_scores_on_chain(
            payload.txHash,
            payload.agent_402_a,
            payload.agent_402_b,
            payload.agent_402_c
        )

        if result["success"]:
            return RecordScoresResponse(
                txHash=payload.txHash,
                recorded=True,
                txReceiptHash=result["tx_hash"],
                error=None
            )
        else:
            return RecordScoresResponse(
                txHash=payload.txHash,
                recorded=False,
                txReceiptHash=None,
                error=result.get("error", "Unknown error recording scores")
            )
    except Exception as e:
        print(f"Record scores error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
