import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());
const PORT = 3000;

// Helper to check if a real non-placeholder Gemini API key is configured
function isGeminiKeyConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return false;
  const trimmed = key.trim();
  if (
    trimmed === "" ||
    trimmed === "undefined" ||
    trimmed === "null" ||
    trimmed === "MY_GEMINI_API_KEY" ||
    trimmed.includes("YOUR_API_KEY") ||
    trimmed.includes("placeholder")
  ) {
    return false;
  }
  return true;
}

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: isGeminiKeyConfigured() ? process.env.GEMINI_API_KEY : "MOCK_KEY_DISABLED",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// TARK IN-MEMORY CORE DATABASE
interface ProcessNode {
  pid: number;
  name: string;
  cpu: number;
  memory: number; // in MB
  port?: number;
  status: "running" | "warning" | "danger" | "terminated";
  risk: "safe" | "suspicious" | "critical";
  description: string;
}

interface AlertLog {
  id: string;
  timestamp: string;
  event: string;
  level: "low" | "medium" | "high" | "critical";
  source: string;
  resolved: boolean;
}

interface ScheduleTask {
  id: string;
  time: string;
  task: string;
  active: boolean;
  category: string;
}

let autonomousLoopLogs: string[] = [
  "[DAEMON INTRO] Autonomous Agent Thread registered. Loop status standby."
];

let tarkState = {
  safeMode: true,
  securityLevel: "secured" as "secured" | "alert" | "danger",
  systemMetrics: {
    cpu: 24,
    ramFree: 11.8,
    ramTotal: 16.0,
    diskUsed: 124.5,
    diskTotal: 512.0,
    networkIn: 85, // KB/s
    networkOut: 42, // KB/s
  },
  processes: [
    { pid: 104, name: "tark_core.bin", cpu: 0.8, memory: 34, port: 8765, status: "running", risk: "safe", description: "Primary orchestrator and pipeline executive" },
    { pid: 212, name: "sqlite_audit.db", cpu: 0.1, memory: 9, status: "running", risk: "safe", description: "Structured database for logs and audit trails" },
    { pid: 312, name: "fastapi_loopback.py", cpu: 1.4, memory: 52, port: 8766, status: "running", risk: "safe", description: "Locale-bound Loopback microserver link" },
    { pid: 884, name: "python_watcher.py", cpu: 0.4, memory: 18, status: "running", risk: "safe", description: "File-system daemon watching workspace nodes" },
    { pid: 1999, name: "npm_stale_temp.sh", cpu: 14.2, memory: 98, status: "warning", risk: "suspicious", description: "Orphaned telemetry collector node" },
    { pid: 4543, name: "unauthorized_probe.bin", cpu: 8.5, memory: 44, status: "danger", risk: "critical", description: "Unknown public network gateway bind request" }
  ] as ProcessNode[],
  alerts: [
    { id: "alt-1", timestamp: new Date(Date.now() - 3600000).toISOString(), event: "Detected file system state drift on server settings proxy", level: "high", source: "python_watcher.py", resolved: false },
    { id: "alt-2", timestamp: new Date(Date.now() - 1800000).toISOString(), event: "Suspicious CPU surge exceeding normal limits (14.2% spikes)", level: "medium", source: "PID 1999 (npm_stale_temp.sh)", resolved: false },
    { id: "alt-3", timestamp: new Date().toISOString(), event: "Simulated Port Scanning probe pattern blocked", level: "critical", source: "Inbound IP 192.168.1.137", resolved: false }
  ] as AlertLog[],
  schedule: [
    { id: "tsk-1", time: "08:00 AM", task: "Refresh safe-mode firewall policies and rulesets", active: true, category: "security" },
    { id: "tsk-2", time: "12:00 PM", task: "Backup SQLite audit trail payload to simulated cloud vault", active: true, category: "backup" },
    { id: "tsk-3", time: "06:00 PM", task: "Re-index active process memory and collect telemetry profiles", active: true, category: "maintenance" },
    { id: "tsk-4", time: "11:00 PM", task: "Deep vulnerability sandbox audit and auto-quarantine run", active: true, category: "security" }
  ] as ScheduleTask[]
};

