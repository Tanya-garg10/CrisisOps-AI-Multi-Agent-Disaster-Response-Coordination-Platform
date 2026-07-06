/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Severity, DisasterType } from "../types";
import { MapPin, AlertCircle, Sparkles, UploadCloud, Check, Mic, MicOff, RefreshCw, Eye, EyeOff, ShieldAlert } from "lucide-react";

interface IncidentFormProps {
  mapCoords: { lat: number; lng: number; address: string } | null;
  onSubmitIncident: (incidentData: {
    title: string;
    description: string;
    type: DisasterType;
    severity: Severity;
    lat: number;
    lng: number;
    address: string;
    victimsCount: number;
    presetImageIndex: number | null;
  }) => void;
  isSubmitting: boolean;
}

// Pre-loaded high quality Unsplash disaster images to feed Gemini Vision analysis on backend
const IMAGE_PRESETS = [
  {
    name: "Wildfire interface",
    url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80",
    desc: "Active forest interface fire encroaching residential homes.",
    type: DisasterType.FIRE,
    visionData: {
      hazardSeverity: "Critical Fire Spread Velocity (Spot fire spotting)",
      collapsedBuildings: "Thermal breaches detected on 2 outhouses",
      roadBlockages: "Ridgecrest exit road 60% obscured by smoke",
      injuredCivilianEst: "Prototype thermal scan: 4 individuals in path"
    }
  },
  {
    name: "Estuary Flash Flood",
    url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=400&q=80",
    desc: "Severe torrential flooding with submerged vehicles.",
    type: DisasterType.FLOOD,
    visionData: {
      hazardSeverity: "Deep Waterlogging (approx. 1.4 meters depth)",
      collapsedBuildings: "Dykes structurally compromised (Overtopped)",
      roadBlockages: "Route 10B Evacuation Highway 100% blocked",
      injuredCivilianEst: "Camera feed visual: 15 motorists stranded on vehicle hoods"
    }
  },
  {
    name: "Industrial HAZMAT Leak",
    url: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=400&q=80",
    desc: "Chemical railcar leaking toxic green plume.",
    type: DisasterType.HAZMAT,
    visionData: {
      hazardSeverity: "Aerosolized Sulfuric/Ammonia gaseous plume",
      collapsedBuildings: "Rail line pressure valve ruptured",
      roadBlockages: "Aviation Medevac corridor bypass advised",
      injuredCivilianEst: "Plant telemetry projection: ~8 factory responders"
    }
  }
];

