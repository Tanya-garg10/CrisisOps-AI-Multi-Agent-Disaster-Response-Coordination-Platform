from typing import Dict, Any
from agents.specialists import (
    IncidentAnalysisAgent, 
    WeatherIntelligenceAgent, 
    ResourceManagementAgent,
    PlanningAgent
)

class CommanderAgent:
    def __init__(self):
        self.name = "Commander Agent"
        self.specialists = {
            "incident": IncidentAnalysisAgent(),
            "weather": WeatherIntelligenceAgent(),
            "resource": ResourceManagementAgent(),
            "planning": PlanningAgent()
        }

    def handle_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        """Orchestrates the response to an incident by coordinating specialist agents."""
        
        # 1. Incident Analysis
        analysis_result = self.specialists["incident"].process(incident_data)
        
        # 2. Weather Intelligence
        weather_result = self.specialists["weather"].process(incident_data)
        
        # 3. Resource Management
        resource_result = self.specialists["resource"].process(incident_data)
        
        # 4. Planning & Coordination
        context = {
            "incident": incident_data,
            "analysis": analysis_result,
            "weather": weather_result,
            "resources": resource_result
        }
        plan_result = self.specialists["planning"].process(context)
        
        return {
            "status": "Processed",
            "analysis": analysis_result,
            "weather": weather_result,
            "resources": resource_result,
            "plan": plan_result
        }

commander = CommanderAgent()