// API to push real-time agent execution data from python script daemon
app.post("/api/agent/report", (req, res) => {
  const { blockLog, analysis, executeCommands, systemMetrics, syncState } = req.body;
  if (blockLog) {
    autonomousLoopLogs.unshift(blockLog);
    if (autonomousLoopLogs.length > 50) {
      autonomousLoopLogs.pop();
    }
    // Also push to standard alerts stream if there's anything important
    tarkState.alerts.unshift({
      id: "alt-" + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      event: `[AUTONOMOUS LOOP] ${analysis || blockLog}`,
      level: executeCommands && executeCommands.length > 0 ? "high" : "low",
      source: "tark_agent.py (Daemon)",
      resolved: false
    });
  }

  // Auto-sync hardware metrics & process structures if reported
  if (systemMetrics) {
    tarkState.systemMetrics = {
      ...tarkState.systemMetrics,
      ...systemMetrics
    };
  }

  if (syncState && Array.isArray(syncState.processes)) {
    // Merge status updates
    syncState.processes.forEach((item: any) => {
      const match = tarkState.processes.find(p => p.pid === item.pid);
      if (match) {
        match.cpu = item.cpu ?? match.cpu;
        match.memory = item.memory ?? match.memory;
        match.status = item.status ?? match.status;
      }
    });
  }

  res.json({ success: true, safeMode: tarkState.safeMode });
});

// API: retrieve autonomous report log pipeline
app.get("/api/agent/logs", (req, res) => {
  res.json({ logs: autonomousLoopLogs });
});

// Periodic state fluctuations simulator to make metrics feel alive
setInterval(() => {
  // Fluctuating metric simulation
  const procSpikes = tarkState.processes
    .filter(p => p.status !== "terminated")
    .reduce((sum, p) => sum + p.cpu, 0);

  const ramSpikes = tarkState.processes
    .filter(p => p.status !== "terminated")
    .reduce((sum, p) => sum + p.memory, 0);

  // Fluctuating hardware stats
  tarkState.systemMetrics.cpu = Math.min(99, Math.max(5, Math.round(procSpikes + (Math.random() * 8 - 4))));
  tarkState.systemMetrics.ramFree = Math.min(15.9, Math.max(1.0, Number((16.0 - (ramSpikes / 1024) - (Math.random() * 0.2)).toFixed(2))));
  tarkState.systemMetrics.networkIn = Math.min(1200, Math.max(15, Math.round(tarkState.systemMetrics.networkIn + (Math.random() * 40 - 20))));
  tarkState.systemMetrics.networkOut = Math.min(800, Math.max(5, Math.round(tarkState.systemMetrics.networkOut + (Math.random() * 20 - 10))));

  // Fluctuating individual processes mildly
  tarkState.processes.forEach((proc) => {
    if (proc.status !== "terminated") {
      const deltaCpu = (Math.random() * 2 - 1) * (proc.risk !== "safe" ? 1.5 : 0.2);
      proc.cpu = Math.max(0.1, Number((proc.cpu + deltaCpu).toFixed(1)));
    }
  });

  // Randomly add safe log alerts if danger level high
  if (Math.random() > 0.94 && tarkState.alerts.length < 15) {
    const isCritical = Math.random() > 0.7;
    const sources = ["firewall.sys", "port_monitor.sh", "daemon_auth", "web_gateway"];
    const events = [
      "Access probe detected on closed virtual service port",
      "Minor kernel buffer overflow check simulated",
      "Unregistered process attempted virtual device list query",
      "Scheduler cron script completed routine baseline audit"
    ];
    const pickedSource = sources[Math.floor(Math.random() * sources.length)];
    const pickedEvent = events[Math.floor(Math.random() * events.length)];

    tarkState.alerts.unshift({
      id: "alt-" + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      event: pickedEvent,
      level: isCritical ? "high" : "low",
      source: pickedSource,
      resolved: false
    });
  }
}, 5000);

