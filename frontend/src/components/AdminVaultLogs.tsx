/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { AuditLog, UserSession } from "../types";
import { KeyRound, ShieldCheck, ShieldAlert, FileCode2, History, Check, AlertTriangle, Fingerprint } from "lucide-react";

interface AdminVaultLogsProps {
  currentSession: UserSession;
  onUpdateSession: (session: UserSession) => void;
  auditLogs: AuditLog[];
  onAddAuditLog: (action: string, details: string, status: "SUCCESS" | "DENIED" | "FAILURE") => void;
}

export default function AdminVaultLogs({
  currentSession,
  onUpdateSession,
  auditLogs,
  onAddAuditLog
}: AdminVaultLogsProps) {
  const [selectedRole, setSelectedRole] = useState<UserSession["role"]>(currentSession.role);

  const handleRoleChange = (role: UserSession["role"]) => {
    setSelectedRole(role);
    let name = "Taniya Garg (HQ)";
    if (role === "DISPATCHER") name = "Sector Dispatcher Blue";
    else if (role === "FIELD_RESPONDER") name = "Cascadia Field Responder 4";

    const updated = {
      email: currentSession.email,
      role: role,
      name: name
    };
    onUpdateSession(updated);

    // Write audit log trail for auth change
    onAddAuditLog(
      "AUTH_ROLE_ELEVATION",
      `Session security clearance downgraded/modified to ${role}.`,
      "SUCCESS"
    );
  };

  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-5 shadow-xl space-y-6" id="admin-security-vault">
      {/* Panel Header */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <div className="p-1.5 bg-indigo-950/40 border border-indigo-500/30 rounded-lg">
          <KeyRound className="h-4.5 w-4.5 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-100 tracking-wide">
            Security Vault, RBAC & Audit Ledger
          </h2>
          <p className="text-[10px] text-slate-400 font-mono">
            Platform Security Protocols | Secure Key Vault | JWT State Simulation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column: RBAC & Authentication */}
        <div className="bg-[#111726]/40 border border-slate-800 rounded-lg p-4 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center space-x-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>RBAC Identity Simulator</span>
          </h3>

          <div className="space-y-3">
            <div className="p-2.5 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] text-slate-400 space-y-1">
              <div>ACTIVE JWT USER: <span className="text-slate-200 font-semibold">{currentSession.email}</span></div>
              <div>CLEARANCE: <span className="text-rose-400 font-bold">{currentSession.role}</span></div>
              <div>OPERATOR: <span className="text-slate-200">{currentSession.name}</span></div>
            </div>

            <label className="block text-[10px] font-mono font-bold text-slate-400">
              CHANGE SECURITY SCHEME / ROLE:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { role: "COMMANDER", desc: "Full Operational Authority" },
                { role: "DISPATCHER", desc: "Logistics and Alert Clearance" },
                { role: "FIELD_RESPONDER", desc: "Read-only Tactical HUD Map" }
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleRoleChange(item.role as UserSession["role"])}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedRole === item.role
                      ? "bg-indigo-950/40 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/30"
                      : "bg-[#0b0f19] border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="text-[11px] font-bold tracking-tight">{item.role}</div>
                    <div className="text-[9px] text-slate-500">{item.desc}</div>
                  </div>
                  {selectedRole === item.role && <Check className="h-4.5 w-4.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Column: API Key Vault & Rate Limiting */}
        <div className="bg-[#111726]/40 border border-slate-800 rounded-lg p-4 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center space-x-1.5">
            <FileCode2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Secure Credentials Vault</span>
          </h3>

          <div className="space-y-3.5 font-mono text-[10px] text-slate-400">
            {/* Secrets Manager status */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Google Cloud Secret Manager</span>
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span>GEMINI_API_KEY</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  <span>LOADED_EOC</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span>APP_URL</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  <span>VERIFIED</span>
                </span>
              </div>
            </div>

            {/* Rate limiting stats */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Input rate limit & validation</span>
              <div className="p-2 bg-[#0b0f19] border border-slate-800 rounded space-y-1">
                <div className="flex justify-between">
                  <span>LIMIT BUCKET:</span>
                  <span className="text-slate-300">60 API RPM</span>
                </div>
                <div className="flex justify-between">
                  <span>TOKEN LEAK VALUE:</span>
                  <span className="text-cyan-400">100% AVAILABLE</span>
                </div>
                <div className="flex justify-between">
                  <span>WAF CORS:</span>
                  <span className="text-emerald-400 font-bold">STRICT_ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Shield disclaimer */}
            <div className="p-2 bg-rose-950/20 border border-rose-500/20 rounded flex items-start space-x-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[9px] text-rose-300 leading-normal">
                Strict CORS verification rules in force. Unauthorized actions trigger alert communication notifications to secondary responders.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Scrolling Audit logs */}
        <div className="bg-[#111726]/40 border border-slate-800 rounded-lg p-4 space-y-3 flex flex-col h-full max-h-[280px]">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center space-x-1.5">
            <History className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>Live Security Audit Ledger</span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar text-[10px] font-mono">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-2 bg-slate-950 rounded border border-slate-900 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400 font-bold">{log.action}</span>
                  <span className={`px-1 rounded text-[8px] font-bold ${
                    log.status === "SUCCESS"
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-950/40 text-red-400 border border-red-500/20"
                  }`}>
                    {log.status}
                  </span>
                </div>
                <div className="text-slate-300">{log.details}</div>
                <div className="flex justify-between text-[8px] text-slate-500">
                  <span>{log.userEmail.split("@")[0]} ({log.role})</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
