import sys
import os

# Ensure parent directory (project root) is in path so 'database' module is found
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from google import genai

from database import models, session
from database.session import engine, get_db
from agents.orchestrator import commander

# Pydantic models for chat
class ChatRequest(BaseModel):
    message: str
    mode: str
    incidents: list = []
    resources: list = []
    weatherNodes: list = []
    history: list = []

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CrisisOps AI API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "operational", "system": "CrisisOps AI Command Center"}

@app.get("/api/incidents")
def get_incidents(db: Session = Depends(get_db)):
    return db.query(models.Incident).all()

@app.post("/api/incidents")
def create_incident(incident_data: Dict[str, Any], background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    incident = models.Incident(
        title=incident_data.get("title", "Unknown Incident"),
        description=incident_data.get("description", ""),
        severity=incident_data.get("severity", "Moderate"),
        emergency_type=incident_data.get("emergency_type", "General"),
        victims=incident_data.get("victims", 0)
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    # Trigger agents in background
    background_tasks.add_task(process_incident_with_agents, incident.id)
    return incident

def process_incident_with_agents(incident_id: int):
    # Create a new session for the background task
    db = next(get_db())
    try:
        incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
        if not incident:
            return
            
        incident_data = {
            "title": incident.title,
            "description": incident.description,
            "severity": incident.severity,
            "emergency_type": incident.emergency_type,
            "victims": incident.victims
        }
        
        result = commander.handle_incident(incident_data)
        
        # Save AI recommendations back to incident
        if "plan" in result and "action_plan" in result["plan"]:
            incident.ai_recommendation = result["plan"]["action_plan"]
            
        # Compile a summary from all agents
        summary = (
            f"Weather: {result.get('weather', {}).get('weather_condition', 'Unknown')}. "
            f"Resources needed: {len(result.get('resources', {}).get('recommended_resources', []))} items."
        )
        incident.ai_summary = summary
        incident.status = "Assessing"
        
        db.commit()
    except Exception as e:
        print(f"Error processing incident {incident_id} with AI agents: {e}")
    finally:
        db.close()

@app.get("/api/resources")
def get_resources(db: Session = Depends(get_db)):
    return db.query(models.Resource).all()

@app.post("/api/chat")
def chat_with_copilot(req: ChatRequest):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY environment variable not configured.")
    
    try:
        client = genai.Client(api_key=api_key)
        
        # System instructions based on mode
        context = f"Active Incidents: {len(req.incidents)} | Active Resources: {len(req.resources)}"
        
        if req.mode == "multi_agent":
            sys_instruct = (
                "You are coordinating multiple AI agents. Based on the user's operational request, "
                "simulate a tactical response from the following agents: Commander, Weather, Medical, Logistics, and Communication. "
                "Respond STRICTLY in JSON array format, where each object has a 'sender' string (the agent name) and a 'text' string (their response). "
                "Do NOT include markdown block formatting (like ```json), ONLY the raw JSON array."
            )
        elif req.mode == "citizen":
            sys_instruct = (
                "You are the CrisisOps Citizen SOS Assistant. Provide actionable, concise, and calm safety guidelines "
                "or evacuation advice to the citizen in distress based on their inquiry."
            )
        else:
            # copilot
            sys_instruct = (
                "You are the CrisisOps EOC AI Copilot. Assist the command center operator with logistics, situational awareness, and planning. "
                "You can trigger system actions by appending a special block to your response if the operator asks to report an incident. "
                "Format for actions: [ACTION] {\"type\": \"CREATE_INCIDENT\", \"title\": \"...\", \"severity\": \"...\"}"
            )

        prompt = f"System Instruction: {sys_instruct}\n\nContext: {context}\n\nUser Message: {req.message}"
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        return {"response": response.text}
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