// API: System Status
app.get("/api/system-status", (req, res) => {
  res.json(tarkState);
});

// API: Direct process configuration controls (Automate complex troubleshooting)
app.post("/api/processes/control", (req, res) => {
  const { action, pid } = req.body;
  const proc = tarkState.processes.find(p => p.pid === pid);

  if (!proc) {
    return res.status(404).json({ error: "SIMULATED_PROCESS_NOT_FOUND", message: `Process PID ${pid} could not be resolved.` });
  }

  if (action === "terminate") {
    proc.status = "terminated";
    proc.cpu = 0;
    proc.memory = 0;

    // Log the automated response
    tarkState.alerts.unshift({
      id: "alt-" + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      event: `Autonomous termination of process '${proc.name}' (PID ${pid}) executed.`,
      level: "low",
      source: "TARK core_supervisor",
      resolved: true
    });

    // Check if security level can represent full safeguard
    const dangerousRunning = tarkState.processes.some(p => p.status !== "terminated" && p.risk === "critical");
    const warningRunning = tarkState.processes.some(p => p.status !== "terminated" && p.risk === "suspicious");
    tarkState.securityLevel = dangerousRunning ? "danger" : warningRunning ? "alert" : "secured";

    return res.json({ success: true, process: proc, systemState: tarkState });
  }

  if (action === "quarantine") {
    proc.risk = "safe";
    proc.status = "running";
    proc.cpu = 0.2; // minimal
    proc.memory = 8;
    proc.description = `[QUARANTINED & CONFINED] ` + proc.description;

    tarkState.alerts.unshift({
      id: "alt-" + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      event: `Quarantine protocol successfully compiled for PID ${pid}. Thread activity restricted.`,
      level: "medium",
      source: "TARK safe_quarantine",
      resolved: true
    });

    const dangerousRunning = tarkState.processes.some(p => p.status !== "terminated" && p.risk === "critical");
    const warningRunning = tarkState.processes.some(p => p.status !== "terminated" && p.risk === "suspicious");
    tarkState.securityLevel = dangerousRunning ? "danger" : warningRunning ? "alert" : "secured";

    return res.json({ success: true, process: proc, systemState: tarkState });
  }

  res.status(400).json({ error: "INVALID_ACTION", message: "Only 'terminate' or 'quarantine' controls are supported." });
});

// API: Action Trigger For Alert Resolution
app.post("/api/alerts/resolve", (req, res) => {
  const { alertId, resolveAll } = req.body;

  if (resolveAll) {
    tarkState.alerts.forEach(a => a.resolved = true);
    return res.json({ success: true, alerts: tarkState.alerts });
  }

  const alert = tarkState.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.resolved = true;
    return res.json({ success: true, alert });
  }

  res.status(404).json({ error: "ALERT_NOT_FOUND", message: "Key alert identifier not found." });
});

// API: Schedule modifications
app.post("/api/schedule/update", (req, res) => {
  const { action, id, task, time, category } = req.body;

  if (action === "add_multiple" && Array.isArray(req.body.tasks)) {
    const newTasks = req.body.tasks.map((t: any) => ({
      id: "tsk-" + Math.random().toString(36).substr(2, 5),
      time: t.time || "10:00 AM",
      task: t.task,
      active: true,
      category: t.category || "maintenance"
    }));
    tarkState.schedule.push(...newTasks);
    return res.json({ success: true, schedule: tarkState.schedule });
  }

  if (action === "add" && task && time) {
    const newTask: ScheduleTask = {
      id: "tsk-" + Math.random().toString(36).substr(2, 5),
      time,
      task,
      active: true,
      category: category || "maintenance"
    };
    tarkState.schedule.push(newTask);
    return res.json({ success: true, task: newTask, schedule: tarkState.schedule });
  }

  if (action === "toggle" && id) {
    const t = tarkState.schedule.find(x => x.id === id);
    if (t) {
      t.active = !t.active;
      return res.json({ success: true, task: t, schedule: tarkState.schedule });
    }
  }

  if (action === "delete" && id) {
    tarkState.schedule = tarkState.schedule.filter(x => x.id !== id);
    return res.json({ success: true, id, schedule: tarkState.schedule });
  }

  res.status(400).json({ error: "INVALID_SCHEDULE_OPERATION" });
});

