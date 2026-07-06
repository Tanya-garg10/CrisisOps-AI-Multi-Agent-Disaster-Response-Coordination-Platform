/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Incident,
  EmergencyResource,
  WeatherNode,
  AgentConfig,
  AuditLog,
  UserSession,
  Severity,
  IncidentStatus,
  DisasterType,
  AgentStatus
} from "./types";
import {
  INITIAL_AGENTS,
  INITIAL_WEATHER_NODES,
  INITIAL_RESOURCES,
  INITIAL_INCIDENTS,
  INITIAL_AUDIT_LOGS
} from "./data/mockData";

// Components
import CommandCenterMap from "./components/CommandCenterMap";
import AgentStatusPanel from "./components/AgentStatusPanel";
import IncidentForm from "./components/IncidentForm";
import ResourceGrid from "./components/ResourceGrid";
import AnalyticsPanel from "./components/AnalyticsPanel";
import AdminVaultLogs from "./components/AdminVaultLogs";
import CommandSettings from "./components/CommandSettings";
import SocialMissingPortal from "./components/SocialMissingPortal";
import MultiAgentChatArena from "./components/MultiAgentChatArena";
import MobileResponderDashboard from "./components/MobileResponderDashboard";

// Translations & Extended mock data
import { TRANSLATIONS } from "./data/translations";
import { INITIAL_MISSING_PERSONS, INITIAL_SOCIAL_FEED } from "./data/mockData";
import { AppSettings, MissingPerson, SocialFeedEntry } from "./types";


