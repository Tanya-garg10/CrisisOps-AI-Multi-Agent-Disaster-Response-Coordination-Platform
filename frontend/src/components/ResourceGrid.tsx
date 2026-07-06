/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EmergencyResource, Incident } from "../types";
import { Shield, Ambulance, Home, Construction, Plane, AlertCircle, Plus, Check } from "lucide-react";

interface ResourceGridProps {
  resources: EmergencyResource[];
  selectedIncident: Incident | null;
  onAllocateResource: (resourceId: string, quantity: number) => void;
  isSimulating: boolean;
}

export default function ResourceGrid({
  resources,
  selectedIncident,
  onAllocateResource,
  isSimulating
}: ResourceGridProps) {
  
  const getResourceIcon = (type: EmergencyResource["type"]) => {
    switch (type) {
      case "RESCUE_TEAM":
        return <Shield className="h-4.5 w-4.5 text-blue-400" />;
      case "AMBULANCE":
        return <Ambulance className="h-4.5 w-4.5 text-red-400" />;
      case "SHELTER":
        return <Home className="h-4.5 w-4.5 text-emerald-400" />;
      case "HEAVY_EQUIPMENT":
        return <Construction className="h-4.5 w-4.5 text-amber-400" />;
      case "HELICOPTER":
        return <Plane className="h-4.5 w-4.5 text-cyan-400" />;
    }
  };

  const getStatusColor = (status: EmergencyResource["status"]) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-emerald-950/40 border-emerald-500/30 text-emerald-400";
      case "DISPATCHED":
        return "bg-amber-950/30 border-amber-500/30 text-amber-400";
      case "FULL":
        return "bg-rose-950/40 border-rose-500/30 text-rose-400";
      default:
        return "bg-slate-900 border-slate-800 text-slate-500";
    }
  };

  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full" id="logistics-resource-grid">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
        <div>
          <h2 className="text-sm font-bold text-slate-100 tracking-wide">
            Emergency Supply & Logistics Grid
          </h2>
          <p className="text-[10px] text-slate-400 font-mono">
            Active Units: {resources.length} | Real-Time Fleet Telemetry
          </p>
        </div>

        {selectedIncident && (
          <div className="bg-rose-950/40 border border-rose-800/40 rounded px-2.5 py-1 text-[10px] text-rose-300 font-mono">
            DEPLOY MODE: <span className="font-bold">{selectedIncident.id}</span>
          </div>
        )}
      </div>

      {/* Selected Incident Recommendation HUD */}
      {selectedIncident && selectedIncident.aiRecommendations && (
        <div className="bg-[#111726]/80 border border-indigo-500/20 p-3 rounded-lg mb-4 space-y-1.5">
          <div className="flex items-center space-x-1.5 text-indigo-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider">AI RECOMMENDATIONS FOR {selectedIncident.id}</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed italic">
            &ldquo;{selectedIncident.aiRecommendations.primaryResponse}&rdquo;
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Required:</span>
            {selectedIncident.aiRecommendations.requiredResources.map((req, i) => (
              <span key={i} className="text-[9px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                {req.type.replace("_", " ")} ({req.quantity})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 flex-1 overflow-y-auto max-h-[300px] lg:max-h-[none] custom-scrollbar">
        {resources.map((res) => {
          const statusStyle = getStatusColor(res.status);
          const isFull = res.status === "FULL";
          const capacityPercent = Math.min((res.capacity.current / res.capacity.max) * 100, 100);

          // Check if this resource is already dispatched to the selected incident
          const isCurrentlyAllocated = selectedIncident?.allocatedResources.some(
            (allocated) => allocated.resourceId === res.id
          );

          return (
            <div
              key={res.id}
              className={`p-3.5 rounded-lg border bg-[#111726]/60 hover:bg-[#141b2e] flex flex-col justify-between transition-all group ${
                isCurrentlyAllocated ? "ring-1 ring-emerald-500/40 border-emerald-500/30" : "border-slate-800"
              }`}
            >
              <div>
                {/* Header card info */}
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 bg-[#0b0f19] border border-slate-800 rounded-md">
                    {getResourceIcon(res.type)}
                  </div>
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${statusStyle}`}>
                    {res.status}
                  </span>
                </div>

                {/* Name */}
                <h4 className="text-[11px] font-bold text-slate-100 tracking-tight group-hover:text-white truncate">
                  {res.name}
                </h4>
                <p className="text-[9px] text-slate-400 truncate mb-2">
                  Station: {res.location.station}
                </p>

                {/* Capacity Progress Bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[8px] font-mono text-slate-500">
                    <span>CAPACITY</span>
                    <span className="font-bold text-slate-300">
                      {res.capacity.current}/{res.capacity.max} {res.capacity.unit.split(" ")[0]}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#0b0f19] rounded overflow-hidden">
                    <div
                      className={`h-full rounded transition-all duration-500 ${
                        isFull ? "bg-rose-500" : res.type === "RESCUE_TEAM" ? "bg-blue-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Dispatch Action */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between mt-auto">
                <span className="text-[8px] text-slate-500 font-mono truncate" title={res.contact}>
                  {res.contact.split(" ")[0]}
                </span>

                {selectedIncident ? (
                  isCurrentlyAllocated ? (
                    <span className="text-[9px] font-mono text-emerald-400 font-bold flex items-center space-x-0.5">
                      <Check className="h-3 w-3 stroke-[3]" />
                      <span>DISPATCHED</span>
                    </span>
                  ) : res.status === "AVAILABLE" ? (
                    <button
                      onClick={() => onAllocateResource(res.id, 1)}
                      className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/30 text-[9px] text-white font-mono font-semibold flex items-center space-x-0.5 cursor-pointer"
                    >
                      <Plus className="h-2.5 w-2.5 stroke-[3]" />
                      <span>ALLOCATE</span>
                    </button>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-600">UNAVAILABLE</span>
                  )
                ) : (
                  <span className="text-[9px] font-mono text-slate-500">Ready</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
