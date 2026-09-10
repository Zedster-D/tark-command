export interface ProcessNode {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  port?: number;
  status: "running" | "warning" | "danger" | "terminated";
  risk: "safe" | "suspicious" | "critical";
  description: string;
}

export interface AlertLog {
  id: string;
  timestamp: string;
  event: string;
  level: "low" | "medium" | "high" | "critical";
  source: string;
  resolved: boolean;
}

export interface ScheduleTask {
  id: string;
  time: string;
  task: string;
  active: boolean;
  category: string;
}

export interface SystemMetrics {
  cpu: number;
  ramFree: number;
  ramTotal: number;
  diskUsed: number;
  diskTotal: number;
  networkIn: number;
  networkOut: number;
}

export interface TarkSystemState {
  safeMode: boolean;
  securityLevel: "secured" | "alert" | "danger";
  systemMetrics: SystemMetrics;
  processes: ProcessNode[];
  alerts: AlertLog[];
  schedule: ScheduleTask[];
}

export interface VulnerabilityCheck {
  category: string;
  title: string;
  severity: "low" | "medium" | "high";
  location: string;
  details: string;
  remediation: string;
  verified: boolean;
}

export interface AuditReport {
  scannedAt: string;
  score: number;
  metrics: {
    totalChecks: number;
    passed: number;
    warnings: number;
    critical: number;
  };
  logsAudited: string[];
  vulnerabilities: VulnerabilityCheck[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  audio?: string;
}

export interface LearnedTask {
  id: string;
  command: string;
  resolvedPattern: string;
  target: string;
  timestamp: string;
  hits: number;
  confidence: string;
}

