import sys
import os

# Ensure parent directory (project root) is in path so 'database' module is found
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from database import models, session
from database.session import engine, get_db

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
def create_incident(incident_data: Dict[str, Any], db: Session = Depends(get_db)):
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
    # background_tasks.add_task(process_incident_with_agents, incident.id)
    return incident

@app.get("/api/resources")
def get_resources(db: Session = Depends(get_db)):
    return db.query(models.Resource).all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