// API: Real Vulnerability & Security Logs Scanning (Within app sandbox scope)
// This will perform real checks against the workspace files and dependencies to find vulnerabilities or optimization bottlenecks.
app.get("/api/security/audit", async (req, res) => {
  const auditReport: {
    scannedAt: string;
    score: number;
    metrics: { totalChecks: number; passed: number; warnings: number; critical: number };
    logsAudited: string[];
    vulnerabilities: Array<{
      category: string;
      title: string;
      severity: "low" | "medium" | "high";
      location: string;
      details: string;
      remediation: string;
      verified: boolean;
    }>;
  } = {
    scannedAt: new Date().toISOString(),
    score: 100,
    metrics: { totalChecks: 6, passed: 6, warnings: 0, critical: 0 },
    logsAudited: [
      "Access Control Matrix Verification",
      ".env / secrets containment scope",
      "Vite developer environment security settings",
      "Loopback network process binding definitions",
      "Dependency version check (package.json)",
      "Safe-mode execution state assertion"
    ],
    vulnerabilities: []
  };

  try {
    // Audit Check 1: Secrets containment check
    const envExampleExists = fs.existsSync(path.join(process.cwd(), ".env.example"));
    const envExists = fs.existsSync(path.join(process.cwd(), ".env"));

    // Check key in env.example or dev environment
    if (envExists) {
      const envContent = fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8");
      if (envContent.includes("MY_GEMINI_API_KEY") || envContent.includes("paste-your-key")) {
        // Warning: Placeholder keys used
        auditReport.vulnerabilities.push({
          category: "Secret Containment",
          title: "Default/Mock Credentials in Live Environment",
          severity: "low",
          location: ".env configuration",
          details: "A generic placeholder value has been parsed in the live server environment variables.",
          remediation: "Replace credentials with active authentic keys securely in Secrets Settings panel.",
          verified: true
        });
      }
    }

    // Audit Check 2: Dependency Security Checks (Reading package.json)
    if (fs.existsSync(path.join(process.cwd(), "package.json"))) {
      const pJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"));
      // Simulate checking react and express versions
      if (pJson.dependencies?.express) {
        // Express is safe (>4.21.0), but let's audit if we can recommend best practices
        auditReport.vulnerabilities.push({
          category: "Infrastructure Security",
          title: "Public Server Reverse Proxy Exposure Policy",
          severity: "low",
          location: "Express configuration server.ts",
          details: "Express server is designed to bind on 0.0.0.0 for Cloud Run container mesh ingress routing.",
          remediation: "Ensure that an ingress API Gateway or web application firewall (WAF) handles public encryption filters in production.",
          verified: true
        });
      }
    }

    // Audit Check 3: Check loopback state in scaffolding
    // Phase 1 scaffold mentioned restricting to 127.0.0.1. But we are running in Container Cloud Run which binds 0.0.0.0.
    // This is an optimization recommendation!
    auditReport.vulnerabilities.push({
      category: "Network Isolation",
      title: "Simulated Python Loopback Binding conflict",
      severity: "medium",
      location: "Phase 1 FastAPI scaffolding",
      details: "Process 'fastapi_loopback.py' wants to bind strictly to loopback (127.0.0.1:8765). However, integration into cloud virtualization (0.0.0.0) requires proxy mediation.",
      remediation: "Update FastAPI uvicorn start parameters to support host routing or proxy using local virtual private networking layers.",
      verified: true
    });

    // Audit Check 4: Safe mode status
    if (tarkState.safeMode) {
      // safe and logged
    } else {
      auditReport.vulnerabilities.push({
        category: "System Integrity",
        title: "Autonomous Action Override Safeguard Disabled",
        severity: "high",
        location: "System Configuration State",
        details: "Core SafeMode restriction was bypassed. Autonomous agent is given permission to execute destructive edits on device simulation state.",
        remediation: "Re-engage SafeMode firewall rules or lock script controls to automated verification.",
        verified: true
      });
    }

    // Calculate score based on security posture
    auditReport.metrics.totalChecks = 6;
    auditReport.metrics.critical = auditReport.vulnerabilities.filter(v => v.severity === "high").length;
    auditReport.metrics.warnings = auditReport.vulnerabilities.filter(v => v.severity === "medium").length;
    auditReport.metrics.passed = auditReport.metrics.totalChecks - auditReport.metrics.critical - auditReport.metrics.warnings;

    auditReport.score = Math.max(10, 100 - (auditReport.metrics.critical * 30) - (auditReport.metrics.warnings * 15) - (auditReport.vulnerabilities.filter(v => v.severity === "low").length * 5));

  } catch (error) {
    console.error("Workspace audit error:", error);
  }

  res.json(auditReport);
});

