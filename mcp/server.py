import json
from typing import Dict, Any

class MockMCPServer:
    """
    Mock MCP Server to demonstrate Model Context Protocol.
    In a real application, this would run as a separate stdio or SSE server 
    using the @modelcontextprotocol/sdk.
    """
    def __init__(self):
        self.tools = {
            "get_weather": self.get_weather,
            "geocode_location": self.geocode_location
        }
        
    def list_tools(self) -> list:
        return list(self.tools.keys())
        
    def execute_tool(self, name: str, params: Dict[str, Any]) -> str:
        if name in self.tools:
            return json.dumps(self.tools[name](**params))
        return json.dumps({"error": f"Tool {name} not found"})
        
    def get_weather(self, location: str) -> Dict[str, Any]:
        return {
            "location": location,
            "temperature": "22C",
            "condition": "Heavy Rain",
            "alerts": ["Flood Warning"]
        }
        
    def geocode_location(self, query: str) -> Dict[str, Any]:
        return {
            "query": query,
            "lat": 34.0522,
            "lng": -118.2437
        }

mcp_server = MockMCPServer()
