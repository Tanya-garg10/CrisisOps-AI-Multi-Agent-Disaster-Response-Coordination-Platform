/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Incident, EmergencyResource, DisasterType } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, PieChart, Pie, Cell } from "recharts";
import { BarChart3, TrendingUp, ShieldAlert, Users, Percent } from "lucide-react";

interface AnalyticsPanelProps {
  incidents: Incident[];
  resources: EmergencyResource[];
}

export default function AnalyticsPanel({ incidents, resources }: AnalyticsPanelProps) {
  
  // Aggregate data for Disaster Breakdown
  const typeCount = incidents.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const breakdownData = Object.values(DisasterType).map((t) => ({
    name: t.replace("Severe ", "").replace("Flash ", ""),
    count: typeCount[t] || 0
  }));

  // Aggregate severity distribution
  const severityCount = incidents.reduce((acc, curr) => {
    acc[curr.severity] = (acc[curr.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const severityData = [
    { name: "CRITICAL", value: severityCount["CRITICAL"] || 0, color: "#f43f5e" },
    { name: "HIGH", value: severityCount["HIGH"] || 0, color: "#f97316" },
    { name: "MEDIUM", value: severityCount["MEDIUM"] || 0, color: "#eab308" },
    { name: "LOW", value: severityCount["LOW"] || 0, color: "#10b981" }
  ].filter((item) => item.value > 0);

  // Compute resource utilization metrics
  const dispatchedCount = resources.filter((r) => r.status === "DISPATCHED" || r.status === "FULL").length;
  const totalResources = resources.length;
  const dispatchRate = totalResources > 0 ? Math.round((dispatchedCount / totalResources) * 100) : 0;

  // Shelter Occupancy metrics
  const shelters = resources.filter((r) => r.type === "SHELTER");
  const shelterCapacity = shelters.reduce((acc, curr) => {
    acc.occupied += curr.capacity.current;
    acc.max += curr.capacity.max;
    return acc;
  }, { occupied: 0, max: 0 });

  const shelterPercent = shelterCapacity.max > 0 ? Math.round((shelterCapacity.occupied / shelterCapacity.max) * 100) : 0;

  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-5 shadow-xl space-y-6" id="ops-command-analytics">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Incidents */}
        <div className="bg-[#111726]/60 border border-slate-800 p-3.5 rounded-lg">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-1">
            <span>TOTAL DISASTERS LOGGED</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {incidents.length}
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
            Active: {incidents.filter((i) => i.status !== "RESOLVED").length} | Resolved: {incidents.filter((i) => i.status === "RESOLVED").length}
          </div>
        </div>

        {/* Resource Dispatch Rate */}
        <div className="bg-[#111726]/60 border border-slate-800 p-3.5 rounded-lg">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-1">
            <span>RESOURCE DISPATCH RATE</span>
            <Percent className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {dispatchRate}%
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
            Units Out: {dispatchedCount} of {totalResources} Total
          </div>
        </div>

        {/* Victims Impacted */}
        <div className="bg-[#111726]/60 border border-slate-800 p-3.5 rounded-lg">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-1">
            <span>TOTAL VICTIMS AT RISK</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {incidents.reduce((sum, inc) => sum + inc.victimsCount, 0)}
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
            Medical airlifts active: 1
          </div>
        </div>

        {/* Shelter Bed Occupancy */}
        <div className="bg-[#111726]/60 border border-slate-800 p-3.5 rounded-lg">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-1">
            <span>CIVIL BED OCCUPANCY</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {shelterPercent}%
          </div>
          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
            Beds filled: {shelterCapacity.occupied} / {shelterCapacity.max}
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Disaster Categories count */}
        <div className="bg-[#111726]/40 border border-slate-800 rounded-lg p-4 lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 font-mono flex items-center space-x-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Disaster Vector Breakdown</span>
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdownData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.1)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} fontClassName="font-mono" />
                <YAxis stroke="#64748b" fontSize={9} fontClassName="font-mono" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #334155", borderRadius: "6px" }}
                  labelStyle={{ fontSize: "10px", color: "#94a3b8", fontFamily: "monospace" }}
                  itemStyle={{ fontSize: "11px", color: "#f8fafc" }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {breakdownData.map((entry, index) => {
                    let color = "#3b82f6";
                    if (entry.name === "Fire") color = "#f97316";
                    else if (entry.name === "Flood") color = "#06b6d4";
                    else if (entry.name === "Hazmat Leak") color = "#10b981";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Density Pie Chart */}
        <div className="bg-[#111726]/40 border border-slate-800 rounded-lg p-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 font-mono flex items-center space-x-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            <span>Crisis Urgency distribution</span>
          </h3>
          <div className="h-56 flex flex-col justify-between">
            {severityData.length > 0 ? (
              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0b0f19", border: "1px solid #334155", borderRadius: "6px" }}
                      itemStyle={{ fontSize: "10px", color: "#f8fafc" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[8px] font-mono text-slate-500 font-bold uppercase">Active Risks</span>
                  <span className="text-lg font-bold text-slate-100 font-mono">
                    {incidents.filter((i) => i.status !== "RESOLVED").length}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-[10px] text-slate-500 italic">
                No active threats logged.
              </div>
            )}
            
            {/* Custom Pie Legend */}
            <div className="flex justify-center space-x-4 text-[9px] font-mono text-slate-400 border-t border-slate-800/60 pt-2">
              {severityData.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