export default function IncidentForm({
  mapCoords,
  onSubmitIncident,
  isSubmitting
}: IncidentFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<DisasterType>(DisasterType.FIRE);
  const [severity, setSeverity] = useState<Severity>(Severity.HIGH);
  const [victimsCount, setVictimsCount] = useState<number>(0);
  
  // Coordinates (lat/lng/address)
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const [selectedPresetImage, setSelectedPresetImage] = useState<number | null>(null);
  
  // Voice simulation states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingCountdown, setRecordingCountdown] = useState(3);
  const [showVisionDiagnostic, setShowVisionDiagnostic] = useState(true);

  // Sync coords from map selection
  React.useEffect(() => {
    if (mapCoords) {
      setLat(mapCoords.lat.toString());
      setLng(mapCoords.lng.toString());
      setAddress(mapCoords.address);
    }
  }, [mapCoords]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !lat || !lng) {
      alert("Please provide Title, Description, and precise Coordinates (or click the map).");
      return;
    }

    onSubmitIncident({
      title,
      description,
      type,
      severity,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      address: address || "Specified Emergency Zone, Cascadia",
      victimsCount: victimsCount || 0,
      presetImageIndex: selectedPresetImage
    });

    // Reset Form
    setTitle("");
    setDescription("");
    setVictimsCount(0);
    setSelectedPresetImage(null);
  };

  const selectPreset = (idx: number) => {
    setSelectedPresetImage(idx);
    const preset = IMAGE_PRESETS[idx];
    setType(preset.type);
    
    // Auto populate realistic details based on preset image selection
    if (preset.type === DisasterType.FIRE) {
      setTitle("Southeastern Ridge Canopy Wildfire");
      setDescription("Extreme wildfire spreading along dried pine interface. Heavy smoke plumes visible. Immediate evacuation of residential block needed.");
      setSeverity(Severity.HIGH);
      setVictimsCount(4);
      setLat("45.4210");
      setLng("-122.4600");
      setAddress("Ridgecrest Dr & Pine Trail, East Foothills");
    } else if (preset.type === DisasterType.FLOOD) {
      setTitle("Highway Delta Underpass Inundation");
      setDescription("Overtopped concrete dyke has led to structural flooding on the state highway. Multiple vehicles trapped in deep currents.");
      setSeverity(Severity.CRITICAL);
      setVictimsCount(15);
      setLat("45.5820");
      setLng("-122.7150");
      setAddress("Route 10B Delta Underpass, Coast Highway");
    } else {
      setTitle("Chemical Tanker Rail Leak");
      setDescription("Industrial Hazmat container showing signs of pressurized valve breach. Toxic yellowish plume drifting downwind. Immediate breathing alert required.");
      setSeverity(Severity.CRITICAL);
      setVictimsCount(8);
      setLat("45.4800");
      setLng("-122.6500");
      setAddress("Industrial Chemical Works Yard 4");
    }
  };

  // Simulate Speech to Text dictation
  const handleSimulateVoiceRecording = () => {
    setIsRecording(true);
    setRecordingCountdown(3);
    
    // Play virtual tone
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // Beep high frequency
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Audio context disabled or not supported in sandbox, fail gracefully
    }

    const interval = setInterval(() => {
      setRecordingCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRecording(false);
          // Transcribe!
          setTitle("Voice Dispatch: Flash Flooding Over Dyke");
          setDescription("Vocal Radio Distress Call: Red alert! Water levels have completely overtopped the dykes near the Delta Underpass. Route 10B is impassable. Cars are sliding. Active current dragging tires. Need swift-water extraction boats now!");
          setType(DisasterType.FLOOD);
          setSeverity(Severity.CRITICAL);
          setVictimsCount(15);
          setLat("45.5820");
          setLng("-122.7150");
          setAddress("Route 10B Delta Underpass, Coast Highway");
          setSelectedPresetImage(1); // Select the flood preset

          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(440, audioCtx.currentTime); // Beep low confirmation
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
          } catch (e) {}

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full relative" id="incident-reporting-wizard">
      
      {/* Voice Capturing simulation overlay */}
      {isRecording && (
        <div className="absolute inset-0 bg-[#070a13]/95 z-40 rounded-xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="h-16 w-16 bg-rose-950/40 border-2 border-rose-500 rounded-full flex items-center justify-center animate-ping mb-4">
            <Mic className="h-8 w-8 text-rose-500" />
          </div>
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest animate-pulse">
            EOC RADIO RECORDER CHANNEL ACTIVE
          </span>
          <p className="text-[14px] text-slate-300 font-bold mt-1 font-mono">
            Vocalizing Distress Signal... {recordingCountdown}s
          </p>
          <div className="flex space-x-1.5 pt-3">
            <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-bounce delay-100"></span>
            <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-bounce delay-200"></span>
            <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-bounce delay-300"></span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-rose-950/40 border border-rose-500/30 rounded-lg">
            <AlertCircle className="h-4.5 w-4.5 text-rose-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-wide font-sans">
              Submit Incident Dispatch Ticket
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              EOC Autonomous Incident Ingestion Interface
            </p>
          </div>
        </div>

        {/* Voice SOS Trigger */}
        <button
          type="button"
          onClick={handleSimulateVoiceRecording}
          title="Simulate Speech-to-Text dynamic incident compilation"
          className="flex items-center space-x-1 px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900/50 border border-rose-500/35 rounded text-[10px] text-rose-400 font-mono font-bold cursor-pointer transition-colors"
        >
          <Mic className="h-3 w-3 text-rose-400 animate-pulse" />
          <span>Vibe Vocal SOS</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4 text-slate-300">
        
        {/* Core details row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">
              DISASTER CATEGORY *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DisasterType)}
              className="w-full bg-[#171e30] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              {Object.values(DisasterType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">
              INITIAL SEVERITY GRADE *
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full bg-[#171e30] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              {Object.values(Severity).map((s) => (
                <option key={s} value={s}>
                  {s} STATUS
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">
            ALERT TITLE *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Southeastern Ridge Timber Wildfire"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#171e30] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 placeholder:text-slate-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">
            SITUATIONAL DISPATCH REPORT *
          </label>
          <textarea
            required
            rows={2.5}
            placeholder="Provide brief details on fire speed, wind direction, visible smoke columns, blocked escape routes, or toxic plumes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#171e30] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 placeholder:text-slate-500"
          />
        </div>

        {/* Geolocation Fields (Interactive with Map) */}
        <div className="bg-[#111726] border border-slate-800 p-3 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-cyan-400 flex items-center space-x-1">
              <MapPin className="h-3 w-3 shrink-0" />
              <span>COORDINATE ASSIGNMENT (GEOLOC)</span>
            </span>
            <span className="text-[9px] text-slate-500 italic">Click on map grid to auto-fill</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[8px] font-mono text-slate-500 mb-0.5">LATITUDE</label>
              <input
                type="number"
                step="0.0001"
                required
                placeholder="45.5200"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-300 font-mono focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[8px] font-mono text-slate-500 mb-0.5">LONGITUDE</label>
              <input
                type="number"
                step="0.0001"
                required
                placeholder="-122.6200"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-300 font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[8px] font-mono text-slate-500 mb-0.5">STREET ADDRESS / BOUNDS</label>
            <input
              type="text"
              placeholder="e.g. Hwy 10B Delta Underpass, Cascadia"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Victims count and Preset Media Upload */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">
              EST. VICTIMS AT RISK
            </label>
            <input
              type="number"
              min="0"
              value={victimsCount}
              onChange={(e) => setVictimsCount(parseInt(e.target.value) || 0)}
              className="w-full bg-[#171e30] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
            />
          </div>

          {/* AI Image Preset Upload Grid */}
          <div className="md:col-span-2">
            <label className="block text-[10px] font-mono font-bold text-slate-400 mb-1">
              EMERGENCY IMAGE INPUT (AI VISION SENSOR)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {IMAGE_PRESETS.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => selectPreset(idx)}
                  className={`relative h-12 rounded border cursor-pointer overflow-hidden transition-all ${
                    selectedPresetImage === idx
                      ? "border-rose-500 ring-1 ring-rose-500/50"
                      : "border-slate-800 hover:border-slate-600"
                  }`}
                  title={img.desc}
                >
                  <img src={img.url} alt={img.name} className="h-full w-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center p-1">
                    <span className="text-[8px] font-bold text-white text-center leading-tight truncate">
                      {img.name.split(" ")[0]}
                    </span>
                  </div>
                  {selectedPresetImage === idx && (
                    <div className="absolute top-0.5 right-0.5 bg-rose-500 rounded-full p-0.5">
                      <Check className="h-2 w-2 text-white stroke-[4]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Vision Analysis Overlay Diagnostic Panel */}
        {selectedPresetImage !== null && showVisionDiagnostic && (
          <div className="bg-cyan-950/15 border border-cyan-500/30 rounded-lg p-3 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between border-b border-cyan-900/40 pb-1.5">
              <span className="text-[9px] font-mono font-bold text-cyan-400 flex items-center space-x-1.5">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>AI COMPUTER VISION REAL-TIME RADAR OVERLAY</span>
              </span>
              <button
                type="button"
                onClick={() => setShowVisionDiagnostic(false)}
                className="text-[8px] font-mono text-cyan-500 hover:text-cyan-300"
              >
                Hide diagnostic
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9px] font-mono text-slate-300 leading-tight">
              <div className="p-1.5 bg-slate-950/40 rounded border border-slate-900">
                <span className="text-[7.5px] text-slate-500 uppercase block">Hazard Classification</span>
                <span className="text-cyan-300">{IMAGE_PRESETS[selectedPresetImage].visionData.hazardSeverity}</span>
              </div>
              <div className="p-1.5 bg-slate-950/40 rounded border border-slate-900">
                <span className="text-[7.5px] text-slate-500 uppercase block">Structural Damage</span>
                <span className="text-amber-400">{IMAGE_PRESETS[selectedPresetImage].visionData.collapsedBuildings}</span>
              </div>
              <div className="p-1.5 bg-slate-950/40 rounded border border-slate-900">
                <span className="text-[7.5px] text-slate-500 uppercase block">Transit Blockages</span>
                <span className="text-rose-400">{IMAGE_PRESETS[selectedPresetImage].visionData.roadBlockages}</span>
              </div>
              <div className="p-1.5 bg-slate-950/40 rounded border border-slate-900">
                <span className="text-[7.5px] text-slate-500 uppercase block">Casualty Estimation</span>
                <span className="text-emerald-400">{IMAGE_PRESETS[selectedPresetImage].visionData.injuredCivilianEst}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-rose-700 hover:bg-rose-600 active:bg-rose-800 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono font-bold rounded-lg transition-colors border border-rose-500/30 flex items-center justify-center space-x-2 text-xs cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>COMMISSIONING MULTI-AGENT SYNCHRONIZER...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-current" />
              <span>RAISE DISASTER ALERT (ENGAGE AI AGENTS)</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