// Icons
import {
  ShieldAlert,
  Cpu,
  Layers,
  History,
  AlertTriangle,
  Clock,
  Printer,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle,
  LogOut,
  Send,
  Share2,
  Settings,
  Smartphone
} from "lucide-react";

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"command" | "agents" | "analytics" | "security" | "social-missing" | "settings">("command");

  // Core EOC States
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [resources, setResources] = useState<EmergencyResource[]>(INITIAL_RESOURCES);
  const [agents, setAgents] = useState<AgentConfig[]>(INITIAL_AGENTS);
  const [weatherNodes, setWeatherNodes] = useState<WeatherNode[]>(INITIAL_WEATHER_NODES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  // Extended features states
  const [socialFeed, setSocialFeed] = useState<SocialFeedEntry[]>(INITIAL_SOCIAL_FEED);
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>(INITIAL_MISSING_PERSONS);
  const [isSimulatingFaceMatch, setIsSimulatingFaceMatch] = useState<string | null>(null);

  // Config parameters
  const [settings, setSettings] = useState<AppSettings>({
    language: "en",
    geminiModel: "gemini-3.5-flash",
    apiRateLimit: 60,
    enableMcpWeather: true,
    enableMcpMaps: true,
    enableMcpFiles: false,
    enableMcpCalendar: true,
    simulationPacing: 1250,
    alertSoundEnabled: true
  });

  // Active User session (RBAC simulation)
  const [session, setSession] = useState<UserSession>({
    email: "taniyagarg1007@gmail.com",
    role: "COMMANDER",
    name: "Taniya Garg (HQ)"
  });

  // Selection states
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(INITIAL_INCIDENTS[0]);
  const [mapCoordsInput, setMapCoordsInput] = useState<{ lat: number; lng: number; address: string } | null>(null);

  // Multi-Agent Simulation logs and trigger states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<{ id: string; timestamp: string; from: string; message: string; type?: string }[]>([]);

  // Submitting a new Incident
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OSINT Sentinel Handlers
  const handleImportSocialIncident = (feed: SocialFeedEntry) => {
    setSocialFeed((prev) =>
      prev.map((f) => (f.id === feed.id ? { ...f, isImported: true } : f))
    );
    setMapCoordsInput({
      lat: feed.lat,
      lng: feed.lng,
      address: feed.location
    });
    addAuditLog(
      "OSINT_FEED_IMPORTED",
      `Imported citizen social stream coordinate by ${feed.username} to EOC ledger.`,
      "SUCCESS"
    );
    setActiveTab("command");
  };

  const handleRegisterMissingPerson = (newPerson: Omit<MissingPerson, "id">) => {
    const fresh: MissingPerson = {
      ...newPerson,
      id: `mp-${Date.now()}`
    };
    setMissingPersons((prev) => [fresh, ...prev]);
    addAuditLog(
      "HUMANITARIAN_RECORD_FILED",
      `Registered missing person database card for: ${newPerson.name}`,
      "SUCCESS"
    );
  };

  const handleTriggerFaceMatch = (personId: string) => {
    setIsSimulatingFaceMatch(personId);
    addAuditLog(
      "AI_FACE_RECOGNITION_TRIGGERED",
      `Initiated municipal CCTV & drone search scan for subject ID [${personId}].`,
      "SUCCESS"
    );

    // Dynamic siren audio
    if (settings.alertSoundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(660, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}
    }

    setTimeout(() => {
      setMissingPersons((prev) =>
        prev.map((p) => {
          if (p.id === personId) {
            return {
              ...p,
              status: "MATCH_FOUND",
              matchConfidence: Math.floor(Math.random() * 10 + 88)
            };
          }
          return p;
        })
      );
      setIsSimulatingFaceMatch(null);
      addAuditLog(
        "AI_FACE_RECOGNITION_MATCHED",
        `Subject geocode detected on surveillance drone telemetry! Match confirmed.`,
        "SUCCESS"
      );
    }, 3000);
  };


  // Live clock state
  const [timeStr, setTimeStr] = useState("");
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toISOString().replace("T", " ").slice(0, 19) + " UTC");
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Utility to append logs and audit entries
  const addAuditLog = (action: string, details: string, status: "SUCCESS" | "DENIED" | "FAILURE") => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: session.email,
      role: session.role,
      action,
      details,
      ipAddress: "10.142.0.24",
      status
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Grid/Map clicking logic to sync into the submission form
  const handleMapGridClick = (lat: number, lng: number, address: string) => {
    setMapCoordsInput({ lat, lng, address });
    // Write dynamic log trace
    addAuditLog("MAP_COORDINATE_TARGETED", `Pin placed at Lat ${lat}, Lng ${lng}. Address extracted.`, "SUCCESS");
  };

  // Submit dynamic incident
  const handleIncidentSubmit = async (data: {
    title: string;
    description: string;
    type: DisasterType;
    severity: Severity;
    lat: number;
    lng: number;
    address: string;
    victimsCount: number;
    presetImageIndex: number | null;
  }) => {
    if (session.role === "FIELD_RESPONDER") {
      addAuditLog("SUBMIT_INCIDENT_TICKET", "Attempted to submit incident ticket under read-only clearance.", "DENIED");
      alert("Access Denied: FIELD_RESPONDER role is restricted to read-only Command HUD access. Toggle COMMANDER role under the Security tab first.");
      return;
    }

    setIsSubmitting(true);
    addAuditLog("SUBMIT_INCIDENT_TICKET", `Filing new dispatch alert: ${data.title}`, "SUCCESS");

    try {
      // Direct post request to the custom backend which triggers Gemini assessment!
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          reporter: session.name
        })
      });

      if (!res.ok) {
        throw new Error("Failed to file Gemini incident on backend. Falling back to local synthesis.");
      }

      const newIncident: Incident = await res.json();
      setIncidents((prev) => [newIncident, ...prev]);
      setSelectedIncident(newIncident);
      
      // Auto-add dynamic audit and success trace
      addAuditLog("AI_INCIDENT_APPRAISED", `Incident ${newIncident.id} successfully generated and appraised via Gemini 3.5 Pro.`, "SUCCESS");
      
    } catch (err) {
      console.error(err);
      // Failover simulation in case backend is offline or key missing
      const mockId = `inc-2026-${Math.floor(Math.random() * 900 + 100)}`;
      const failoverIncident: Incident = {
        id: mockId,
        title: data.title,
        description: data.description,
        type: data.type,
        severity: data.severity,
        location: {
          lat: data.lat,
          lng: data.lng,
          address: data.address,
          region: "Cascadia Command Hub Area"
        },
        victimsCount: data.victimsCount,
        reportedAt: new Date().toISOString(),
        reportedBy: session.name,
        status: IncidentStatus.REPORTED,
        aiSummary: "Failover local summary: Severe hazard risk spotted. Immediate perimeter zoning strongly advised.",
        aiRecommendations: {
          primaryResponse: "Establish dynamic defensive lines; evaluate road structures and direct field-responder patrols.",
          requiredResources: [{ type: "RESCUE_TEAM", quantity: 1 }],
          safetyPrecautions: ["Equip respiratory masks.", "Set barrier fencing."],
          priorityLevel: data.severity === Severity.CRITICAL ? 95 : 70
        },
        allocatedResources: [],
        timeline: [
          {
            timestamp: new Date().toISOString(),
            title: "Report Filed (Local Failover)",
            description: "Dispatched ticket registered. Awaiting multi-agent mesh assignment.",
            agentName: "Incident Analysis Agent"
          }
        ]
      };
      setIncidents((prev) => [failoverIncident, ...prev]);
      setSelectedIncident(failoverIncident);
      addAuditLog("AI_INCIDENT_APPRAISED", `Incident ${mockId} processed via failover state engine.`, "SUCCESS");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dispatch Logistics Resource manually
  const handleAllocateResource = (resourceId: string, quantity: number) => {
    if (!selectedIncident) return;

    if (session.role === "FIELD_RESPONDER") {
      addAuditLog("DISPATCH_RESOURCE", `Attempted resource allocation of ${resourceId} to ${selectedIncident.id}.`, "DENIED");
      alert("Access Denied: Field responder accounts cannot dispatch heavy logistics assets. Switch roles in the Security tab.");
      return;
    }

    // Check availability
    const resourceIndex = resources.findIndex((r) => r.id === resourceId);
    if (resourceIndex === -1 || resources[resourceIndex].status !== "AVAILABLE") return;

    // Update logistics
    const updatedResources = [...resources];
    const targetResource = updatedResources[resourceIndex];
    targetResource.status = "DISPATCHED";

    setResources(updatedResources);

    // Register inside incident ledger
    const updatedIncidents = incidents.map((inc) => {
      if (inc.id === selectedIncident.id) {
        const newAllocation = {
          resourceId,
          quantity,
          dispatchedAt: new Date().toISOString()
        };
        const newTimelineEvent = {
          timestamp: new Date().toISOString(),
          title: `${targetResource.name} Dispatched`,
          description: `Dispatched from ${targetResource.location.station} with capacity ${targetResource.capacity.current} personnel.`,
          agentName: "Resource Management Agent"
        };
        return {
          ...inc,
          status: IncidentStatus.DISPATCHING,
          allocatedResources: [...inc.allocatedResources, newAllocation],
          timeline: [...inc.timeline, newTimelineEvent]
        };
      }
      return inc;
    });

    setIncidents(updatedIncidents);
    // Find newly updated incident
    const newInc = updatedIncidents.find((i) => i.id === selectedIncident.id);
    if (newInc) setSelectedIncident(newInc);

    addAuditLog(
      "DISPATCH_RESOURCE",
      `Successfully dispatched ${targetResource.name} to ${selectedIncident.id}`,
      "SUCCESS"
    );
  };

  // Cascade Multi-Agent Simulation Cycle
  const handleTriggerSimulation = async () => {
    if (!selectedIncident) {
      alert("Please select or submit an incident to coordinate agents around.");
      return;
    }

    setIsSimulating(true);
    setSimulationLogs([]);

    // Staggered Agent thinking states and response logs simulation
    const steps = [
      {
        agentId: "commander",
        status: AgentStatus.THINKING,
        log: "Received incident analysis ticket. Routing coordinates to weather forecasting grids and inventory logs.",
        task: "Delegating tasks"
      },
      {
        agentId: "incident-analysis",
        status: AgentStatus.EXECUTING,
        log: `Analyzing coordinates ${selectedIncident.location.lat}, ${selectedIncident.location.lng}. Classifying severity: ${selectedIncident.severity}. Victims at risk: ${selectedIncident.victimsCount}.`,
        task: "Analyzing geocodes"
      },
      {
        agentId: "weather-intel",
        status: AgentStatus.EXECUTING,
        log: "Evaluating real-time weather feeds: Estuary Delta High Winds warnings are active. Windspeed: 28 knots, rain rate 45mm/hr. High landslide susceptibility calculated.",
        task: "Modeling wind/flood shear"
      },
      {
        agentId: "resource-manager",
        status: AgentStatus.EXECUTING,
        log: "Querying emergency logistics: Rescue Unit Alpha and LifeFlight helipads are in proximity. Preparing transit routing arrays.",
        task: "Querying vehicle grids"
      },
      {
        agentId: "planning-agent",
        status: AgentStatus.EXECUTING,
        log: "Drafting action plan: Priority weighting index set to 95. Proposing immediate swift-water deployment & evacuation route redirects.",
        task: "Formulating action briefs"
      },
      {
        agentId: "communication-agent",
        status: AgentStatus.EXECUTING,
        log: "Broadcasting EAS system Civil Hazard warning. Dispatched mobile SMS notices to Sector 4 grids. Responder dispatch signals armed.",
        task: "Delivering SMS alerts"
      },
      {
        agentId: "report-gen",
        status: AgentStatus.EXECUTING,
        log: "Compiling executive briefing. Historical records indexed. Executive PDF situation document drafted.",
        task: "Writing executive dossier"
      }
    ];

    let currentLogs: typeof simulationLogs = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Update specific agent status to Active
      setAgents((prev) =>
        prev.map((a) => (a.id === step.agentId ? { ...a, status: step.status, currentTask: step.task } : a))
      );

      // Add log
      const newLog = {
        id: `sim-${Date.now()}-${i}`,
        timestamp: new Date().toLocaleTimeString(),
        from: INITIAL_AGENTS.find((a) => a.id === step.agentId)?.name || step.agentId,
        message: step.log,
        type: step.agentId === "commander" ? "commander" : "specialist"
      };
      
      currentLogs = [...currentLogs, newLog];
      setSimulationLogs(currentLogs);

      // Stagger slightly for premium high-fidelity thinking feel
      await new Promise((resolve) => setTimeout(resolve, 1400));

      // Mark agent as completed and idle
      setAgents((prev) =>
        prev.map((a) => (a.id === step.agentId ? { ...a, status: AgentStatus.COMPLETED, currentTask: undefined } : a))
      );
    }

    // Update overall incident status on successful simulation completion
    const updatedIncidents = incidents.map((inc) => {
      if (inc.id === selectedIncident.id) {
        return {
          ...inc,
          status: IncidentStatus.ACTIVE,
          timeline: [
            ...inc.timeline,
            {
              timestamp: new Date().toISOString(),
              title: "Multi-Agent Brief Compiled",
              description: "Commander, Planning, and Weather agents successfully aligned resources. Alerts pushed.",
              agentName: "Commander Agent"
            }
          ]
        };
      }
      return inc;
    });

    setIncidents(updatedIncidents);
    const updatedSelected = updatedIncidents.find((i) => i.id === selectedIncident.id);
    if (updatedSelected) setSelectedIncident(updatedSelected);

    // Reset all agent states to IDLE
    setAgents((prev) => prev.map((a) => ({ ...a, status: AgentStatus.IDLE })));
    setIsSimulating(false);

    addAuditLog(
      "SIMULATE_AGENT_FLOW",
      `Multi-Agent planning cascade finished successfully for ${selectedIncident.id}`,
      "SUCCESS"
    );
  };

  // Generate dynamic situation markdown report
  const triggerReportPrint = () => {
    if (!selectedIncident) return;
    addAuditLog("GENERATE_REPORT_DOC", `Exported full Markdown dossier for ${selectedIncident.id}`, "SUCCESS");
    
    const reportText = `
=========================================
CRISISOPS AI - SITUATION BRIEF DOSSIER
=========================================
INCIDENT ID: ${selectedIncident.id}
REPORT TIMESTAMP: ${new Date().toISOString()}
COORDINATES: Lat ${selectedIncident.location.lat}, Lng ${selectedIncident.location.lng}
ADDRESS: ${selectedIncident.location.address}
DISASTER TYPE: ${selectedIncident.type}
URGENCY LEVEL: ${selectedIncident.severity}
VICTIMS DIRECTLY THREATENED: ${selectedIncident.victimsCount}
-----------------------------------------
EXECUTIVE SUMMARY:
${selectedIncident.aiSummary || "No AI summary compiled yet."}

AI RESPONSE TACTICS RECOMMENDATION:
${selectedIncident.aiRecommendations?.primaryResponse || "N/A"}

SAFETY ENFORCEMENT PARAMETERS:
${selectedIncident.aiRecommendations?.safetyPrecautions.map((p, i) => `${i + 1}. ${p}`).join("\n") || "N/A"}

CURRENT LOGISTICAL DEPLOYMENTS:
${
  selectedIncident.allocatedResources.length > 0
    ? selectedIncident.allocatedResources
        .map((r) => `- Resource ID: ${r.resourceId} (Allocated at ${r.dispatchedAt})`)
        .join("\n")
    : "No heavy logistics dispatched."
}
=========================================
    `;

    // Download as text file
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Situation_Report_${selectedIncident.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const t = TRANSLATIONS[settings.language] || TRANSLATIONS.en;

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Top Global Command Banner */}
      <header className="bg-[#0b0f19] border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 z-20 sticky top-0 backdrop-blur-md bg-opacity-95">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-rose-600/10 border border-rose-500/40 rounded-xl flex items-center justify-center shadow-lg shadow-rose-950/20">
            <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold tracking-wider uppercase text-slate-100 font-mono">
                {t.title}
              </h1>
              <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-800/40 px-2 py-0.5 rounded font-mono font-bold tracking-widest">
                {t.sectorBadge}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Real-Time UTC clock & Active Operator Clearance badge */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-1.5 font-mono text-[10px] bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-400">
            <Clock className="h-3.5 w-3.5 text-cyan-400" />
            <span>{timeStr}</span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg p-1.5">
            <div className="h-6 w-6 rounded-md bg-rose-600/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-[10px] font-bold font-mono">
              {session.role[0]}
            </div>
            <div className="text-left leading-none pr-1">
              <div className="text-[10px] font-bold text-slate-300 truncate max-w-[120px]">{session.name}</div>
              <span className="text-[8px] font-mono font-bold text-slate-500 uppercase">{session.role} LEVEL</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main EOC Hub Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 bg-[#0b0f19]/80 border-r border-slate-800 p-4 space-y-1 z-10 shrink-0">
          <div className="text-[10px] font-mono font-bold text-slate-500 px-3 mb-2 uppercase tracking-wider">
            Operator HUD Navigation
          </div>
          <button
            onClick={() => setActiveTab("command")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-mono tracking-tight transition-all text-left border cursor-pointer ${
              activeTab === "command"
                ? "bg-indigo-950/40 text-indigo-300 border-indigo-500/30 font-semibold"
                : "border-transparent text-slate-400 hover:bg-[#111726]/50 hover:text-slate-300"
            }`}
          >
            <Layers className="h-4.5 w-4.5 text-cyan-500" />
            <span>{t.commandTab}</span>
          </button>
          
          <button
            onClick={() => setActiveTab("agents")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-mono tracking-tight transition-all text-left border cursor-pointer ${
              activeTab === "agents"
                ? "bg-indigo-950/40 text-indigo-300 border-indigo-500/30 font-semibold"
                : "border-transparent text-slate-400 hover:bg-[#111726]/50 hover:text-slate-300"
            }`}
          >
            <Cpu className="h-4.5 w-4.5 text-indigo-400" />
            <span>{t.agentsTab}</span>
          </button>

          <button
            onClick={() => setActiveTab("social-missing")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-mono tracking-tight transition-all text-left border cursor-pointer ${
              activeTab === "social-missing"
                ? "bg-indigo-950/40 text-indigo-300 border-indigo-500/30 font-semibold"
                : "border-transparent text-slate-400 hover:bg-[#111726]/50 hover:text-slate-300"
            }`}
          >
            <Share2 className="h-4.5 w-4.5 text-indigo-400" />
            <span>{t.socialTab}</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-mono tracking-tight transition-all text-left border cursor-pointer ${
              activeTab === "analytics"
                ? "bg-indigo-950/40 text-indigo-300 border-indigo-500/30 font-semibold"
                : "border-transparent text-slate-400 hover:bg-[#111726]/50 hover:text-slate-300"
            }`}
          >
            <History className="h-4.5 w-4.5 text-amber-500" />
            <span>{t.analyticsTab}</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-mono tracking-tight transition-all text-left border cursor-pointer ${
              activeTab === "security"
                ? "bg-indigo-950/40 text-indigo-300 border-indigo-500/30 font-semibold"
                : "border-transparent text-slate-400 hover:bg-[#111726]/50 hover:text-slate-300"
            }`}
          >
            <ShieldAlert className="h-4.5 w-4.5 text-emerald-400" />
            <span>{t.securityTab}</span>
          </button>

          <button
            onClick={() => setActiveTab("responder")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-mono tracking-tight transition-all text-left border cursor-pointer ${
              activeTab === "responder"
                ? "bg-indigo-950/40 text-indigo-300 border-indigo-500/30 font-semibold"
                : "border-transparent text-slate-400 hover:bg-[#111726]/50 hover:text-slate-300"
            }`}
          >
            <Smartphone className="h-4.5 w-4.5 text-rose-400" />
            <span>{t.responderTab}</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-mono tracking-tight transition-all text-left border cursor-pointer ${
              activeTab === "settings"
                ? "bg-indigo-950/40 text-indigo-300 border-indigo-500/30 font-semibold"
                : "border-transparent text-slate-400 hover:bg-[#111726]/50 hover:text-slate-300"
            }`}
          >
            <Settings className="h-4.5 w-4.5 text-slate-400" />
            <span>{t.settingsTab}</span>
          </button>


          {/* Quick weather status box */}
          <div className="pt-4 mt-4 border-t border-slate-800/60 text-[10px] space-y-2.5">
            <div className="font-mono font-bold text-slate-500 uppercase tracking-wider px-3">
              Meteorological Grid Alerts
            </div>
            <div className="space-y-1.5 px-3">
              {weatherNodes.map((w, i) => (
                <div key={i} className="flex items-center justify-between font-mono">
                  <span className="text-slate-400 truncate max-w-[120px]">{w.region.replace("Valley", "").replace("Estuary", "")}</span>
                  <span className={`text-[8px] font-bold px-1.5 rounded ${
                    w.alertLevel === "WARNING"
                      ? "bg-rose-950/40 text-rose-400 border border-rose-800/30"
                      : w.alertLevel === "ADVISORY"
                      ? "bg-amber-950/40 text-amber-400 border border-amber-800/30"
                      : "bg-slate-900 text-slate-500"
                  }`}>
                    {w.alertLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Dynamic Display Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* View 1: Tactical CommandCenter HUD */}
            {activeTab === "command" && (
              <motion.div
                key="command"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 xl:grid-cols-12 gap-6"
              >
                {/* Left Column: List and submit */}
                <div className="xl:col-span-4 space-y-6 flex flex-col">
                  {/* List of active disasters */}
                  <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col min-h-[300px]">
                    <h2 className="text-sm font-bold text-slate-100 tracking-wide border-b border-slate-800 pb-3 mb-3">
                      Active Disaster Command Log
                    </h2>
                    
                    <div className="flex-1 overflow-y-auto max-h-[220px] space-y-2.5 pr-1.5 custom-scrollbar">
                      {incidents.map((inc) => {
                        const isSelected = selectedIncident?.id === inc.id;
                        return (
                          <div
                            key={inc.id}
                            onClick={() => setSelectedIncident(inc)}
                            className={`p-3 rounded-lg border text-left transition-all cursor-pointer relative overflow-hidden ${
                              isSelected
                                ? "bg-indigo-950/20 border-indigo-500/50 shadow-indigo-950/20 shadow-md"
                                : "bg-[#111726]/40 border-slate-800 hover:border-slate-700 hover:bg-[#141b2e]/40"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] font-mono font-bold text-slate-500">
                                {inc.id}
                              </span>
                              <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                inc.severity === "CRITICAL"
                                  ? "bg-rose-950/50 text-rose-400 border border-rose-500/20"
                                  : inc.severity === "HIGH"
                                  ? "bg-orange-950/50 text-orange-400 border border-orange-500/20"
                                  : "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                              }`}>
                                {inc.severity}
                              </span>
                            </div>

                            <h4 className="text-[11px] font-bold text-slate-200 truncate tracking-tight mb-1">
                              {inc.title}
                            </h4>
                            <p className="text-[9px] text-slate-400 truncate font-mono">
                              Geo: {inc.location.region}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submission ticket form */}
                  <div className="flex-1">
                    <IncidentForm
                      mapCoords={mapCoordsInput}
                      onSubmitIncident={handleIncidentSubmit}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                </div>

                {/* Right Column: Tactical Map, resource tracking, and agent summaries */}
                <div className="xl:col-span-8 space-y-6">
                  {/* Interactive Map Grid */}
                  <div className="h-[400px] lg:h-[480px]">
                    <CommandCenterMap
                      incidents={incidents}
                      resources={resources}
                      selectedIncident={selectedIncident}
                      onSelectIncident={(inc) => setSelectedIncident(inc)}
                      onGridClick={handleMapGridClick}
                    />
                  </div>

                  {/* Logistical assets and shelter status */}
                  <ResourceGrid
                    resources={resources}
                    selectedIncident={selectedIncident}
                    onAllocateResource={handleAllocateResource}
                    isSimulating={isSimulating}
                  />

                  {/* Sliding Incident Detail & AI Plan Analysis HUD */}
                  {selectedIncident && (
                    <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-4">
                        <div>
                          <div className="flex items-center space-x-1.5 text-rose-400">
                            <span className="text-[9px] font-mono font-bold tracking-wider">ACTIVE DOSSIER VIEW</span>
                            <span className="text-[10px] text-slate-500">|</span>
                            <span className="text-[9px] font-mono text-slate-300 font-bold">{selectedIncident.id}</span>
                          </div>
                          <h3 className="text-xs font-bold text-slate-200 font-mono mt-0.5 uppercase tracking-wide">
                            {selectedIncident.title}
                          </h3>
                        </div>

                        {/* Print Report */}
                        <button
                          onClick={triggerReportPrint}
                          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#111726] hover:bg-slate-800 border border-slate-700 text-[10px] text-slate-300 font-mono transition-colors cursor-pointer"
                        >
                          <Printer className="h-3 w-3" />
                          <span>EXPORT SITUATION DOSSIER</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs text-slate-300 leading-normal">
                        {/* Summary column */}
                        <div className="lg:col-span-7 space-y-4">
                          {selectedIncident.imageUrl && (
                            <div className="h-32 rounded-lg border border-slate-800 overflow-hidden relative">
                              <img src={selectedIncident.imageUrl} alt="Scene alert preset" className="w-full h-full object-cover" />
                              <div className="absolute bottom-2 left-2 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded font-mono text-[8px] text-rose-400">
                                SCENE CAPTURE: GEMINI VISION ACTIVE
                              </div>
                            </div>
                          )}

                          <div className="space-y-1">
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Description</span>
                            <p className="text-[11px] text-slate-300">
                              {selectedIncident.description}
                            </p>
                          </div>

                          {selectedIncident.aiSummary && (
                            <div className="p-3.5 rounded-lg bg-indigo-950/15 border border-indigo-500/20 space-y-1">
                              <span className="text-[9px] font-mono font-bold text-indigo-400 flex items-center space-x-1">
                                <Sparkles className="h-3 w-3 text-indigo-400 fill-current" />
                                <span>AI GENERATED SITUATION BRIEF</span>
                              </span>
                              <p className="text-[11px] text-slate-300 italic">
                                &ldquo;{selectedIncident.aiSummary}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Dispatch, Safety warnings, and timeline Column */}
                        <div className="lg:col-span-5 space-y-4">
                          {selectedIncident.aiRecommendations && (
                            <div className="space-y-2 bg-[#111726]/60 border border-slate-800 p-3 rounded-lg">
                              <span className="text-[9px] font-mono font-bold text-rose-400 uppercase">Enforced Safety Bounds</span>
                              <ul className="space-y-1">
                                {selectedIncident.aiRecommendations.safetyPrecautions.map((prec, i) => (
                                  <li key={i} className="text-[10px] text-slate-300 flex items-start space-x-1.5">
                                    <span className="text-rose-500 shrink-0 mt-0.5 font-bold">&#8226;</span>
                                    <span>{prec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Historical action timeline logs */}
                          <div className="space-y-2">
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">Operational Milestones</span>
                            <div className="space-y-2.5 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                              {selectedIncident.timeline.map((event, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <div className="h-2 w-2 rounded-full bg-slate-700 mt-1 shrink-0" />
                                  <div className="leading-tight text-[10px]">
                                    <div className="font-bold text-slate-300">{event.title}</div>
                                    <div className="text-[9px] text-slate-400 mt-0.5">{event.description}</div>
                                    {event.agentName && (
                                      <span className="text-[8px] text-indigo-400 font-mono block mt-0.5">[{event.agentName}]</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* View 2: Multi-Agent status graph and execution simulation with strategic debate forum */}
            {activeTab === "agents" && (
              <motion.div
                key="agents"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="h-full"
              >
                <div className="space-y-6">
                  {/* Explainer / HUD info bar */}
                  <div className="bg-[#111726]/60 border border-slate-800 p-4 rounded-xl flex items-start space-x-3">
                    <Cpu className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                        Google ADK Multi-Agent Orchestration Layer
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        The platform deploys seven specialized cooperative agents synchronized under the Commander. Operators can trigger visual orchestration simulations below, or utilize the Strategic Chat Arena to watch the Commander, Weather, Medical, Logistics, and Communication agents debate operational directives in real time.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AgentStatusPanel
                      agents={agents}
                      logs={simulationLogs}
                      isSimulating={isSimulating}
                      onTriggerSimulation={handleTriggerSimulation}
                    />
                    
                    <MultiAgentChatArena
                      onAddAuditLog={addAuditLog}
                      simulationPacing={settings.simulationPacing}
                      incidents={incidents}
                      resources={resources}
                      weatherNodes={weatherNodes}
                      onAddIncident={(newIncident) => {
                        setIncidents((prev) => [newIncident, ...prev]);
                        setSelectedIncident(newIncident);
                      }}
                      onUpdateIncidentStatus={(id, status) => {
                        setIncidents((prev) =>
                          prev.map((inc) => (inc.id === id ? { ...inc, status } : inc))
                        );
                        if (selectedIncident && selectedIncident.id === id) {
                          setSelectedIncident((prev) => (prev ? { ...prev, status } : null));
                        }
                      }}
                      onUpdateResourceStatus={(id, status) => {
                        setResources((prev) =>
                          prev.map((res) => (res.id === id ? { ...res, status } : res))
                        );
                      }}
                      onUpdateWeatherAlert={(region, alertLevel) => {
                        setWeatherNodes((prev) =>
                          prev.map((w) => (w.region === region ? { ...w, alertLevel } : w))
                        );
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* View 3: Social sentinel & humanitarian portal */}
            {activeTab === "social-missing" && (
              <motion.div
                key="social-missing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <SocialMissingPortal
                  socialFeed={socialFeed}
                  missingPersons={missingPersons}
                  onImportSocialIncident={handleImportSocialIncident}
                  onRegisterMissingPerson={handleRegisterMissingPerson}
                  onTriggerFaceMatch={handleTriggerFaceMatch}
                  onAddAuditLog={addAuditLog}
                  isSimulatingFaceMatch={isSimulatingFaceMatch}
                />
              </motion.div>
            )}

            {/* View 4: Recharts analytics dashboards */}
            {activeTab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <AnalyticsPanel incidents={incidents} resources={resources} />
              </motion.div>
            )}

            {/* View 5: SOC Security settings, JWT authorization simulation */}
            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <AdminVaultLogs
                  currentSession={session}
                  onUpdateSession={(updated) => setSession(updated)}
                  auditLogs={auditLogs}
                  onAddAuditLog={addAuditLog}
                />
              </motion.div>
            )}

            {/* View 5.5: Ground Mobile Phone Simulation Console */}
            {activeTab === "responder" && (
              <motion.div
                key="responder"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <MobileResponderDashboard
                  incidents={incidents}
                  onAddIncident={(newIncident) => {
                    setIncidents((prev) => [newIncident, ...prev]);
                    setSelectedIncident(newIncident);
                  }}
                  onUpdateIncidentStatus={(id, status) => {
                    setIncidents((prev) =>
                      prev.map((inc) => (inc.id === id ? { ...inc, status } : inc))
                    );
                    if (selectedIncident && selectedIncident.id === id) {
                      setSelectedIncident((prev) => (prev ? { ...prev, status } : null));
                    }
                  }}
                  onAddAuditLog={addAuditLog}
                  alertSoundEnabled={settings.alertSoundEnabled}
                />
              </motion.div>
            )}

            {/* View 6: Systems Configuration Settings panel */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <CommandSettings
                  settings={settings}
                  onUpdateSettings={setSettings}
                  onAddAuditLog={addAuditLog}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* Portal Footer status bar */}
      <footer className="bg-[#0b0f19] border-t border-slate-800 px-6 py-2 flex items-center justify-between font-mono text-[9px] text-slate-500">
        <div>
          AUDIT LEDGER SECURE | WGS84 REFERENCE FRAME ACTIVE
        </div>
        <div>
          KAGGLE CAPSTONE SUBMISSION | VIBE-CODING 2026
        </div>
      </footer>
    </div>
  );
}
