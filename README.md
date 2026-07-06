# CrisisOps AI 🛰️
### Multi-Agent Disaster Response Coordination Platform

CrisisOps AI is a production-grade, highly secure, full-stack disaster management command center.

The platform coordinates a mesh of seven autonomous AI agents leveraging the modern **Google GenAI Python SDK** and Gemini, allowing local emergency dispatch teams to instantly analyze disasters, run storm risk modeling, optimize tactical rescue asset assignments, and broadcast warnings.

---

## 🏗️ System Architecture & Workflow

```
                        [ CITIZEN / DISPATCH REPORT ]
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   Express API Ingestion   │ (Secure CORS & Rate Limiter)
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   Commander Agent (Hub)   │ (Orchestrates ADK mesh)
                        └──────┬──────┬──────┬──────┘
                               │      │      │
           ┌───────────────────┘      │      └───────────────────┐
           ▼                          ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│  Incident Analysis   │   │    Weather Intel     │   │   Resource Manager   │
│  - Geocoding Extract │   │  - Radar sweeps      │   │  - Station metrics   │
│  - Severity Grading  │   │  - Flood risk bounds │   │  - Dispatch latency  │
└──────────┬───────────┘   └──────────┬───────────┘   └──────────┬───────────┘
           │                          │                          │
           └───────────────────┐      │      ┌───────────────────┘
                               ▼      ▼      ▼
                        ┌───────────────────────────┐
                        │  Planning Agent (Tactical)│ (Resource matching index)
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌─────────────┴─────────────┐
                        │    Communication Agent    │ (EAS alerts & SMS logs)
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌─────────────┴─────────────┐
                        │  Report Generation Agent  │ (Executive Markdown briefings)
                        └───────────────────────────┘
```

---

## 🌟 Key Features

### 1. Situational Command Center
- **Interactive Vector Tactical Map**: A responsive coordinate grid mapping out Cascadia Sector 4, featuring real-time coordinate tracking, click-to-pin geocoding, thermal hazards, and overlay toggles (Precipitation Radar & Medevac Aviation corridors).
- **Active Disaster Command Log**: Track historical, reported, and active emergencies with live severity chips.
- **Deep Situational Dossier**: View full threat parameters, medical evacuation milestones, and live status.

### 2. Autonomous Multi-Agent Mesh
- Visualizes **7 Cooperative AI Agents** working in sync.
- Interactive **Agent Communication Bus Console** displaying step-by-step thinking processes, task delegations, meteorological risk evaluations, and logistics routing alerts.

### 3. AI-Powered Asset Dispatch
- Monitor live capacity bars for station resources (Ambulances, Search & Rescue Squads, Heavy Plant, lifeFlight Medevacs, and Bed Space).
- Dynamic recommenders and click-to-dispatch allocation updating the crisis chronological timeline immediately.

### 4. Enterprise Security & Audit
- **Role-Based Access Control (RBAC)**: Supports `COMMANDER` (full operational authority), `DISPATCHER` (alerts and logistics), and `FIELD_RESPONDER` (read-only command HUD) authentication roles.
- **Key Vault Status Panel**: Tracks Secret Manager integration (CORS, Rate Limiter buckets).
- **Live Security Audit Ledger**: Chronological trail logging connections, IP markers, and action elevations.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS (v4), Framer Motion (`motion/react`), Lucide Icons, Recharts.
- **Backend**: Node.js, Express (serving assets, proxying Gemini, parsing CORS rules).
- **AI Engine**: Google Gemini 3.5 Flash utilizing the `@google/genai` TypeScript SDK and strict `responseSchema` JSON configurations.

---

## ⚙️ Installation & Local Setup

### 1. Environment Variables
Clone `.env.example` into a local `.env` file:
```env
# Required for Gemini AI SDK
GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"

# Self-referential URL for callbacks
APP_URL="http://localhost:3000"
```

### 2. Install & Start Development Server
```bash
# Install initial packages
npm install

# Run the full-stack development environment (Port 3000)
npm run dev
```

### 3. Production Build
```bash
# Build React static assets and bundle server.ts via esbuild
npm run build

# Start the production environment
npm run start
```

---

## 📡 Google ADK & Gemini API Usage

CrisisOps AI utilizes the modern `google-genai` Python SDK on the backend to parse, assess, and summarize incoming reports. 

Below is our **strict response schema configuration** that guarantees structure and eliminates parser crashing using Pydantic:

```python
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

class ResourceRequirement(BaseModel):
    resource_type: str
    quantity: int

class IncidentAssessment(BaseModel):
    ai_summary: str
    primary_response: str
    required_resources: list[ResourceRequirement]
    safety_precautions: list[str]
    priority_level: int = Field(description="1 to 5 priority level")

client = genai.Client()
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=prompt_string,
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=IncidentAssessment,
    ),
)
```

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/Tanya-garg10/CrisisOps-AI-Multi-Agent-Disaster-Response-Coordination-Platform/issues) if you want to contribute.

## 📝 License
This project is open-source and available under the MIT License.

## 👥 Author
- **Tanya Garg** - *Creator & Lead Developer* - [GitHub Profile](https://github.com/Tanya-garg10)
