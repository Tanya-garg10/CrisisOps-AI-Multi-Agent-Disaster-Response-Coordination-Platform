/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Smartphone,
  Wifi,
  Battery,
  AlertTriangle,
  MapPin,
  Compass,
  Heart,
  Wind,
  ShieldAlert,
  Send,
  User,
  Activity,
  Check,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { Incident, DisasterType, Severity, IncidentStatus } from "../types";

interface MobileResponderDashboardProps {
  incidents: Incident[];
  onAddIncident: (data: any) => void;
  onUpdateIncidentStatus: (incidentId: string, status: IncidentStatus) => void;
  onAddAuditLog: (action: string, details: string, status: "SUCCESS" | "DENIED" | "FAILURE") => void;
  alertSoundEnabled: boolean;
}

export default function MobileResponderDashboard({
  incidents,
  onAddIncident,
  onUpdateIncidentStatus,
  onAddAuditLog,
  alertSoundEnabled
}: MobileResponderDashboardProps) {
  // Mobile app navigation state
  const [activeScreen, setActiveScreen] = useState<"tasks" | "report" | "sensors" | "sos">("tasks");
  const [selectedTask, setSelectedTask] = useState<Incident | null>(null);
  
  // Simulated mobile states
  const [batteryLevel, setBatteryLevel] = useState(84);
  const [mobileTime, setMobileTime] = useState("");
  
  // Ground report form states
  const [reportTitle, setReportTitle] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportType, setReportType] = useState<DisasterType>(DisasterType.FLOOD);
  const [reportSeverity, setReportSeverity] = useState<Severity>(Severity.MEDIUM);
  const [reportAddress, setReportAddress] = useState("Sector 4 - Estuary West Outpost");
  const [reportVictims, setReportVictims] = useState(2);
  const [reportSending, setReportSending] = useState(false);

  // Field sensor simulator values
  const [heartRate, setHeartRate] = useState(78);
  const [oxygenLevel, setOxygenLevel] = useState(98);
  const [toxicGasPpm, setToxicGasPpm] = useState(12); // Carbon Monoxide / Methane
  const [isGasAlarm, setIsGasAlarm] = useState(false);

  // Update mobile status bar clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, "0");
      const mins = now.getMinutes().toString().padStart(2, "0");
      setMobileTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulating small battery drain over time
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => (prev > 5 ? prev - 1 : 100));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Live heart rate fluctuate
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => {
        // Fluctuates slightly
        const delta = Math.floor(Math.random() * 5) - 2;
        const target = prev + delta;
        return target > 140 ? 120 : target < 60 ? 65 : target;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Monitor toxic gas slider alarm triggers
  useEffect(() => {
    if (toxicGasPpm > 80) {
      if (!isGasAlarm) {
        setIsGasAlarm(true);
        onAddAuditLog(
          "FIELD_SENSOR_CRITICAL",
          `FIELD SENSOR TRIGGERED: Toxic gas detected on tactical responder unit at ${toxicGasPpm} PPM. Mask deployment mandatory!`,
          "FAILURE"
        );
        triggerAlarmBeep(880, 0.4);
      }
    } else {
      setIsGasAlarm(false);
    }
  }, [toxicGasPpm]);

  // Audio utility for beeps
  const triggerAlarmBeep = (freq = 440, duration = 0.15) => {
    if (!alertSoundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  };

  // Submit ground incident bypasses heavy AI processing but inserts into central EOC feed
  const handleGroundReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportDesc.trim()) return;

    setReportSending(true);
    triggerAlarmBeep(523, 0.1);

    setTimeout(() => {
      // Mock latitude/longitude offset from HQ center
      const lat = parseFloat((37.7749 + (Math.random() * 0.04 - 0.02)).toFixed(4));
      const lng = parseFloat((-122.4194 + (Math.random() * 0.04 - 0.02)).toFixed(4));

      const mockId = `inc-ground-${Math.floor(Math.random() * 900 + 100)}`;
      const newGroundIncident: Incident = {
        id: mockId,
        title: `[GROUND REPORT] ${reportTitle}`,
        description: reportDesc,
        type: reportType,
        severity: reportSeverity,
        location: {
          lat,
          lng,
          address: reportAddress,
          region: "Sector 4 Ground Patrol Area"
        },
        victimsCount: reportVictims,
        reportedAt: new Date().toISOString(),
        reportedBy: "Ground Responder Patrol Alpha",
        status: IncidentStatus.REPORTED,
        aiSummary: "Ground scout telemetry received. High fidelity first-hand damage brief verified.",
        aiRecommendations: {
          primaryResponse: "Acknowledge scout coordinates. Logisticians to establish dynamic perimeter barricades.",
          requiredResources: [{ type: "RESCUE_TEAM", quantity: 1 }],
          safetyPrecautions: ["Ground scout reported active local debris.", "Enforce respiratory protocol."],
          priorityLevel: reportSeverity === Severity.CRITICAL ? 90 : 55
        },
        allocatedResources: [],
        timeline: [
          {
            timestamp: new Date().toISOString(),
            title: "Ground Scout Filed Report",
            description: "Direct tactical radio telemetry lodged. Incident assigned to EOC Sector 4."
          }
        ]
      };

      onAddIncident(newGroundIncident);
      onAddAuditLog(
        "GROUND_REPORT_FILED",
        `Ground scout logged field report: ${reportTitle} with ${reportSeverity} urgency.`,
        "SUCCESS"
      );

      setReportTitle("");
      setReportDesc("");
      setReportSending(false);
      setActiveScreen("tasks");
    }, 1500);
  };

  // Trigger Distress Panic SOS Beacon
  const handleDistressSOS = () => {
    triggerAlarmBeep(987, 0.8);
    // Dynamic high siren warning
    if (alertSoundEnabled) {
      setTimeout(() => triggerAlarmBeep(1320, 0.6), 200);
      setTimeout(() => triggerAlarmBeep(987, 0.6), 500);
    }

    const distressId = `inc-distress-${Date.now().toString().slice(-4)}`;
    const distressIncident: Incident = {
      id: distressId,
      title: "🚨 MAYDAY: FIELD AGENT IN DISTRESS 🚨",
      description: "FIELD RESPONDER AMBIENT ALARM: Biometric/Emergency beacon triggered by ground personnel. Immediate medical dispatch and protective containment required.",
      type: DisasterType.HAZMAT,
      severity: Severity.CRITICAL,
      location: {
        lat: 37.7599,
        lng: -122.4368,
        address: "Sector 4 Grid Coordinate (Biometrics Anomaly)",
        region: "Sector 4 Outpost 2"
      },
      victimsCount: 1,
      reportedAt: new Date().toISOString(),
      reportedBy: "SENSORS RADAR: Unit Alpha-10",
      status: IncidentStatus.REPORTED,
      aiSummary: "CRITICAL SYSTEM EMERGENCY: GROUND DEPLOYMENT DISTRESS DETECTED. Immediate rescue sweep authorized.",
      aiRecommendations: {
        primaryResponse: "RESCUE TEAM AND LIFEFLIGHT DEPLOYMENT MANDATORY.",
        requiredResources: [{ type: "RESCUE_TEAM", quantity: 2 }, { type: "AMBULANCE", quantity: 1 }],
        safetyPrecautions: ["Equip thermal scanners.", "Armed hazard containment protocols."],
        priorityLevel: 100
      },
      allocatedResources: [],
      timeline: [
        {
          timestamp: new Date().toISOString(),
          title: "Beacon Alert Activated",
          description: "Panic switch manually pressed by responder Alpha-10. GPS coordinates locked."
        }
      ]
    };

    onAddIncident(distressIncident);
    onAddAuditLog(
      "FIELD_PANIC_SOS_TRIGGERED",
      `CRITICAL DISTRESS BEACON EMITTED BY FIELD AGENT ALPHA-10! COORDINATES LOCK IN PROGRESS.`,
      "FAILURE"
    );

    alert("🚨 SOS Distress Signal Broadcasted to Central Command HQ! Flashing alarms mapped.");
    setActiveScreen("tasks");
  };

  return (
    <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left column: Simulator Instructions */}
        <div className="xl:col-span-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-rose-500 mb-2">
              <Smartphone className="h-5 w-5 animate-bounce" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider">
                Field Mobile App Simulator
              </h2>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              This terminal provides direct integration for boots-on-the-ground responders. In physical EOC systems, field personnel access this application via secure tactical cell networks to review active logs, modify assignment statuses, and feed environmental sensor metadata back into central HQ.
            </p>

            <div className="mt-4 p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2 text-[10px] font-mono text-slate-400">
              <div className="text-slate-300 font-bold uppercase border-b border-slate-800 pb-1 flex items-center justify-between">
                <span>Simulation Instructions</span>
                <span className="text-rose-500 text-[8px] animate-pulse">● FULL SYNC ACTIVE</span>
              </div>
              <p>&bull; <strong className="text-rose-400">Ground Ingestion:</strong> Use the &quot;File Alert&quot; screen to log custom events. They instantly bypass filters and populate on the HQ Command map.</p>
              <p>&bull; <strong className="text-cyan-400">Status Sync:</strong> Expand tasks on the simulated phone and toggle their statuses. Watch HQ update instantly.</p>
              <p>&bull; <strong className="text-amber-400">Sensor Telemetry:</strong> Adjust the toxic gas slider on the &quot;Telemetry&quot; tab. Dragging it past <strong className="text-rose-500">80 PPM</strong> triggers automated EOC system logs.</p>
              <p>&bull; <strong className="text-rose-500 font-extrabold">Emergency SOS:</strong> Hit the panic button on the &quot;SOS Beacon&quot; screen to emit a simulated high-alert ground emergency.</p>
            </div>
          </div>

          <div className="hidden xl:block p-3.5 bg-indigo-950/20 border border-indigo-500/20 rounded-lg text-[10px] text-indigo-300 font-mono">
            <div className="font-bold uppercase tracking-widest flex items-center space-x-1.5 mb-1 text-indigo-400">
              <Activity className="h-3.5 w-3.5" />
              <span>LOGISTICS TELEMETRY BUFFER</span>
            </div>
            <p>Ground status logs are compiled into a central SQLite/WGS84 schema. Simulated face recognition triggers CCTV feed locks based on telemetry geofences.</p>
          </div>
        </div>

        {/* Right column: The Simulated Smartphone Device Wrapper */}
        <div className="xl:col-span-7 flex justify-center items-center">
          
          {/* Smartphone container */}
          <div className="relative w-[300px] h-[580px] bg-[#070a13] rounded-[40px] border-[10px] border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden">
            
            {/* Top Ear Speaker notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-slate-800 rounded-b-xl z-30 flex items-center justify-center">
              <div className="w-10 h-1 bg-slate-900 rounded-full" />
            </div>

            {/* Simulated Phone Screen Status Bar */}
            <div className="h-7 pt-1 px-5 flex items-center justify-between text-[9px] font-mono font-bold text-slate-400 z-20 shrink-0">
              <span>{mobileTime || "12:00"}</span>
              <div className="flex items-center space-x-1.5">
                <Wifi className="h-3 w-3 text-emerald-500" />
                <span className="text-[8px] bg-slate-900 px-1 py-0.5 rounded text-emerald-400 border border-slate-800">5G_SECURE</span>
                <div className="flex items-center space-x-0.5">
                  <Battery className="h-3.5 w-3.5" />
                  <span>{batteryLevel}%</span>
                </div>
              </div>
            </div>

            {/* Interactive Phone Body Content Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1 flex flex-col justify-between select-none relative custom-scrollbar">
              
              <AnimatePresence mode="wait">
                {/* 1. SCREEN: Tasks Assignments */}
                {activeScreen === "tasks" && (
                  <motion.div
                    key="tasks"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex-1 flex flex-col"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                      <span className="text-[10px] font-bold text-slate-200 uppercase font-mono flex items-center space-x-1">
                        <Activity className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Tactical Dispatches</span>
                      </span>
                      <span className="text-[8px] bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded font-bold font-mono">
                        {incidents.length} active
                      </span>
                    </div>

                    {!selectedTask ? (
                      <div className="flex-1 space-y-2 overflow-y-auto max-h-[380px] pr-1">
                        <p className="text-[9px] text-slate-400 italic mb-2">
                          Select an active dispatch ticket below to access route logs, coordinate biometrics, and mark assignment resolution.
                        </p>
                        
                        {incidents.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-1.5 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] font-mono font-bold text-rose-400">{task.id}</span>
                              <span className={`text-[8px] font-bold px-1 rounded uppercase ${
                                task.severity === Severity.CRITICAL
                                  ? "bg-rose-950/50 text-rose-400"
                                  : task.severity === Severity.HIGH
                                  ? "bg-amber-950/50 text-amber-400"
                                  : "bg-slate-950 text-slate-400"
                              }`}>
                                {task.severity}
                              </span>
                            </div>
                            <h3 className="text-[10px] font-bold text-slate-200 font-mono truncate">{task.title}</h3>
                            <p className="text-[8px] text-slate-400 truncate flex items-center space-x-1">
                              <MapPin className="h-2 w-2 text-rose-400 shrink-0" />
                              <span>{task.location.address}</span>
                            </p>
                            <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                              <span>{new Date(task.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="text-cyan-400 hover:underline">ACCESS HUB &rarr;</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col justify-between text-left space-y-2">
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-2">
                          <button
                            onClick={() => setSelectedTask(null)}
                            className="text-[9px] font-mono text-slate-400 hover:text-slate-200 cursor-pointer mb-1 block"
                          >
                            &larr; BACK TO FEED
                          </button>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-mono font-bold text-rose-400">{selectedTask.id}</span>
                            <span className="text-[8px] font-mono text-slate-500">{selectedTask.type}</span>
                          </div>
                          
                          <h3 className="text-[10px] font-bold text-slate-200 font-mono">{selectedTask.title}</h3>
                          
                          <p className="text-[9px] text-slate-400 line-clamp-3 leading-normal bg-slate-950 p-1.5 rounded border border-slate-800/40 font-mono">
                            {selectedTask.description}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-2 text-[8px] font-mono text-slate-400">
                            <div>
                              <span className="text-[7px] text-slate-500 block uppercase">Region</span>
                              <span className="truncate block font-bold text-slate-300">{selectedTask.location.region}</span>
                            </div>
                            <div>
                              <span className="text-[7px] text-slate-500 block uppercase">Severity Status</span>
                              <span className="text-rose-400 font-bold">{selectedTask.status}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status update controls */}
                        <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg space-y-1.5">
                          <span className="text-[7px] font-mono font-bold text-slate-500 uppercase block">Update Central Status Ledger</span>
                          
                          <div className="grid grid-cols-2 gap-1.5 text-[8px] font-mono">
                            <button
                              onClick={() => {
                                onUpdateIncidentStatus(selectedTask.id, IncidentStatus.ACTIVE);
                                setSelectedTask(prev => prev ? { ...prev, status: IncidentStatus.ACTIVE } : null);
                                onAddAuditLog("STATUS_SYNC", `Field team marked ${selectedTask.id} active. Operations live.`, "SUCCESS");
                                triggerAlarmBeep(440, 0.1);
                              }}
                              className={`py-1 rounded border text-center font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                                selectedTask.status === IncidentStatus.ACTIVE
                                  ? "bg-indigo-950 text-indigo-400 border-indigo-700"
                                  : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                              }`}
                            >
                              <RefreshCw className="h-2 w-2" />
                              <span>ON SCENE</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                onUpdateIncidentStatus(selectedTask.id, IncidentStatus.RESOLVED);
                                setSelectedTask(prev => prev ? { ...prev, status: IncidentStatus.RESOLVED } : null);
                                onAddAuditLog("STATUS_SYNC", `Field team resolved threat assignment at ${selectedTask.id}.`, "SUCCESS");
                                triggerAlarmBeep(523, 0.1);
                              }}
                              className={`py-1 rounded border text-center font-bold flex items-center justify-center space-x-1 cursor-pointer transition-all ${
                                selectedTask.status === IncidentStatus.RESOLVED
                                  ? "bg-emerald-950 text-emerald-400 border-emerald-700"
                                  : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                              }`}
                            >
                              <Check className="h-2 w-2" />
                              <span>RESOLVED</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 2. SCREEN: Report ground incident */}
                {activeScreen === "report" && (
                  <motion.div
                    key="report"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex-1 flex flex-col text-left"
                  >
                    <div className="border-b border-slate-800 pb-1.5 mb-2 flex items-center space-x-1">
                      <Send className="h-3.5 w-3.5 text-rose-500" />
                      <span className="text-[10px] font-bold text-slate-200 uppercase font-mono">Ground Field Reporter</span>
                    </div>

                    <form onSubmit={handleGroundReportSubmit} className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                      <div>
                        <label className="text-[7px] font-mono text-slate-500 uppercase block">Alert Headline</label>
                        <input
                          type="text"
                          required
                          value={reportTitle}
                          onChange={(e) => setReportTitle(e.target.value)}
                          placeholder="e.g. Broken Power Lines Grid 2"
                          className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded px-1.5 py-1 text-[9px] font-mono focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="text-[7px] font-mono text-slate-500 uppercase block">Live Situation Notes</label>
                        <textarea
                          required
                          value={reportDesc}
                          onChange={(e) => setReportDesc(e.target.value)}
                          placeholder="Provide details of collapsed structures, survivors or environmental blocks..."
                          rows={3}
                          className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded px-1.5 py-1 text-[9px] font-mono focus:outline-none focus:border-rose-500 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="text-[7px] font-mono text-slate-500 uppercase block">Disaster Vector</label>
                          <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value as DisasterType)}
                            className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded px-1 py-0.5 text-[9px] font-mono focus:outline-none focus:border-rose-500"
                          >
                            {Object.values(DisasterType).map((v) => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[7px] font-mono text-slate-500 uppercase block">Priority Level</label>
                          <select
                            value={reportSeverity}
                            onChange={(e) => setReportSeverity(e.target.value as Severity)}
                            className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded px-1 py-0.5 text-[9px] font-mono focus:outline-none focus:border-rose-500"
                          >
                            {Object.values(Severity).map((v) => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[7px] font-mono text-slate-500 uppercase block">Geo-reference / Location</label>
                        <input
                          type="text"
                          required
                          value={reportAddress}
                          onChange={(e) => setReportAddress(e.target.value)}
                          className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded px-1.5 py-1 text-[9px] font-mono focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={reportSending}
                        className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-850 text-white rounded text-[9px] font-mono font-bold uppercase transition-colors tracking-widest flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        {reportSending ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            <span>broadcasting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-3 w-3" />
                            <span>file ground ticket</span>
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* 3. SCREEN: Environmental biometrics & sensors */}
                {activeScreen === "sensors" && (
                  <motion.div
                    key="sensors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex-1 flex flex-col text-left"
                  >
                    <div className="border-b border-slate-800 pb-1.5 mb-2 flex items-center space-x-1">
                      <Activity className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-[10px] font-bold text-slate-200 uppercase font-mono">Ground Sensor Mesh</span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[8px] text-slate-400 italic">
                        Real-time biometrics of Unit Alpha-10. Spikes in CO/toxic gases or drops in blood oxygen register alerts on the EOC audit ledger.
                      </p>

                      {/* Health telemetry card */}
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-2">
                        <span className="text-[7px] font-mono font-bold text-indigo-400 block uppercase">Biometric Telemetry</span>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded">
                            <Heart className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                            <div>
                              <span className="text-[6px] text-slate-500 block uppercase">Heart Rate</span>
                              <span className="text-[10px] font-bold text-slate-200 font-mono">{heartRate} BPM</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded">
                            <Activity className="h-4.5 w-4.5 text-cyan-400" />
                            <div>
                              <span className="text-[6px] text-slate-500 block uppercase">O2 Saturation</span>
                              <span className="text-[10px] font-bold text-slate-200 font-mono">{oxygenLevel}% SpO2</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Environmental gas telemetry card with interactive simulator slider */}
                      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[7px] font-mono font-bold text-amber-400 block uppercase">Toxic Gas Exposure</span>
                          {isGasAlarm && (
                            <span className="text-[6px] bg-rose-950 text-rose-400 px-1 rounded animate-pulse font-bold font-mono">ALERT</span>
                          )}
                        </div>

                        <div className="bg-slate-900 p-1.5 rounded space-y-1">
                          <div className="flex justify-between text-[8px] font-mono">
                            <span className="text-slate-400">Carbon Monoxide Index</span>
                            <span className={`font-bold ${isGasAlarm ? "text-rose-500 animate-pulse" : "text-amber-500"}`}>{toxicGasPpm} PPM</span>
                          </div>
                          
                          {/* Slider to trigger the warning WOW feature */}
                          <input
                            type="range"
                            min="5"
                            max="150"
                            value={toxicGasPpm}
                            onChange={(e) => setToxicGasPpm(parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
                          />
                          <div className="flex justify-between text-[6px] font-mono text-slate-500 pt-0.5">
                            <span>0 PPM (SAFE)</span>
                            <span>80 PPM (ALARM LEVEL)</span>
                            <span>150 PPM</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* 4. SCREEN: SOS distress emergency signal */}
                {activeScreen === "sos" && (
                  <motion.div
                    key="sos"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex-1 flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-rose-600/15 border border-rose-500/40 flex items-center justify-center text-rose-500 animate-pulse">
                      <ShieldAlert className="h-10 w-10 text-rose-500" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-widest">GROUND PANIC SYNC</h3>
                      <p className="text-[9px] text-slate-400 max-w-[200px] leading-relaxed mx-auto">
                        Activating this tactical distress beacon triggers an immediate Priority 100 emergency within EOC Sector 4. Air rescue assets and logistics networks will be mobilized automatically.
                      </p>
                    </div>

                    {/* Panic trigger */}
                    <button
                      onClick={handleDistressSOS}
                      className="px-6 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white border border-rose-500/40 rounded-full text-[10px] font-bold font-mono uppercase shadow-lg shadow-rose-950/40 cursor-pointer animate-pulse"
                    >
                      ⚠️ BROADCAST MAYDAY SOS
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Simulated Smartphone Navigation Bar inside screen */}
              <div className="h-12 border-t border-slate-800/80 flex items-center justify-around text-slate-400 z-20 shrink-0 bg-[#070a13]">
                <button
                  onClick={() => { setActiveScreen("tasks"); setSelectedTask(null); }}
                  className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                    activeScreen === "tasks" ? "text-cyan-400" : "hover:text-slate-200 text-slate-500"
                  }`}
                >
                  <Compass className="h-4 w-4" />
                  <span className="text-[6px] font-mono font-bold uppercase">Tasks</span>
                </button>
                
                <button
                  onClick={() => setActiveScreen("report")}
                  className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                    activeScreen === "report" ? "text-rose-400" : "hover:text-slate-200 text-slate-500"
                  }`}
                >
                  <Send className="h-4 w-4" />
                  <span className="text-[6px] font-mono font-bold uppercase">File Alert</span>
                </button>
                
                <button
                  onClick={() => setActiveScreen("sensors")}
                  className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                    activeScreen === "sensors" ? "text-amber-400" : "hover:text-slate-200 text-slate-500"
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  <span className="text-[6px] font-mono font-bold uppercase">Telemetry</span>
                </button>
                
                <button
                  onClick={() => setActiveScreen("sos")}
                  className={`flex flex-col items-center justify-center space-y-0.5 cursor-pointer ${
                    activeScreen === "sos" ? "text-rose-500 animate-pulse" : "hover:text-slate-200 text-slate-500"
                  }`}
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span className="text-[6px] font-mono font-bold uppercase">SOS Beacon</span>
                </button>
              </div>

            </div>

            {/* Smartphone screen bottom swipe bar */}
            <div className="h-4 pb-1.5 flex items-center justify-center bg-[#070a13] z-20 shrink-0">
              <div className="w-20 h-1 bg-slate-700 rounded-full" />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

import { AnimatePresence } from "motion/react";