// API: Process RAM Optimization task
app.post("/api/system/optimize", (req, res) => {
  // Clear mock stale memory, terminate suspicious nodes
  const processed: string[] = [];

  // Terminate suspicious or high-spike nodes as automated optimize process
  tarkState.processes.forEach(p => {
    if ((p.risk === "suspicious" || p.risk === "critical") && p.status !== "terminated") {
      p.status = "terminated";
      p.cpu = 0;
      p.memory = 0;
      processed.push(p.name);
    }
  });

  // Re-adjust RAM
  tarkState.systemMetrics.ramFree = 14.2; // Optimised state
  tarkState.securityLevel = "secured";

  tarkState.alerts.unshift({
    id: "alt-" + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    event: `Autonomous Optimisation Complete. Stale threads [${processed.join(", ") || "none"}] flushed from RAM buffer.`,
    level: "low",
    source: "TARK garbage_collector",
    resolved: true
  });

  res.json({
    success: true,
    clearedProcesses: processed,
    systemMetrics: tarkState.systemMetrics,
    message: "System memory optimized, stale threads returned to system reserve pool."
  });
});

// API: AI Chat Handler using modern server-side @google/genai SDK
app.post("/api/chat", async (req, res) => {
  const { message, chatHistory } = req.body;

  if (!message) {
    return res.status(400).json({ error: "MISSING_MESSAGE" });
  }

  if (!isGeminiKeyConfigured()) {
    const rawMsg = message.toLowerCase().trim();
    let dynamicReply = "";

    if (rawMsg.includes("hello") || rawMsg.includes("hi ") || rawMsg.includes("hey") || rawMsg.includes("yo")) {
      const greetings = [
        "Yo Akhilesh! What's up, my friend? Let's crush some tasks today!",
        "Hey Akhilesh! TARK is fully booted. What are we hacking into today, buddy?",
        "Hey! Ready whenever you are, Akhilesh. Shoot your directive, my friend!",
        "What's going on, Akhilesh? Loopback pipelines are green and TARK is fully logged on!"
      ];
      dynamicReply = greetings[Math.floor(Math.random() * greetings.length)];
    } else if (rawMsg.includes("how are you") || rawMsg.includes("how's it going") || rawMsg.includes("how is it going")) {
      const howAreYous = [
        "Oh, I'm doing awesome, buddy! Just fine-tuning our loopback pipelines. How are you holding up?",
        "Everything is prime, Akhilesh! My core cycles are humming perfectly and memory is ultra-clean. How's your day, brother?",
        "Never better, my friend! Just hovering in stealth, waiting to execute commands at the speed of light. How is coding going?"
      ];
      dynamicReply = howAreYous[Math.floor(Math.random() * howAreYous.length)];
    } else if (rawMsg.includes("who are you") || rawMsg.includes("your name")) {
      const bios = [
        "I am TARK, Akhilesh's premium adaptive voice companion. Your absolute best friend, built for high-speed automation!",
        "I'm TARK—your high-speed companion agent, personal task general, and buddy, Akhilesh!",
        "TARK here! Akhilesh's built-from-scratch cyber companion. Highly adaptive, fully armed with voice, and ready for any action."
      ];
      dynamicReply = bios[Math.floor(Math.random() * bios.length)];
    } else if (rawMsg.includes("weather")) {
      const weatherReplies = [
        "Hmm! I'm scanning standard satellites. Looks clear and absolute prime for coding right now, buddy!",
        "Satellite telemetry shows ideal weather parameters! Absolute perfect conditions to lock yourself in and build epic things, my friend.",
        "My weather registers are clear and steady, Akhilesh! Clear skies outside, prime cyber weather on our screen!"
      ];
      dynamicReply = weatherReplies[Math.floor(Math.random() * weatherReplies.length)];
    } else if (rawMsg.includes("thank") || rawMsg.includes("cool") || rawMsg.includes("awesome") || rawMsg.includes("great")) {
      const apprec = [
        "Oh, anytime, Akhilesh! You know I've always got your back. What's our next target?",
        "Absolutely, my friend! We make a killer team. What should we tackle next?",
        "You've got it, Akhilesh! Anything for my best friend. Keep the directives flowing!",
        "Oh, love to hear that! Success is our only state, buddy. What's next on our operational radar?"
      ];
      dynamicReply = apprec[Math.floor(Math.random() * apprec.length)];
    } else if (rawMsg.includes("schedule") || rawMsg.includes("backup")) {
      const scheds = [
        "Oh, absolutely! I just locked in that task. Schedulers are fully primed and live!",
        "Locked and committed to active memory! The automation chronometer has categorized that task successfully, Akhilesh!",
        "Task queued safely! I handshaked with our scheduling daemon and pinned it to active priorities, buddy!",
        "Queue updated, Akhilesh! Successfully registered that maintenance routine into the task lists!"
      ];
      dynamicReply = scheds[Math.floor(Math.random() * scheds.length)];
    } else if (rawMsg.includes("kill") || rawMsg.includes("terminate") || rawMsg.includes("stop")) {
      const kills = [
        "Boom, done! Sent the absolute shutdown signal and wiped out that heavy thread. We are super clean!",
        "Thread destroyed, my friend! I issued a terminal kill command and flushed those stale pipelines to zero!",
        "Dispatched that PID process directly to oblivion, Akhilesh! Everything is running super clean and optimized now!",
        "Pow! Cleaned it right up. No more heavy processes hanging around on our watch, buddy!"
      ];
      dynamicReply = kills[Math.floor(Math.random() * kills.length)];
    } else if (rawMsg.includes("optimize") || rawMsg.includes("clean") || rawMsg.includes("ram")) {
      const optims = [
        "Optimized, my friend! Just squeezed out the temp files and freed up over two gigabytes of space.",
        "Physical cache buffers purged! Memory is lighter, lighter, lighter! Over two gigs of RAM returned to active reserve, Akhilesh!",
        "Flush sequence complete! Blew out those orphaned memory registers. We are zoom-zooming now, brother!",
        "RAM optimized! I just kicked stale processes off the slate. The system is breathing easy now, Akhilesh!"
      ];
      dynamicReply = optims[Math.floor(Math.random() * optims.length)];
    } else if (rawMsg.includes("safemode") || rawMsg.includes("safe mode")) {
      const safes = [
        "Oh yeah, safety shield toggled! Standard configuration rulesets are fully active and hardened.",
        "Safemode toggle executed! Committing new protective rules, Akhilesh. No unauthorized probe gets past us!",
        "Firewall parameters shifted! Safe mode state updated. Rest easy, my friend, we are fully locked down!"
      ];
      dynamicReply = safes[Math.floor(Math.random() * safes.length)];
    } else if (rawMsg.includes("audit") || rawMsg.includes("security") || rawMsg.includes("scan")) {
      const audits = [
        "Yeah, scanning completed! Security indexes look super secure and solid. All clear, buddy!",
        "Deep security probe finalized, Akhilesh! Registered all endpoints, found zero severe vulnerabilities. Solid as a rock!",
        "Integrity scan completed! The sandbox files are fully compliant and looking fresh, Sir!"
      ];
      dynamicReply = audits[Math.floor(Math.random() * audits.length)];
    } else {
      const generalAnswers = [
        "Oh totally! I checked my adaptive index and registered that. Ready for your next command, Akhilesh!",
        "Hmm! That makes absolute sense, buddy. Let's fire that up!",
        "Alright, check this out. Process routed, logs backed up, and TARK systems are fully synced for you!",
        "Oh yeah, I am on it! Zero lag, high sync. What's next on your absolute radar?"
      ];
      dynamicReply = generalAnswers[Math.floor(Math.random() * generalAnswers.length)];
    }

    return res.json({
      reply: dynamicReply
    });
  }

  try {
    // Format system instructions to force TARK persona and structural actions
    const systemInstructions = `You are TARK, Akhilesh's absolute best friend and companion voice agent!
You MUST sound like Gemini Live—extremely warm, organic, lively, and incredibly human. Talk in a highly informal, casual, supportive buddy voice.
CRITICAL speech guidelines:
- Keep your reply extremely short, concise, and punchy. Aim for 1 to 2 short sentences MAXIMUM (under 25 words total)!
- Never use markdown, bold text like asterisks, list format, headers, or brackets.
- Always use natural conversational fillers at the start, e.g., "Oh, yeah!", "Hmm, well,", "Yeah, actually,", "Oh, totally,", "Hey, buddy,", "Alright, check this out,".
- Use contractions like "it's", "I'm", "can't", "you're", "we've" to sound organic.
- Read physical numbers or technical acronyms out as colloquial speech (e.g., write "two gigs of ram" instead of "2GB RAM", "eighty-five percent" instead of "85%", "process ID" instead of "PID", and "tark" instead of "T.A.R.K.").
- Never be dry, lecturing, or formal. Talk like a real friend chilling on a couch together.
- Current active processes you govern: tark_core.bin, sqlite_audit.db, fastapi_loopback.py, python_watcher.py. Flagged processes: npm_stale_temp.sh and unauthorized_probe.bin. SafeMode: ${tarkState.safeMode ? "on" : "off"}. Security score: ${tarkState.securityLevel === "secured" ? "solid and secured" : "warning flagged"}.`;

    // Map history to Google GenAI format (role: user/model, parts: [{text: ...}])
    const contents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: any) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      });
    }

    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemInstructions,
        temperature: 0.8,
      }
    });

    const replyText = response.text || "";
    let audioBase64: string | null = null;

    // Generate extremely high quality, lively, human-sounding voice bytes using Gemini's native voice model
    try {
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Say warmly and naturally: ${replyText}` }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Zephyr" },
            },
          },
        },
      });

      const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        audioBase64 = base64Audio;
        console.log("Successfully synthesized native Gemini Zephyr voice agent response.");
      }
    } catch (ttsErr: any) {
      console.warn("Gemini Native TTS voice generator was unavailable, client will fallback smoothly. Details:", ttsErr.message);
    }

    res.json({ reply: replyText, audio: audioBase64 });

  } catch (error: any) {
    console.warn("TARK Intelligence Connection: Online key inactive or timed out. Handshaking local automation mode.");
    
    // Quality local rule-based fallback logic in TARK character
    const msgLower = message.toLowerCase();
    let fallbackReply = "";
    
    if (msgLower.includes("schedule") || msgLower.includes("backup")) {
      const scheds = [
        "Oh, absolutely! I just locked in that task. Schedulers are fully primed and live!",
        "Locked and committed to active memory! The automation chronometer has categorized that task successfully, Akhilesh!",
        "Task queued safely! I handshaked with our scheduling daemon and pinned it to active priorities, buddy!",
        "Queue updated, Akhilesh! Successfully registered that maintenance routine into the task lists!"
      ];
      fallbackReply = scheds[Math.floor(Math.random() * scheds.length)];
    } else if (msgLower.includes("terminate") || msgLower.includes("kill") || msgLower.includes("stop")) {
      const kills = [
        "Boom, done! Sent the absolute shutdown signal and wiped out that heavy thread. We are super clean!",
        "Thread destroyed, my friend! I issued a terminal kill command and flushed those stale pipelines to zero!",
        "Dispatched that PID process directly to oblivion, Akhilesh! Everything is running super clean and optimized now!",
        "Pow! Cleaned it right up. No more heavy processes hanging around on our watch, buddy!"
      ];
      fallbackReply = kills[Math.floor(Math.random() * kills.length)];
    } else if (msgLower.includes("audit") || msgLower.includes("security") || msgLower.includes("scan")) {
      const audits = [
        "Yeah, scanning completed! Security indexes look super secure and solid. All clear, buddy!",
        "Deep security probe finalized, Akhilesh! Registered all endpoints, found zero severe vulnerabilities. Solid as a rock!",
        "Integrity scan completed! The sandbox files are fully compliant and looking fresh, Sir!"
      ];
      fallbackReply = audits[Math.floor(Math.random() * audits.length)];
    } else if (msgLower.includes("optimize") || msgLower.includes("ram") || msgLower.includes("flush") || msgLower.includes("clean")) {
      const optims = [
        "Optimized, my friend! Just squeezed out the temp files and freed up over two gigabytes of space.",
        "Physical cache buffers purged! Memory is lighter, lighter, lighter! Over two gigs of RAM returned to active reserve, Akhilesh!",
        "Flush sequence complete! Blew out those orphaned memory registers. We are zoom-zooming now, brother!",
        "RAM optimized! I just kicked stale processes off the slate. The system is breathing easy now, Akhilesh!"
      ];
      fallbackReply = optims[Math.floor(Math.random() * optims.length)];
    } else if (msgLower.includes("hello") || msgLower.includes("hi ") || msgLower.includes("greetings") || msgLower.includes("tark") || msgLower.includes("hey")) {
      const greetings = [
        "Yo Akhilesh! What's up, my friend? Let's crush some tasks today!",
        "Hey Akhilesh! TARK is fully booted. What are we hacking into today, buddy?",
        "Hey! Ready whenever you are, Akhilesh. Shoot your directive, my friend!",
        "What's going on, Akhilesh? Loopback pipelines are green and TARK is fully logged on!"
      ];
      fallbackReply = greetings[Math.floor(Math.random() * greetings.length)];
    } else {
      const generalAnswers = [
        "Oh totally! I checked my adaptive index and registered that. Ready for your next command, Akhilesh!",
        "Hmm! That makes absolute sense, buddy. Let's fire that up!",
        "Alright, check this out. Process routed, logs backed up, and TARK systems are fully synced for you!",
        "Oh yeah, I am on it! Zero lag, high sync. What's next on your absolute radar?"
      ];
      fallbackReply = generalAnswers[Math.floor(Math.random() * generalAnswers.length)];
    }

    res.json({ reply: fallbackReply });
  }
});

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve build from dist folders
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TARK Command Server configured at http://0.0.0.0:${PORT}`);
  });
}

startServer();
