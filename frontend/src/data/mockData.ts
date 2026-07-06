/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Incident, EmergencyResource, WeatherNode, AgentConfig, Severity, IncidentStatus, DisasterType, AgentStatus, AuditLog, MissingPerson, SocialFeedEntry } from "../types";

export const INITIAL_AGENTS: AgentConfig[] = [
  {
    id: "commander",
    name: "Commander Agent",
    role: "Central Orchestrator",
    description: "Receives inputs, plans execution tracks, delegates sub-tasks to specialists, and maintains context memory.",
    capabilities: ["Orchestration", "Context Routing", "Priority Triage", "Delegation"],
    status: AgentStatus.IDLE,
    lastActive: "Just now"
  },
  {
    id: "incident-analysis",
    name: "Incident Analysis Agent",
    role: "Classification & Geodata Specialist",
    description: "Extracts precise coordinates, parses textual reports, classifies incident types, and estimates impact radius.",
    capabilities: ["MIME Classification", "Geocoding Extraction", "Severity Grading", "Victim Estimation"],
    status: AgentStatus.IDLE,
    lastActive: "Just now"
  },
  {
    id: "weather-intel",
    name: "Weather Intelligence Agent",
    role: "Meteorological Analyst",
    description: "Evaluates precipitation rate, wind shear, radar profiles, and computes secondary risks like landslides.",
    capabilities: ["Flood Modeling", "Precipitation Forecasting", "Storm Tracking", "Microclimate Analytics"],
    status: AgentStatus.IDLE,
    lastActive: "Just now"
  },
  {
    id: "resource-manager",
    name: "Resource Management Agent",
    role: "Logistics Coordinator",
    description: "Monitors supply hubs, calculates deployment transit latency, and tracks emergency shelter beds.",
    capabilities: ["Inventory Tracking", "Route Optimization", "MCT Deployment", "Shelter Metrics"],
    status: AgentStatus.IDLE,
    lastActive: "Just now"
  },
  {
    id: "planning-agent",
    name: "Planning Agent",
    role: "Tactical Strategist",
    description: "Computes priority weighting matrix, matches resources to needs, and compiles tactical action briefs.",
    capabilities: ["Optimization Modeling", "Queueing Logic", "Action Plan Drafting", "Contingency Routing"],
    status: AgentStatus.IDLE,
    lastActive: "Just now"
  },
  {
    id: "communication-agent",
    name: "Communication Agent",
    role: "Emergency Broadcast Manager",
    description: "Formats and delivers civil emergency alerts, handles mock automated responder dispatch alerts, and SMS simulation.",
    capabilities: ["Alert Broadcasting", "Responder Dispatch Protocols", "Multi-lingual Warnings", "EAS Integration"],
    status: AgentStatus.IDLE,
    lastActive: "Just now"
  },
  {
    id: "report-gen",
    name: "Report Generation Agent",
    role: "Incident Recorder & Archivist",
    description: "Compiles complete incident timelines, tracks resource budgets, and drafts executive briefing dossiers.",
    capabilities: ["PDF Structure Layout", "Timeline Synthesis", "Executive Summary Drafting", "KPI Compilation"],
    status: AgentStatus.IDLE,
    lastActive: "Just now"
  }
];

export const INITIAL_WEATHER_NODES: WeatherNode[] = [
  {
    region: "Cascadia North Valley",
    temp: 68,
    condition: "High Winds / Wind Advisory",
    humidity: 32,
    windSpeed: 28,
    rainProbability: 5,
    floodRisk: "LOW",
    alertLevel: "ADVISORY",
    lastUpdated: "2 mins ago"
  },
  {
    region: "Coastal Delta Estuary",
    temp: 54,
    condition: "Torrential Rains",
    humidity: 95,
    windSpeed: 22,
    rainProbability: 90,
    floodRisk: "EXTREME",
    alertLevel: "WARNING",
    lastUpdated: "1 min ago"
  },
  {
    region: "Metropolitan Command Core",
    temp: 62,
    condition: "Scattered Showers",
    humidity: 78,
    windSpeed: 12,
    rainProbability: 40,
    floodRisk: "MODERATE",
    alertLevel: "NONE",
    lastUpdated: "Just now"
  },
  {
    region: "Southeastern Foothills",
    temp: 84,
    condition: "Extreme Dry Heat",
    humidity: 14,
    windSpeed: 18,
    rainProbability: 0,
    floodRisk: "LOW",
    alertLevel: "WATCH",
    lastUpdated: "5 mins ago"
  }
];

