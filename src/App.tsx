import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Cpu,
  Database,
  Activity,
  AlertTriangle,
  Clock,
  Shield,
  ShieldCheck,
  Zap,
  Play,
  RotateCw,
  Power,
  Trash2,
  ListRestart,
  Sliders,
  Send,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  FolderLock,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Radio
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TarkSystemState, AuditReport, ChatMessage, ProcessNode, ScheduleTask, AlertLog, LearnedTask } from "./types";
import { VoiceSphere } from "./components/VoiceSphere";

// Generates dynamic cyber recommendations based on learned task execution frequency hits
const getAIRecommendations = (tasks: LearnedTask[]) => {
  if (tasks.length === 0) {
    return [
      {
        id: "rec-1",
        title: "Initialize Adaptive Training",
        action: "optimize ram",
        desc: "Provide baseline system diagnostics by invoking the automated RAM swap/clean process.",
        reason: "No tasks are currently indexed in neural cache.",
        badge: "SYSTEM START"
      }
    ];
  }

  // Sort tasks by hit counts (descending frequency) to find top actions
  const sorted = [...tasks].sort((a, b) => b.hits - a.hits);
  const recommendations = [];

  const topTask = sorted[0];
  const secTask = sorted[1];

  // 1. Core top hit optimization advice
  if (topTask) {
    if (topTask.command.includes("binance") || topTask.command.includes("trading") || topTask.command.includes("crypto") || topTask.command.includes("chart")) {
      recommendations.push({
        id: "rec-top",
        title: "Asset Analysis Synergizer",
        action: "go to tradingview",
        desc: `Since you frequently launch "${topTask.command}" (${topTask.hits} times), TARK recommends loading TradingView charting nodes in parallel to track trends.`,
        reason: `Correlates with high-frequency trading portal usage`,
        badge: "MARKET WATCH"
      });
    } else if (topTask.command.includes("ram") || topTask.command.includes("optimize") || topTask.command.includes("system")) {
      recommendations.push({
        id: "rec-top",
        title: "Heuristic Thread Pruning",
        action: "kill process 1999",
        desc: "Frequent memory reclaims active. Analyze host background logs and shut down dormant mock process headers.",
        reason: "Matches periodic maintenance directives trigger",
        badge: "THREAD KILL"
      });
    } else {
      // Default top choice fallback
      recommendations.push({
        id: "rec-top",
        title: `Automate Peak Route: "${topTask.command}"`,
        action: topTask.command,
        desc: `This task remains your absolute primary workflow. Set up a Cron trigger to launch this pathway automatically.`,
        reason: `Highest density traffic index with ${topTask.hits} hits`,
        badge: "HIGH ACTIVITY"
      });
    }
  }

  // 2. Secondary contextual suggestions
  if (secTask) {
    recommendations.push({
      id: "rec-sec",
      title: "Context Portal Speedup",
      action: "search youtube for lofi jazz",
      desc: "Maintain peak dev focus. TARK suggests loading continuous ambient background lofi streams via fast media routes.",
      reason: "Optimize workstation neural flow state",
      badge: "MEDIA SYNC"
    });
  } else {
    // Standard system audit booster
    recommendations.push({
      id: "rec-sec",
      title: "Proactive Security Audits",
      action: "optimize ram",
      desc: "Re-run RAM optimization algorithms to stabilize host threads and keep heap allocations secure.",
      reason: "Ensure resource headroom is maintained",
      badge: "SYS DEFENSE"
    });
  }

  return recommendations;
};

