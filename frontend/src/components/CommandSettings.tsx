/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppSettings } from "../types";
import {
  Settings,
  Languages,
  Cpu,
  Volume2,
  VolumeX,
  Gauge,
  Database,
  CheckCircle,
  XCircle,
  HelpCircle,
  Wifi,
  Server
} from "lucide-react";

interface CommandSettingsProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onAddAuditLog: (action: string, details: string, status: "SUCCESS" | "DENIED" | "FAILURE") => void;
}

export default function CommandSettings({
  settings,
  onUpdateSettings,
  onAddAuditLog
}: CommandSettingsProps) {
  
  const handleLanguageChange = (lang: AppSettings["language"]) => {
    const updated = { ...settings, language: lang };
    onUpdateSettings(updated);
    onAddAuditLog("CONFIG_LANGUAGE_CHANGED", `System language updated to [${lang.toUpperCase()}].`, "SUCCESS");
  };

  const handleModelChange = (model: AppSettings["geminiModel"]) => {
    const updated = { ...settings, geminiModel: model };
    onUpdateSettings(updated);
    onAddAuditLog("AI_MODEL_CHANGED", `Cognitive backend shifted to [${model}].`, "SUCCESS");
  };

  const handleMcpToggle = (key: keyof AppSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    onUpdateSettings(updated);
    onAddAuditLog(
      "MCP_TUNNEL_TOGGLED",
      `Model Context Protocol service [${String(key)}] state toggled to: ${!settings[key]}`,
      "SUCCESS"
    );
  };

  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-6 shadow-xl space-y-6" id="eoc-command-settings">
      {/* Header */}
      <div className="flex items-center space-x-2.5 border-b border-slate-800 pb-4">
        <div className="p-2 bg-emerald-950/60 border border-emerald-500/30 rounded-lg">
          <Settings className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-100 tracking-wide font-sans">
            CrisisOps AI - EOC Systems Configurations
          </h2>
          <p className="text-[10px] text-slate-400 font-mono">
            Adjust cognitive backends, localization models, security thresholds, and tool connections.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Language & Cognitive Model Selection */}
        <div className="space-y-5">
          {/* Multilingual Support */}
          <div className="space-y-2 bg-[#111726]/60 border border-slate-800/80 p-4 rounded-lg">
            <label className="text-xs font-bold text-slate-300 font-mono flex items-center space-x-1.5">
              <Languages className="h-4 w-4 text-indigo-400" />
              <span>MULTILINGUAL EOC LOCALIZATION</span>
            </label>
            <p className="text-[10px] text-slate-500 leading-normal">
              Toggle complete system translations. Supports core telemetry readings and mission dossiers.
            </p>
            
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { code: "en", label: "English" },
                { code: "hi", label: "हिन्दी (Hindi)" },
                { code: "bn", label: "বাংলা (Bengali)" },
                { code: "ta", label: "தமிழ் (Tamil)" },
                { code: "te", label: "తెలుగు (Telugu)" },
                { code: "mr", label: "मराठी (Marathi)" }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code as any)}
                  className={`px-2 py-1.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                    settings.language === lang.code
                      ? "bg-indigo-950/50 border-indigo-500 text-indigo-300 font-bold"
                      : "bg-[#0b0f19]/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Cognitive Model Selection */}
          <div className="space-y-2 bg-[#111726]/60 border border-slate-800/80 p-4 rounded-lg">
            <label className="text-xs font-bold text-slate-300 font-mono flex items-center space-x-1.5">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span>COGNITIVE BRAIN MODEL</span>
            </label>
            <p className="text-[10px] text-slate-500 leading-normal">
              Select the Gemini generative node utilized during disaster scenario mapping, route layouts, and report synthesis.
            </p>
            
            <div className="space-y-2 pt-2">
              {[
                { code: "gemini-3.5-flash", desc: "Gemini 3.5 Flash (Ultra-low latency tactical responses)", speed: "Fastest" },
                { code: "gemini-2.5-flash", desc: "Gemini 2.5 Flash (Standard situational assessments)", speed: "Standard" },
                { code: "gemini-2.5-pro", desc: "Gemini 2.5 Pro (Extreme-depth multi-agent logic chains)", speed: "Deepest Reasoner" }
              ].map((model) => (
                <div
                  key={model.code}
                  onClick={() => handleModelChange(model.code as any)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    settings.geminiModel === model.code
                      ? "bg-cyan-950/15 border-cyan-500/60"
                      : "bg-[#0b0f19]/40 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-slate-200">{model.code.toUpperCase()}</div>
                    <div className="text-[9px] text-slate-400">{model.desc}</div>
                  </div>
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold ${
                    settings.geminiModel === model.code ? "bg-cyan-950 text-cyan-400 border border-cyan-800/40" : "bg-slate-900 text-slate-500"
                  }`}>
                    {model.speed}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: MCP Tool Connectors & Advanced Preferences */}
        <div className="space-y-5">
          {/* Model Context Protocol (MCP) integrations */}
          <div className="space-y-2 bg-[#111726]/60 border border-slate-800/80 p-4 rounded-lg">
            <label className="text-xs font-bold text-slate-300 font-mono flex items-center space-x-1.5">
              <Database className="h-4 w-4 text-emerald-400" />
              <span>MODEL CONTEXT PROTOCOL (MCP) INTERFACES</span>
            </label>
            <p className="text-[10px] text-slate-500 leading-normal">
              Enable secure host API conduits that autonomous agents invoke to pull live context or commit records during thinking loops.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { key: "enableMcpWeather", label: "Meteorological MCP", desc: "Live Weather Radar alerts", active: settings.enableMcpWeather },
                { key: "enableMcpMaps", label: "Google Maps MCP", desc: "Dynamic route and traffic calculations", active: settings.enableMcpMaps },
                { key: "enableMcpFiles", label: "Filesystem MCP", desc: "Workspace incident document archival", active: settings.enableMcpFiles },
                { key: "enableMcpCalendar", label: "Google Calendar MCP", desc: "Responder rota & dispatch schedulers", active: settings.enableMcpCalendar }
              ].map((mcp) => (
                <div
                  key={mcp.key}
                  onClick={() => handleMcpToggle(mcp.key as any)}
                  className={`p-2.5 rounded border text-left cursor-pointer transition-all flex items-start space-x-2.5 ${
                    mcp.active
                      ? "bg-emerald-950/10 border-emerald-500/40 text-emerald-300"
                      : "bg-[#0b0f19]/40 border-slate-800 text-slate-500 hover:border-slate-700"
                  }`}
                >
                  <Server className={`h-4 w-4 shrink-0 mt-0.5 ${mcp.active ? "text-emerald-400" : "text-slate-600"}`} />
                  <div className="leading-tight">
                    <div className="text-[10px] font-bold text-slate-200">{mcp.label}</div>
                    <div className="text-[8px] text-slate-400 mt-0.5">{mcp.desc}</div>
                    <div className="flex items-center space-x-1 mt-1.5">
                      {mcp.active ? (
                        <>
                          <CheckCircle className="h-2.5 w-2.5 text-emerald-400" />
                          <span className="text-[8px] font-mono text-emerald-400">TUNNEL OPENED</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-2.5 w-2.5 text-slate-500" />
                          <span className="text-[8px] font-mono text-slate-500">OFFLINE / BYPASS</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Tuning Parameters */}
          <div className="space-y-4 bg-[#111726]/60 border border-slate-800/80 p-4 rounded-lg">
            <label className="text-xs font-bold text-slate-300 font-mono flex items-center space-x-1.5">
              <Gauge className="h-4 w-4 text-amber-400" />
              <span>ORCHESTRATION PACING & SOUND LEVEL</span>
            </label>
            
            {/* Pacing Speed */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>MULTI-AGENT REVOLVING CYCLE DELAY</span>
                <span className="text-amber-400 font-bold">{settings.simulationPacing} ms</span>
              </div>
              <input
                type="range"
                min="500"
                max="3000"
                step="250"
                value={settings.simulationPacing}
                onChange={(e) => onUpdateSettings({ ...settings, simulationPacing: Number(e.target.value) })}
                className="w-full h-1 bg-slate-900 border border-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[8px] text-slate-500 font-mono">
                Speed of staggered thinking displays when running autonomous planning runs.
              </p>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-300 font-mono block">EOC SIREN AUDIO SYSTEM</span>
                <p className="text-[8px] text-slate-500">Play simulated emergency auditory sweeps when critical alerts trigger.</p>
              </div>
              
              <button
                onClick={() => {
                  const updated = { ...settings, alertSoundEnabled: !settings.alertSoundEnabled };
                  onUpdateSettings(updated);
                  onAddAuditLog("ALERT_SOUNDS_TOGGLED", `Siren speaker systems set to: ${!settings.alertSoundEnabled}`, "SUCCESS");
                }}
                className={`p-2 rounded border transition-all cursor-pointer ${
                  settings.alertSoundEnabled
                    ? "bg-amber-950/20 border-amber-500/50 text-amber-400"
                    : "bg-slate-900 border-slate-800 text-slate-500"
                }`}
              >
                {settings.alertSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
