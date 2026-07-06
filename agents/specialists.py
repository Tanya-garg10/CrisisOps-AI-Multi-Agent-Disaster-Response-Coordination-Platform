from typing import Dict, Any, List

class Agent:
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role

    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Base process method to be overridden by subclasses."""
        pass

class IncidentAnalysisAgent(Agent):
    def __init__(self):
        super().__init__("Incident Analysis Agent", "Extract location, classify severity, understand disaster type")

    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        description = context.get("description", "")
        # Mock LLM processing
        severity = "Critical" if "fire" in description.lower() or "trapped" in description.lower() else "Moderate"
        return {
            "severity": severity,
            "disaster_type": "Fire" if "fire" in description.lower() else "General",
            "victims_extracted": 2 if "trapped" in description.lower() else 0
        }

class WeatherIntelligenceAgent(Agent):
    def __init__(self):
        super().__init__("Weather Intelligence Agent", "Current weather, rain prediction, flood prediction")

    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "weather_condition": "Heavy Rainfall expected",
            "flood_risk": "High"
        }

class ResourceManagementAgent(Agent):
    def __init__(self):
        super().__init__("Resource Management Agent", "Rescue teams, ambulances, shelters, equipment")

    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "recommended_resources": [
                {"type": "Ambulance", "quantity": 1},
                {"type": "Rescue Team", "quantity": 1}
            ]
        }

class PlanningAgent(Agent):
    def __init__(self):
        super().__init__("Planning Agent", "Prioritize incidents, assign resources, optimize response")
        
    def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "action_plan": "Dispatch Team Bravo to Sector 12 immediately."
        }
