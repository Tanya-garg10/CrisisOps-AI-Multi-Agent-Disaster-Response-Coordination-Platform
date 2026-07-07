import os
import json
from typing import Dict, Any, List
from pydantic import BaseModel
from google import genai
from google.genai import types

# Pydantic schemas for structured output
class IncidentAnalysisResult(BaseModel):
    severity: str
    disaster_type: str
    victims_extracted: int

class WeatherResult(BaseModel):
    weather_condition: str
    flood_risk: str

class ResourceItem(BaseModel):
    type: str
    quantity: int

class ResourceResult(BaseModel):
    recommended_resources: list[ResourceItem]

class PlanResult(BaseModel):
    action_plan: str

class Agent:
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        api_key = os.environ.get("GEMINI_API_KEY")
        self.client = genai.Client(api_key=api_key) if api_key else None

    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Base process method to be overridden by subclasses."""
        pass
        
    def _generate_structured(self, prompt: str, schema: type[BaseModel]) -> BaseModel:
        if not self.client:
            raise ValueError("GEMINI_API_KEY is not configured.")
        response = self.client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema,
            ),
        )
        return schema.model_validate_json(response.text)

class IncidentAnalysisAgent(Agent):
    def __init__(self):
        super().__init__("Incident Analysis Agent", "Extract location, classify severity, understand disaster type")

    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        description = context.get("description", "")
        if not self.client:
            return {"severity": "Critical", "disaster_type": "General", "victims_extracted": 0}
            
        prompt = f"Analyze the following incident and classify severity, disaster type, and number of trapped/extracted victims if mentioned. Description: {description}"
        try:
            res = self._generate_structured(prompt, IncidentAnalysisResult)
            return res.model_dump()
        except Exception as e:
            print(f"IncidentAnalysisAgent Error: {e}")
            return {"severity": "Critical", "disaster_type": "Unknown", "victims_extracted": 0}

class WeatherIntelligenceAgent(Agent):
    def __init__(self):
        super().__init__("Weather Intelligence Agent", "Current weather, rain prediction, flood prediction")

    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        description = context.get("description", "")
        if not self.client:
            return {"weather_condition": "Unknown", "flood_risk": "Unknown"}
            
        prompt = f"Based on this incident, infer the most likely weather condition and flood risk level (Low/Medium/High). Description: {description}"
        try:
            res = self._generate_structured(prompt, WeatherResult)
            return res.model_dump()
        except Exception as e:
            print(f"WeatherIntelligenceAgent Error: {e}")
            return {"weather_condition": "Unknown", "flood_risk": "Unknown"}

class ResourceManagementAgent(Agent):
    def __init__(self):
        super().__init__("Resource Management Agent", "Rescue teams, ambulances, shelters, equipment")

    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        description = context.get("description", "")
        analysis = context.get("analysis", {})
        if not self.client:
            return {"recommended_resources": [{"type": "Rescue Team", "quantity": 1}]}
            
        prompt = f"Incident: {description}. Analysis: {json.dumps(analysis)}. Recommend required emergency resources and quantities."
        try:
            res = self._generate_structured(prompt, ResourceResult)
            return res.model_dump()
        except Exception as e:
            print(f"ResourceManagementAgent Error: {e}")
            return {"recommended_resources": [{"type": "Rescue Team", "quantity": 1}]}

class PlanningAgent(Agent):
    def __init__(self):
        super().__init__("Planning Agent", "Prioritize incidents, assign resources, optimize response")
        
    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        if not self.client:
            return {"action_plan": "Proceed with caution."}
            
        # exclude client from context for json dump safety
        safe_context = {k: v for k, v in context.items() if not k.startswith('_')}
        prompt = f"Context: {json.dumps(safe_context)}. Generate a concise, tactical action plan (2-3 sentences) for first responders."
        try:
            res = self._generate_structured(prompt, PlanResult)
            return res.model_dump()
        except Exception as e:
            print(f"PlanningAgent Error: {e}")
            return {"action_plan": "Error generating plan. Dispatch local units."}
