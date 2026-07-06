/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Incident, EmergencyResource, DisasterType } from "../types";
import { Crosshair, MapPin, Radio, Shield, HelpCircle, Layers, Wind, Droplets, Flame } from "lucide-react";

interface CommandCenterMapProps {
  incidents: Incident[];
  resources: EmergencyResource[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onGridClick: (lat: number, lng: number, address: string) => void;
}

export default function CommandCenterMap({
  incidents,
  resources,
  selectedIncident,
  onSelectIncident,
  onGridClick
}: CommandCenterMapProps) {
  const [hoveredNode, setHoveredNode] = useState<{
    name: string;
    type: string;
    details: string;
    x: number;
    y: number;
  } | null>(null);

  const [activeLayers, setActiveLayers] = useState({
    radar: true,
    corridors: false,
    stations: true,
    grid: true
  });

  const [cursorCoord, setCursorCoord] = useState({ x: 0, y: 0, lat: 45.5000, lng: -122.6000 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Map coordinate conversion functions
  // Custom bounding box for Cascadia Sector: Lat: 45.3800 to 45.6200, Lng: -122.8000 to -122.4000
  const latMin = 45.3800;
  const latMax = 45.6200;
  const lngMin = -122.8000;
  const lngMax = -122.4000;

  const getXY = (lat: number, lng: number) => {
    const xPct = ((lng - lngMin) / (lngMax - lngMin)) * 100;
    // SVG y coordinates go from top to bottom, while latitude increases bottom to top
    const yPct = (1 - (lat - latMin) / (latMax - latMin)) * 100;
    return { x: xPct, y: yPct };
  };

  const getLatLng = (xPct: number, yPct: number) => {
    const lng = lngMin + (xPct / 100) * (lngMax - lngMin);
    const lat = latMin + (1 - yPct / 100) * (latMax - latMin);
    return { lat: parseFloat(lat.toFixed(4)), lng: parseFloat(lng.toFixed(4)) };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    const { lat, lng } = getLatLng(xPct, yPct);
    setCursorCoord({ x: e.clientX - rect.left, y: e.clientY - rect.top, lat, lng });
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    const { lat, lng } = getLatLng(xPct, yPct);
    
    // Reverse-geocode mock address
    let address = `Sector [${Math.floor(xPct)}, ${Math.floor(yPct)}] C-Line, Cascadia`;
    if (lat > 45.55) address = `North Shore Corridor, near Lat ${lat}`;
    else if (lat < 45.45) address = `Southeastern Forest Interface, near Lng ${lng}`;
    else address = `Metropolitan Core Hub, near Lat ${lat}`;

    onGridClick(lat, lng, address);
  };

  // Weather radar sweeps
  const [radarRotation, setRadarRotation] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarRotation((prev) => (prev + 1.5) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0b0f19] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative" id="command-center-map-viewport">
      {/* HUD Header */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#111726]/90 border-b border-slate-800 backdrop-blur-md z-10">
        <div className="flex items-center space-x-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">
              Live Tactical Operations Feed
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Cascadia Regional Grid Range: EPSG:4326 | WGS84
            </p>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="flex items-center space-x-2 text-[10px] text-slate-300 font-mono mt-2 sm:mt-0">
          <button
            onClick={() => setActiveLayers((prev) => ({ ...prev, radar: !prev.radar }))}
            className={`px-2 py-1 rounded border transition-all ${
              activeLayers.radar
                ? "bg-emerald-950/40 border-emerald-500 text-emerald-400"
                : "border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
          >
            Radar Scan
          </button>
          <button
            onClick={() => setActiveLayers((prev) => ({ ...prev, corridors: !prev.corridors }))}
            className={`px-2 py-1 rounded border transition-all ${
              activeLayers.corridors
                ? "bg-cyan-950/40 border-cyan-500 text-cyan-400"
                : "border-slate-800 text-slate-500 hover:text-slate-300"
            }`}
          >
            Medevac Corridors
          </button>
          <button
            onClick={() => setActiveLayers((prev) => ({ ...prev, grid: !prev.grid }))}
            className={`px-2 py-1 rounded border transition-all ${
              activeLayers.grid
                ? "bg-slate-800 border-slate-600 text-slate-200"
                : "border-slate-900 text-slate-600 hover:text-slate-500"
            }`}
          >
            Tactical Grid
          </button>
        </div>
      </div>

      {/* SVG Map Container */}
      <div
        ref={mapContainerRef}
        className="relative flex-1 bg-[#070a13] cursor-crosshair overflow-hidden min-h-[350px] lg:min-h-[450px]"
      >
        <svg
          width="100%"
          height="100%"
          className="absolute inset-0 select-none"
          onMouseMove={handleMouseMove}
          onClick={handleMapClick}
        >
          {/* Base Grid Pattern */}
          {activeLayers.grid && (
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.15)" strokeWidth="1" />
                <circle cx="0" cy="0" r="1.5" fill="rgba(100, 116, 139, 0.3)" />
              </pattern>
            </defs>
          )}

          {activeLayers.grid && (
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          )}

          {/* Radar Sweep Sweep Line */}
          {activeLayers.radar && (
            <g transform="translate(400, 250)">
              {/* Central base station marker */}
              <circle cx="0" cy="0" r="100" fill="none" stroke="rgba(16, 185, 129, 0.04)" strokeDasharray="5,5" />
              <circle cx="0" cy="0" r="200" fill="none" stroke="rgba(16, 185, 129, 0.02)" />
              <line
                x1="0"
                y1="0"
                x2={300 * Math.cos((radarRotation * Math.PI) / 180)}
                y2={300 * Math.sin((radarRotation * Math.PI) / 180)}
                stroke="rgba(16, 185, 129, 0.25)"
                strokeWidth="1.5"
              />
              <path
                d={`M 0,0 L ${300 * Math.cos((radarRotation * Math.PI) / 180)} ${
                  300 * Math.sin((radarRotation * Math.PI) / 180)
                } A 300 300 0 0 0 ${300 * Math.cos(((radarRotation - 20) * Math.PI) / 180)} ${
                  300 * Math.sin(((radarRotation - 20) * Math.PI) / 180)
                } Z`}
                fill="url(#radar-gradient)"
                opacity="0.12"
              />
              <defs>
                <linearGradient id="radar-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
                  <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                </linearGradient>
              </defs>
            </g>
          )}

          {/* Cascadia Estuary Contour Lines (Fictional flood barrier representation) */}
          <path
            d="M 50,150 Q 150,120 300,160 T 550,140 T 750,220"
            fill="none"
            stroke="rgba(6, 182, 212, 0.12)"
            strokeWidth="24"
            strokeLinecap="round"
          />
          <path
            d="M 50,150 Q 150,120 300,160 T 550,140 T 750,220"
            fill="none"
            stroke="rgba(6, 182, 212, 0.2)"
            strokeWidth="3"
            strokeDasharray="10, 10"
          />

          {/* Medevac/Aviation Flight Corridors */}
          {activeLayers.corridors && (
            <g opacity="0.5">
              <line x1="100" y1="50" x2="700" y2="400" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4,8" />
              <line x1="100" y1="400" x2="700" y2="50" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4,8" />
              <circle cx="400" cy="225" r="150" fill="none" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1" />
              <text x="410" y="220" fill="#06b6d4" className="font-mono text-[8px]" letterSpacing="1">
                CIVIL EVAC CORRIDOR CHARLIE
              </text>
            </g>
          )}

          {/* Regional Station / Command Posts */}
          {activeLayers.stations &&
            resources
              .filter((r) => r.status === "AVAILABLE" || r.status === "MAINTENANCE")
              .map((res) => {
                const { x, y } = getXY(res.location.lat, res.location.lng);
                return (
                  <g
                    key={res.id}
                    className="transition-transform duration-200 hover:scale-110 cursor-pointer"
                    onMouseEnter={(e) =>
                      setHoveredNode({
                        name: res.name,
                        type: `Logistic Asset | ${res.type}`,
                        details: `Station: ${res.location.station} | Status: ${res.status}`,
                        x: x,
                        y: y
                      })
                    }
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <circle cx={`${x}%`} cy={`${y}%`} r="5" fill="#3b82f6" opacity="0.75" />
                    <circle cx={`${x}%`} cy={`${y}%`} r="9" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.4" />
                    <text x={`${x + 1.2}%`} y={`${y + 0.8}%`} fill="#94a3b8" className="text-[8px] font-mono font-semibold">
                      {res.name.split(" ").slice(-1)[0]}
                    </text>
                  </g>
                );
              })}

          {/* Active Disasters / Incidents */}
          {incidents.map((inc) => {
            const { x, y } = getXY(inc.location.lat, inc.location.lng);
            const isSelected = selectedIncident?.id === inc.id;

            // Select color based on incident type/severity
            let pulseColor = "rgba(239, 68, 68, 0.2)";
            let nodeColor = "#ef4444";
            if (inc.type === DisasterType.FLOOD) {
              pulseColor = "rgba(6, 182, 212, 0.25)";
              nodeColor = "#06b6d4";
            } else if (inc.type === DisasterType.FIRE) {
              pulseColor = "rgba(249, 115, 22, 0.25)";
              nodeColor = "#f97316";
            }

            return (
              <g
                key={inc.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectIncident(inc);
                }}
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredNode({
                    name: inc.title,
                    type: `Active Alert: ${inc.type}`,
                    details: `Victims: ${inc.victimsCount} | Severity: ${inc.severity} | State: ${inc.status}`,
                    x: x,
                    y: y
                  })
                }
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Active ripple wave animation */}
                <circle cx={`${x}%`} cy={`${y}%`} r={isSelected ? "25" : "16"} fill="none" stroke={nodeColor} strokeWidth="1">
                  <animate
                    attributeName="r"
                    values={isSelected ? "8;32;8" : "6;20;6"}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;0.1;0.8"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Outer halo */}
                <circle cx={`${x}%`} cy={`${y}%`} r={isSelected ? "14" : "9"} fill={pulseColor} />

                {/* Center marker */}
                <circle cx={`${x}%`} cy={`${y}%`} r={isSelected ? "6" : "4.5"} fill={nodeColor} />

                {/* Custom glowing tag for selected alert */}
                {isSelected && (
                  <g>
                    <rect
                      x={`${x - 4}%`}
                      y={`${y - 12}%`}
                      width="65"
                      height="14"
                      rx="3"
                      fill="#1e1b4b"
                      stroke="#ef4444"
                      strokeWidth="1"
                    />
                    <text x={`${x - 3}%`} y={`${y - 8}%`} fill="#fca5a5" className="text-[7px] font-mono font-bold">
                      CRISIS CORE
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Dynamic Context Tooltip */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ left: `${hoveredNode.x}%`, top: `${hoveredNode.y - 12}%` }}
              className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-950/95 border border-slate-700 p-2 rounded shadow-2xl z-20 min-w-[200px] backdrop-blur-md"
            >
              <div className="text-[10px] uppercase tracking-wider font-semibold text-rose-400 font-mono">
                {hoveredNode.type}
              </div>
              <div className="text-xs font-bold text-slate-100 font-sans mt-0.5">
                {hoveredNode.name}
              </div>
              <div className="text-[9px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-800">
                {hoveredNode.details}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD Crosshair coordinates on the side */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-[9px] text-slate-400 backdrop-blur-md space-y-0.5">
          <div className="flex items-center space-x-1.5">
            <Crosshair className="h-3 w-3 text-cyan-400 animate-spin" />
            <span className="text-slate-200">CROSSHAIR RADAR ACTIVE</span>
          </div>
          <div>GRID LAT: <span className="text-emerald-400">{cursorCoord.lat.toFixed(4)}</span></div>
          <div>GRID LNG: <span className="text-emerald-400">{cursorCoord.lng.toFixed(4)}</span></div>
          <div className="text-[8px] text-slate-500 italic mt-0.5">Click grid to place incident pins</div>
        </div>

        {/* Legend Map Panel */}
        <div className="absolute top-3 right-3 bg-slate-950/80 border border-slate-800 rounded p-2 font-mono text-[9px] text-slate-400 backdrop-blur-md space-y-1">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-0.5 mb-1 text-[8px] tracking-wider uppercase">
            Map Overlay Legend
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-[#f97316]"></span>
            <span>Wildfire (Active)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-[#06b6d4]"></span>
            <span>Estuary Flooding</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-[#3b82f6]"></span>
            <span>Rescue Command Stations</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-1 w-3 border-t border-cyan-500 border-dashed inline-block"></span>
            <span>High-Water Barriers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
