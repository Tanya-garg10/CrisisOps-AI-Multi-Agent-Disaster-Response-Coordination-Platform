/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SocialFeedEntry, MissingPerson } from "../types";
import {
  Users,
  Search,
  Check,
  Share2,
  MapPin,
  AlertCircle,
  Clock,
  Eye,
  Plus,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Camera,
  Heart
} from "lucide-react";

interface SocialMissingPortalProps {
  socialFeed: SocialFeedEntry[];
  missingPersons: MissingPerson[];
  onImportSocialIncident: (feed: SocialFeedEntry) => void;
  onRegisterMissingPerson: (person: Omit<MissingPerson, "id">) => void;
  onTriggerFaceMatch: (personId: string) => void;
  onAddAuditLog: (action: string, details: string, status: "SUCCESS" | "DENIED" | "FAILURE") => void;
  isSimulatingFaceMatch: string | null; // active person ID being processed
}

export default function SocialMissingPortal({
  socialFeed,
  missingPersons,
  onImportSocialIncident,
  onRegisterMissingPerson,
  onTriggerFaceMatch,
  onAddAuditLog,
  isSimulatingFaceMatch
}: SocialMissingPortalProps) {
  
  // Tab within this portal: Social or Missing
  const [activePortalTab, setActivePortalTab] = useState<"social" | "missing">("social");
  
  // Register Form states
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [regName, setRegName] = useState("");
  const [regAge, setRegAge] = useState<number>(30);
  const [regGender, setRegGender] = useState("Male");
  const [regLocation, setRegLocation] = useState("");
  const [regTime, setRegTime] = useState("");
  const [regNotes, setRegNotes] = useState("");
  const [regPresetPhoto, setRegPresetPhoto] = useState(0);

  // Preset photos for easy demo upload simulation
  const PHOTO_PRESETS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&w=150&q=80"
  ];

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regLocation) {
      alert("Please provide the name and last known location.");
      return;
    }

    onRegisterMissingPerson({
      name: regName,
      age: regAge,
      gender: regGender,
      lastKnownLocation: regLocation,
      lastSeenTime: regTime || "Just now",
      photoUrl: PHOTO_PRESETS[regPresetPhoto],
      status: "MISSING",
      notes: regNotes
    });

    // Reset
    setRegName("");
    setRegLocation("");
    setRegTime("");
    setRegNotes("");
    setShowRegisterForm(false);
  };

  return (
    <div className="bg-[#0f1422] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full" id="social-intelligence-portal">
      {/* Portal Header tabs */}
      <div className="bg-[#0b0f19] border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-[#141b2e] border border-slate-800 rounded-lg text-indigo-400">
            <Users className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-200 tracking-wider font-sans uppercase">
              Social Sentinel & Humanitarian Portal
            </h2>
            <p className="text-[9px] text-slate-500 font-mono">
              Intelligence Scraping, Multi-Source OSINT & Missing Persons Coordination
            </p>
          </div>
        </div>

        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActivePortalTab("social")}
            className={`px-3 py-1 text-[10px] font-mono rounded cursor-pointer transition-all ${
              activePortalTab === "social"
                ? "bg-indigo-950/50 text-indigo-300 font-bold border border-indigo-900/45"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Social OSINT Feed ({socialFeed.length})
          </button>
          <button
            onClick={() => setActivePortalTab("missing")}
            className={`px-3 py-1 text-[10px] font-mono rounded cursor-pointer transition-all ${
              activePortalTab === "missing"
                ? "bg-[#161f36] text-indigo-300 font-bold border border-indigo-900/45"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Missing Persons Search ({missingPersons.length})
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="p-5 flex-1 min-h-[450px]">
        
        {/* VIEW 1: Social Media Monitor OSINT Feed */}
        {activePortalTab === "social" && (
          <div className="space-y-4">
            <div className="bg-indigo-950/10 border border-indigo-500/20 rounded-lg p-3.5 flex items-start space-x-3">
              <TrendingUp className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-indigo-300 font-mono block">AI ACTIVE SENTINEL SCANNING</span>
                <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">
                  Our background intelligence parser monitors public streams (X, Instagram, and local Citizen radios). Natural language extractors isolate coordinates, assess victim count gravity, and tag urgency flags. Use "Import into EOC Ledger" to parse location directly into EOC.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {socialFeed.map((feed) => {
                const badgeColor =
                  feed.urgency === "CRITICAL"
                    ? "bg-rose-950/50 text-rose-400 border-rose-800/40"
                    : feed.urgency === "HIGH"
                    ? "bg-orange-950/50 text-orange-400 border-orange-800/40"
                    : "bg-amber-950/40 text-amber-400 border-amber-800/30";

                return (
                  <div
                    key={feed.id}
                    className="bg-[#111726]/40 border border-slate-800/80 rounded-lg p-4 flex flex-col justify-between transition-all hover:border-slate-700 hover:bg-[#141b2e]/40 relative overflow-hidden"
                  >
                    {/* Source Tag */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          feed.platform === "X"
                            ? "bg-slate-900 text-slate-300 border border-slate-700"
                            : feed.platform === "Citizen"
                            ? "bg-rose-950/30 text-rose-400 border border-rose-900/30"
                            : "bg-indigo-950/40 text-indigo-400"
                        }`}>
                          {feed.platform.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-300">
                          {feed.username}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {feed.handle}
                        </span>
                      </div>
                      <span className={`text-[8px] font-mono font-bold px-1.5 rounded ${badgeColor}`}>
                        {feed.urgency}
                      </span>
                    </div>

                    {/* Post Text */}
                    <p className="text-[11px] text-slate-300 leading-normal italic mb-3">
                      &ldquo;{feed.text}&rdquo;
                    </p>

                    {/* Extracted Geo Metadata */}
                    <div className="pt-2 border-t border-slate-800/50 space-y-1.5 text-[9px] font-mono text-slate-400">
                      <div className="flex items-center space-x-1 text-indigo-400 font-bold">
                        <Cpu className="h-3 w-3 shrink-0" />
                        <span>AI OSINT PARSINGS:</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        <span className="truncate">Loc: {feed.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Disaster: {feed.detectedDisaster}</span>
                        {feed.peopleAffected > 0 && (
                          <span className="text-orange-400 font-bold">~{feed.peopleAffected} Affected</span>
                        )}
                      </div>
                    </div>

                    {/* Import Action */}
                    <div className="mt-3.5 pt-2 border-t border-slate-800/40">
                      {feed.isImported ? (
                        <div className="w-full py-1 bg-slate-900 border border-slate-800 rounded text-center text-[9px] text-slate-500 font-mono font-bold flex items-center justify-center space-x-1">
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>SYNCHRONIZED WITH COMMAND HUD</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onImportSocialIncident(feed)}
                          className="w-full py-1.5 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/30 rounded text-center text-[9px] text-indigo-300 font-mono font-bold flex items-center justify-center space-x-1 cursor-pointer transition-colors"
                        >
                          <ArrowRight className="h-3 w-3" />
                          <span>IMPORT INTO CENTRAL COMMAND</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: Missing Persons Search Engine */}
        {activePortalTab === "missing" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg w-full max-w-sm">
                <Search className="h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search missing by name or last location..."
                  className="bg-transparent text-xs text-slate-300 focus:outline-none w-full font-mono"
                />
              </div>

              <button
                onClick={() => setShowRegisterForm(!showRegisterForm)}
                className="flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-mono text-[10px] font-semibold transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>REGISTER MISSING</span>
              </button>
            </div>

            {/* Registration Form modal overlay */}
            {showRegisterForm && (
              <form
                onSubmit={handleRegisterSubmit}
                className="bg-[#111726]/90 border border-slate-800 rounded-lg p-4 space-y-3 max-w-lg mx-auto"
              >
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase border-b border-slate-800 pb-2">
                  Register Missing Person Entry Form
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 block">FULL NAME</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Liam Smith"
                      className="w-full bg-[#0b0f19] border border-slate-800 rounded p-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 block">AGE</label>
                    <input
                      type="number"
                      value={regAge}
                      onChange={(e) => setRegAge(Number(e.target.value))}
                      className="w-full bg-[#0b0f19] border border-slate-800 rounded p-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 block">GENDER</label>
                    <select
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value)}
                      className="w-full bg-[#0b0f19] border border-slate-800 rounded p-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 block">LAST KNOWN LOCATION</label>
                    <input
                      type="text"
                      required
                      value={regLocation}
                      onChange={(e) => setRegLocation(e.target.value)}
                      placeholder="e.g. Ridgecrest Trail entrance"
                      className="w-full bg-[#0b0f19] border border-slate-800 rounded p-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-400 block">LAST SEEN TIME</label>
                    <input
                      type="text"
                      value={regTime}
                      onChange={(e) => setRegTime(e.target.value)}
                      placeholder="e.g. 2 hours ago"
                      className="w-full bg-[#0b0f19] border border-slate-800 rounded p-1.5 text-xs text-slate-200 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 block">DISTINGUISHING REMARKS</label>
                  <textarea
                    value={regNotes}
                    onChange={(e) => setRegNotes(e.target.value)}
                    placeholder="Red jacket, grey backpack, diabetic medications needed."
                    className="w-full h-12 bg-[#0b0f19] border border-slate-800 rounded p-1.5 text-xs text-slate-200 font-mono focus:outline-none resize-none"
                  />
                </div>

                {/* Preset Avatar Selection */}
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 block">SELECT IDENTIFICATION PHOTO PRESET</label>
                  <div className="flex items-center space-x-2 pt-1">
                    {PHOTO_PRESETS.map((url, idx) => (
                      <div
                        key={idx}
                        onClick={() => setRegPresetPhoto(idx)}
                        className={`h-11 w-11 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          regPresetPhoto === idx ? "border-indigo-500 scale-105" : "border-slate-800 hover:border-slate-600"
                        }`}
                      >
                        <img src={url} alt="preset preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowRegisterForm(false)}
                    className="px-2.5 py-1.5 border border-slate-800 text-slate-400 font-mono text-[9px] rounded hover:bg-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[9px] font-bold rounded cursor-pointer"
                  >
                    File Record
                  </button>
                </div>
              </form>
            )}

            {/* Grid of Missing Persons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {missingPersons.map((p) => {
                const isMatching = isSimulatingFaceMatch === p.id;
                
                return (
                  <div
                    key={p.id}
                    className={`bg-[#111726]/40 border rounded-lg p-4 flex space-x-3.5 transition-all ${
                      p.status === "MATCH_FOUND"
                        ? "border-emerald-500/40 bg-emerald-950/5 ring-1 ring-emerald-500/20"
                        : p.status === "LOCATED"
                        ? "border-blue-500/30 bg-blue-950/5"
                        : "border-slate-800"
                    }`}
                  >
                    {/* Visual identification portrait */}
                    <div className="relative shrink-0">
                      <div className="h-16 w-16 rounded-xl overflow-hidden border border-slate-800 relative bg-slate-900">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-700">
                            <Camera className="h-5 w-5" />
                          </div>
                        )}
                        {/* Dynamic sweep animation when scanning */}
                        {isMatching && (
                          <div className="absolute inset-x-0 h-1 bg-cyan-400 animate-bounce top-0" />
                        )}
                      </div>
                      
                      {/* Gender/Age tag */}
                      <span className="absolute -bottom-1 -right-1 text-[7px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-300 px-1 rounded">
                        {p.age}y/{p.gender[0]}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-bold text-slate-100 truncate">{p.name}</h4>
                          <span className={`text-[8px] font-mono font-bold px-1 rounded ${
                            p.status === "MATCH_FOUND"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800/30 animate-pulse"
                              : p.status === "LOCATED"
                              ? "bg-blue-950 text-blue-400 border border-blue-800/30"
                              : "bg-slate-900 text-amber-500 border border-amber-950"
                          }`}>
                            {p.status}
                          </span>
                        </div>

                        <div className="space-y-0.5 mt-1 font-mono text-[9px] text-slate-400">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                            <span className="truncate">{p.lastKnownLocation}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-slate-500 shrink-0" />
                            <span>Seen: {p.lastSeenTime}</span>
                          </div>
                        </div>

                        {p.notes && (
                          <p className="text-[9px] text-slate-500 italic mt-1.5 truncate max-w-[180px]" title={p.notes}>
                            &ldquo;{p.notes}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Face recognition simulation matches */}
                      <div className="pt-2 border-t border-slate-800/40 mt-2 flex items-center justify-between">
                        {p.status === "MATCH_FOUND" && p.matchConfidence && (
                          <div className="flex items-center space-x-1">
                            <Cpu className="h-3 w-3 text-emerald-400 shrink-0" />
                            <span className="text-[8px] font-mono text-emerald-400 font-bold">
                              AI MATCH: {p.matchConfidence}% CONFIDENCE
                            </span>
                          </div>
                        )}

                        {p.status === "LOCATED" && (
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3 text-blue-400 shrink-0 fill-current" />
                            <span className="text-[8px] font-mono text-blue-400 font-bold">
                              RESOLVED / SAFE
                            </span>
                          </div>
                        )}

                        {p.status === "MISSING" && (
                          <button
                            onClick={() => onTriggerFaceMatch(p.id)}
                            disabled={isMatching || isSimulatingFaceMatch !== null}
                            className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border transition-all cursor-pointer ${
                              isMatching
                                ? "bg-cyan-950/20 border-cyan-800/50 text-cyan-400 cursor-not-allowed"
                                : "bg-cyan-950/40 hover:bg-cyan-900/30 border-cyan-500/30 text-cyan-400"
                            }`}
                          >
                            {isMatching ? (
                              <span className="flex items-center space-x-1">
                                <RefreshCw className="h-2 w-2 animate-spin" />
                                <span>Drone Matching...</span>
                              </span>
                            ) : (
                              <span>Trigger AI Search Scan</span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