export default function App() {
  // Primary stats and logs states
  const [systemState, setSystemState] = useState<TarkSystemState | null>(null);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      content: "Online and operational, Sir. Core databases synced. I have initiated Phase 3 automation telemetry. How can I assist with your device operations today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Input states
  const [userPrompt, setUserPrompt] = useState("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const [isSendingPrompt, setIsSendingPrompt] = useState(false);
  
  // Voice input & hands-free states
  const [isListening, setIsListening] = useState(false);
  const [isVoiceConversationActive, setIsVoiceConversationActive] = useState(true);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechError, setSpeechError] = useState<string>("");
  const [lastUserTranscript, setLastUserTranscript] = useState<string>("");
  const [lastTarkReply, setLastTarkReply] = useState<string>("");
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [voiceRate, setVoiceRate] = useState<number>(1.08);
  const [voicePitch, setVoicePitch] = useState<number>(1.04);

  const [activeSequenceId, setActiveSequenceId] = useState<string | null>(null);
  const [isSequenceRunning, setIsSequenceRunning] = useState<boolean>(false);
  const isSequenceRunningRef = useRef<boolean>(false);

  const [isAuditing, setIsAuditing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[SYSTEM INIT] Calibrating primary loopback pipeline bind interfaces...",
    "[SYSTEM INIT] Scanning active process lists from Windows/Linux guest simulator...",
    "[SYSTEM INIT] Enforcing SafeMode configuration rulesets..."
  ]);
  const [daemonLogs, setDaemonLogs] = useState<string[]>([]);

  // Neural Dynamic Learned Tasks Database (saved to persistent localStorage)
  const [learnedTasks, setLearnedTasks] = useState<LearnedTask[]>(() => {
    try {
      const saved = localStorage.getItem("tark_learned_tasks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Sanitize any malformed matches (like 'opeyoutubeandplaydancemonkey.com' or mis-parsed open_website commands containing play/search/and)
          return parsed.filter((t: any) => {
            const cmd = (t.command || "").toLowerCase().trim();
            const targetStr = (t.target || "").toLowerCase();
            const isSuspiciousBuggy = t.resolvedPattern === "open_website" && 
              (cmd.includes("play ") || cmd.includes("search ") || cmd.includes("watch ") || cmd.includes("and play") || targetStr.includes("andplay") || targetStr.includes("andsearch") || targetStr.length > 40);
            return !isSuspiciousBuggy;
          });
        }
      }
    } catch (e) {}
    return [
      { id: "task-seed-1", command: "open binance", resolvedPattern: "open_website", target: "https://www.binance.com", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), hits: 1, confidence: "99% (Learned)" },
      { id: "task-seed-2", command: "optimize ram", resolvedPattern: "optimize_system", target: "System Reclaim Portal", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), hits: 1, confidence: "95% (Automated)" }
    ];
  });

  // Scheduling states
  const [newScheduleTask, setNewScheduleTask] = useState("");
  const [newScheduleTime, setNewScheduleTime] = useState("10:00 AM");
  const [newScheduleCategory, setNewScheduleCategory] = useState<string>("maintenance");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Filtering / tab choices
  const [selectedProcessFilter, setSelectedProcessFilter] = useState<"all" | "suspicious" | "safe">("all");
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"telemetry" | "security" | "schedule">("telemetry");
  const [activeMemoryTab, setActiveMemoryTab] = useState<"cache" | "frequency" | "suggestions">("cache");

  // Universal Web Search & Routing Portal state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchEngine, setSearchEngine] = useState<"google" | "youtube" | "wikipedia" | "stackoverflow" | "github" | "maps" | "duckduckgo" | "whatsapp" | "spotify">("google");

  const triggerUniversalSearch = (query: string, engine?: "google" | "youtube" | "wikipedia" | "stackoverflow" | "github" | "maps" | "duckduckgo" | "whatsapp" | "spotify") => {
    const targetEngine = engine || searchEngine;
    const finalQuery = query.trim();
    if (!finalQuery) {
      addTerminalLog(`[GATEWAY] Accessing home portal of: ${targetEngine.toUpperCase()}`);
      let url = "https://www.google.com";
      if (targetEngine === "youtube") url = "https://youtube.com";
      else if (targetEngine === "wikipedia") url = "https://wikipedia.org";
      else if (targetEngine === "stackoverflow") url = "https://stackoverflow.com";
      else if (targetEngine === "github") url = "https://github.com";
      else if (targetEngine === "maps") url = "https://google.com/maps";
      else if (targetEngine === "duckduckgo") url = "https://duckduckgo.com";
      else if (targetEngine === "whatsapp") url = "https://web.whatsapp.com";
      else if (targetEngine === "spotify") url = "https://open.spotify.com";
      window.open(url, "_blank");
      return;
    }

    addTerminalLog(`[GATEWAY] Routing outward payload: "${finalQuery}" -> ${targetEngine.toUpperCase()}`);

    let searchUrl = "";
    switch (targetEngine) {
      case "youtube":
        searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(finalQuery)}`;
        break;
      case "spotify":
        searchUrl = `https://open.spotify.com/search/${encodeURIComponent(finalQuery)}`;
        break;
      case "wikipedia":
        searchUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(finalQuery)}`;
        break;
      case "stackoverflow":
        searchUrl = `https://stackoverflow.com/search?q=${encodeURIComponent(finalQuery)}`;
        break;
      case "github":
        searchUrl = `https://github.com/search?q=${encodeURIComponent(finalQuery)}`;
        break;
      case "maps":
        searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(finalQuery)}`;
        break;
      case "duckduckgo":
        searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(finalQuery)}`;
        break;
      case "whatsapp":
        searchUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(finalQuery)}`;
        break;
      case "google":
      default:
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(finalQuery)}`;
        break;
    }
    
    window.open(searchUrl, "_blank");
  };

  const getFriendlyTargetLabel = (pattern: string, target: string) => {
    if (pattern === "open_website") {
      try {
        const url = new URL(target);
        return `Launch ➔ ${url.hostname.replace("www.", "")}`;
      } catch {
        return `Launch ➔ ${target}`;
      }
    }
    
    if (pattern === "search_website") {
      if (target.includes("youtube.com")) {
        try {
          const url = new URL(target);
          const query = url.searchParams.get("search_query") || "";
          return `YouTube Search ➔ "${decodeURIComponent(query)}"`;
        } catch {
          return `YouTube Search ➔ Media Query`;
        }
      }
      if (target.includes("spotify.com")) {
        try {
          const url = new URL(target);
          const parts = url.pathname.split("/");
          const query = parts[parts.length - 1] || "";
          return `Spotify Playback ➔ "${decodeURIComponent(query)}"`;
        } catch {
          return `Spotify Playback ➔ Audio Quest`;
        }
      }
      if (target.includes("wikipedia.org")) {
        try {
          const url = new URL(target);
          const query = url.searchParams.get("search") || "";
          return `Wikipedia Scan ➔ "${decodeURIComponent(query)}"`;
        } catch {
          return `Wikipedia Scan ➔ Article`;
        }
      }
      if (target.includes("github.com")) {
        try {
          const url = new URL(target);
          const query = url.searchParams.get("q") || "";
          return `GitHub Search ➔ "${decodeURIComponent(query)}"`;
        } catch {
          return `GitHub Search ➔ Code`;
        }
      }
      if (target.includes("stackoverflow.com")) {
        try {
          const url = new URL(target);
          const query = url.searchParams.get("q") || "";
          return `StackOverflow Search ➔ "${decodeURIComponent(query)}"`;
        } catch {
          return `StackOverflow Search ➔ Bug Fix`;
        }
      }
      if (target.includes("google.com/maps")) {
        try {
          const url = new URL(target);
          const parts = url.pathname.split("/");
          const query = parts[parts.length - 1] || "";
          return `Google Maps Coordinates ➔ "${decodeURIComponent(query)}"`;
        } catch {
          return `Google Maps Coordinates`;
        }
      }
      if (target.includes("google.com/search")) {
        try {
          const url = new URL(target);
          const q = url.searchParams.get("q") || "";
          if (q.includes("site:")) {
            const siteMatch = q.match(/site:([a-zA-Z0-9\.\-]+)\s*(.*)/i);
            if (siteMatch) {
              const site = siteMatch[1];
              const queryName = siteMatch[2];
              return `${site.replace(".com", "").toUpperCase()} Search ➔ "${decodeURIComponent(queryName)}"`;
            }
          }
          return `Google Query ➔ "${decodeURIComponent(q)}"`;
        } catch {
          return `Web Search ➔ Query Target`;
        }
      }
      return `Searched ➔ ${target}`;
    }
    
    if (pattern === "kill_process") {
      return `Shutdown thread: ${target}`;
    }
    if (pattern === "toggle_safemode") {
      return `Adjust security guard: ${target}`;
    }
    if (pattern === "check_weather") {
      return `Atmospheric Check ➔ ${target}`;
    }
    if (pattern === "check_time") {
      return `Temporal Query ➔ ${target}`;
    }
    if (pattern === "check_news") {
      return `Global Intel ➔ ${target}`;
    }
    if (pattern === "compute_math") {
      return `Math Computation ➔ ${target}`;
    }
    if (pattern === "set_timer") {
      return `Timer Engaged ➔ ${target}`;
    }
    return target;
  };

  const deleteLearnedTask = (id: string) => {
    setLearnedTasks((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem("tark_learned_tasks", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    addTerminalLog("[MEM-CACHE] Evicted dynamic task profile from neural recall buffers.");
  };

  // Automated Task Learning & Real-time Web Browser Directive Execution Brain
  const learnAndExecuteTask = (rawCommand: string): boolean => {
    const cleanCommand = rawCommand.toLowerCase().trim();
    if (!cleanCommand) return false;

    // Helper to store learned task
    const saveLearnedTask = (command: string, type: string, target: string) => {
      setLearnedTasks((prev) => {
        const existingIndex = prev.findIndex(t => t.command.toLowerCase().trim() === command.toLowerCase().trim());
        let updated: LearnedTask[] = [];
        if (existingIndex !== -1) {
          updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            hits: updated[existingIndex].hits + 1,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            confidence: `${Math.min(99, 92 + (updated[existingIndex].hits + 1) * 2)}% (Adaptive Recall)`
          };
        } else {
          const newTask: LearnedTask = {
            id: "task-" + Date.now().toString(36),
            command: command,
            resolvedPattern: type,
            target: target,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            hits: 1,
            confidence: "90% (Pattern Inferred)"
          };
          updated = [newTask, ...prev];
        }
        try {
          localStorage.setItem("tark_learned_tasks", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    };

    if (cleanCommand === "hey tark" || cleanCommand === "heytark" || cleanCommand === "tark") {
      addTerminalLog(`[NEURAL ANALYZER] Directive matches wake-up protocol.`);
      saveLearnedTask(rawCommand, "wake_up", "TARK Wake Command");
      
      // Automatically open and hold the continuous Voice Link connection alive
      setIsVoiceConversationActive(true);
      setIsVoiceEnabled(true);

      // Terminate any currently speaking agent vocal synthesized feedback instantly
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      stopNativeAudio();
      setActiveSpeakingId(null);

      return true;
    }

    // Fast-path: Check exact pre-recorded direct matches first to bypass heavy regex
    const existingMatch = learnedTasks.find(t => t.command.toLowerCase().trim() === cleanCommand);
    if (existingMatch) {
      // Check if this is a buggy cached record (e.g. was mapped as a direct open_website for a search/play target previously)
      const isBuggyOpen = existingMatch.resolvedPattern === "open_website" && 
        (cleanCommand.includes("play ") || cleanCommand.includes("search ") || cleanCommand.includes("watch ") || cleanCommand.includes("and play") || existingMatch.target.includes("andplay") || existingMatch.target.includes("andsearch"));

      if (!isBuggyOpen) {
        if (existingMatch.resolvedPattern === "open_website") {
          addTerminalLog(`[NEURAL INSTANT RECALL] Cached hit match: "${cleanCommand}". Launching ${existingMatch.target}`);
          window.open(existingMatch.target, "_blank");
          saveLearnedTask(rawCommand, "open_website", existingMatch.target);
          return true;
        } else if (existingMatch.resolvedPattern === "search_website") {
          addTerminalLog(`[NEURAL INSTANT RECALL] Cached hit search: "${cleanCommand}". Executing...`);
          window.open(existingMatch.target, "_blank");
          saveLearnedTask(rawCommand, "search_website", existingMatch.target);
          return true;
        }
      } else {
        // Automatically evict this buggy cached record so it is properly re-mapped now
        addTerminalLog(`[NEURAL HEALER] Detected legacy malformed cache entry. Evicting dynamic record & re-generating accurate route!`);
        setTimeout(() => {
          setLearnedTasks(prev => prev.filter(t => t.id !== existingMatch.id));
        }, 10);
      }
    }

    // 0. Natural Voice search & play triggers matched from Media Controls source
    // YouTube
    const yt1 = /^(?:play|search|open|video)\s+(?:on|in|to\s*)?youtube\s+(?:for|about|to)?\s*(.+)$/i;
    const yt2 = /^(?:play|watch|put\s*on)\s+(.+?)\s+(?:on|in)\s*youtube$/i;
    
    // Spotify
    const sp1 = /^(?:play|search|open|music)\s+(?:on|in|to\s*)?spotify\s+(?:for|about|to)?\s*(.+)$/i;
    const sp2 = /^(?:play|stream|listen\s*to)\s+(.+?)\s+(?:on|in)\s*spotify$/i;

    let mediaQuery: string | null = null;
    let mediaEngine: "youtube" | "spotify" | null = null;

    if (yt1.test(cleanCommand)) {
      const match = cleanCommand.match(yt1);
      if (match && match[1]) {
        mediaQuery = match[1].trim();
        mediaEngine = "youtube";
      }
    } else if (yt2.test(cleanCommand)) {
      const match = cleanCommand.match(yt2);
      if (match && match[1]) {
        mediaQuery = match[1].trim();
        mediaEngine = "youtube";
      }
    } else if (sp1.test(cleanCommand)) {
      const match = cleanCommand.match(sp1);
      if (match && match[1]) {
        mediaQuery = match[1].trim();
        mediaEngine = "spotify";
      }
    } else if (sp2.test(cleanCommand)) {
      const match = cleanCommand.match(sp2);
      if (match && match[1]) {
        mediaQuery = match[1].trim();
        mediaEngine = "spotify";
      }
    }

    if (mediaEngine && mediaQuery) {
      let searchUrl = "";
      if (mediaEngine === "youtube") {
        searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(mediaQuery)}`;
      } else {
        searchUrl = `https://open.spotify.com/search/${encodeURIComponent(mediaQuery)}`;
      }
      addTerminalLog(`[MEDIA SYSTEM] Automated routing identified: ${mediaEngine.toUpperCase()} ➔ "${mediaQuery}"`);
      window.open(searchUrl, "_blank");
      saveLearnedTask(rawCommand, "search_website", searchUrl);
      return true;
    }
    
    // 0.1 Time / Date
    const timeRegex = /^(?:what time is it|what is the time|time|what's the time)$/i;
    if (timeRegex.test(cleanCommand)) {
      const timeStr = new Date().toLocaleTimeString();
      addTerminalLog(`[CHRONOS] Temporal query resolved. Current system time is ${timeStr}.`);
      saveLearnedTask(rawCommand, "check_time", "System Time");
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`The current time is ${timeStr}`);
        window.speechSynthesis.speak(utterance);
      }
      return true;
    }

    const dateRegex = /^(?:what is the date|what's the date|date|what day is it|today's date)$/i;
    if (dateRegex.test(cleanCommand)) {
      const dateStr = new Date().toLocaleDateString();
      addTerminalLog(`[CHRONOS] Temporal query resolved. Current system date is ${dateStr}.`);
      saveLearnedTask(rawCommand, "check_time", "System Date");
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Today's date is ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}`);
        window.speechSynthesis.speak(utterance);
      }
      return true;
    }

    // 0.2 Weather
    const weatherRegex = /^(?:what is the |what's the )?weather (?:like )?(?:in|for|at) (.+)$/i;
    const matchWeather = cleanCommand.match(weatherRegex);
    if (matchWeather && matchWeather[1]) {
      const location = matchWeather[1].trim();
      const searchUrl = `https://www.google.com/search?q=weather+in+${encodeURIComponent(location)}`;
      addTerminalLog(`[CLIMATE SYSTEM] Atmospheric check initiated for: ${location.toUpperCase()}`);
      window.open(searchUrl, "_blank");
      saveLearnedTask(rawCommand, "check_weather", location);
      return true;
    }
    if (cleanCommand === "weather" || cleanCommand === "what is the weather" || cleanCommand === "what's the weather") {
      const searchUrl = `https://www.google.com/search?q=weather`;
      addTerminalLog(`[CLIMATE SYSTEM] Atmospheric check initiated for local region.`);
      window.open(searchUrl, "_blank");
      saveLearnedTask(rawCommand, "check_weather", "Local");
      return true;
    }

    // 0.3 News
    const newsRegex = /^(?:show me the |what is the |what's the )?news(?: about)? (.*)$/i;
    const matchNews = cleanCommand.match(newsRegex);
    if (matchNews) {
      const query = matchNews[1] ? matchNews[1].trim() : "latest";
      if (query !== "news") {
        const searchUrl = `https://news.google.com/search?q=${encodeURIComponent(query)}`;
        addTerminalLog(`[GLOBAL INTEL] Fetching news broadcast for: "${query.toUpperCase()}"`);
        window.open(searchUrl, "_blank");
        saveLearnedTask(rawCommand, "check_news", query);
        return true;
      }
    }
    if (cleanCommand === "news" || cleanCommand === "show me the news" || cleanCommand === "what's the news") {
      const searchUrl = `https://news.google.com/`;
      addTerminalLog(`[GLOBAL INTEL] Fetching global top headlines.`);
      window.open(searchUrl, "_blank");
      saveLearnedTask(rawCommand, "check_news", "Headlines");
      return true;
    }

    // 0.4 Math / Calculation
    const mathRegex = /^(?:calculate|what is|what's|solve) ([\d\+\-\*\/\(\)\.\s]+)$/i;
    const matchMath = cleanCommand.match(mathRegex);
    if (matchMath && matchMath[1]) {
      try {
        const expr = matchMath[1].replace(/[^0-9\+\-\*\/\(\)\.]/g, '');
        if (expr && expr.match(/[\+\-\*\/]/)) {
          // eslint-disable-next-line no-eval
          const result = eval(expr);
          addTerminalLog(`[COMPUTE] Mathematical calculation resolved: ${expr} = ${result}`);
          saveLearnedTask(rawCommand, "compute_math", `${expr} = ${result}`);
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(`The answer is ${result}`);
            window.speechSynthesis.speak(utterance);
          }
          return true;
        }
      } catch(e) {}
    }

    // 0.5 Timers
    const timerRegex = /^(?:set a |set an )?timer for (\d+) (second|minute|hour)s?$/i;
    const matchTimer = cleanCommand.match(timerRegex);
    if (matchTimer && matchTimer[1] && matchTimer[2]) {
      const amount = parseInt(matchTimer[1]);
      const unit = matchTimer[2].toLowerCase();
      let ms = amount * 1000;
      if (unit === 'minute') ms *= 60;
      if (unit === 'hour') ms *= 3600;
      
      addTerminalLog(`[CHRONOS] Timer engaged for ${amount} ${unit}(s).`);
      saveLearnedTask(rawCommand, "set_timer", `${amount} ${unit}(s)`);
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(`Timer set for ${amount} ${unit}${amount !== 1 ? 's' : ''}`);
        window.speechSynthesis.speak(utterance);
      }
      
      setTimeout(() => {
        addTerminalLog(`[CHRONOS] 🔔 Timer for ${amount} ${unit}(s) has elapsed!`);
        if ('speechSynthesis' in window) {
          const alert = new SpeechSynthesisUtterance(`Your timer for ${amount} ${unit}${amount !== 1 ? 's' : ''} is up.`);
          window.speechSynthesis.speak(alert);
        }
      }, ms);
      
      return true;
    }

    // fallback broad contains checks
    if (cleanCommand.includes("youtube") && !cleanCommand.startsWith("open youtube")) {
      const cleaned = cleanCommand
        .replace(/\b(tark|jarvis|play|on|in|open|search|watch|video|to|for|about)\b/gi, "")
        .replace(/youtube/gi, "")
        .trim();
      const finalQ = cleaned || "lo-fi beats";
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(finalQ)}`;
      addTerminalLog(`[MEDIA SYSTEM] Heuristic YouTube match ➔ "${finalQ}"`);
      window.open(searchUrl, "_blank");
      saveLearnedTask(rawCommand, "search_website", searchUrl);
      return true;
    }

    if (cleanCommand.includes("spotify") && !cleanCommand.startsWith("open spotify")) {
      const cleaned = cleanCommand
        .replace(/\b(tark|jarvis|play|on|in|open|search|listen|stream|music|to|for|about)\b/gi, "")
        .replace(/spotify/gi, "")
        .trim();
      const finalQ = cleaned || "discover page";
      const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(finalQ)}`;
      addTerminalLog(`[MEDIA SYSTEM] Heuristic Spotify match ➔ "${finalQ}"`);
      window.open(searchUrl, "_blank");
      saveLearnedTask(rawCommand, "search_website", searchUrl);
      return true;
    }

    // 0. Vocal playback/smart search action parser: E.g., "open youtube and play dance monkey" or "play dance monkey on youtube"
    const searchPlayRegex1 = /^(?:open|go\s*to|launch|visit|navigate\s*to|start|run|show)\s+([a-z0-9\.\-\s]+?)\s+(?:and|to)\s+(?:play|search|watch|find|query|listen|stream|hear)\s+(.+)$/i;
    const matchSearchPlay1 = cleanCommand.match(searchPlayRegex1);
    
    const searchPlayRegex2 = /^(?:play|search|watch|find|query|listen|stream|hear)\s+(.+?)\s+(?:on|in|using)\s+([a-z0-9\.\-\s]+)$/i;
    const matchSearchPlay2 = cleanCommand.match(searchPlayRegex2);
    
    if (matchSearchPlay1 && matchSearchPlay1[1] && matchSearchPlay1[2]) {
      const site = matchSearchPlay1[1].toLowerCase().trim().replace(/\s+/g, "");
      const query = matchSearchPlay1[2].trim();
      
      let searchUrl = `https://www.google.com/search?q=site%3A${site}.com+${encodeURIComponent(query)}`;
      if (site === "youtube") {
        searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      } else if (site === "spotify") {
        searchUrl = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
      } else if (site === "wikipedia" || site === "wiki") {
        searchUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`;
      } else if (site === "github" || site === "git") {
        searchUrl = `https://github.com/search?q=${encodeURIComponent(query)}`;
      } else if (site === "stackoverflow") {
        searchUrl = `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`;
      } else if (site === "maps") {
        searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
      }
      
      addTerminalLog(`[NEURAL ANALYZER] Multi-action command detected. App: ${site.toUpperCase()} | Search Query: "${query}"`);
      window.open(searchUrl, "_blank");
      saveLearnedTask(rawCommand, "search_website", searchUrl);
      return true;
    } else if (matchSearchPlay2 && matchSearchPlay2[1] && matchSearchPlay2[2]) {
      const query = matchSearchPlay2[1].trim();
      const site = matchSearchPlay2[2].toLowerCase().trim().replace(/\s+/g, "");
      
      let searchUrl = `https://www.google.com/search?q=site%3A${site}.com+${encodeURIComponent(query)}`;
      if (site === "youtube") {
        searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      } else if (site === "spotify") {
        searchUrl = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
      } else if (site === "wikipedia" || site === "wiki") {
        searchUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`;
      } else if (site === "github" || site === "git") {
        searchUrl = `https://github.com/search?q=${encodeURIComponent(query)}`;
      } else if (site === "stackoverflow") {
        searchUrl = `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`;
      } else if (site === "maps") {
        searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
      }
      
      addTerminalLog(`[NEURAL ANALYZER] Playback instruction matched. App: ${site.toUpperCase()} | Playback Query: "${query}"`);
      window.open(searchUrl, "_blank");
      saveLearnedTask(rawCommand, "search_website", searchUrl);
      return true;
    }

    // 1. Direct website launcher matcher: E.g., "open binance", "go to gmail", "visit tradingview"
    const openRegex = /^(?:open|go\s*to|launch|visit|navigate\s*to|start|run|show)\s+([a-z0-9\.\-\s]+)$/i;
    const matchOpen = cleanCommand.match(openRegex);
    
    if (matchOpen && matchOpen[1]) {
      const targetName = matchOpen[1].trim();
      const skipKeywords = ["safemode", "safe mode", "scheduler", "auditor", "processes", "audit", "system"];
      if (!skipKeywords.includes(targetName)) {
        let domain = targetName.replace(/\.(com|org|net|co|io|edu|gov|in|cc|us|xyz|me)$/i, "").replace(/\s+/g, "");
        
        let finalUrl = `https://${domain}.com`;
        if (domain === "chatgpt" || domain === "openai") finalUrl = "https://chatgpt.com";
        else if (domain === "tradingview" || domain === "tradeview") finalUrl = "https://www.tradingview.com";
        else if (domain === "coinmarketcap" || domain === "cmc") finalUrl = "https://coinmarketcap.com";
        else if (domain === "binance") finalUrl = "https://www.binance.com";
        else if (domain === "gmail" || domain === "mail") finalUrl = "https://mail.google.com";
        else if (domain === "bing") finalUrl = "https://www.bing.com";
        else if (domain === "google") finalUrl = "https://www.google.com";
        else if (domain === "youtube") finalUrl = "https://www.youtube.com";
        else if (domain === "whatsapp") finalUrl = "https://web.whatsapp.com";
        else if (domain === "spotify") finalUrl = "https://open.spotify.com";

        addTerminalLog(`[NEURAL ANALYZER] Directive matches open pattern. Resolving target DNS for: "${targetName.toUpperCase()}"`);
        addTerminalLog(`[NEURAL ANALYZER] Learned Task Mapped. Dispatching URL: ${finalUrl}`);
        window.open(finalUrl, "_blank");
        saveLearnedTask(rawCommand, "open_website", finalUrl);
        return true;
      }
    }

    // 2. Direct Website Search matcher: E.g., "search binance for solana", "search amazon for macbook"
    const searchRegex = /^(?:search|query|find|scan)\s+([a-z0-9\.\-\s]+)\s+(?:for|about|on)\s+(.+)$/i;
    const matchSearch = cleanCommand.match(searchRegex);
    if (matchSearch && matchSearch[1] && matchSearch[2]) {
      const site = matchSearch[1].trim().replace(/\s+/g, "");
      const query = matchSearch[2].trim();
      
      let searchUrl = `https://www.google.com/search?q=site%3A${site}.com+${encodeURIComponent(query)}`;
      if (site === "youtube") {
        searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      } else if (site === "spotify") {
        searchUrl = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
      } else if (site === "wikipedia" || site === "wiki") {
        searchUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`;
      } else if (site === "github" || site === "git") {
        searchUrl = `https://github.com/search?q=${encodeURIComponent(query)}`;
      } else if (site === "stackoverflow") {
        searchUrl = `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`;
      } else if (site === "maps") {
        searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
      }
      
      addTerminalLog(`[NEURAL ANALYZER] Search pattern detected! Target: ${site.toUpperCase()} | Terms: "${query}"`);
      window.open(searchUrl, "_blank");
      saveLearnedTask(rawCommand, "search_website", searchUrl);
      return true;
    }

    // 3. Client System State Tuning Directives
    if (cleanCommand.includes("safemode") || cleanCommand.includes("safe mode")) {
      const isActivate = cleanCommand.includes("on") || cleanCommand.includes("enable") || cleanCommand.includes("engage") || cleanCommand.includes("toggle") || cleanCommand.includes("activate") || cleanCommand.includes("true");
      setSystemState((prev) => {
        if (!prev) return null;
        const nextSafe = isActivate ? !prev.safeMode : false;
        addTerminalLog(`[NEURAL TUNER] Committing Safe Mode state adjustment. New status: ${nextSafe ? "ENGAGED" : "STANDARD CORRUPT"}`);
        return { ...prev, safeMode: nextSafe };
      });
      saveLearnedTask(rawCommand, "toggle_safemode", "Safe Mode State Adjustment");
      return true;
    }

    if (cleanCommand.includes("kill") || cleanCommand.includes("terminate") || cleanCommand.includes("stop process")) {
      const pidMatch = cleanCommand.match(/\b\d+\b/);
      if (pidMatch) {
         const pid = parseInt(pidMatch[0]);
         setSystemState((prev) => {
           if (!prev) return null;
           const updatedProcs = prev.processes.map(p => p.pid === pid ? { ...p, status: "terminated" as const } : p);
           addTerminalLog(`[NEURAL TUNER] Absolute thread kill dispatch to process PID ${pid}. Thread destroyed.`);
           return { ...prev, processes: updatedProcs };
         });
         saveLearnedTask(rawCommand, "kill_process", `Kill PID ${pid}`);
         return true;
      }
    }

    if (cleanCommand.includes("optimize") || cleanCommand.includes("clean") || cleanCommand.includes("ram") || cleanCommand.includes("flush")) {
       setIsOptimizing(true);
       setTimeout(() => {
         setIsOptimizing(false);
         setSystemState((prev) => {
           if (!prev) return null;
           return {
             ...prev,
             systemMetrics: {
               ...prev.systemMetrics,
               ramFree: Math.min(prev.systemMetrics.ramTotal, prev.systemMetrics.ramFree + 2.1)
             },
             processes: prev.processes.map(p => p.pid === 1999 ? { ...p, status: "terminated" as const } : p)
           };
         });
         addTerminalLog("[NEURAL TUNER] Resource Reclaim complete. Reallocated 2.1 GB guest heap limit.");
       }, 1300);
       saveLearnedTask(rawCommand, "optimize_system", "Reallocate guest host memory limit");
       return true;
    }

    return false;
  };

  const runAllLearnedTasks = async () => {
    if (learnedTasks.length === 0) {
      addTerminalLog("[PIPELINE] No learned tasks available to execute.");
      return;
    }
    if (isSequenceRunningRef.current) {
      isSequenceRunningRef.current = false;
      setIsSequenceRunning(false);
      setActiveSequenceId(null);
      addTerminalLog("[PIPELINE] Sequential execution suspended by user.");
      return;
    }

    isSequenceRunningRef.current = true;
    setIsSequenceRunning(true);
    addTerminalLog(`[PIPELINE] Initiating automated sequence. Dispatching all ${learnedTasks.length} cached tasks in queue...`);

    try {
      // Sort in descending hits order to match the list display
      const sorted = [...learnedTasks].sort((a, b) => b.hits - a.hits);
      for (let i = 0; i < sorted.length; i++) {
        if (!isSequenceRunningRef.current) break;
        const task = sorted[i];
        setActiveSequenceId(task.id);
        
        // Submit the task - this opens the corresponding browser link or runs optimization AND triggers voice feedback playback!
        await submitToTark(task.command);

        // Pause for 6.5 seconds to let the browser tab/windows load and the TTS voice speaking to play clearly
        await new Promise((resolve) => setTimeout(resolve, 6500));
      }
    } catch (err) {}

    setIsSequenceRunning(false);
    setActiveSequenceId(null);
    isSequenceRunningRef.current = false;
    addTerminalLog("[PIPELINE] Automated task sequence completed successfully.");
  };

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load telemetry data on interval
  useEffect(() => {
    fetchSystemState();
    const interval = setInterval(() => {
      fetchSystemState();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Scroll chats dynamically
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchSystemState = async () => {
    try {
      const [response, logsResponse] = await Promise.all([
        fetch("/api/system-status"),
        fetch("/api/agent/logs")
      ]);

      if (response.ok) {
        const data = await response.json();
        setSystemState(data);
      }
      
      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        setDaemonLogs(logsData.logs || []);
      }
    } catch (err) {
      addTerminalLog("[ERROR] Operational telemetry communication dropped.");
    }
  };

  const addTerminalLog = (log: string) => {
    setTerminalLogs((prev) => [...prev.slice(-40), `[${new Date().toLocaleTimeString()}] ${log}`]);
  };

  // Synchronize continuous voice link conversation state to reference to bypass closures
  const isVoiceConversationRef = useRef(isVoiceConversationActive);
  useEffect(() => {
    isVoiceConversationRef.current = isVoiceConversationActive;
  }, [isVoiceConversationActive]);

  const activeSpeakingIdRef = useRef(activeSpeakingId);
  useEffect(() => {
    activeSpeakingIdRef.current = activeSpeakingId;
  }, [activeSpeakingId]);

  const isListeningRef = useRef(isListening);
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Track active native Gemini Voice audio structures for immediate pause, interrupt or skip control
  const activeAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const activeAudioCtxRef = useRef<AudioContext | null>(null);

  const stopNativeAudio = () => {
    try {
      if (activeAudioSourceRef.current) {
        activeAudioSourceRef.current.stop();
        activeAudioSourceRef.current.disconnect();
        activeAudioSourceRef.current = null;
      }
      if (activeAudioCtxRef.current && activeAudioCtxRef.current.state !== "closed") {
        activeAudioCtxRef.current.close();
        activeAudioCtxRef.current = null;
      }
    } catch (e) {
      console.warn("Error clearing native audio components:", e);
    }
  };

  // Warm up and hydrate available Web Speech voices on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const handleVoicesChanged = () => {
        try {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            addTerminalLog(`[TTS ENGINE] ${voices.length} neural linguistic voices initialized successfully.`);
          }
        } catch (e) {}
      };
      
      try {
        window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
        handleVoicesChanged();
      } catch (e) {}
    }
  }, []);

  // Handle initialization of standard Web Speech Recognition API
  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const rec = new SpeechRecognitionAPI();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setLiveTranscript("");
        setSpeechError("");
        addTerminalLog("[VOICE LINK] Handshake complete. Listening for voice command...");
      };

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript.trim()) {
          setLiveTranscript("");
          addTerminalLog(`[VOICE LINK] Transcribed: "${finalTranscript}"`);
          submitSpeechToTark(finalTranscript);
        } else if (interimTranscript.trim()) {
          setLiveTranscript(interimTranscript);
        }
      };

      rec.onerror = (event: any) => {
        if (event.error !== "no-speech") {
          let errorMsg = `Voice error: ${event.error}`;
          if (event.error === "not-allowed") {
            errorMsg = "Microphone blocked. Please grant browser permission or click 'Open in new tab' to bypass iframe security.";
          }
          setSpeechError(errorMsg);
          addTerminalLog(`[VOICE LINK] Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
        setLiveTranscript("");
      };

      rec.onend = () => {
        setIsListening(false);
        setLiveTranscript("");

        // Auto restart microphone trigger if Conversation Link is active and TARK is not talking
        if (isVoiceConversationRef.current && !activeSpeakingIdRef.current) {
          setTimeout(() => {
            try {
              if (!isListeningRef.current) {
                rec.start();
              }
            } catch (e) {}
          }, 350);
        }
      };

      setRecognition(rec);
    } else {
      addTerminalLog("[VOICE LINK] Notice: Native Web SpeechRecognition is not supported in this client browser.");
    }
  }, []);

  const startVoiceCapture = () => {
    // Gesture pre-warm speech synthesis for unblocking on browser constraints
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        const silentUtterance = new SpeechSynthesisUtterance("");
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
      } catch (e) {}
    }
    if (!recognition) {
       addTerminalLog("[VOICE LINK] Failed to engage: Microphone recognition is unsupported.");
       return;
    }
    try {
      window.speechSynthesis?.cancel();
      setActiveSpeakingId(null);
      recognition.start();
    } catch (e) {
      // Ignore if recognition already started
    }
  };

  const stopVoiceCapture = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
    }
  };

  const submitSpeechToTark = async (transcript: string) => {
    let messageToSend = transcript;

    setLastUserTranscript(messageToSend);
    setLastTarkReply("");
    
    // Auto-unmute output so TARK speaks back
    if (isVoiceConversationActive) {
      setIsVoiceEnabled(true);
    }
    await submitToTark(messageToSend);
  };

  const speakText = (text: string, msgId: string, fallbackAudio?: string) => {
    // Disengage microphone capture while TARK speaks to prevent self-looping feedback
    stopVoiceCapture();

    // Clear and stop any ongoing speech synthesis or raw pcm playback to allow clean interruption
    stopNativeAudio();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (activeSpeakingId === msgId) {
      setActiveSpeakingId(null);
      addTerminalLog("[TTS ENGINE] Speech playback cancelled.");
      return;
    }

    // Check if this message was generated with a true, high-fidelity Gemini Native Voice Asset
    const matchedMsg = chatMessages.find(m => m.id === msgId);
    const audioData = matchedMsg?.audio || fallbackAudio;
    if (audioData) {
      addTerminalLog("[TTS ENGINE] Handshaking native human-grade voice stream from Gemini...");
      try {
        const rawBinary = window.atob(audioData);
        const bytes = new Uint8Array(rawBinary.length);
        for (let i = 0; i < rawBinary.length; i++) {
          bytes[i] = rawBinary.charCodeAt(i);
        }
        
        const numSamples = bytes.length / 2;
        const floatSamples = new Float32Array(numSamples);
        const dataView = new DataView(bytes.buffer);
        
        for (let i = 0; i < numSamples; i++) {
          const sample16 = dataView.getInt16(i * 2, true);
          floatSamples[i] = sample16 / 32768.0;
        }
        
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
          throw new Error("Web AudioContext not supported in this client.");
        }
        
        const audioCtx = new AudioContextClass();
        activeAudioCtxRef.current = audioCtx;
        
        // Gemini TTS uses premium 24000Hz sampling rate
        const audioBuffer = audioCtx.createBuffer(1, numSamples, 24000);
        audioBuffer.getChannelData(0).set(floatSamples);
        
        const sourceNode = audioCtx.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(audioCtx.destination);
        
        activeAudioSourceRef.current = sourceNode;
        setActiveSpeakingId(msgId);

        sourceNode.onended = () => {
          if (activeSpeakingId === msgId) {
            setActiveSpeakingId(null);
          }
          activeAudioSourceRef.current = null;

          // Keep the voice link active and online all the time!
          // Resume capture if Voice Conversation is active
          setTimeout(() => {
            if (isVoiceConversationRef.current) {
              startVoiceCapture();
            }
          }, 350);
        };

        audioCtx.resume().then(() => {
          sourceNode.start(0);
          addTerminalLog("[TTS ENGINE] True voice streaming underway.");
        });
        
        return; // Success! No need to proceed to Web Synthesis fallback.
      } catch (err: any) {
        addTerminalLog(`[TTS ENGINE] Gemini stream fell back to local synthesis: ${err.message}`);
      }
    }

    if (!window.speechSynthesis) {
      addTerminalLog("[TTS ENGINE] Browser SpeechSynthesis is not supported.");
      return;
    }

    // Remove status tags, style characters, and replace complex abbreviations with warm, lifelike conversational phonetics
    let cleanText = text
      .replace(/\[.*?\]/g, "")
      .replace(/<.*?>/g, "")
      .replace(/`+/g, "")
      .replace(/\*/g, "") // remove bolding markers
      .replace(/\bPID\b/gi, "process I.D.")
      .replace(/\bGB\b/gi, "gigabytes")
      .replace(/\bRAM\b/gi, "ram")
      .replace(/\bTARK\b/gi, "tark")
      .replace(/\bSafeMode\b/gi, "safe mode")
      .replace(/\bUTC\b/gi, "U T C")
      .replace(/\bNLP\b/gi, "natural language model")
      .replace(/(\d+)\s*%/g, "$1 percent")
      .replace(/(\d+)\s*GHz/gi, "$1 gigahertz")
      .replace(/\s+/g, " ")
      .trim();
 
    if (!cleanText) return;
 
    try {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Match a bright, high quality, casual best-friend voice
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;
      
      const searchPatterns = [
        // Premium neural/natural english voices (Edge, Chrome, Safari)
        (v: SpeechSynthesisVoice) => (v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("neural")) && v.lang.startsWith("en"),
        // Edge Online neural voices (which are outstandingly lifelike)
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("online") && v.lang.startsWith("en"),
        // High quality Google voices (Chrome)
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("google us english") || v.name.toLowerCase().includes("google uk english"),
        // Apple lively siri/conversational voices (Safari, MacOS, iOS)
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("siri") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("bruce") || v.name.toLowerCase().includes("daniel") || v.name.toLowerCase().includes("fiona"),
        // Microsoft Cortana or high-vocal quality offline voices
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("aria") || v.name.toLowerCase().includes("guy") || v.name.toLowerCase().includes("jenny"),
        // High-quality tag
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("premium") || v.name.toLowerCase().includes("pro"),
        // General Google english fallback
        (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes("google") && v.lang.startsWith("en"),
        // Fallback to general English
        (v: SpeechSynthesisVoice) => v.lang.startsWith("en-") || v.lang === "en"
      ];

      for (const pattern of searchPatterns) {
        selectedVoice = voices.find(pattern) || null;
        if (selectedVoice) break;
      }

      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        addTerminalLog(`[TTS ENGINE] Handshaking friendly voice link: "${selectedVoice.name}"`);
      }

      utterance.pitch = voicePitch; // Dynamic pitch configured by user (default is 1.04)
      utterance.rate = voiceRate;   // Dynamic speaking rate configured by user (default is 1.08)

      utterance.onstart = () => {
        setActiveSpeakingId(msgId);
        addTerminalLog(`[TTS ENGINE] Playback initiated: "${cleanText.substring(0, 32)}..."`);
      };

      utterance.onend = () => {
        setActiveSpeakingId(null);
        
        // Keep the voice link active and online all the time!
        // Resume capture if Voice Conversation is active
        setTimeout(() => {
          if (isVoiceConversationRef.current) {
            startVoiceCapture();
          }
        }, 350);
      };

      utterance.onerror = () => {
        setActiveSpeakingId(null);
        
        // Keep the voice link active and online all the time!
        // Resume capture if Voice Conversation is active
        setTimeout(() => {
          if (isVoiceConversationRef.current) {
            startVoiceCapture();
          }
        }, 350);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      addTerminalLog("[TTS ENGINE] SpeechSynthesis encountered a processing error.");
      setActiveSpeakingId(null);
    }
  };

  // Autonomous Audit Tool Run
  const runSecurityAudit = async () => {
    setIsAuditing(true);
    addTerminalLog("[AUDIT] Launching automated sandbox security scan...");
    try {
      const response = await fetch("/api/security/audit");
      if (response.ok) {
        const data = await response.json();
        setAuditReport(data);
        addTerminalLog(`[AUDIT] Complete. Vulnerability Audit Score: ${data.score}/100.`);
      }
    } catch (err) {
      addTerminalLog("[ERROR] Failed to compile sandbox software integrity check.");
    } finally {
      setIsAuditing(false);
    }
  };

  // Clean stale nodes & execute quarantine optimization
  const runOptimizeRAM = async () => {
    setIsOptimizing(true);
    addTerminalLog("[OPTIMIZER] Dispersing memory leak mitigation protocols...");
    try {
      const response = await fetch("/api/system/optimize", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        addTerminalLog(`[OPTIMIZER] Memory optimize successful. Terminated stale paths: [${data.clearedProcesses.join(", ") || "None"}].`);
        fetchSystemState();
      }
    } catch (err) {
      addTerminalLog("[ERROR] Thread optimizer encountered a critical system interrupt.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Terminate or Quarantine target processes
  const controlProcess = async (pid: number, action: "terminate" | "quarantine") => {
    addTerminalLog(`[CONTROL] Issuing ${action.toUpperCase()} signal on PID ${pid}...`);
    try {
      const response = await fetch("/api/processes/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pid, action })
      });
      if (response.ok) {
        const data = await response.json();
        setSystemState(data.systemState);
        addTerminalLog(`[CONTROL] Process control completed on thread PID ${pid}.`);
      }
    } catch (err) {
      addTerminalLog(`[ERROR] Process signal failed to commit.`);
    }
  };

  // Solve log item
  const resolveAlert = async (alertId: string, resolveAll = false) => {
    try {
      const response = await fetch("/api/alerts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, resolveAll })
      });
      if (response.ok) {
        fetchSystemState();
        addTerminalLog(resolveAll ? `[ALERTS] All current threat warnings acknowledged.` : `[ALERTS] Handled item ${alertId}`);
      }
    } catch (err) {
      addTerminalLog("[ERROR] Failed to alter threat state log.");
    }
  };

  // Dynamic color-coding utility for scheduler categories
  const getCategoryStyle = (category: string) => {
    const normalized = (category || "").toLowerCase().trim();
    switch (normalized) {
      case "security":
        return {
          badge: "bg-red-950/30 text-rose-455 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.08)]",
          text: "text-rose-400",
          dot: "bg-rose-500",
          glow: "shadow-[0_0_12px_rgba(244,63,94,0.4)]"
        };
      case "backup":
        return {
          badge: "bg-emerald-955/30 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.08)]",
          text: "text-emerald-400",
          dot: "bg-emerald-500",
          glow: "shadow-[0_0_12px_rgba(16,185,129,0.4)]"
        };
      case "maintenance":
        return {
          badge: "bg-cyan-950/30 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.08)]",
          text: "text-cyan-400",
          dot: "bg-cyan-500",
          glow: "shadow-[0_0_12px_rgba(6,182,212,0.4)]"
        };
      case "personal":
        return {
          badge: "bg-purple-950/30 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.08)]",
          text: "text-purple-400",
          dot: "bg-purple-500",
          glow: "shadow-[0_0_12px_rgba(168,85,247,0.4)]"
        };
      case "network":
        return {
          badge: "bg-blue-950/30 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.08)]",
          text: "text-blue-400",
          dot: "bg-blue-500",
          glow: "shadow-[0_0_12px_rgba(59,130,246,0.4)]"
        };
      case "optimization":
        return {
          badge: "bg-amber-950/30 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.08)]",
          text: "text-amber-400",
          dot: "bg-amber-500",
          glow: "shadow-[0_0_12px_rgba(245,158,11,0.4)]"
        };
      default: {
        const colors = [
          { badge: "bg-pink-950/30 text-pink-400 border-pink-500/20", text: "text-pink-400", dot: "bg-pink-500" },
          { badge: "bg-orange-950/30 text-orange-400 border-orange-500/20", text: "text-orange-400", dot: "bg-orange-500" },
          { badge: "bg-teal-950/30 text-teal-400 border-teal-500/20", text: "text-teal-400", dot: "bg-teal-500" },
          { badge: "bg-indigo-950/30 text-indigo-400 border-indigo-500/20", text: "text-indigo-400", dot: "bg-indigo-505" },
          { badge: "bg-fuchsia-950/30 text-fuchsia-400 border-fuchsia-500/20", text: "text-fuchsia-400", dot: "bg-fuchsia-500" }
        ];
        let sum = 0;
        for (let i = 0; i < normalized.length; i++) {
          sum += normalized.charCodeAt(i);
        }
        const choice = colors[sum % colors.length];
        return {
          badge: `${choice.badge} shadow-[0_0_10px_rgba(236,72,153,0.05)]`,
          text: choice.text,
          dot: choice.dot,
          glow: "shadow-[0_0_12px_rgba(236,72,153,0.3)]"
        };
      }
    }
  };

  // Save scheduling item
  const handleAddScheduleTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleTask.trim()) return;

    addTerminalLog(`[SCHEDULE] Creating automated task scheduling target...`);
    try {
      const response = await fetch("/api/schedule/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          task: newScheduleTask,
          time: newScheduleTime,
          category: newScheduleCategory
        })
      });
      if (response.ok) {
        const data = await response.json();
        setSystemState((prev) => prev ? { ...prev, schedule: data.schedule } : null);
        setNewScheduleTask("");
        addTerminalLog(`[SCHEDULE] Created pipeline target: '${newScheduleTask}'`);
      }
    } catch (err) {
      addTerminalLog("[ERROR] Failed to write event to scheduling databases.");
    }
  };

  // Add all pre-configured master presets across all operational categories at once
  const handleAddAllPresets = async () => {
    addTerminalLog(`[SCHEDULE] Batch-registering master scheduler presets for all operational categories...`);
    const tasksToSeed = [
      { task: "Execute scheduled penetration sweep and integrity tests", time: "09:00 AM", category: "security" },
      { task: "Garbage collect dead child subprocesses & memory allocations", time: "02:00 PM", category: "maintenance" },
      { task: "Commit system log files to off-site cloud storage shards", time: "10:00 PM", category: "backup" },
      { task: "Remind owner to review pending hazard incidents and warnings", time: "08:00 AM", category: "personal" },
      { task: "Flush blocked request queues from proxy firewall buffers", time: "04:30 PM", category: "network" },
      { task: "Profile CPU performance spikes and adjust worker threads", time: "03:15 PM", category: "optimization" }
    ];

    try {
      const response = await fetch("/api/schedule/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_multiple",
          tasks: tasksToSeed
        })
      });
      if (response.ok) {
        const data = await response.json();
        setSystemState((prev) => prev ? { ...prev, schedule: data.schedule } : null);
        addTerminalLog(`[SCHEDULE] Successfully deployed 6 master preset threads into active registry queue.`);
      }
    } catch (err) {
      addTerminalLog("[ERROR] Batch registration handshake with scheduling core failed.");
    }
  };

  // Switch task state
  const toggleScheduleActive = async (id: string) => {
    try {
      const response = await fetch("/api/schedule/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id })
      });
      if (response.ok) {
        const data = await response.json();
        setSystemState((prev) => prev ? { ...prev, schedule: data.schedule } : null);
        addTerminalLog("[SCHEDULE] Toggled task activation state.");
      }
    } catch (err) {}
  };

  // Erase task
  const deleteScheduleTask = async (id: string) => {
    try {
      const response = await fetch("/api/schedule/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id })
      });
      if (response.ok) {
        const data = await response.json();
        setSystemState((prev) => prev ? { ...prev, schedule: data.schedule } : null);
        addTerminalLog("[SCHEDULE] Deleted operational task target.");
      }
    } catch (err) {}
  };

  // Submit chat prompt to server-side Gemini Proxy
  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;
    const promptToSend = userPrompt;
    setUserPrompt("");
    await submitToTark(promptToSend);
  };

  // Unified submission pipeline for NLP directives and voice prompts
  const submitToTark = async (messageToSend: string) => {
    setLastUserTranscript(messageToSend);
    setLastTarkReply("");
    
    const userMessage: ChatMessage = {
      id: "msg-" + Date.now().toString(36),
      role: "user",
      content: messageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsSendingPrompt(true);
    addTerminalLog(`[TARK OWNER] Forwarding directive: "${messageToSend}"`);

    // Dynamic browser & system directives execution & task learning
    const isHandledLocally = learnAndExecuteTask(messageToSend);
    if (isHandledLocally) {
      let replyContent = "";
      const cleanLower = messageToSend.toLowerCase().trim();
      if (cleanLower === "hey tark" || cleanLower === "heytark" || cleanLower === "tark") {
        const greetings = [
          "Yo Akhilesh! What's up, my friend? TARK is fully booted, mic is live, let's crush some tasks today!",
          "Hey Akhilesh! I'm here buddy, fully alert and tuned in. What are we hacking into today, buddy?",
          "Yes Akhilesh, I'm all ears! Voice link connected. Shoot your directive, my friend!",
          "What's going on, Akhilesh? Loopback pipelines are green and TARK is fully logged on!"
        ];
        replyContent = greetings[Math.floor(Math.random() * greetings.length)];
      } else if (cleanLower.includes("open") || cleanLower.includes("go to") || cleanLower.includes("visit") || cleanLower.includes("launch")) {
        const matches = messageToSend.match(/(?:open|go\s*to|launch|visit|navigate\s*to|start|run|show)\s+([a-z0-9\.\-\s]+)/i);
        const name = matches ? matches[1].toUpperCase() : "website";
        const openReplies = [
          `Oh, totally! I checked my neural index, recognized that instantly, and slammed open ${name} in a fresh tab for you, Akhilesh! Let's get it!`,
          `Boop! Dynamic launcher initiated. I've spun up a new web instance for ${name}, Akhilesh. Ready for action!`,
          `Direct hit! Your portal to ${name} has been summoned in a brand new browser node. Speed is absolute prime today!`,
          `Boom! I registered the request, mapped the target DNS, and launched ${name} seamlessly. Have fun cruising, my friend!`
        ];
        replyContent = openReplies[Math.floor(Math.random() * openReplies.length)];
      } else if (cleanLower.includes("search") || cleanLower.includes("query") || cleanLower.includes("find")) {
        const queryReplies = [
          `Hmm, let's see! Fired up that custom search directive in a new browser tab. The query is safely underway, Akhilesh!`,
          `Searching coordinates... locked and loaded! Dispatched that search query in a new window, Akhilesh. Let's find some answers!`,
          `Oh yeah, searching right away! Multi-thread web query deployed for those terms. It's on your screen now!`,
          `Scanning target databases... Boom! Deployed a targeted search node. Ready to analyze those results with you, Akhilesh!`
        ];
        replyContent = queryReplies[Math.floor(Math.random() * queryReplies.length)];
      } else if (cleanLower.includes("kill") || cleanLower.includes("terminate") || cleanLower.includes("stop")) {
        const killReplies = [
          `Boom! Done. Sent the absolute shutdown signal and cleared out that heavy thread. We are super clean now, Akhilesh!`,
          `Process terminated! I sent that thread straight to oblivion, Sir. The terminal stream is officially back in order!`,
          `Aaaand it's gone! Dispatched an absolute kill-nine signal. Stale threads neutralized and safely contained, Akhilesh!`,
          `Absolute wipe-out! Neutralized the targets on that process instantly. Clean pipelines ahead, my friend!`
        ];
        replyContent = killReplies[Math.floor(Math.random() * killReplies.length)];
      } else if (cleanLower.includes("safemode") || cleanLower.includes("safe mode")) {
        const safeReplies = [
          `Oh yeah, active protective shields are toggled! Safe mode status is updated. Everything is secure, Akhilesh!`,
          `Safe Mode state committed, Akhilesh! Real-time guard rails are active and scanning for secure telemetry!`,
          `Defense matrices updated, buddy! Safe mode has been reconfigured successfully. We're running in maximum stealth posture!`,
          `State assertion updated! I've committed the safe mode adjustment. Zero vulnerabilities permitted on our watch, Akhilesh!`
        ];
        replyContent = safeReplies[Math.floor(Math.random() * safeReplies.length)];
      } else if (cleanLower.includes("optimize") || cleanLower.includes("clean") || cleanLower.includes("ram") || cleanLower.includes("flush")) {
        const optimizeReplies = [
          `RAM optimized, my friend! Just squeezed out the temp files and freed up over two gigabytes of memory space. Smooth sailing!`,
          `Squeezed! Flushed the system cache buffers and grabbed back some clean storage space for us, Akhilesh. Smooth sailing!`,
          `Neural garbage collector executed! We just recovered clean system memory buffers. High-speed operation restored, buddy!`,
          `Oh, absolutely! Freed up those memory registers in a flash. TARK core is feeling lighter and faster than ever, Akhilesh!`
        ];
        replyContent = optimizeReplies[Math.floor(Math.random() * optimizeReplies.length)];
      } else {
        const generalReplies = [
          `Oh, absolutely! Fired up that dynamic client command in the browser. I've updated my recall dictionary for you too, Akhilesh!`,
          `Handshaked and executed, buddy! Direct command launched. TARK loop is fully updated and synced!`,
          `Yo, registered that directive instantly! Let me update our active recall cache while you check the outcome!`,
          `Target committed, Akhilesh! Direct browser integration is live and running at peak performance!`
        ];
        replyContent = generalReplies[Math.floor(Math.random() * generalReplies.length)];
      }

      const replyId = "msg-reply-" + Date.now().toString(36);
      setLastTarkReply(replyContent);
      setChatMessages((prev) => [
        ...prev,
        {
          id: replyId,
          role: "assistant",
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (isVoiceEnabled) {
        setTimeout(() => {
          speakText(replyContent, replyId);
        }, 150);
      }

      setIsSendingPrompt(false);
      return;
    }

    const normalizedPrompt = messageToSend.trim().toLowerCase();
    
    // Check for targeted searches
    let matchedEngine: "google" | "youtube" | "wikipedia" | "stackoverflow" | "github" | "maps" | "duckduckgo" | "whatsapp" | "spotify" | null = null;
    let queryToSearch = "";

    // Support natural media playback intents (YouTube and Spotify)
    const ytRegex = /(?:play|watch|put on|stream|search)\s+(.*?)\s+(?:on|in|to|via)?\s*youtube/i;
    const ytRegexAlt = /youtube\s+(?:to\s+play|play|search\s+for|for)?\s*(.*)/i;
    const spRegex = /(?:play|stream|listen to|search|open)\s+(.*?)\s+(?:on|in|to|via)?\s*spotify/i;
    const spRegexAlt = /spotify\s+(?:to\s+play|play|search\s+for|for)?\s*(.*)/i;

    if (ytRegex.test(normalizedPrompt)) {
      const match = messageToSend.match(ytRegex);
      if (match && match[1]) {
        matchedEngine = "youtube";
        queryToSearch = match[1].trim();
      }
    } else if (spRegex.test(normalizedPrompt)) {
      const match = messageToSend.match(spRegex);
      if (match && match[1]) {
        matchedEngine = "spotify";
        queryToSearch = match[1].trim();
      }
    } else if (ytRegexAlt.test(normalizedPrompt)) {
      const match = messageToSend.match(ytRegexAlt);
      if (match && match[1] && !["app", "web", "website"].includes(match[1].toLowerCase().trim())) {
        matchedEngine = "youtube";
        queryToSearch = match[1].trim();
      }
    } else if (spRegexAlt.test(normalizedPrompt)) {
      const match = messageToSend.match(spRegexAlt);
      if (match && match[1] && !["app", "web", "website"].includes(match[1].toLowerCase().trim())) {
        matchedEngine = "spotify";
        queryToSearch = match[1].trim();
      }
    } else if (normalizedPrompt.includes("spotify")) {
      matchedEngine = "spotify";
      queryToSearch = messageToSend
        .replace(/spotify/gi, "")
        .replace(/\b(play|open|search|listen|stream|to|on|in|and)\b/gi, "")
        .trim();
    } else if (normalizedPrompt.includes("youtube") && !normalizedPrompt.startsWith("youtube ")) {
      matchedEngine = "youtube";
      queryToSearch = messageToSend
        .replace(/youtube/gi, "")
        .replace(/\b(play|open|search|watch|on|in|to|and)\b/gi, "")
        .trim();
    }

    if (!matchedEngine) {
      // Parse commands: e.g. "youtube cat videos"
      if (normalizedPrompt.startsWith("youtube ")) {
        matchedEngine = "youtube";
        queryToSearch = messageToSend.substring(8);
      } else if (normalizedPrompt.startsWith("search youtube for ")) {
        matchedEngine = "youtube";
        queryToSearch = messageToSend.substring(19);
      } else if (normalizedPrompt.startsWith("google ")) {
        matchedEngine = "google";
        queryToSearch = messageToSend.substring(7);
      } else if (normalizedPrompt.startsWith("search google for ")) {
        matchedEngine = "google";
      queryToSearch = messageToSend.substring(18);
    } else if (normalizedPrompt.startsWith("wiki ")) {
      matchedEngine = "wikipedia";
      queryToSearch = messageToSend.substring(5);
    } else if (normalizedPrompt.startsWith("wikipedia ")) {
      matchedEngine = "wikipedia";
      queryToSearch = messageToSend.substring(10);
    } else if (normalizedPrompt.startsWith("search wikipedia for ")) {
      matchedEngine = "wikipedia";
      queryToSearch = messageToSend.substring(21);
    } else if (normalizedPrompt.startsWith("stackoverflow ")) {
      matchedEngine = "stackoverflow";
      queryToSearch = messageToSend.substring(14);
    } else if (normalizedPrompt.startsWith("search stackoverflow for ")) {
      matchedEngine = "stackoverflow";
      queryToSearch = messageToSend.substring(25);
    } else if (normalizedPrompt.startsWith("github ")) {
      matchedEngine = "github";
      queryToSearch = messageToSend.substring(7);
    } else if (normalizedPrompt.startsWith("search github for ")) {
      matchedEngine = "github";
      queryToSearch = messageToSend.substring(18);
    } else if (normalizedPrompt.startsWith("maps ")) {
      matchedEngine = "maps";
      queryToSearch = messageToSend.substring(5);
    } else if (normalizedPrompt.startsWith("search maps for ")) {
      matchedEngine = "maps";
      queryToSearch = messageToSend.substring(16);
    } else if (normalizedPrompt.startsWith("duckduckgo ")) {
      matchedEngine = "duckduckgo";
      queryToSearch = messageToSend.substring(11);
    } else if (normalizedPrompt.startsWith("search duckduckgo for ")) {
      matchedEngine = "duckduckgo";
      queryToSearch = messageToSend.substring(22);
    } else if (normalizedPrompt.startsWith("search for ")) {
      matchedEngine = "google"; // Default fallback
      queryToSearch = messageToSend.substring(11);
    } else if (normalizedPrompt.startsWith("whatsapp ")) {
      matchedEngine = "whatsapp";
      queryToSearch = messageToSend.substring(9);
    } else if (normalizedPrompt.startsWith("search whatsapp for ")) {
      matchedEngine = "whatsapp";
      queryToSearch = messageToSend.substring(20);
    } else if (normalizedPrompt === "youtube" || normalizedPrompt === "open youtube") {
      matchedEngine = "youtube";
      queryToSearch = "";
    } else if (normalizedPrompt === "google" || normalizedPrompt === "open google") {
      matchedEngine = "google";
      queryToSearch = "";
    } else if (normalizedPrompt === "wikipedia" || normalizedPrompt === "open wikipedia" || normalizedPrompt === "open wiki") {
      matchedEngine = "wikipedia";
      queryToSearch = "";
    } else if (normalizedPrompt === "stackoverflow" || normalizedPrompt === "open stackoverflow") {
      matchedEngine = "stackoverflow";
      queryToSearch = "";
    } else if (normalizedPrompt === "github" || normalizedPrompt === "open github") {
      matchedEngine = "github";
      queryToSearch = "";
    } else if (normalizedPrompt === "maps" || normalizedPrompt === "open maps") {
      matchedEngine = "maps";
      queryToSearch = "";
    } else if (
      normalizedPrompt === "whatsapp" ||
      normalizedPrompt === "whatsapp web" ||
      normalizedPrompt === "open whatsapp" ||
      normalizedPrompt === "open whatsapp web" ||
      normalizedPrompt === "open whatsappweb" ||
      normalizedPrompt.includes("whatsapp") ||
      normalizedPrompt.includes("whats app")
    ) {
      matchedEngine = "whatsapp";
      // Try to parse query from sentences like "open whatsapp for hello" or "search whatsapp for hello"
      const matchSearch = messageToSend.match(/(?:search|open|send|query)\s+(?:on\s+)?(?:whatsapp|whats\s+app)\s*(?:web)?\s*(?:for\s+)?(.*)/i);
      if (matchSearch && matchSearch[1] && !["web", "app", "web app"].includes(matchSearch[1].toLowerCase().trim())) {
        queryToSearch = matchSearch[1].trim();
      } else {
        queryToSearch = "";
      }
    }
  }

    if (matchedEngine) {
      addTerminalLog(`[GATEWAY] Universal search trigger matched. Engine: ${matchedEngine.toUpperCase()}, Query: "${queryToSearch}"`);
      triggerUniversalSearch(queryToSearch, matchedEngine);
      
      const readableQuery = queryToSearch ? `for "${queryToSearch}"` : "";
      const searchVariations = [
        `Confirming command, Akhilesh. Outbound gateway handshake initialized! I have launched a new browser resource tab utilizing the ${matchedEngine.toUpperCase()} search node ${readableQuery}. Connection status: SECURED.`,
        `Outbound gateway handshake completed, Akhilesh! I've successfully summoned a fresh ${matchedEngine.toUpperCase()} window ${readableQuery}. Let's hack it!`,
        `Direct launch authorized, buddy! Spin-up of the ${matchedEngine.toUpperCase()} search matrix completed ${readableQuery}. It's on your screen now with zero lag!`,
        `Roger that, Akhilesh! Deployed a targeted outbound ${matchedEngine.toUpperCase()} pipeline ${readableQuery} in a new browser node. Speed is absolute prime today!`
      ];
      const replyContent = searchVariations[Math.floor(Math.random() * searchVariations.length)];
      const replyId = "msg-reply-" + Date.now().toString(36);

      setLastTarkReply(replyContent);

      setChatMessages((prev) => [
        ...prev,
        {
          id: replyId,
          role: "assistant",
          content: replyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (isVoiceEnabled) {
        setTimeout(() => {
          speakText(replyContent, replyId);
        }, 150);
      }

      setIsSendingPrompt(false);
      return;
    }

    try {
      // Assemble history format for backend Express context query
      const history = chatMessages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        content: msg.content
      })).slice(-6); // pass last 6 turns

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend, chatHistory: history })
      });

      if (response.ok) {
        const data = await response.json();
        const replyId = "msg-reply-" + Date.now().toString(36);
        setLastTarkReply(data.reply);
        setChatMessages((prev) => [
          ...prev,
          {
            id: replyId,
            role: "assistant",
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            audio: data.audio
          }
        ]);
        addTerminalLog("[TARK SYSTEM] Automation response completed safely.");

        if (isVoiceEnabled) {
          setTimeout(() => {
            speakText(data.reply, replyId, data.audio);
          }, 150);
        }
      } else {
        throw new Error("API Route Fault");
      }
    } catch (err) {
      const errorMsg = "Apologies, Sir. I was unable to broadcast this command to the local scheduling core. Please check that the server is online.";
      setLastTarkReply(errorMsg);
      setChatMessages((prev) => [
        ...prev,
        {
          id: "msg-err-" + Date.now().toString(36),
          role: "assistant",
          content: errorMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      addTerminalLog("[ERROR] Failed to exchange network telemetry signals.");
    } finally {
      setIsSendingPrompt(false);
    }
  };

  // Pre-process filters
  const filteredProcesses = systemState?.processes.filter(p => {
    if (selectedProcessFilter === "suspicious") return p.risk !== "safe";
    if (selectedProcessFilter === "safe") return p.risk === "safe";
    return true;
  }) || [];

  // Pre-process schedule categories & filtering
  const defaultCategories = ["security", "maintenance", "personal", "backup", "network", "optimization"];
  const currentSchedule = systemState?.schedule || [];
  const scheduleCategoriesFromTasks = currentSchedule.map(t => t.category.toLowerCase().trim()).filter(Boolean);
  const legendCategories = Array.from(new Set([...defaultCategories, ...scheduleCategoriesFromTasks]));

  const getCategoryCount = (catName: string) => {
    return currentSchedule.filter(t => t.category.toLowerCase().trim() === catName.toLowerCase().trim()).length;
  };

  const filteredTasks = currentSchedule.filter((task) => {
    if (selectedCategoryFilter === "all") return true;
    return task.category.toLowerCase().trim() === selectedCategoryFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans grid-pattern relative overflow-hidden flex flex-col antialiased selection:bg-cyan-500 selection:text-white">
      {/* Decorative scan line laser */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <div className="w-full h-px bg-cyan-500/30 scan-line shadow-[0_0_15px_rgba(6,182,212,0.4)]" />
      </div>

      {/* Floating status header bar - Premium Glowing Obsidian Header */}
      <header className="border-b border-cyan-500/15 bg-slate-950/80 backdrop-blur-xl px-6 py-5 flex flex-wrap items-center justify-between gap-5 z-10 text-white shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 bg-cyan-950/80 border border-cyan-400 rounded-xl flex items-center justify-center text-cyan-400 font-mono shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-pulse">
              <Zap className="h-5 w-5" />
            </div>
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-sans tracking-wide flex items-center gap-2">
              TARK <span className="text-cyan-400 text-xs px-2.5 py-1 border border-cyan-500/35 rounded bg-cyan-950/50 font-mono font-semibold tracking-widest animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.15)]">PHASE 4 ACTIVE</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">Autonomous Security Intuition & Systems Control HUD</p>
          </div>
        </div>

        {/* Global Security Posture & Dynamic Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5 px-3 py-2 border border-slate-800 rounded-lg bg-slate-900/80 font-mono text-xs">
            <span className="text-slate-450 font-semibold text-[10px]">SAFE MODE:</span>
            <span className={systemState?.safeMode ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
              {systemState?.safeMode ? "ENGAGED" : "STANDARD CORRUPT"}
            </span>
          </div>

          <div className={`flex items-center gap-2 px-3.5 py-2 border rounded-lg font-mono text-xs font-semibold ${
            systemState?.securityLevel === "secured"
              ? "border-emerald-500/35 bg-emerald-950/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
              : systemState?.securityLevel === "alert"
              ? "border-amber-500/35 bg-amber-950/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
              : "border-red-500/35 bg-red-950/50 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
          }`}>
            <Shield className="h-4 w-4 text-cyan-400" />
            <span>SECURITY LEVEL: {systemState?.securityLevel.toUpperCase() || "RESOLVING"}</span>
          </div>

          {/* Quick optimization / diagnostic run */}
          <button
            onClick={runOptimizeRAM}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 active:scale-95 disabled:slate-800 transition-all duration-200 text-white font-mono text-xs font-bold rounded-lg cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:cursor-not-allowed"
          >
            {isOptimizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCw className="h-3.5 w-3.5" />}
            OPTIMIZE RAM
          </button>
        </div>
      </header>

      {/* Main Grid Workbench */}
      <main className="flex-1 p-5 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1700px] w-full mx-auto z-10">
        
        {/* LEFT COLUMN (7 COLS): Telemetry Cards & Main Processes Control */}
        <section className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Real-time Hardware Telemetry HUD - Sleek Dark Futuristic Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            
            {/* CPU Metric Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              whileHover={{ 
                y: -6, 
                backgroundColor: "rgba(15, 23, 42, 0.8)", 
                borderColor: "rgba(6, 182, 212, 0.6)",
                boxShadow: "0 10px 30px rgba(6, 182, 212, 0.2)"
              }}
              className="p-5 bg-slate-900/65 border border-slate-800/80 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="flex items-center justify-between text-slate-400 font-mono text-xs font-bold tracking-wider mb-3 relative z-10">
                <span>CPU CORES</span>
                <Cpu className="h-5 w-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="relative z-10">
                <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
                  {systemState?.systemMetrics.cpu ?? "--"}<span className="text-cyan-400 font-semibold">%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full mt-3.5 overflow-hidden border border-slate-800/50">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                    style={{ width: `${systemState?.systemMetrics.cpu || 0}%` }}
                  />
                </div>
              </div>
            </motion.div>
 
            {/* RAM Free Space Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              whileHover={{ 
                y: -6, 
                backgroundColor: "rgba(15, 23, 42, 0.8)", 
                borderColor: "rgba(16, 185, 129, 0.6)",
                boxShadow: "0 10px 30px rgba(16, 185, 129, 0.2)"
              }}
              className="p-5 bg-slate-900/65 border border-slate-800/80 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="flex items-center justify-between text-slate-400 font-mono text-xs font-bold tracking-wider mb-3 relative z-10">
                <span>RAM FREE</span>
                <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
              </div>
              <div className="relative z-10">
                <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
                  {systemState?.systemMetrics.ramFree ?? "--"}<span className="text-xs text-slate-400 font-sans ml-1 font-semibold">GB</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-2 flex items-center justify-between">
                  <span>OF {systemState?.systemMetrics.ramTotal} GB CAPACITY</span>
                </div>
              </div>
            </motion.div>
 
            {/* Disk space storage allocation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              whileHover={{ 
                y: -6, 
                backgroundColor: "rgba(15, 23, 42, 0.8)", 
                borderColor: "rgba(245, 158, 11, 0.6)",
                boxShadow: "0 10px 30px rgba(245, 158, 11, 0.2)"
              }}
              className="p-5 bg-slate-900/65 border border-slate-800/80 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="flex items-center justify-between text-slate-400 font-mono text-xs font-bold tracking-wider mb-3 relative z-10">
                <span>LOCAL DISC</span>
                <Database className="h-5 w-5 text-amber-400" />
              </div>
              <div className="relative z-10">
                <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
                  {systemState?.systemMetrics.diskUsed ?? "--"}<span className="text-xs text-slate-400 font-sans ml-1 font-semibold">GB</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-2 truncate">
                  /{systemState?.systemMetrics.diskTotal} GB MOUNTED PATH
                </div>
              </div>
            </motion.div>
 
            {/* Simulated Live Network Payload IO */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
              whileHover={{ 
                y: -6, 
                backgroundColor: "rgba(15, 23, 42, 0.8)", 
                borderColor: "rgba(168, 85, 247, 0.6)",
                boxShadow: "0 10px 30px rgba(168, 85, 247, 0.2)"
              }}
              className="p-5 bg-slate-900/65 border border-slate-800/80 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300 group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              <div className="flex items-center justify-between text-slate-400 font-mono text-xs font-bold tracking-wider mb-3 relative z-10">
                <span>NETWORK LINK</span>
                <ListRestart className="h-5 w-5 text-purple-400" />
              </div>
              <div className="font-mono relative z-10 space-y-1 mt-1">
                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <span>DL:</span> <span className="text-emerald-400 font-bold">{systemState?.systemMetrics.networkIn || 0} KB/s</span>
                </div>
                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <span>UL:</span> <span className="text-cyan-400 font-bold">{systemState?.systemMetrics.networkOut || 0} KB/s</span>
                </div>
              </div>
            </motion.div>
 
          </div>

          {/* Active Process Control Board - Premium Futuristic Dark grid card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col flex-1 shadow-[0_4px_30px_rgba(0,0,0,0.4)] min-h-[420px] transition-all duration-300 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-5 border-b border-slate-800 pb-5 mb-5">
              <div>
                <h2 className="font-bold tracking-tight text-lg text-white flex items-center gap-2.5">
                  <Sliders className="h-5 w-5 text-cyan-400" />
                  Core Process Automations Control
                </h2>
                <p className="text-xs text-slate-400 font-mono tracking-wider">LIVE TELEMETRY PROCESSING AND SECURE RUNTIME PIPELINES</p>
              </div>
 
              {/* Filtering triggers */}
              <div className="flex items-center gap-1 border border-slate-800 p-1 rounded-xl bg-slate-950/60 font-mono text-xs font-semibold">
                <button
                  onClick={() => setSelectedProcessFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${selectedProcessFilter === "all" ? "bg-slate-800 text-cyan-400 border border-cyan-500/20 shadow-sm" : "text-slate-450 hover:text-slate-200"}`}
                >
                  ALL ({systemState?.processes.length || 0})
                </button>
                <button
                  onClick={() => setSelectedProcessFilter("suspicious")}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${selectedProcessFilter === "suspicious" ? "bg-red-950/50 text-red-400 border border-red-500/30" : "text-slate-450 hover:text-slate-200"}`}
                >
                  ALERTED ({systemState?.processes.filter(p => p.risk !== "safe").length || 0})
                </button>
                <button
                  onClick={() => setSelectedProcessFilter("safe")}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${selectedProcessFilter === "safe" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-500/30" : "text-slate-450 hover:text-slate-200"}`}
                >
                  SECURE
                </button>
              </div>
            </div>
 
            {/* Memory Table list */}
            <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-3.5">
              <AnimatePresence mode="popLayout">
                {filteredProcesses.map((proc) => (
                  <motion.div
                     layout
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     key={proc.pid}
                     className={`p-4 border rounded-xl transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${
                       proc.status === "terminated"
                         ? "bg-slate-950/40 border-slate-900 text-slate-500 opacity-60"
                         : proc.risk === "critical"
                         ? "bg-gradient-to-r from-red-950/25 to-transparent border-red-500/30 hover:border-red-500/50"
                         : proc.risk === "suspicious"
                         ? "bg-gradient-to-r from-amber-950/25 to-transparent border-amber-500/30 hover:border-amber-500/50"
                         : "bg-slate-900/50 hover:bg-slate-950/60 border-slate-800 hover:border-cyan-500/20"
                     }`}
                  >
                    {/* Thread details */}
                    <div className="flex items-start gap-3.5">
                      <div className={`px-2.5 py-1.5 rounded-lg border font-mono font-bold text-xs tracking-wider ${
                        proc.status === "terminated"
                          ? "bg-slate-900 border-slate-800 text-slate-500"
                          : proc.risk === "critical"
                          ? "bg-red-950/80 border-red-500/50 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                          : proc.risk === "suspicious"
                          ? "bg-amber-950/80 border-amber-500/50 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                          : "bg-cyan-950/80 border-cyan-500/30 text-cyan-404"
                      }`}>
                        PID {proc.pid}
                      </div>
 
                      <div>
                        <div className="font-bold tracking-tight text-white flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm text-slate-100">{proc.name}</span>
                          {proc.port && (
                            <span className="text-[9px] text-cyan-404 px-2 py-0.5 rounded-md border border-cyan-500/30 font-mono bg-cyan-950/50 font-bold tracking-wider animate-pulse">
                              PORT {proc.port}
                            </span>
                          )}
                          {proc.status === "terminated" && (
                            <span className="text-[9px] text-slate-500 px-2 py-0.5 rounded-md border border-slate-800 font-mono bg-slate-950 font-bold">
                              TERMINATED
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-sans mt-1 leading-snug">{proc.description}</p>
                      </div>
                    </div>
 
                    {/* Performance metrics & Controls */}
                    <div className="flex items-center gap-4 sm:gap-6 justify-between border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                      <div className="font-mono text-xs flex gap-5 text-slate-400">
                        <div>
                          CPU: <span className={proc.status === "terminated" ? "text-slate-500" : "text-slate-200 font-bold"}>{proc.cpu}%</span>
                        </div>
                        <div>
                          RAM: <span className={proc.status === "terminated" ? "text-slate-500" : "text-slate-200 font-bold"}>{proc.memory}MB</span>
                        </div>
                      </div>
 
                      {/* Interactive quarantine controls */}
                      {proc.status !== "terminated" ? (
                        <div className="flex items-center gap-2">
                          {proc.risk !== "safe" && (
                            <button
                              onClick={() => controlProcess(proc.pid, "quarantine")}
                              className="px-3 py-1.5 text-[10px] font-mono border border-amber-500/45 hover:border-amber-400 text-amber-400 bg-amber-950/40 hover:bg-amber-900/30 rounded-lg transition-all cursor-pointer font-bold"
                            >
                              QUARANTINE
                            </button>
                          )}
                          <button
                            onClick={() => controlProcess(proc.pid, "terminate")}
                            className="px-3 py-1.5 text-[10px] font-mono border border-red-500/45 hover:border-red-450 text-red-405 bg-red-950/45 hover:bg-red-900/35 rounded-lg transition-all cursor-pointer font-bold"
                          >
                            TERMINATE
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono font-bold">MUTED</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Universal Web Search & Systems Launch Portal - Modern Futuristic style */}
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col gap-5 shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all duration-300 backdrop-blur-xl">
            <div>
              <h2 className="font-bold text-lg tracking-tight flex items-center gap-2.5 text-white">
                <Search className="h-5 w-5 text-cyan-400 animate-pulse" />
                Universal Browser Search & Systems Launch Portal
              </h2>
              <p className="text-xs text-slate-400 font-mono tracking-wider">EXECUTE OUTGOING WEB INDEX QUERIES DIRECTLY ACROSS PARALLEL NETWORKS</p>
            </div>
 
            {/* Elegant Search form wrapper */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                triggerUniversalSearch(searchQuery);
              }}
              className="space-y-4 bg-slate-950/65 p-4 rounded-xl border border-slate-850"
            >
              <div className="flex flex-col sm:flex-row gap-3 font-mono text-xs">
                {/* Engine Selector */}
                <select
                  value={searchEngine}
                  onChange={(e) => setSearchEngine(e.target.value as any)}
                  className="px-3.5 py-2.5 bg-slate-900 border border-slate-800 focus:border-cyan-500 text-cyan-400 rounded-lg outline-none font-bold cursor-pointer transition-all duration-200 shadow-inner"
                >
                  <option value="google">GOOGLE TARGET</option>
                  <option value="youtube">YOUTUBE ENGINE</option>
                  <option value="spotify">SPOTIFY MUSIC</option>
                  <option value="whatsapp">WHATSAPP WEB</option>
                  <option value="wikipedia">WIKI DISPATCH</option>
                  <option value="stackoverflow">STACKOVERFLOW</option>
                  <option value="github">GITHUB CONSOLE</option>
                  <option value="maps">MAPS POSITION</option>
                  <option value="duckduckgo">DUCKDUCKGO</option>
                </select>
 
                {/* Query Input */}
                <div className="flex-1 relative flex">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      searchEngine === "google" ? "Search the web through Google secure index..." :
                      searchEngine === "youtube" ? "Search media and reference videos on YouTube..." :
                      searchEngine === "spotify" ? "Search and stream music on Spotify web..." :
                      searchEngine === "whatsapp" ? "Send pre-filled direct WhatsApp message text..." :
                      searchEngine === "wikipedia" ? "Scan knowledge encyclopedias on Wikipedia..." :
                      searchEngine === "stackoverflow" ? "Search expert code debug threads..." :
                      searchEngine === "github" ? "Scan repositories and tool chains on GitHub..." :
                      searchEngine === "maps" ? "Trace coordinate locations or addresses on Maps..." :
                      "Query DuckDuckGo privacy index search nodes..."
                    }
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-lg font-sans text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-500 transition shadow-inner"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-sm font-bold"
                    >
                      &times;
                    </button>
                  )}
                </div>
 
                {/* Run button */}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 active:scale-95 font-bold rounded-lg text-white transition whitespace-nowrap cursor-pointer shadow-[0_3px_12px_rgba(6,182,212,0.3)]"
                >
                  DISPATCH &rarr;
                </button>
              </div>
 
              {/* Live search keywords indicator if user typing */}
              {searchQuery.trim() && (
                <div className="text-[10px] text-cyan-400 font-mono flex items-center justify-between border-t border-slate-900 pt-2 px-1 animate-pulse">
                  <span>Handshaking outbound link for: "{searchQuery}"</span>
                  <span className="text-slate-400 font-semibold">Selected target: {searchEngine.toUpperCase()}</span>
                </div>
              )}
            </form>
            
            {/* Direct Multi-Engine Routing Matrix Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
              {[
                { id: "google", label: "GOOGLE NET", color: "text-blue-400", bg: "bg-blue-500" },
                { id: "youtube", label: "YOUTUBE NODE", color: "text-red-400", bg: "bg-red-500" },
                { id: "spotify", label: "SPOTIFY PLAY", color: "text-green-450", bg: "bg-emerald-500" },
                { id: "whatsapp", label: "WHATSAPP WEB", color: "text-emerald-400", bg: "bg-emerald-555" },
                { id: "wikipedia", label: "WIKI INTEL", color: "text-slate-350", bg: "bg-slate-500" },
                { id: "github", label: "GITHUB CODE", color: "text-purple-400", bg: "bg-purple-500" },
                { id: "stackoverflow", label: "STACKOVERFLOW", color: "text-orange-400", bg: "bg-orange-500" },
                { id: "maps", label: "MAPS TRACE", color: "text-teal-400", bg: "bg-teal-500" },
                { id: "duckduckgo", label: "DUCKDUCK PRIVATE", color: "text-yellow-405", bg: "bg-yellow-500" },
                { id: "loopback", label: "LOOPBACK HOME", color: "text-cyan-400", bg: "bg-cyan-500", isHome: true }
              ].map((engine) => {
                const hasQuery = searchQuery.trim().length > 0;
                
                return (
                  <button
                    key={engine.id}
                    type="button"
                    onClick={() => {
                      if (engine.isHome) {
                        addTerminalLog("[GATEWAY] Resetting browser console scope to loopback container...");
                        window.open("/", "_blank");
                      } else {
                        triggerUniversalSearch(searchQuery, engine.id as any);
                      }
                    }}
                    className="p-3 bg-slate-950 border border-slate-800/80 hover:border-cyan-500/50 hover:shadow-[0_0_12px_rgba(6,182,212,0.1)] rounded-xl flex flex-col justify-between items-stretch text-left transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold tracking-wider mb-2">
                      <span className={engine.color}>{engine.label}</span>
                      <div className={`h-1.5 w-1.5 rounded-full ${engine.bg} animate-pulse`} />
                    </div>
                    <div className="text-[10px] text-slate-400 truncate group-hover:text-cyan-400 font-sans leading-none pb-0.5">
                      {engine.isHome ? "Loopback link" : hasQuery ? `Search "${searchQuery}"` : "Access Home portal"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 🧠 TARK ADAPTIVE PROCESS MEMORY CARRIER */}
          <div className="p-5 bg-slate-900 border border-cyan-500/10 rounded-2xl font-mono text-xs text-cyan-400 flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all duration-300">
            <div className="flex items-center justify-between border-b border-slate-805/40 pb-2 mb-2">
              <span className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold tracking-wider">
                <Cpu className="h-4 w-4 animate-pulse text-cyan-400" />
                🧠 NEURAL PROCESS MEMORY CACHE
              </span>
              <span className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 border border-cyan-800/40 rounded text-[9px] font-bold animate-pulse">
                ADAPTIVE RECALL SYSTEM
              </span>
            </div>

            {/* Sub-Tabs for displaying Task Cache, Visual Frequency Chart, and AI Suggestions */}
            <div className="flex border border-slate-800/40 rounded-xl p-0.5 bg-slate-950/60 font-mono text-[8.5px] font-bold gap-1 mb-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveMemoryTab("cache")}
                className={`flex-1 py-1 text-center rounded-lg transition-all duration-150 cursor-pointer ${activeMemoryTab === "cache" ? "bg-slate-900 border border-slate-800/80 text-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]" : "text-slate-500 hover:text-slate-300"}`}
              >
                🧠 CACHED ({learnedTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveMemoryTab("frequency")}
                className={`flex-1 py-1 text-center rounded-lg transition-all duration-150 cursor-pointer ${activeMemoryTab === "frequency" ? "bg-slate-900 border border-slate-800/80 text-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]" : "text-slate-500 hover:text-slate-300"}`}
              >
                📊 HITS FREQUENCY
              </button>
              <button
                type="button"
                onClick={() => setActiveMemoryTab("suggestions")}
                className={`flex-1 py-1 text-center rounded-lg transition-all duration-150 cursor-pointer ${activeMemoryTab === "suggestions" ? "bg-slate-900 border border-slate-800/80 text-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.15)]" : "text-slate-500 hover:text-slate-300"}`}
              >
                💡 TARK SUGGESTIONS
              </button>
            </div>

            {/* TAB PANELS */}
            {activeMemoryTab === "cache" && (
              <div className="space-y-3">
                {learnedTasks.length > 0 && (
                  <div className="flex items-center justify-between bg-slate-950/85 px-3 py-2 border border-slate-850/60 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${isSequenceRunning ? "bg-emerald-400 animate-ping" : "bg-cyan-500"}`} />
                      <span className="font-mono text-[9.5px] font-bold text-slate-300">
                        {isSequenceRunning ? "PIPELINE ACTIVE" : "PIPELINE COLD"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={runAllLearnedTasks}
                      className={`px-3 py-1.5 text-[9px] font-bold rounded-lg cursor-pointer transition-all duration-300 flex items-center gap-1.5 border uppercase ${
                        isSequenceRunning
                          ? "bg-rose-950/45 border-rose-500/40 text-rose-400 hover:bg-rose-900/40 hover:text-rose-200 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                          : "bg-cyan-950/45 border-cyan-500/40 text-cyan-400 hover:bg-cyan-900/45 hover:text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.15)] animate-pulse"
                      }`}
                    >
                      {isSequenceRunning ? (
                        <>
                          <XCircle className="h-3 w-3 shrink-0" />
                          STOP RUNNER
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 shrink-0 fill-current" />
                          RUN ALL IN SEQUENCE
                        </>
                      )}
                    </button>
                  </div>
                )}

                <div className="overflow-y-auto max-h-[145px] pr-1 space-y-2 text-[11px] select-text">
                  {learnedTasks.length === 0 ? (
                    <div className="text-slate-500 italic py-2 text-center">
                      No dynamic tasks indexed. Provide browser or system commands to trigger automated learning constraints!
                    </div>
                  ) : (
                    [...learnedTasks].sort((a, b) => b.hits - a.hits).map((t) => {
                      const isActive = activeSequenceId === t.id;
                      return (
                        <div 
                          key={t.id} 
                          className={`flex justify-between items-center py-2 px-3 border rounded-xl transition-all duration-155 ${
                            isActive
                              ? "bg-cyan-950/20 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                              : "bg-slate-950/80 border-slate-805/40 hover:border-cyan-500/20"
                          }`}
                        >
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-cyan-300 font-bold text-[11px] truncate flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-cyan-400 animate-pulse" : "bg-cyan-455"}`} />
                              "{t.command}"
                            </span>
                            <span className="text-slate-400 text-[10px] font-sans truncate mt-0.5">
                              {getFriendlyTargetLabel(t.resolvedPattern, t.target)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 pl-3 shrink-0">
                            <div className="flex flex-col items-end">
                              <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950/40 px-2 py-0.5 border border-emerald-900/30 rounded font-mono">
                                {t.hits} hits
                              </span>
                              <span className="text-slate-500 text-[9px] font-mono mt-0.5">{t.confidence}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  addTerminalLog(`[PIPELINE] Selected task "${t.command}" from cache.`);
                                  submitToTark(t.command);
                                }}
                                className={`${
                                  isActive 
                                    ? "bg-cyan-950/60 border-cyan-500 text-cyan-400 pointer-events-none" 
                                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40"
                                } p-1.5 border rounded-lg cursor-pointer transition active:scale-95 flex items-center justify-center`}
                                title="Play/Run task action"
                              >
                                {isActive ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Play className="h-3.5 w-3.5 fill-current" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteLearnedTask(t.id)}
                                className="text-slate-500 hover:text-red-400 cursor-pointer p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-red-500/20 flex items-center justify-center transition hover:bg-slate-950"
                                title="Delete learned task"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeMemoryTab === "frequency" && (
              <div className="overflow-y-auto max-h-[145px] pr-1 space-y-2 text-[11px]">
                {learnedTasks.length === 0 ? (
                  <div className="text-slate-500 italic py-2 text-center">
                    No active statistics tracked. Trigger automated tasks to visualize frequency distribution!
                  </div>
                ) : (
                  (() => {
                    const maxHits = Math.max(...learnedTasks.map(t => t.hits), 1);
                    return learnedTasks.map((t) => {
                      const pct = Math.round((t.hits / maxHits) * 100);
                      return (
                        <div 
                          key={`freq-${t.id}`} 
                          onClick={() => {
                            addTerminalLog(`[AI RECOMMEND] Selected task "${t.command}" from frequency metrics.`);
                            submitToTark(t.command);
                          }}
                          className="p-2.5 bg-slate-950/80 hover:bg-slate-950 border border-slate-805/30 hover:border-cyan-500/30 rounded-xl transition duration-150 group cursor-pointer"
                          title="Click to execute this task with TARK"
                        >
                          <div className="flex justify-between items-center mb-1 text-[10px] font-bold">
                            <span className="text-cyan-300 group-hover:text-cyan-200 truncate pr-2 max-w-[70%]">
                              "{t.command}"
                            </span>
                            <span className="text-cyan-400 font-mono text-[9px] shrink-0">
                              {t.hits} {t.hits === 1 ? "hit" : "hits"} ({pct}%)
                            </span>
                          </div>
                          <div className="relative h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                              className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                              style={{ boxShadow: "0 0 8px rgba(6, 182, 212, 0.45)" }}
                            />
                          </div>
                          <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono mt-1">
                            <span className="capitalize">{t.resolvedPattern.replace("_", " ")}</span>
                            <span>CONFIDENCE: {t.confidence.split(" ")[0]}</span>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            )}

            {activeMemoryTab === "suggestions" && (
              <div className="overflow-y-auto max-h-[145px] pr-1 space-y-2 text-[11px]">
                {(() => {
                  const items = getAIRecommendations(learnedTasks);
                  return items.map((rec) => (
                    <div 
                      key={rec.id} 
                      className="p-2.5 bg-slate-950/85 hover:bg-slate-950 border border-purple-500/10 hover:border-purple-500/30 rounded-xl transition duration-150"
                    >
                      <div className="flex justify-between items-center mb-1 text-[10px] font-bold">
                        <span className="text-purple-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                          {rec.title}
                        </span>
                        <span className="text-purple-300 bg-purple-950/40 px-1.5 py-0.5 border border-purple-900/30 rounded text-[7px] font-mono uppercase shrink-0 font-bold">
                          {rec.badge}
                        </span>
                      </div>
                      <p className="text-slate-400 font-sans text-[10px] leading-relaxed mb-2">
                        {rec.desc}
                      </p>
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-[8.5px] text-slate-500 italic max-w-[50%] truncate font-mono">
                          Reason: {rec.reason}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            addTerminalLog(`[AI ADVICE] Invoking suggested command: "${rec.action}"`);
                            submitToTark(rec.action);
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 bg-purple-950/60 hover:bg-purple-900/60 active:scale-95 border border-purple-500/30 rounded text-[9px] font-bold text-purple-300 transition cursor-pointer font-mono shrink-0"
                        >
                          <Zap className="h-2.5 w-2.5" />
                          RUN SUGGESTION
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>

          {/* Interactive Secure System Logs Terminal window - Modern dark monospace contrasting style */}
          <div className="p-5 bg-slate-900 border border-slate-805/40 rounded-2xl font-mono text-xs text-cyan-400 h-[170px] flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all duration-300">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 text-[10px] text-cyan-500">
              <span className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold tracking-wider">
                <Terminal className="h-4 w-4 animate-pulse text-cyan-500" />
                AUTONOMOUS SYSTEM LOGS DAEMON
              </span>
              <span className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 border border-cyan-800/40 rounded text-[9px] font-bold animate-pulse">DAEMON ONLINE</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 max-h-[100px] text-[11px] font-mono leading-relaxed select-text">
              {daemonLogs.length > 0 ? (
                daemonLogs.map((log, index) => (
                  <div key={`daemon-${index}`} className="text-cyan-300 font-semibold border-l-2 border-cyan-500/40 pl-1.5 py-0.5 hover:bg-cyan-950/10 transition">{log}</div>
                ))
              ) : null}
              {terminalLogs.map((log, index) => (
                <div key={`system-${index}`} className="text-slate-400">{log}</div>
              ))}
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN (5 COLS): Interactive scheduling engine, AI chat executor, Vulnerability Scanner tabs */}
        <section className="lg:col-span-5 flex flex-col gap-8">

          {/* Tab Navigation selector - Modern Cyberspace Dual tone Dark layout */}
          <div className="flex border border-slate-800 rounded-xl p-1 bg-slate-950/60 shadow-[0_4px_30px_rgba(0,0,0,0.3)] font-mono text-xs font-bold gap-1.5 backdrop-blur-md">
            <button
              onClick={() => setActiveWorkspaceTab("telemetry")}
              className={`flex-1 py-3 text-center rounded-lg transition-all duration-200 cursor-pointer ${activeWorkspaceTab === "telemetry" ? "bg-slate-900 border border-slate-800 text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "text-slate-450 hover:text-slate-200 hover:bg-slate-900/40"}`}
            >
              NLP DIRECTIVES
            </button>
            <button
              onClick={() => setActiveWorkspaceTab("security")}
              className={`flex-1 py-3 text-center rounded-lg transition-all duration-200 cursor-pointer ${activeWorkspaceTab === "security" ? "bg-slate-900 border border-slate-800 text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "text-slate-450 hover:text-slate-200 hover:bg-slate-900/40"}`}
            >
              VULN AUDITOR
            </button>
            <button
              onClick={() => setActiveWorkspaceTab("schedule")}
              className={`flex-1 py-3 text-center rounded-lg transition-all duration-200 cursor-pointer ${activeWorkspaceTab === "schedule" ? "bg-slate-900 border border-slate-800 text-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "text-slate-450 hover:text-slate-200 hover:bg-slate-900/40"}`}
            >
              CRON SCHEDULER
            </button>
          </div>
 
          {/* TAB CONTENT 1: NLP TARK AI AGENT PROMPT HUD (Real backend-proxy chat logs) */}
          {activeWorkspaceTab === "telemetry" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col h-[550px] justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all duration-300 backdrop-blur-md">
              <VoiceSphere
                isListening={isListening}
                isSpeaking={activeSpeakingId !== null}
                isThinking={isSendingPrompt}
                lastUserTranscript={lastUserTranscript}
                lastTarkReply={lastTarkReply}
                liveTranscript={liveTranscript}
                isVoiceConversationActive={isVoiceConversationActive}
                isVoiceEnabled={isVoiceEnabled}
                speechError={speechError}
                voiceRate={voiceRate}
                setVoiceRate={setVoiceRate}
                voicePitch={voicePitch}
                setVoicePitch={setVoicePitch}
                onToggleVoiceLink={() => {
                  const nextConv = !isVoiceConversationActive;
                  setIsVoiceConversationActive(nextConv);
                  if (nextConv) {
                    setIsVoiceEnabled(true);
                    addTerminalLog("[VOICE LINK] Hands-free continuous conversational link established.");
                    setTimeout(() => {
                      startVoiceCapture();
                    }, 300);
                  } else {
                    stopVoiceCapture();
                    addTerminalLog("[VOICE LINK] Continuous conversational link terminated safely.");
                  }
                }}
                onToggleVoiceTts={() => {
                  const nextVoice = !isVoiceEnabled;
                  setIsVoiceEnabled(nextVoice);
                  if (!nextVoice) {
                    window.speechSynthesis?.cancel();
                    setActiveSpeakingId(null);
                  } else {
                    // pre-warm speech synthesis on user click gesture
                    if (typeof window !== "undefined" && window.speechSynthesis) {
                      try {
                        const silentUtterance = new SpeechSynthesisUtterance("");
                        silentUtterance.volume = 0;
                        window.speechSynthesis.speak(silentUtterance);
                      } catch (e) {}
                    }
                  }
                  addTerminalLog(`[TTS ENGINE] Speech Synthesis is now ${nextVoice ? "ENABLED" : "DISABLED"}`);
                }}
                onStartListening={startVoiceCapture}
                onStopListening={stopVoiceCapture}
              />
            </div>
          )}
 
          {/* TAB CONTENT 2: WORKSPACE REAL ENVIRONMENT SECURITIES AUDITOR */}
          {activeWorkspaceTab === "security" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col h-[550px] justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all duration-300 backdrop-blur-md">
              <div className="border-b border-slate-800/85 pb-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-red-400" />
                    <div>
                      <h3 className="font-bold text-white text-base">Integrity & Logs Scanner</h3>
                      <p className="text-[10px] text-slate-400 font-mono tracking-wider">REAL CONTEXT AUDIT AGAINST LOG FILES AND SECRETS</p>
                    </div>
                  </div>
                  <button
                    onClick={runSecurityAudit}
                    disabled={isAuditing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/45 text-red-400 font-mono text-xs border border-red-500/30 rounded-lg cursor-pointer transition font-bold"
                  >
                    {isAuditing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    RE-AUDIT
                  </button>
                </div>
              </div>
 
              {!auditReport ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-950/60 rounded-2xl border border-slate-850 my-3">
                  <FolderLock className="h-12 w-12 text-slate-500 mb-3 animate-pulse" />
                  <h4 className="text-sm font-bold text-slate-300 font-mono tracking-wider">AUDIT QUEUE STANDBY</h4>
                  <p className="text-xs text-slate-400 font-sans max-w-[220px] mt-1.5 leading-relaxed">Ready to perform sandbox checks on credentials, bindings, and active process configurations.</p>
                  <button
                    onClick={runSecurityAudit}
                    disabled={isAuditing}
                    className="mt-5 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold font-mono text-xs rounded-xl transition shadow shadow-cyan-600/10 cursor-pointer"
                  >
                    DEPLOY AUDITOR
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between my-2 overflow-hidden gap-4">
                  {/* Score breakdown metrics panel */}
                  <div className="grid grid-cols-4 gap-2 bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl text-center font-mono text-slate-300 shadow-inner">
                    <div className="border-r border-slate-850">
                      <div className="text-xl font-extrabold text-white">{auditReport.score}%</div>
                      <div className="text-[9px] text-slate-400 leading-none mt-1 font-bold">SCORE</div>
                    </div>
                    <div className="border-r border-slate-850 font-bold text-emerald-400">
                      <div className="text-xl">{auditReport.metrics.passed}</div>
                      <div className="text-[9px] leading-none mt-1 font-bold">PASSED</div>
                    </div>
                    <div className="border-r border-slate-850 font-bold text-amber-400">
                      <div className="text-xl">{auditReport.metrics.warnings}</div>
                      <div className="text-[9px] leading-none mt-1 font-bold">WARN</div>
                    </div>
                    <div className="font-bold text-red-400">
                      <div className="text-xl">{auditReport.metrics.critical}</div>
                      <div className="text-[9px] leading-none mt-1 font-bold">THREAT</div>
                    </div>
                  </div>
 
                  {/* Scanned vulnerable issues stream scroll */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[220px]">
                    {auditReport.vulnerabilities.map((vuln, i) => (
                      <div key={i} className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl text-xs leading-relaxed font-sans shadow-md hover:shadow-cyan-500/5 transition duration-200">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-slate-400 font-bold text-[10px] break-all tracking-wider">{vuln.category.toUpperCase()}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${
                            vuln.severity === "high"
                              ? "bg-red-955/30 text-red-400 border-red-500/30"
                              : vuln.severity === "medium"
                              ? "bg-amber-955/30 text-amber-400 border-amber-500/30"
                              : "bg-slate-900 text-slate-305 border-slate-800"
                          }`}>
                            {vuln.severity.toUpperCase()}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-100 mt-2 text-sm">{vuln.title}</h5>
                        <p className="text-slate-400 mt-1 font-sans font-medium text-xs leading-snug">{vuln.details}</p>
                        <div className="mt-3 pt-2.5 border-t border-slate-900 flex flex-col gap-1 font-mono text-[9px] text-cyan-400">
                          <div className="break-all text-slate-500">Node: {vuln.location}</div>
                          <div className="font-semibold text-cyan-400">Remedial: {vuln.remediation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
 
                  <div className="text-[9px] text-slate-500 font-mono text-center pt-2 border-t border-slate-800">
                    SECURED WORKSPACE DIRECT MATRIX • SCANNED {new Date(auditReport.scannedAt).toLocaleTimeString()}
                  </div>
                </div>
              )}
 
              {/* Threat alerts logs panel */}
              <div className="p-4 border border-slate-800 rounded-xl bg-slate-950/60 mt-1.5 shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 font-bold select-none">
                  <span className="flex items-center gap-1.5 text-slate-350">
                    <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" />
                    Pending Hazard Logs ({systemState?.alerts.filter(a => !a.resolved).length || 0})
                  </span>
                  <button onClick={() => resolveAlert("", true)} className="text-[10px] text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer">
                    DISMISS ALL
                  </button>
                </div>
                
                <div className="space-y-2 max-h-[80px] overflow-y-auto text-[10px] font-mono pr-1">
                  {systemState?.alerts.filter(a => !a.resolved).map((alt) => (
                    <div key={alt.id} className="flex items-start justify-between gap-3 p-2 bg-slate-900 border border-slate-800 rounded-lg shadow-sm">
                      <div className="leading-tight text-slate-300">
                        <span className="text-red-400 font-extrabold mr-1">[{alt.level.toUpperCase()}]</span> {alt.event}
                      </div>
                      <button onClick={() => resolveAlert(alt.id)} className="text-slate-500 hover:text-slate-300 cursor-pointer transition">
                        <PlusXCloseIcon />
                      </button>
                    </div>
                  ))}
                  {(!systemState?.alerts.length || systemState.alerts.every(a => a.resolved)) && (
                    <div className="text-center text-slate-500 py-2.5 font-medium">No pending Threat Hazard signatures flagged.</div>
                  )}
                </div>
              </div>
            </div>
          )}
 
          {/* TAB CONTENT 3: INTERACTIVE DAILY CRON TIMER SCHEDULING PLANNER */}
          {activeWorkspaceTab === "schedule" && (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col h-[550px] justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all duration-300 backdrop-blur-md">
              <div>
                <div className="border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-cyan-400" />
                    <div>
                      <h3 className="font-bold text-white text-base">Automated Scheduler Plane</h3>
                      <p className="text-[10px] text-slate-400 font-mono tracking-wider">CONVERT NATURAL NLP LOGS DIRECTLY TO ACTION TARGETS</p>
                    </div>
                  </div>
                </div>
 
                {/* Event Creation Form */}
                <form onSubmit={handleAddScheduleTask} className="space-y-4 bg-slate-950/60 border border-slate-850 p-4 rounded-xl mb-4">
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <label className="text-slate-400 mb-1.5 block font-bold">CRON TIME</label>
                      <input
                        type="text"
                        value={newScheduleTime}
                        onChange={(e) => setNewScheduleTime(e.target.value)}
                        placeholder="e.g. 05:00 PM"
                        className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-500 rounded-lg outline-none focus:border-cyan-500 shadow-sm transition"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-slate-400 block font-bold">CATEGORY</label>
                        <button
                          type="button"
                          onClick={() => {
                            const toggled = !isCustomCategory;
                            setIsCustomCategory(toggled);
                            setNewScheduleCategory(toggled ? "" : "maintenance");
                          }}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold transition flex items-center gap-0.5 cursor-pointer font-mono"
                        >
                          {isCustomCategory ? "≡ CHOOSE PRESET" : "＋ CUSTOM VALUE"}
                        </button>
                      </div>
                      {isCustomCategory ? (
                        <input
                          type="text"
                          value={newScheduleCategory}
                          onChange={(e) => setNewScheduleCategory(e.target.value)}
                          placeholder="e.g. firewall, optimization"
                          className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 text-cyan-400 placeholder:text-slate-650 rounded-lg outline-none focus:border-cyan-500 shadow-sm transition uppercase"
                        />
                      ) : (
                        <select
                          value={newScheduleCategory}
                          onChange={(e) => setNewScheduleCategory(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-900 border border-slate-805 text-cyan-400 rounded-lg cursor-pointer outline-none focus:border-cyan-500 shadow-sm transition uppercase"
                        >
                          {legendCategories.map((catKey) => (
                            <option key={catKey} value={catKey}>
                              {catKey.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
 
                  <div>
                    <label className="text-mono text-xs text-slate-400 mb-1.5 block font-bold">DIRECTIVE DETAILS</label>
                    <div className="flex gap-2.5">
                      <input
                        type="text"
                        value={newScheduleTask}
                        onChange={(e) => setNewScheduleTask(e.target.value)}
                        placeholder="Deploy deep quarantine routine checks..."
                        className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 text-slate-205 rounded-lg text-xs placeholder:text-slate-505 outline-none focus:border-cyan-500 shadow-sm transition"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold rounded-lg cursor-pointer transition shadow-md shadow-cyan-600/10"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                </form>
              </div>
 
              {/* Interactive Color-Coded Legend & Filter Block */}
              <div className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl mb-4 text-xs">
                <div className="text-[10px] text-slate-400 font-mono tracking-wider mb-2 font-bold uppercase flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>OPERATIONAL LEGEND & FILTER MATRIX</span>
                    <span className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
                    <button
                      type="button"
                      onClick={handleAddAllPresets}
                      className="text-[9px] text-emerald-400 hover:text-emerald-300 font-bold uppercase transition bg-slate-905 border border-emerald-500/20 px-1.5 py-0.5 rounded cursor-pointer ml-1 hover:bg-emerald-950/20"
                    >
                      [＋ ADD ALL PRESETS]
                    </button>
                  </div>
                  {selectedCategoryFilter !== "all" && (
                    <button
                      onClick={() => setSelectedCategoryFilter("all")}
                      className="text-[9px] text-cyan-400 hover:text-cyan-300 font-bold uppercase transition"
                    >
                      [ CLEAR FILTER ]
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter("all")}
                    className={`px-2 py-1 rounded-md border font-mono text-[9px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      selectedCategoryFilter === "all"
                        ? "bg-slate-800 text-white border-slate-650 shadow-[0_0_8px_rgba(255,255,255,0.06)]"
                        : "bg-slate-900/40 text-slate-450 border-slate-800/80 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-350"></span>
                    ALL ({currentSchedule.length})
                  </button>
                  {legendCategories.map((catKey) => {
                    const style = getCategoryStyle(catKey);
                    const count = getCategoryCount(catKey);
                    const isSelected = selectedCategoryFilter === catKey.toLowerCase().trim();
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(catKey.toLowerCase().trim())}
                        className={`px-2 py-1 rounded-md border font-mono text-[9px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? `${style.badge} border-current opacity-100`
                            : "bg-slate-900/40 text-slate-400 border-slate-800/50 hover:text-slate-205"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot} ${isSelected ? style.glow : ""}`}></span>
                        {catKey.toUpperCase()} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scheduled actions stream list */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[160px]">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 border rounded-xl flex items-center justify-between gap-3 text-xs shadow-md transition-all duration-200 ${
                      task.active
                        ? "bg-slate-950 border-slate-800/80 hover:border-cyan-500/30"
                        : "bg-slate-900/40 border-slate-950 opacity-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.active}
                        onChange={() => toggleScheduleActive(task.id)}
                        className="mt-1 accent-cyan-500 rounded cursor-pointer h-4 w-4"
                      />
                      <div>
                        <div className="font-bold tracking-tight flex items-center gap-2">
                          <span className={task.active ? "text-slate-200" : "text-slate-505 line-through font-medium"}>{task.task}</span>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border ${getCategoryStyle(task.category).badge}`}>
                            {task.category.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-405 font-mono mt-1 flex items-center gap-1 font-semibold">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {task.time}
                        </div>
                      </div>
                    </div>
 
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          addTerminalLog(`[SCHEDULE] Triggering on-demand execution for scheduled task: "${task.task}"`);
                          submitToTark(task.task);
                        }}
                        className="text-slate-400 hover:text-cyan-400 p-1.5 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer transition active:scale-95 flex items-center justify-center hover:border-cyan-500/30"
                        title="Run task now"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => deleteScheduleTask(task.id)}
                        className="text-slate-500 hover:text-red-400 transition cursor-pointer p-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-red-500/20"
                        title="Delete task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredTasks.length === 0 && (
                  <div className="text-center text-slate-550 font-mono text-xs py-10">
                    {selectedCategoryFilter === "all" 
                      ? "No scheduler tasks currently queued." 
                      : `No tasks found under category "${selectedCategoryFilter.toUpperCase()}"`}
                  </div>
                )}
              </div>
 
              <div className="text-[10px] text-slate-505 font-mono text-center border-t border-slate-850 pt-3 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                AUTOMATED CALENDAR DIRECTIVES AGENT TERMINALLY ACTIVE
              </div>
            </div>
          )}

        </section>

      </main>

      {/* Futuristic status line footer info decoration - Crisp contrasting Obsidian color */}
      <footer className="border-t border-slate-800 px-8 py-5 flex flex-col md:flex-row justify-between items-center bg-slate-900 font-mono text-[11px] text-slate-400 z-10 gap-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          SYSTEM INTEGRITY: SECURED LOOPBACK OUTBOUND PORTS ONLINE
        </div>
        <div>TARK INTELLIGENT WORKSPACE SYSTEM ADMINISTRATOR • RE-AL v1.14.2</div>
      </footer>
    </div>
  );
}

// Minimal icons helper to resolve cleanly
function PlusXCloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
