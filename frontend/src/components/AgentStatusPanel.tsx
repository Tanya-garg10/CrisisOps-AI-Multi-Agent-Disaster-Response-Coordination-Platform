/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { AgentConfig, AgentStatus } from "../types";
import { Cpu, Terminal, Sparkles, Send, RefreshCw, Zap, CheckCircle, AlertTriangle } from "lucide-react";

interface AgentStatusPanelProps {
  agents: AgentConfig[];
  logs: { id: string; timestamp: string; from: string; message: string; type?: string }[];
  isSimulating: boolean;
  onTriggerSimulation: () => void;
}

export default function AgentStatusPanel({
  agents,
  logs,
  isSimulating,
  onTriggerSimulation
}: AgentStatusPanelProps) {
  
  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.THINKING:
        return {
          bg: "bg-amber-950/40 border-amber-500/50 text-amber-400",
          ping: "bg-amber-400",
          text: "Thinking..."
        };
      case AgentStatus.EXECUTING:
        return {
          bg: "bg-emerald-950/40 border-emerald-500/50 text-emerald-400",
          ping: "bg-emerald-400",
          text: "Executing..."
        };
      case AgentStatus.COMPLETED:
        return {
          bg: "bg-blue-950/30 border-blue-500/30 text-blue-400",
          ping: "bg-blue-400",
          text: "Completed"
        };
      case AgentStatus.ERROR:
        return {
          bg: "bg-red-950/40 border-red-500/50 text-red-400",
          ping: "bg-red-400",
          text: "Alert Error"
        };
      default:
        return {
          bg: "bg-slate-900/60 border-slate-800 text-slate-500",
          ping: "bg-slate-600",
          text: "Standby"
        };
    }
  };

  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full" id="agent-orchestration-console">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-950/60 border border-indigo-500/30 rounded-lg">
            <Cpu className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-wide font-sans">
              Autonomous Agent Orchestration Mesh
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              Status: 7 Active Co-Agents | Google ADK Connected
            </p>
          </div>
        </div>

        {/* Trigger Simulation Button */}
        <button
          onClick={onTriggerSimulation}
          disabled={isSimulating}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all font-semibold ${
            isSimulating
              ? "bg-indigo-950/20 border-indigo-800/50 text-indigo-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/30 shadow-indigo-900/20 shadow-md"
          }`}
        >
          {isSimulating ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Mesh Resolving...</span>
            </>
          ) : (
            <>
              <Zap className="h-3.5 w-3.5 fill-current text-amber-300" />
              <span>Simulate Agent Flow</span>
            </>
          )}
        </button>
      </div>

      {/* Multi-Agent Directed Acyclic Graph (Visual Flow chart) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
        {agents.map((agent, index) => {
          const statusStyle = getStatusColor(agent.status);
          const isCommander = agent.id === "commander";

          return (
            <div
              key={agent.id}
              className={`p-3 rounded-lg border flex flex-col justify-between transition-all relative ${
                statusStyle.bg
              } ${isCommander ? "ring-1 ring-indigo-500/30" : ""}`}
            >
              {/* Connector lines visual */}
              {index < agents.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 border-t border-slate-700/50 z-0 pointer-events-none" />
              )}

              <div className="z-10">
                {/* Agent Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    AG-{String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="relative flex h-2 w-2">
                    {agent.status !== AgentStatus.IDLE && (
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusStyle.ping}`} />
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${statusStyle.ping}`} />
                  </div>
                </div>

                {/* Agent Name */}
                <h4 className="text-[11px] font-bold text-slate-100 truncate tracking-tight">
                  {agent.name.split(" ")[0]}
                </h4>
                <p className="text-[9px] text-slate-400 truncate mb-1">
                  {agent.role}
                </p>
              </div>

              {/* Task or Status */}
              <div className="mt-2 pt-1.5 border-t border-slate-800/40 text-[9px] font-mono text-slate-300">
                {agent.status === AgentStatus.IDLE ? (
                  <span className="text-slate-500">Standby</span>
                ) : (
                  <span className="truncate block font-semibold" title={agent.currentTask}>
                    {agent.currentTask}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Agent Communication Log Terminal */}
      <div className="flex-1 flex flex-col border border-slate-800 rounded-lg bg-slate-950/90 overflow-hidden font-mono text-xs">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px]">
          <div className="flex items-center space-x-1.5">
            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-bold tracking-wider uppercase">Agent Communication bus</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-[9px]">BUFFER STABLE</span>
          </div>
        </div>

        {/* Console logs view */}
        <div className="flex-1 p-3 overflow-y-auto max-h-[160px] lg:max-h-[200px] space-y-2 select-text custom-scrollbar">
          {logs.map((log) => {
            let logTypeIcon = <Sparkles className="h-3 w-3 text-cyan-400 shrink-0" />;
            let textColor = "text-slate-300";

            if (log.from === "Commander Agent") {
              logTypeIcon = <Zap className="h-3 w-3 text-indigo-400 shrink-0" />;
              textColor = "text-indigo-200 font-semibold";
            } else if (log.from === "Communication Agent") {
              logTypeIcon = <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />;
              textColor = "text-emerald-300";
            } else if (log.type === "error" || log.message.includes("CRITICAL")) {
              logTypeIcon = <AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />;
              textColor = "text-red-300 font-bold";
            }

            return (
              <div key={log.id} className="flex items-start space-x-2 border-b border-slate-900 pb-1.5">
                <span className="text-[9px] text-slate-500 shrink-0 mt-0.5">
                  {log.timestamp}
                </span>
                {logTypeIcon}
                <div className="flex-1 leading-normal">
                  <span className="text-[10px] font-bold text-slate-400 mr-1.5">
                    [{log.from}]:
                  </span>
                  <span className={`text-[11px] font-mono ${textColor}`}>
                    {log.message}
                  </span>
                </div>
              </div>
            );
          })}

          {logs.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 py-6 text-center">
              <Sparkles className="h-6 w-6 mb-2 text-slate-800 animate-pulse" />
              <p className="text-[10px]">No multi-agent simulations run in this EOC session.</p>
              <p className="text-[9px] mt-0.5">Click "Simulate Agent Flow" to watch the agents resolve the emergency.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
