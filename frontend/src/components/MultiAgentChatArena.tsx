/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Zap,
  CloudLightning,
  Ambulance,
  Truck,
  Volume2,
  RefreshCw,
  Cpu,
  User,
  CheckCircle2,
  AlertTriangle,
  Mic,
  Users,
  Sparkles,
  HelpCircle,
  Activity,
  CheckCircle,
  FileText
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "Operator" | "Commander" | "Weather" | "Medical" | "Logistics" | "Communication" | "Copilot" | "Citizen" | "System";
  text: string;
  timestamp: string;
  avatarColor: string;
}

interface MultiAgentChatArenaProps {
  onAddAuditLog: (action: string, details: string, status: "SUCCESS" | "DENIED" | "FAILURE") => void;
  simulationPacing: number;
  incidents?: any[];
  resources?: any[];
  weatherNodes?: any[];
  onAddIncident?: (newIncident: any) => void;
  onUpdateIncidentStatus?: (id: string, status: any) => void;
  onUpdateResourceStatus?: (id: string, status: any) => void;
  onUpdateWeatherAlert?: (region: string, alertLevel: any) => void;
}

type ChatTab = "copilot" | "multi_agent" | "citizen";

export default function MultiAgentChatArena({
  onAddAuditLog,
  simulationPacing,
  incidents = [],
  resources = [],
  weatherNodes = [],
  onAddIncident,
  onUpdateIncidentStatus,
  onUpdateResourceStatus,
  onUpdateWeatherAlert
}: MultiAgentChatArenaProps) {
  const [activeTab, setActiveTab] = useState<ChatTab>("copilot");
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState("");
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  // Separate conversation histories for independent user sessions
  const [copilotMessages, setCopilotMessages] = useState<ChatMessage[]>([
    {
      id: "cop-init",
      sender: "Copilot",
      text: "**CrisisOps AI Copilot Online**. Grounded in EOC Database context.\n\nYou can query active threats, generate disaster logs, check weather status, or list shelters. Ask me:\n* *\"Show all critical incidents\"*\n* *\"Which shelter has capacity?\"*\n* *\"Generate today's disaster report\"*",
      timestamp: new Date().toLocaleTimeString(),
      avatarColor: "bg-indigo-950 border-indigo-500 text-indigo-300"
    }
  ]);

  const [multiAgentMessages, setMultiAgentMessages] = useState<ChatMessage[]>([
    {
      id: "agent-init",
      sender: "Commander",
      text: "System initialized. Operators can type coordinates or situational alerts below. Our specialized tactical agents (Commander, Weather, Logistics, Medical, and Communication) will automatically trigger a collaborative debate sequence to coordinate EOC deployment.",
      timestamp: new Date().toLocaleTimeString(),
      avatarColor: "bg-slate-900 border-indigo-400 text-indigo-200"
    }
  ]);

  const [citizenMessages, setCitizenMessages] = useState<ChatMessage[]>([
    {
      id: "cit-init",
      sender: "Citizen",
      text: "👋 **Welcome to the Citizen SOS Assistance Desk**.\n\nAre you currently in an emergency area? We are here to help you coordinate paths and stay safe. Select a quick action below or speak into the microphone to file an urgent distress alert.",
      timestamp: new Date().toLocaleTimeString(),
      avatarColor: "bg-emerald-950 border-emerald-500 text-emerald-300"
    }
  ]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Poll server for API health check
  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/health`);
        const data = await res.json();
        setApiConnected(data.apiConnected);
      } catch (e) {
        setApiConnected(false);
      }
    };
    checkApi();
  }, []);

  // Scroll to bottom when messages or typing indicators update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [copilotMessages, multiAgentMessages, citizenMessages, activeSpeaker, activeTab, isListeningVoice]);

  // Suggested prompt templates per experience
  const SUGGESTIONS = {
    copilot: [
      "Show all critical incidents",
      "Which shelter has capacity?",
      "Generate today's disaster report"
    ],
    multi_agent: [
      "Plan safe evacuation routing if river dykes overtop",
      "Deploy critical care staging parameters for 15 trapped victims",
      "Model landfall wind advisory and forest fire spread velocities"
    ],
    citizen: [
      "Show nearby emergency shelters",
      "Give flash flood safety guidelines",
      "How can I report an emergency?"
    ]
  };

  // Helper: Query the backend server-side Gemini Proxy or offline engine
  const runQuery = async (userPrompt: string, mode: ChatTab) => {
    setIsProcessing(true);
    const activeHistory =
      mode === "copilot" ? copilotMessages : mode === "citizen" ? citizenMessages : multiAgentMessages;

    // Send the query to server-side `/api/chat`
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userPrompt,
          mode: mode,
          incidents,
          resources,
          weatherNodes,
          history: activeHistory.slice(-10) // Limit context history for efficiency
        })
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.warn("API Error, triggering local procedural failover:", error);
      return null;
    }
  };

  const executeCopilotAction = (action: any) => {
    if (!action || !action.type) return;

    onAddAuditLog(
      "AI_COPILOT_MUTATION",
      `AI Copilot executed mutation: ${action.type} for entity ${action.id || action.title || action.region || ""}`,
      "SUCCESS"
    );

    // Play a confirmation audio cue
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}

    switch (action.type) {
      case "CREATE_INCIDENT":
        if (onAddIncident) {
          const newId = `INC-${100 + Math.floor(Math.random() * 900)}`;
          onAddIncident({
            id: newId,
            title: action.title || "Unspecified Incident Alert",
            description: action.description || "Ingested and geo-staged via active EOC AI Copilot processing.",
            type: action.disasterType || "Wildfire",
            severity: action.severity || "MEDIUM",
            location: {
              lat: 22.5726 + (Math.random() - 0.5) * 0.05,
              lng: 88.3639 + (Math.random() - 0.5) * 0.05,
              address: action.address || "Sector Coordinates",
              region: action.region || "Delta Region"
            },
            victimsCount: Number(action.victimsCount || 0),
            reportedAt: new Date().toLocaleTimeString(),
            reportedBy: "AI Copilot System",
            status: "REPORTED",
            allocatedResources: [],
            timeline: [
              {
                timestamp: new Date().toLocaleTimeString(),
                title: "Report Ingested",
                description: "EOC Copilot ingested this event dynamically into active registry."
              }
            ]
          });

          const sysFeedback: ChatMessage = {
            id: `sys-${Date.now()}`,
            sender: "System",
            text: `🔔 **System Action Successful**: Dynamic dispatch incident **${newId}** (${action.title}) created in the database and visible on EOC map!`,
            timestamp: new Date().toLocaleTimeString(),
            avatarColor: "bg-indigo-950 border-amber-500 text-amber-300"
          };
          if (activeTab === "copilot") {
            setCopilotMessages(prev => [...prev, sysFeedback]);
          } else if (activeTab === "citizen") {
            setCitizenMessages(prev => [...prev, sysFeedback]);
          } else {
            setMultiAgentMessages(prev => [...prev, sysFeedback]);
          }
        }
        break;

      case "UPDATE_INCIDENT_STATUS":
        if (onUpdateIncidentStatus && action.id && action.status) {
          onUpdateIncidentStatus(action.id, action.status);

          const sysFeedback: ChatMessage = {
            id: `sys-${Date.now()}`,
            sender: "System",
            text: `🔔 **System Action Successful**: Incident **${action.id}** status updated to **${action.status}**!`,
            timestamp: new Date().toLocaleTimeString(),
            avatarColor: "bg-indigo-950 border-amber-500 text-amber-300"
          };
          if (activeTab === "copilot") {
            setCopilotMessages(prev => [...prev, sysFeedback]);
          } else if (activeTab === "citizen") {
            setCitizenMessages(prev => [...prev, sysFeedback]);
          } else {
            setMultiAgentMessages(prev => [...prev, sysFeedback]);
          }
        }
        break;

      case "UPDATE_RESOURCE_STATUS":
        if (onUpdateResourceStatus && action.id && action.status) {
          onUpdateResourceStatus(action.id, action.status);

          const sysFeedback: ChatMessage = {
            id: `sys-${Date.now()}`,
            sender: "System",
            text: `🔔 **System Action Successful**: Resource **${action.id}** status updated to **${action.status}**!`,
            timestamp: new Date().toLocaleTimeString(),
            avatarColor: "bg-indigo-950 border-amber-500 text-amber-300"
          };
          if (activeTab === "copilot") {
            setCopilotMessages(prev => [...prev, sysFeedback]);
          } else if (activeTab === "citizen") {
            setCitizenMessages(prev => [...prev, sysFeedback]);
          } else {
            setMultiAgentMessages(prev => [...prev, sysFeedback]);
          }
        }
        break;

      case "UPDATE_WEATHER_ALERT":
        if (onUpdateWeatherAlert && action.region && action.alertLevel) {
          onUpdateWeatherAlert(action.region, action.alertLevel);

          const sysFeedback: ChatMessage = {
            id: `sys-${Date.now()}`,
            sender: "System",
            text: `🔔 **System Action Successful**: Regional alert for **${action.region}** updated to **${action.alertLevel}**!`,
            timestamp: new Date().toLocaleTimeString(),
            avatarColor: "bg-indigo-950 border-amber-500 text-amber-300"
          };
          if (activeTab === "copilot") {
            setCopilotMessages(prev => [...prev, sysFeedback]);
          } else if (activeTab === "citizen") {
            setCitizenMessages(prev => [...prev, sysFeedback]);
          } else {
            setMultiAgentMessages(prev => [...prev, sysFeedback]);
          }
        }
        break;

      default:
        console.warn("Unrecognized mutation action type:", action.type);
    }
  };

  // Handler: Main Chat Submit logic
  const handleMessageSubmit = async (textToSend: string) => {
    if (!textToSend.trim() || isProcessing) return;
    
    onAddAuditLog(
      `AI_CHAT_INQUIRY_${activeTab.toUpperCase()}`,
      `Operator submitted inquiry in ${activeTab} view: "${textToSend.slice(0, 35)}..."`,
      "SUCCESS"
    );

    const timestamp = new Date().toLocaleTimeString();
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "Operator",
      text: textToSend,
      timestamp,
      avatarColor: "bg-slate-800 border-slate-700 text-slate-300"
    };

    // 1. UPDATE SENDER MESSAGE
    if (activeTab === "copilot") {
      setCopilotMessages((prev) => [...prev, userMsg]);
    } else if (activeTab === "citizen") {
      setCitizenMessages((prev) => [...prev, userMsg]);
    } else {
      setMultiAgentMessages((prev) => [...prev, userMsg]);
    }

    setIsProcessing(true);

    // 2. DISPATCH CALL
    const aiResponseRaw = await runQuery(textToSend, activeTab);

    // Extract action if present
    let finalAiResponse = aiResponseRaw || "";
    let actionPayload: any = null;

    if (finalAiResponse.includes("[ACTION]")) {
      const actionParts = finalAiResponse.split("[ACTION]");
      finalAiResponse = actionParts[0].trim();
      try {
        actionPayload = JSON.parse(actionParts[1].trim());
      } catch (err) {
        console.warn("Could not parse action payload JSON from response:", actionParts[1]);
      }
    }

    // 3. PROCESS RESPONSE BASED ON TAB
    if (activeTab === "multi_agent") {
      // In multi-agent mode, the response is a JSON array of agent responses.
      let agentSequence = [];
      try {
        agentSequence = JSON.parse(finalAiResponse);
      } catch (e) {
        // Fallback procedural parsing if it returned plain text
        agentSequence = [
          { sender: "Commander", text: finalAiResponse || "Operational request registered." },
          { sender: "Weather", text: "Atmospheric readings stabilized. No microclimate constraints reported." },
          { sender: "Logistics", text: "Verifying staging coordinates. Route clearances look clean." },
          { sender: "Medical", text: "Emergency trauma responders alerted to coordinate safely." },
          { sender: "Communication", text: "Disseminated regional dispatcher update to field crews." }
        ];
      }

      // Stagger and display each agent's contribution sequentially
      for (const agent of agentSequence) {
        setActiveSpeaker(agent.sender);
        await new Promise((resolve) => setTimeout(resolve, Math.max(1200, simulationPacing)));

        const agentAvatar =
          agent.sender === "Commander"
            ? "bg-indigo-950 border-indigo-500 text-indigo-300"
            : agent.sender === "Weather"
            ? "bg-amber-950 border-amber-500 text-amber-400"
            : agent.sender === "Logistics"
            ? "bg-slate-900 border-slate-700 text-slate-300"
            : agent.sender === "Medical"
            ? "bg-red-950 border-red-500 text-red-400"
            : "bg-emerald-950 border-emerald-500 text-emerald-400";

        const replyMsg: ChatMessage = {
          id: `rep-${Date.now()}-${agent.sender}`,
          sender: agent.sender,
          text: agent.text,
          timestamp: new Date().toLocaleTimeString(),
          avatarColor: agentAvatar
        };

        setMultiAgentMessages((prev) => [...prev, replyMsg]);
      }
      setActiveSpeaker(null);
    } else if (activeTab === "copilot") {
      const replyMsg: ChatMessage = {
        id: `rep-${Date.now()}`,
        sender: "Copilot",
        text: finalAiResponse || "I was unable to analyze this operational parameter. Procedural ledger is stable.",
        timestamp: new Date().toLocaleTimeString(),
        avatarColor: "bg-indigo-950 border-indigo-500 text-indigo-300"
      };
      setCopilotMessages((prev) => [...prev, replyMsg]);
    } else {
      // Citizen Assistance tab
      const replyMsg: ChatMessage = {
        id: `rep-${Date.now()}`,
        sender: "Citizen",
        text: finalAiResponse || "Your citizen assistance query has been safely logged in the local EOC buffer.",
        timestamp: new Date().toLocaleTimeString(),
        avatarColor: "bg-emerald-950 border-emerald-500 text-emerald-300"
      };
      setCitizenMessages((prev) => [...prev, replyMsg]);
    }

    if (actionPayload) {
      executeCopilotAction(actionPayload);
    }

    setIsProcessing(false);
  };

  // Handler: Form submit wrapper
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    const prompt = inputText;
    setInputText("");
    handleMessageSubmit(prompt);
  };

  // Handler: Microphone vocal SOS simulator
  const handleVoiceSOSClick = () => {
    if (isListeningVoice || isProcessing) return;
    setIsListeningVoice(true);
    onAddAuditLog("VOICE_SOS_CAPTURE", "Operator initiated Vocal SOS Speech-to-Text simulation pipeline.", "SUCCESS");

    // Play visual feedback sound beep
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(520, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}

    setTimeout(() => {
      // Mock emergency vocal transcripts
      const distressTranscripts = [
        "Urgent! Heavy rising floods trapped three citizens inside Sector 12 basement. Need immediate rescue rafts.",
        "Smoke hazard reported near the Central Ridge crossing, fires are blowing close to the main power lines.",
        "Medical dispatch needed at St. Jude intersection! Two evacuees have minor injuries and need transport assistance."
      ];
      const speechOutput = distressTranscripts[Math.floor(Math.random() * distressTranscripts.length)];
      
      setIsListeningVoice(false);
      handleMessageSubmit(speechOutput);
    }, 3200);
  };

  const getAgentIcon = (sender: string) => {
    switch (sender) {
      case "Commander":
        return <Zap className="h-3.5 w-3.5 text-indigo-400 fill-current" />;
      case "Weather":
        return <CloudLightning className="h-3.5 w-3.5 text-amber-400" />;
      case "Medical":
        return <Ambulance className="h-3.5 w-3.5 text-red-400" />;
      case "Logistics":
        return <Truck className="h-3.5 w-3.5 text-slate-300" />;
      case "Communication":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
      case "Copilot":
        return <Sparkles className="h-3.5 w-3.5 text-indigo-400" />;
      case "Citizen":
        return <Users className="h-3.5 w-3.5 text-emerald-400" />;
      default:
        return <User className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  // Parser: simple markdown to React element structure (bold, list, paragraphs)
  const formatMessageText = (text: string) => {
    if (!text) return "";
    
    const lines = text.split("\n");
    return (
      <div className="space-y-1.5 leading-relaxed font-sans text-slate-300">
        {lines.map((line, idx) => {
          let trimmed = line.trim();
          
          if (trimmed.match(/^[-_*]{3,}$/) || trimmed.startsWith("____")) {
            return (
              <p key={idx} className="text-[11px] font-bold text-white">
                {parseInlineFormatting(line)}
              </p>
            );
          }

          // Bullet point line
          if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
            const cleanText = trimmed.substring(2);
            return (
              <li key={idx} className="ml-4 list-disc text-slate-300 mt-1">
                {parseInlineFormatting(cleanText)}
              </li>
            );
          }
          
          // Heading lines
          if (trimmed.startsWith("#### ") || trimmed.startsWith("### ") || trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
            return (
              <p key={idx} className="text-[11px] font-bold text-white">
                {parseInlineFormatting(line)}
              </p>
            );
          }

          if (trimmed === "") {
            return <div key={idx} className="h-1" />;
          }

          return (
            <p key={idx} className="text-[11px]">
              {parseInlineFormatting(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Replace formatting matches inside strings with customized nodes
  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*\*.*?\*\*\*|___.*?___|\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|____|##|\*\*\*)/g);
    return parts.map((part, i) => {
      if (part === "____" || part === "##" || part === "***") {
        return <strong key={i} className="font-bold text-white">{part}</strong>;
      }
      if ((part.startsWith("***") && part.endsWith("***")) || (part.startsWith("___") && part.endsWith("___"))) {
        return (
          <strong key={i} className="font-bold text-white italic">
            {part.slice(3, -3)}
          </strong>
        );
      }
      if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
        return (
          <em key={i} className="text-indigo-200 italic px-0.5">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  const currentMessages =
    activeTab === "copilot"
      ? copilotMessages
      : activeTab === "citizen"
      ? citizenMessages
      : multiAgentMessages;

  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-[520px]" id="collaborative-agent-chat-arena">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
        <div className="flex items-center space-x-1 bg-[#090d16] p-1 rounded-lg border border-slate-900">
          <button
            onClick={() => setActiveTab("copilot")}
            className={`px-3 py-1.5 rounded-md text-[10px] font-mono tracking-tight transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "copilot"
                ? "bg-indigo-950/80 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI Copilot</span>
          </button>
          
          <button
            onClick={() => setActiveTab("multi_agent")}
            className={`px-3 py-1.5 rounded-md text-[10px] font-mono tracking-tight transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "multi_agent"
                ? "bg-indigo-950/80 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Multi-Agent</span>
          </button>

          <button
            onClick={() => setActiveTab("citizen")}
            className={`px-3 py-1.5 rounded-md text-[10px] font-mono tracking-tight transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeTab === "citizen"
                ? "bg-indigo-950/80 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span>Citizen SOS</span>
          </button>
        </div>

        {/* API Connection Indicator Badge */}
        <div className="flex items-center space-x-1.5">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              apiConnected ? "bg-emerald-400" : "bg-amber-400"
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              apiConnected ? "bg-emerald-500" : "bg-amber-500"
            }`}></span>
          </span>
          <span className="text-[8px] font-mono text-slate-500">
            {apiConnected ? "Gemini-3.5 Active" : "EOC Fallback Mode"}
          </span>
        </div>
      </div>

      {/* Messages Feed Viewport */}
      <div className="flex-1 overflow-y-auto pr-1.5 space-y-3.5 custom-scrollbar mb-4 bg-slate-950/40 border border-slate-900 rounded-lg p-3 min-h-0">
        {currentMessages.map((msg) => {
          const isOperator = msg.sender === "Operator";
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isOperator ? "justify-end text-right" : "justify-start text-left"}`}
            >
              {!isOperator && (
                <div className={`h-6.5 w-6.5 rounded-md border flex items-center justify-center shrink-0 text-[10px] font-bold bg-[#111726]/80 ${
                  msg.sender === "Copilot" ? "border-indigo-500/30" : "border-slate-800"
                }`}>
                  {getAgentIcon(msg.sender)}
                </div>
              )}

              <div className={`max-w-[85%] leading-relaxed ${isOperator ? "text-right" : "text-left"}`}>
                <div className="flex items-center space-x-1.5 mb-1 justify-start">
                  <span className={`text-[9px] font-bold font-mono ${
                    isOperator ? "text-slate-400 ml-auto" : "text-indigo-400"
                  }`}>
                    {msg.sender === "Operator" ? "HQ Dispatch Operator" : `${msg.sender} Agent`}
                  </span>
                  <span className="text-[8px] text-slate-600 font-mono">{msg.timestamp}</span>
                </div>
                
                <div className={`p-3 rounded-lg border ${
                  isOperator
                    ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-100 rounded-tr-none text-left"
                    : "bg-[#111726]/85 border-slate-800/80 rounded-tl-none text-slate-300"
                }`}>
                  {formatMessageText(msg.text)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Dynamic Waveform for Simulated Listening */}
        {isListeningVoice && (
          <div className="flex flex-col items-center justify-center space-y-2.5 py-4 bg-indigo-950/10 border border-indigo-500/10 rounded-lg animate-pulse">
            <div className="flex items-center space-x-1 justify-center">
              {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
                <span
                  key={idx}
                  className="bg-rose-500 w-1 rounded-full animate-bounce"
                  style={{
                    height: `${Math.floor(Math.random() * 24 + 8)}px`,
                    animationDelay: `${idx * 0.12}s`,
                    animationDuration: "0.8s"
                  }}
                />
              ))}
            </div>
            <p className="text-[9px] font-mono text-rose-400 tracking-wider uppercase animate-pulse">
              [Vocal SOS Capturing]: Speak into terminal...
            </p>
          </div>
        )}

        {/* Active Typing Indicator */}
        {activeSpeaker && (
          <div className="flex items-center space-x-2.5 text-left">
            <div className="h-6.5 w-6.5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-500" />
            </div>
            <div className="bg-[#111726]/40 border border-slate-900/60 p-2.5 rounded-lg rounded-tl-none text-[9px] font-mono text-indigo-400 animate-pulse">
              [{activeSpeaker} Agent] is thinking and formulating response...
            </div>
          </div>
        )}

        {/* Generic Loader */}
        {!activeSpeaker && isProcessing && !isListeningVoice && (
          <div className="flex items-center space-x-2.5 text-left">
            <div className="h-6.5 w-6.5 rounded-md bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-500" />
            </div>
            <div className="bg-[#111726]/40 border border-slate-900/60 p-2.5 rounded-lg rounded-tl-none text-[9px] font-mono text-slate-400 animate-pulse">
              Evaluating intelligence ledger. Syncing database context...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested Quick Presets */}
      {!isProcessing && !isListeningVoice && (
        <div className="mb-3 space-y-1 shrink-0">
          <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wide">
            {activeTab === "copilot"
              ? "HQ System Queries:"
              : activeTab === "citizen"
              ? "Citizen Safety Assistance Shortcuts:"
              : "Tactical Response Scenarios:"}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS[activeTab].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleMessageSubmit(preset)}
                className="px-2 py-1 bg-[#111726] hover:bg-indigo-950/40 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/20 rounded text-[9px] font-mono text-slate-400 text-left transition-all cursor-pointer truncate max-w-[320px]"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input controls block */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 border-t border-slate-800/80 pt-3 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isProcessing || isListeningVoice}
          placeholder={
            isListeningVoice
              ? "Capturing vocal SOS coordinates..."
              : isProcessing
              ? "AI is coordinating operations, please wait..."
              : activeTab === "copilot"
              ? "Query incidents, shelter capacities, or ask for briefs..."
              : activeTab === "citizen"
              ? "Report disaster location, request paths, or ask tips..."
              : "Describe situational coordinates to watch agents debate..."
          }
          className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-50"
        />
        
        {/* Vocal SOS Microphone Simulator (available for Citizen SOS) */}
        {activeTab === "citizen" && (
          <button
            type="button"
            onClick={handleVoiceSOSClick}
            disabled={isProcessing || isListeningVoice}
            title="Simulate Speech-to-Text SOS distress signal"
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              isListeningVoice
                ? "bg-rose-950/40 text-rose-400 border-rose-500/40 animate-pulse"
                : "bg-rose-950/20 hover:bg-rose-950/50 text-rose-400 border-rose-950/50 hover:border-rose-800/50"
            }`}
          >
            <Mic className="h-4 w-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={isProcessing || isListeningVoice || !inputText.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 border border-indigo-400/20 text-white rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
