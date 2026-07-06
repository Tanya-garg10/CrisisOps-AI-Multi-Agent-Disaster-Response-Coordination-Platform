/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Severity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}

export enum DisasterType {
  FIRE = "Wildfire",
  FLOOD = "Flash Flood",
  HURRICANE = "Hurricane",
  EARTHQUAKE = "Earthquake",
  HAZMAT = "Hazmat Leak",
  BLIZZARD = "Severe Blizzard"
}

export enum IncidentStatus {
  REPORTED = "REPORTED",
  ANALYZING = "ANALYZING",
  DISPATCHING = "DISPATCHING",
  ACTIVE = "ACTIVE_RESPONSE",
  RESOLVED = "RESOLVED"
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  type: DisasterType;
  severity: Severity;
  location: {
    lat: number;
    lng: number;
    address: string;
    region: string;
  };
  victimsCount: number;
  reportedAt: string;
  reportedBy: string;
  status: IncidentStatus;
  imageUrl?: string;
  aiSummary?: string;
  aiRecommendations?: {
    primaryResponse: string;
    requiredResources: { type: string; quantity: number }[];
    safetyPrecautions: string[];
    priorityLevel: number;
  };
  allocatedResources: {
    resourceId: string;
    quantity: number;
    dispatchedAt: string;
  }[];
  timeline: {
    timestamp: string;
    title: string;
    description: string;
    agentName?: string;
  }[];
}

export enum AgentStatus {
  IDLE = "IDLE",
  THINKING = "THINKING",
  EXECUTING = "EXECUTING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR"
}

export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  status: AgentStatus;
  currentTask?: string;
  lastActive: string;
}

export interface AgentMessage {
  id: string;
  timestamp: string;
  fromAgent: string;
  toAgent: string;
  content: string;
  type: "task_delegation" | "data_share" | "plan_update" | "alert" | "system";
}

export interface EmergencyResource {
  id: string;
  name: string;
  type: "RESCUE_TEAM" | "AMBULANCE" | "SHELTER" | "HEAVY_EQUIPMENT" | "HELICOPTER";
  status: "AVAILABLE" | "DISPATCHED" | "MAINTENANCE" | "FULL";
  capacity: {
    current: number;
    max: number;
    unit: string;
  };
  location: {
    lat: number;
    lng: number;
    station: string;
  };
  contact: string;
}

export interface WeatherNode {
  region: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  floodRisk: "LOW" | "MODERATE" | "HIGH" | "EXTREME";
  alertLevel: "NONE" | "ADVISORY" | "WATCH" | "WARNING";
  lastUpdated: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  role: "COMMANDER" | "DISPATCHER" | "FIELD_RESPONDER";
  action: string;
  details: string;
  ipAddress: string;
  status: "SUCCESS" | "DENIED" | "FAILURE";
}

export interface UserSession {
  email: string;
  role: "COMMANDER" | "DISPATCHER" | "FIELD_RESPONDER";
  name: string;
  token?: string;
}

export interface MissingPerson {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastKnownLocation: string;
  lastSeenTime: string;
  photoUrl: string;
  status: "MISSING" | "LOCATED" | "MATCH_FOUND";
  matchConfidence?: number;
  notes?: string;
}

export interface SocialFeedEntry {
  id: string;
  username: string;
  handle: string;
  text: string;
  time: string;
  platform: "X" | "Instagram" | "Citizen";
  detectedDisaster: string;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  location: string;
  lat: number;
  lng: number;
  peopleAffected: number;
  isImported: boolean;
}

export interface AppSettings {
  language: "en" | "hi" | "bn" | "ta" | "te" | "mr";
  geminiModel: "gemini-3.5-flash" | "gemini-2.5-flash" | "gemini-2.5-pro";
  apiRateLimit: number;
  enableMcpWeather: boolean;
  enableMcpMaps: boolean;
  enableMcpFiles: boolean;
  enableMcpCalendar: boolean;
  simulationPacing: number; // Milliseconds per agent turn
  alertSoundEnabled: boolean;
}