export const INITIAL_RESOURCES: EmergencyResource[] = [
  {
    id: "res-sar-1",
    name: "Search & Rescue Unit Alpha",
    type: "RESCUE_TEAM",
    status: "AVAILABLE",
    capacity: { current: 12, max: 12, unit: "Personnel" },
    location: { lat: 45.5230, lng: -122.6670, station: "Port Metro Command Hub" },
    contact: "SAR-Alpha Console (+1 555-0190)"
  },
  {
    id: "res-sar-2",
    name: "Forestry Hotshot Fire Crew 8",
    type: "RESCUE_TEAM",
    status: "DISPATCHED",
    capacity: { current: 20, max: 20, unit: "Personnel" },
    location: { lat: 45.4290, lng: -122.4810, station: "East Hills Ranger Post" },
    contact: "Hotshots-8 Dispatch (+1 555-0145)"
  },
  {
    id: "res-amb-1",
    name: "Ambulance Fleet Dispatch 3",
    type: "AMBULANCE",
    status: "AVAILABLE",
    capacity: { current: 6, max: 8, unit: "Vehicles" },
    location: { lat: 45.5080, lng: -122.6810, station: "Valley Memorial Medical" },
    contact: "Fleet-3 Lead Medic (+1 555-0177)"
  },
  {
    id: "res-amb-2",
    name: "Critical Care Transport Unit",
    type: "AMBULANCE",
    status: "AVAILABLE",
    capacity: { current: 3, max: 4, unit: "Vehicles" },
    location: { lat: 45.5200, lng: -122.6100, station: "Metro General Trauma" },
    contact: "CCT Console (+1 555-0111)"
  },
  {
    id: "res-shl-1",
    name: "St. Jude Crisis Shelter Node",
    type: "SHELTER",
    status: "AVAILABLE",
    capacity: { current: 142, max: 250, unit: "Beds Occupied" },
    location: { lat: 45.5350, lng: -122.6420, station: "Community Annex B" },
    contact: "Shelter Coordinator (+1 555-0130)"
  },
  {
    id: "res-shl-2",
    name: "Delta Secondary Evacuation Node",
    type: "SHELTER",
    status: "FULL",
    capacity: { current: 150, max: 150, unit: "Beds Occupied" },
    location: { lat: 45.5800, lng: -122.7100, station: "Delta Expo Center" },
    contact: "Delta Ops Desk (+1 555-0155)"
  },
  {
    id: "res-hvy-1",
    name: "Civil Engineering Heavy Plant",
    type: "HEAVY_EQUIPMENT",
    status: "AVAILABLE",
    capacity: { current: 5, max: 5, unit: "Bulldozers/Excavators" },
    location: { lat: 45.4800, lng: -122.6500, station: "Municipal Works Yard 4" },
    contact: "Works Supervisor (+1 555-0182)"
  },
  {
    id: "res-cop-1",
    name: "LifeFlight Medevac Guardian 1",
    type: "HELICOPTER",
    status: "AVAILABLE",
    capacity: { current: 1, max: 1, unit: "Airframe" },
    location: { lat: 45.5890, lng: -122.5970, station: "Portland Air Base Helipad" },
    contact: "Flight Ops (+1 555-0101)"
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "inc-2026-001",
    title: "Southeastern Ridge Timber Wildfire",
    description: "Rapidly spreading brush and timber fire sparked by downed utility lines during high wind event. Encroaching on suburban residential perimeter with several homes evacuated.",
    type: DisasterType.FIRE,
    severity: Severity.HIGH,
    location: {
      lat: 45.4210,
      lng: -122.4600,
      address: "Ridgecrest Dr & Pine Trail, East Foothills",
      region: "Southeastern Foothills"
    },
    victimsCount: 4,
    reportedAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hrs ago
    reportedBy: "Foothills Lookout Station",
    status: IncidentStatus.ACTIVE,
    imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80",
    aiSummary: "Multi-acre timber canopy wildfire with strong westward wind propagation of 18 knots. Severe danger of immediate suburban interface loss. Evacuations ordered across Sector 4.",
    aiRecommendations: {
      primaryResponse: "Establish defensive backburn lines along Ridgecrest Dr; dispatch specialized hotshot crews with heavy dozer support to dig physical breaks.",
      requiredResources: [
        { type: "RESCUE_TEAM", quantity: 1 },
        { type: "HEAVY_EQUIPMENT", quantity: 1 }
      ],
      safetyPrecautions: [
        "Equip all units with active respiratory filter apparatus.",
        "Maintain dual exit channels for all dispatched crews.",
        "Implement localized power grid de-energization immediately."
      ],
      priorityLevel: 85
    },
    allocatedResources: [
      { resourceId: "res-sar-2", quantity: 20, dispatchedAt: new Date(Date.now() - 3600000 * 3.5).toISOString() }
    ],
    timeline: [
      {
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        title: "Initial Alert Raised",
        description: "Satellite thermal imaging triggered warning, verified by Foothills Lookout Ranger Station.",
        agentName: "Incident Analysis Agent"
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(),
        title: "Met-Evaluation Completed",
        description: "Wind vector identified as 18 knots ESE, humidity 14%. Risk rating elevated to Extreme due to severe fuel dry levels.",
        agentName: "Weather Intelligence Agent"
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
        title: "Hotshot Deployment Authorized",
        description: "Forestry Hotshot Fire Crew 8 dispatched from East Ranger Station with specialized gear.",
        agentName: "Resource Management Agent"
      }
    ]
  },
  {
    id: "inc-2026-002",
    title: "Delta Estuary Flood Blockade",
    description: "Abrupt flash flood triggered by tidal surge coinciding with high precipitation. Overtopping dykes and flooding critical evacuation highway route 10B.",
    type: DisasterType.FLOOD,
    severity: Severity.CRITICAL,
    location: {
      lat: 45.5820,
      lng: -122.7150,
      address: "Route 10B Delta Underpass, Coast Highway",
      region: "Coastal Delta Estuary"
    },
    victimsCount: 15,
    reportedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(), // 1.5 hrs ago
    reportedBy: "Department of Transportation Sensor Hub",
    status: IncidentStatus.ACTIVE,
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=400&q=80",
    aiSummary: "Tidal flooding overtopping concrete embankments. Over 15 motorists trapped in high-water conditions. Route 10B fully blocked with continuous backflow.",
    aiRecommendations: {
      primaryResponse: "Dispatch swift-water rescue craft immediately to extract stranded vehicles. Set up sandbag pumps and redirect all northbound traffic.",
      requiredResources: [
        { type: "RESCUE_TEAM", quantity: 1 },
        { type: "HELICOPTER", quantity: 1 }
      ],
      safetyPrecautions: [
        "Avoid wading without tethered safety harnesses.",
        "Monitor local dam discharge rates continuously.",
        "Check for underwater electrical hazards from utility poles."
      ],
      priorityLevel: 95
    },
    allocatedResources: [],
    timeline: [
      {
        timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
        title: "Automated Level Alert",
        description: "Telemetry reports flood sensor exceeds critical 4.2m datum line.",
        agentName: "Incident Analysis Agent"
      },
      {
        timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
        title: "Orchestration Alert",
        description: "Commander triggers high alert. Requests immediate resource matching.",
        agentName: "Commander Agent"
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: "aud-001",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    userEmail: "taniyagarg1007@gmail.com",
    role: "COMMANDER",
    action: "SESSION_ESTABLISHED",
    details: "Command session authenticated and verified under Sector 4 rules.",
    ipAddress: "10.142.0.24",
    status: "SUCCESS"
  },
  {
    id: "aud-002",
    timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    userEmail: "taniyagarg1007@gmail.com",
    role: "COMMANDER",
    action: "DISPATCH_RESOURCE",
    details: "Authorized dispatch of Hotshot Crew 8 to Fire Incident inc-2026-001.",
    ipAddress: "10.142.0.24",
    status: "SUCCESS"
  },
  {
    id: "aud-003",
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    userEmail: "guest_dispatcher@crisisops.ai",
    role: "DISPATCHER",
    action: "UPDATE_INCIDENT_STATUS",
    details: "Elevated flood blockade incident inc-2026-002 to CRITICAL status.",
    ipAddress: "192.168.42.11",
    status: "SUCCESS"
  }
];

export const INITIAL_MISSING_PERSONS: MissingPerson[] = [
  {
    id: "mp-101",
    name: "Aarav Sharma",
    age: 28,
    gender: "Male",
    lastKnownLocation: "Ridgecrest Dr near Trailhead",
    lastSeenTime: "3 hours ago",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    status: "MISSING",
    notes: "Was wearing a blue windbreaker and hiking boots. Evacuated near Ridgecrest Dr forest boundaries."
  },
  {
    id: "mp-102",
    name: "Priya Patel",
    age: 64,
    gender: "Female",
    lastKnownLocation: "Route 10B Delta Underpass",
    lastSeenTime: "1 hour ago",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    status: "MATCH_FOUND",
    matchConfidence: 94,
    notes: "Driving a grey sedan. Face recognized on municipal flood evacuation toll camera 14B."
  },
  {
    id: "mp-103",
    name: "John Doe",
    age: 42,
    gender: "Male",
    lastKnownLocation: "Cascadia Foothills Campgrounds",
    lastSeenTime: "6 hours ago",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    status: "LOCATED",
    notes: "Successfully found by Search & Rescue Unit Alpha. Currently resting at St. Jude Crisis Shelter Node."
  }
];

export const INITIAL_SOCIAL_FEED: SocialFeedEntry[] = [
  {
    id: "soc-301",
    username: "Rohan_K",
    handle: "@rohan_wildfire_watch",
    text: "Heavy smoke plume rising fast over the Ridgecrest area! Winds are blowing it directly towards suburban homes. Emergency sirens can be heard. Evacuate now!",
    time: "12 mins ago",
    platform: "X",
    detectedDisaster: "Wildfire",
    urgency: "HIGH",
    location: "Ridgecrest Dr & Pine Trail",
    lat: 45.4210,
    lng: -122.4600,
    peopleAffected: 8,
    isImported: false
  },
  {
    id: "soc-302",
    username: "DeltaResident",
    handle: "@delta_flood_updates",
    text: "The delta dike is overtopping. Route 10B is completely waterlogged. I see at least three cars floating near the delta underpass, we need boats immediately!",
    time: "24 mins ago",
    platform: "Citizen",
    detectedDisaster: "Flash Flood",
    urgency: "CRITICAL",
    location: "Route 10B Delta Underpass",
    lat: 45.5820,
    lng: -122.7150,
    peopleAffected: 15,
    isImported: true
  },
  {
    id: "soc-303",
    username: "NatureLover88",
    handle: "@nature_wanderer",
    text: "Downed power line sparks noticed near Foothills park entrance during strong high winds. Dry brush nearby represents a major ignition risk. Emergency services notified.",
    time: "45 mins ago",
    platform: "X",
    detectedDisaster: "Wildfire",
    urgency: "MEDIUM",
    location: "Southeastern Foothills",
    lat: 45.4290,
    lng: -122.4810,
    peopleAffected: 0,
    isImported: false
  }
];

