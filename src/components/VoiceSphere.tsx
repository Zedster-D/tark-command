import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Radio, Volume2, VolumeX, Shield, Play, HelpCircle, X, Terminal, ExternalLink, Zap, Sliders } from "lucide-react";

interface VoiceSphereProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  lastUserTranscript: string;
  lastTarkReply: string;
  liveTranscript: string;
  isVoiceConversationActive: boolean;
  isVoiceEnabled: boolean;
  speechError: string;
  onToggleVoiceLink: () => void;
  onToggleVoiceTts: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  voiceRate: number;
  setVoiceRate: (rate: number) => void;
  voicePitch: number;
  setVoicePitch: (pitch: number) => void;
}

export const VoiceSphere: React.FC<VoiceSphereProps> = ({
  isListening,
  isSpeaking,
  isThinking,
  lastUserTranscript,
  lastTarkReply,
  liveTranscript,
  isVoiceConversationActive,
  isVoiceEnabled,
  speechError,
  onToggleVoiceLink,
  onToggleVoiceTts,
  onStartListening,
  onStopListening,
  voiceRate,
  setVoiceRate,
  voicePitch,
  setVoicePitch,
}) => {
  const [micVolume, setMicVolume] = React.useState<number>(0);
  const [showShortcuts, setShowShortcuts] = React.useState<boolean>(false);
  const [showTuning, setShowTuning] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (isVoiceConversationActive) {
      setShowShortcuts(true);
    } else {
      setShowShortcuts(false);
    }
  }, [isVoiceConversationActive]);

  React.useEffect(() => {
    if (!isListening) {
      setMicVolume(0);
      return;
    }

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let microphone: MediaStreamAudioSourceNode | null = null;
    let stream: MediaStream | null = null;
    let animationFrameId: number;

    const startVolumeMeter = async () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new AudioContextClass();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64; // Responsive and fast
        
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let lastUpdateTime = 0;
        const updateVolume = () => {
          if (!analyser) return;
          analyser.getByteFrequencyData(dataArray);

          // Calculate average volume intensity
          let total = 0;
          for (let i = 0; i < bufferLength; i++) {
            total += dataArray[i];
          }
          const average = total / bufferLength;
          
          const now = Date.now();
          if (now - lastUpdateTime > 30) { // Throttle React state updates to ~33fps (approx every 30ms) to maximize performance
            setMicVolume(average);
            lastUpdateTime = now;
          }

          animationFrameId = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (err) {
        console.warn("Could not retrieve mic volume stream for visual pulsing:", err);
      }
    };

    startVolumeMeter();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (microphone) {
        microphone.disconnect();
      }
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isListening]);

  // Determine dominant state
  let currentState: "listening" | "speaking" | "thinking" | "idle" = "idle";
  if (isListening) currentState = "listening";
  else if (isThinking) currentState = "thinking";
  else if (isSpeaking) currentState = "speaking";

  // Dynamic volume scale boost calculated when user is actively speaking
  const dynamicScaleBoost = (micVolume / 185) * 0.35; // boost up to ~0.35 extra scale
  const normalizedVolumeScale = Math.min(1.4, 1.02 + dynamicScaleBoost);

  // Dynamic Cyan Color Shift intensity (0 to 1) based on Web Audio volume peaks
  const cyanIntens = Math.min(1.0, micVolume / 65); // Highly responsive offset

  // Configuration thresholds for colors/glows
  const stateConfig = {
    idle: {
      color: "from-cyan-500/80 via-blue-600/50 to-slate-950",
      glow: "rgba(6, 182, 212, 0.4)",
      ringColor: "border-cyan-500/40",
      statusText: "TARK OPERATIONAL SOURCE • STANDBY",
      pulsingScale: [1.0, 1.05, 1.0],
      pulseDuration: 3.5,
      rippleCount: 1,
      rippleColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
    },
    listening: {
      color: "from-rose-500/80 via-red-650/40 to-slate-950",
      glow: "rgba(244, 63, 94, 0.65)",
      ringColor: "border-rose-500/60",
      statusText: "TARK ENGAGED • LISTENING TO OWNER...",
      pulsingScale: [1.02, 1.15, 1.02],
      pulseDuration: 1.2,
      rippleCount: 3,
      rippleColor: "bg-rose-500/15",
      borderColor: "border-rose-500/50",
    },
    thinking: {
      color: "from-amber-400/80 via-orange-600/50 to-slate-950",
      glow: "rgba(245, 158, 11, 0.6)",
      ringColor: "border-amber-400/50",
      statusText: "TARK ANALYZING TELEMETRY PILES...",
      pulsingScale: [1.0, 1.08, 1.0],
      pulseDuration: 0.8,
      rippleCount: 2,
      rippleColor: "bg-amber-400/15",
      borderColor: "border-amber-450/40",
    },
    speaking: {
      color: "from-emerald-400/80 via-teal-650/50 to-slate-950",
      glow: "rgba(16, 185, 129, 0.75)",
      ringColor: "border-emerald-450/60",
      statusText: "TARK BROADCASTING COMPILING RESPONSES...",
      pulsingScale: [0.95, 1.2, 0.95, 1.1, 0.95],
      pulseDuration: 2.0,
      rippleCount: 4,
      rippleColor: "bg-emerald-500/20",
      borderColor: "border-emerald-400/50",
    }
  };

  const activeConfig = stateConfig[currentState];

  // Dynamically blend glow color from RED/ROSE (recording state) to vibrant CYAN (vocal peaks)
  const dynamicGlowColor = (currentState === "listening")
    ? `rgba(${Math.round(244 * (1 - cyanIntens) + 6 * cyanIntens)}, ${Math.round(63 * (1 - cyanIntens) + 182 * cyanIntens)}, ${Math.round(94 * (1 - cyanIntens) + 212 * cyanIntens)}, ${0.65 + cyanIntens * 0.35})`
    : activeConfig.glow;

  return (
    <div className="flex flex-col items-center justify-between h-full py-2" id="tark-voice-sphere-container">
      {/* Top Banner Status Bar */}
      <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-4 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Shield className={`h-5 w-5 shrink-0 ${currentState === 'listening' ? 'text-rose-500 animate-pulse' : currentState === 'speaking' ? 'text-emerald-400' : 'text-cyan-405'}`} />
          <div className="truncate">
            <h3 className="font-bold text-white text-sm sm:text-base truncate">TARK Quantum Core</h3>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono tracking-wider truncate uppercase">HOLOGRAPHIC VOCAL CONVERSATION SPLINE</p>
          </div>
        </div>

        {/* Toggle controls relocated above */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <button
            type="button"
            onClick={onToggleVoiceLink}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-[9px] font-bold cursor-pointer transition duration-300 ${
              isVoiceConversationActive
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse"
                : "bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300"
            }`}
            title="Toggle Continuous Hands-Free Conversation Mode"
          >
            <Radio className="h-3 w-3 shrink-0" />
            <span className="hidden sm:inline">CONVERSATION LINK: {isVoiceConversationActive ? "ONLINE" : "OFFLINE"}</span>
          </button>

          <button
            type="button"
            onClick={onToggleVoiceTts}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-[9px] font-bold cursor-pointer transition duration-300 ${
              isVoiceEnabled
                ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)] animate-pulse"
                : "bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-300"
            }`}
            title="Toggle Speech Audio Output"
          >
            {isVoiceEnabled ? <Volume2 className="h-3 w-3 shrink-0 text-cyan-400" /> : <VolumeX className="h-3 w-3 shrink-0" />}
            <span className="hidden sm:inline">VOICE TTS: {isVoiceEnabled ? "LIVE" : "MUTED"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowTuning((prev) => !prev);
              setShowShortcuts(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-[9px] font-bold cursor-pointer transition duration-300 ${
              showTuning
                ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
            }`}
            title="Configure TARK's Vocal Speed and Pitch Tuning"
          >
            <Sliders className={`h-3 w-3 shrink-0 ${showTuning ? "text-cyan-400 animate-pulse" : "text-slate-400"}`} />
            <span className="hidden sm:inline">VOICE TUNING</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowShortcuts((prev) => !prev);
              setShowTuning(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-[9px] font-bold cursor-pointer transition duration-300 ${
              showShortcuts
                ? "bg-purple-950/40 border-purple-500/40 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
            }`}
            title="Toggle TARK Command Shortcuts Helper Manual"
          >
            <HelpCircle className={`h-3 w-3 shrink-0 ${showShortcuts ? "text-purple-400 animate-pulse" : "text-slate-400"}`} />
            <span className="hidden sm:inline">COMMANDS</span>
          </button>
        </div>
      </div>

      {/* Collapsible Voice Tuning Configuration Panel */}
      <AnimatePresence>
        {showTuning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-slate-950/90 border border-slate-850 rounded-xl p-4 mt-2 mb-1.5 font-sans text-xs space-y-4 box-border shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                Linguistic Engine Calibration Slider Array
              </span>
              <button 
                onClick={() => setShowTuning(false)}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Speaking Rate (Cadence) */}
              <div className="space-y-2.5">
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-slate-400 font-bold">CADENCE (VOICE SPEED RATE)</span>
                  <span className="text-cyan-400 font-extrabold">{voiceRate.toFixed(2)}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[8px] text-slate-500">0.5x</span>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={voiceRate}
                    onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                    className="flex-1 accent-cyan-500 bg-slate-900 border border-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                  <span className="font-mono text-[8px] text-slate-500">2.0x</span>
                </div>
                <p className="text-[9px] text-slate-500 font-medium leading-normal">
                  Sets the velocity of linguistic output. Perfect casual cadence is <span className="text-cyan-500 font-bold">1.08x</span>.
                </p>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setVoiceRate(0.8)} 
                    className="px-2 py-0.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded font-mono text-[8px] text-slate-400 cursor-pointer transition font-bold"
                  >
                    0.80x Slow
                  </button>
                  <button 
                    onClick={() => setVoiceRate(1.08)} 
                    className="px-2 py-0.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded font-mono text-[8px] text-cyan-400 cursor-pointer transition font-bold"
                  >
                    1.08x Optimal
                  </button>
                  <button 
                    onClick={() => setVoiceRate(1.4)} 
                    className="px-2 py-0.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded font-mono text-[8px] text-slate-400 cursor-pointer transition font-bold"
                  >
                    1.40x Rapid
                  </button>
                </div>
              </div>

              {/* Speaking Pitch */}
              <div className="space-y-2.5">
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-slate-400 font-bold">FREQUENCY (VOCAL PITCH DECO)</span>
                  <span className="text-pink-400 font-extrabold">{voicePitch.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[8px] text-slate-500">0.5</span>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={voicePitch}
                    onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                    className="flex-1 accent-pink-500 bg-slate-900 border border-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                  <span className="font-mono text-[8px] text-slate-500">1.5</span>
                </div>
                <p className="text-[9px] text-slate-500 font-medium leading-normal">
                  Vocal frequency adjust. Warm, companion-grade organic pitch is <span className="text-pink-500 font-bold">1.04</span>.
                </p>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => setVoicePitch(0.7)} 
                    className="px-2 py-0.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded font-mono text-[8px] text-slate-400 cursor-pointer transition font-bold"
                  >
                    0.70 Deep
                  </button>
                  <button 
                    onClick={() => setVoicePitch(1.04)} 
                    className="px-2 py-0.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded font-mono text-[8px] text-pink-400 cursor-pointer transition font-bold"
                  >
                    1.04 Optimal
                  </button>
                  <button 
                    onClick={() => setVoicePitch(1.3)} 
                    className="px-2 py-0.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 rounded font-mono text-[8px] text-slate-400 cursor-pointer transition font-bold"
                  >
                    1.30 High
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main interactive Glowing Sphere viewport */}
      <div className="flex-1 flex flex-col items-center justify-center py-3 w-full relative select-none">
        {/* Responsive HUD Wrapper matching the 600x400 aspect ratio */}
        <div className="relative w-full max-w-[620px] aspect-[620/420] flex items-center justify-center rounded-2xl overflow-hidden bg-slate-950/20">
          
          {/* Cyber HUD Interactive SVG Overlay - Fully responsive vector graphic */}
          <svg 
            viewBox="0 0 600 400" 
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
          >
            <defs>
              {/* Neon Cyan HUD glow filter */}
              <filter id="hud-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              
              {/* Tech repeat Grid pattern */}
              <pattern id="cyber-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="0.75" />
              </pattern>
            </defs>

            {/* Background Grid Layer */}
            <rect width="100%" height="100%" fill="url(#cyber-grid)" className="opacity-75" />

            {/* Decorative Cyber Grid Blocks (Upper Right and Lower Left) as seen in user image */}
            <g opacity="0.1" fill="#06b6d4" className="transition-all duration-500">
              {/* Upper Right Tech Decors */}
              <rect x="420" y="30" width="12" height="12" />
              <rect x="434" y="30" width="12" height="12" />
              <rect x="448" y="30" width="12" height="12" />
              <rect x="462" y="30" width="12" height="12" />
              <rect x="476" y="30" width="12" height="12" />
              
              <rect x="434" y="44" width="12" height="12" />
              <rect x="448" y="44" width="12" height="12" />
              <rect x="462" y="44" width="12" height="12" />

              <rect x="448" y="58" width="12" height="12" />
              <rect x="462" y="58" width="12" height="12" />
              <rect x="476" y="58" width="12" height="12" />
              
              <rect x="462" y="72" width="12" height="12" />
              <rect x="476" y="72" width="12" height="12" />
              <rect x="490" y="72" width="12" height="12" />

              {/* Lower Left Tech Decors */}
              <rect x="80" y="310" width="12" height="12" />
              <rect x="94" y="310" width="12" height="12" />
              <rect x="108" y="310" width="12" height="12" />
              
              <rect x="80" y="324" width="12" height="12" />
              <rect x="94" y="324" width="12" height="12" />
              <rect x="122" y="324" width="12" height="12" />
              
              <rect x="94" y="338" width="12" height="12" />
              <rect x="108" y="338" width="12" height="12" />
              <rect x="122" y="338" width="12" height="12" />
            </g>

            {/* Glowing Tech Highlights/Spots */}
            <circle cx="300" cy="200" r="160" fill="none" stroke="rgba(6, 182, 212, 0.02)" strokeWidth="1" />
            <circle cx="300" cy="200" r="140" fill="none" stroke="rgba(6, 182, 212, 0.03)" strokeWidth="0.5" />

            {/* Ambient Cyan Soft Glow Spots behind */}
            <circle cx="210" cy="140" r="6" fill="#06b6d4" opacity="0.3" filter="url(#hud-glow)" />
            <circle cx="390" cy="250" r="8" fill="#06b6d4" opacity="0.2" filter="url(#hud-glow)" />

            {/* ======================================================== */}
            {/* HUD DIALOG LINES AND TECH LABELS (Match User Upload Asset Exactly) */}
            {/* ======================================================== */}

            {/* 1. TOP-LEFT: LOREM IPSUM */}
            <g className="transition-all duration-300">
              {/* Thin glowing paths with horizontal baseline and bent diagnostic hook */}
              <path 
                d="M 50 110 H 180 L 235 150" 
                fill="none" 
                stroke={currentState === 'listening' ? 'rgba(244, 63, 94, 0.6)' : 'rgba(34, 211, 238, 0.6)'} 
                strokeWidth="1" 
                filter="url(#hud-glow)"
              />
              {/* Joint Dots */}
              <circle cx="180" cy="110" r="2.5" fill={currentState === 'listening' ? '#f43f5e' : '#22d3ee'} />
              <circle cx="235" cy="150" r="1.5" fill={currentState === 'listening' ? '#f43f5e' : '#22d3ee'} />
              
              {/* Display Header label */}
              <text 
                x="50" 
                y="95" 
                fill="#ffffff" 
                fontSize="10" 
                fontWeight="800" 
                fontFamily="sans-serif" 
                letterSpacing="1.2"
              >
                LOREM IPSUM
              </text>
              {/* High-tech diagnostic values */}
              <text 
                x="50" 
                y="105" 
                fill={currentState === 'listening' ? '#fda4af' : '#22d3ee'} 
                fontSize="7" 
                fontFamily="monospace" 
                fontWeight="500" 
                opacity="0.85"
              >
                CORE_SYS_MATRIX • IDLE
              </text>
            </g>

            {/* 2. TOP-RIGHT: CONSECTETUR ADIPISCING */}
            <g className="transition-all duration-300">
              <path 
                d="M 550 110 H 420 L 365 150" 
                fill="none" 
                stroke={currentState === 'listening' ? 'rgba(244, 63, 94, 0.6)' : 'rgba(34, 211, 238, 0.6)'} 
                strokeWidth="1" 
                filter="url(#hud-glow)"
              />
              <circle cx="420" cy="110" r="2.5" fill={currentState === 'listening' ? '#f43f5e' : '#22d3ee'} />
              <circle cx="365" cy="150" r="1.5" fill={currentState === 'listening' ? '#f43f5e' : '#22d3ee'} />
              
              <text 
                x="550" 
                y="95" 
                textAnchor="end" 
                fill="#ffffff" 
                fontSize="10" 
                fontWeight="800" 
                fontFamily="sans-serif" 
                letterSpacing="1.1"
              >
                CONSECTETUR ADIPISCING
              </text>
              <text 
                x="550" 
                y="105" 
                textAnchor="end" 
                fill={currentState === 'listening' ? '#fda4af' : '#22d3ee'} 
                fontSize="7" 
                fontFamily="monospace" 
                fontWeight="500" 
                opacity="0.85"
              >
                SECURE_THREAD_FEED_ACTIVATED
              </text>
            </g>

            {/* 3. CENTER-RIGHT: MAGNA ALIQUA */}
            <g className="transition-all duration-300">
              <path 
                d="M 550 210 H 460 L 396 200" 
                fill="none" 
                stroke={currentState === 'listening' ? 'rgba(244, 63, 94, 0.6)' : 'rgba(34, 211, 238, 0.6)'} 
                strokeWidth="1" 
                filter="url(#hud-glow)"
              />
              <circle cx="460" cy="210" r="2.5" fill={currentState === 'listening' ? '#f43f5e' : '#22d3ee'} />
              <circle cx="396" cy="200" r="1.5" fill={currentState === 'listening' ? '#f43f5e' : '#22d3ee'} />
              
              <text 
                x="550" 
                y="195" 
                textAnchor="end" 
                fill="#ffffff" 
                fontSize="10" 
                fontWeight="800" 
                fontFamily="sans-serif" 
                letterSpacing="1.1"
              >
                MAGNA ALIQUA
              </text>
              <text 
                x="550" 
                y="205" 
                textAnchor="end" 
                fill={currentState === 'listening' ? '#fda4af' : '#22d3ee'} 
                fontSize="7" 
                fontFamily="monospace" 
                fontWeight="500" 
                opacity="0.85"
              >
                MEM_HEAP_SWAP_STREAMING_LOCK
              </text>
            </g>

            {/* 4. BOTTOM-LEFT: DOLOR SIT AMET */}
            <g className="transition-all duration-300">
              <path 
                d="M 50 290 H 180 L 235 250" 
                fill="none" 
                stroke={currentState === 'listening' ? 'rgba(244, 63, 94, 0.6)' : 'rgba(34, 211, 238, 0.6)'} 
                strokeWidth="1" 
                filter="url(#hud-glow)"
              />
              <circle cx="180" cy="290" r="2.5" fill={currentState === 'listening' ? '#f43f5e' : '#22d3ee'} />
              <circle cx="235" cy="250" r="1.5" fill={currentState === 'listening' ? '#f43f5e' : '#22d3ee'} />
              
              <text 
                x="50" 
                y="305" 
                fill="#ffffff" 
                fontSize="10" 
                fontWeight="800" 
                fontFamily="sans-serif" 
                letterSpacing="1.2"
              >
                DOLOR SIT AMET
              </text>
              <text 
                x="50" 
                y="315" 
                fill={currentState === 'listening' ? '#fda4af' : '#22d3ee'} 
                fontSize="7" 
                fontFamily="monospace" 
                fontWeight="500" 
                opacity="0.85"
              >
                DEF_COG_NODES_STATUS_GOOD
              </text>
            </g>
          </svg>

          {/* Particle/Ring ripples extending outward behind sphere, synchronized with state */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            {/* Outer Ring 1 */}
            <motion.div
              animate={{
                rotate: 360,
                scale: isSpeaking ? [1.05, 1.18, 1.05] : [1.0, 1.04, 1.0]
              }}
              transition={{
                rotate: { repeat: Infinity, duration: 25, ease: "linear" },
                scale: { repeat: Infinity, duration: 3.5, ease: "easeInOut" }
              }}
              className={`absolute w-72 h-72 rounded-full border border-dashed ${activeConfig.borderColor} opacity-15`}
            />

            {/* Outer Ring 2 - Opposing direction */}
            <motion.div
              animate={{
                rotate: -360,
                scale: isSpeaking ? [0.98, 1.1, 0.98] : [1.0, 1.02, 1.0]
              }}
              transition={{
                rotate: { repeat: Infinity, duration: 40, ease: "linear" },
                scale: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
              }}
              className={`absolute w-60 h-60 rounded-full border border-dotted ${activeConfig.borderColor} opacity-20`}
            />

            {/* Expanding visual sound ripples when talking or listening */}
            {Array.from({ length: activeConfig.rippleCount }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.7, opacity: 0.6 }}
                animate={currentState === "listening" ? {
                  scale: 1 + (micVolume / 255) * 1.5 + (i * 0.1),
                  opacity: Math.max(0.15, (micVolume / 255) * 0.8),
                } : {
                  scale: 1.8,
                  opacity: 0,
                }}
                transition={currentState === "listening" ? {
                  duration: 0.08,
                  ease: "easeOut"
                } : {
                  repeat: Infinity,
                  duration: activeConfig.pulseDuration * 1.5,
                  delay: i * 0.45,
                  ease: "easeOut",
                }}
                className={`absolute w-52 h-52 rounded-full blur-sm z-0 ${
                  currentState === "listening" 
                    ? (cyanIntens > 0.45 ? "bg-cyan-500/20" : "bg-rose-500/15")
                    : activeConfig.rippleColor
                }`}
              />
            ))}
          </div>

          {/* Central Sphere Core - Formulated with modern CSS + Interactive SVG circular telemetry */}
          <motion.div
            className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-full cursor-pointer flex items-center justify-center border border-white/10 group overflow-hidden bg-slate-950/90 shadow-[inset_0_4px_10px_rgba(255,255,255,0.15)]"
            animate={{
              scale: currentState === "listening" ? normalizedVolumeScale : activeConfig.pulsingScale,
              boxShadow: currentState === "listening" 
                ? `0 0 ${70 + cyanIntens * 80}px ${dynamicGlowColor}, inset 0 0 50px rgba(0,0,0,0.85)`
                : `0 0 70px ${activeConfig.glow}, inset 0 0 50px rgba(0,0,0,0.85)`
            }}
            transition={{
              duration: currentState === "listening" ? 0.08 : activeConfig.pulseDuration,
              repeat: currentState === "listening" ? 0 : Infinity,
              ease: currentState === "listening" ? "easeOut" : "easeInOut",
            }}
            onClick={() => {
              if (isListening) {
                onStopListening();
              } else {
                onStartListening();
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            {/* Dynamic visual base layer color matches state */}
            <div className={`absolute inset-0 bg-gradient-to-tr ${activeConfig.color} opacity-50 transition-opacity duration-300 pointer-events-none rounded-full`} />

            {/* Premium background texture image with low blend-mode for grit as in user mockup */}
            <img 
              src="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=600&q=80" 
              alt="Quantum HUD base grid texture"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover rounded-full mix-blend-overlay opacity-30 group-hover:scale-105 transition-transform duration-700 pointer-events-none select-none"
            />

            {/* INTERACTIVE COMPRESSED SVG RADIAL COMPASS COMPONENT (replicating HUD in image) */}
            <svg 
              viewBox="0 0 200 200" 
              className="absolute inset-0 w-full h-full pointer-events-none select-none z-10"
            >
              {/* Outer ticked compass ring */}
              <motion.circle 
                cx="100" 
                cy="100" 
                r="92" 
                fill="none" 
                stroke={currentState === 'listening' ? '#f43f5e' : '#22d3ee'} 
                strokeWidth="1.5" 
                strokeDasharray="2 3" 
                opacity="0.75"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                style={{ transformOrigin: "100px 100px" }}
              />

              {/* Segmented active ring */}
              <motion.circle 
                cx="100" 
                cy="100" 
                r="83" 
                fill="none" 
                stroke={currentState === 'listening' ? '#fb7185' : '#06b6d4'} 
                strokeWidth="2.5" 
                strokeDasharray="40 15 10 15 20 15" 
                opacity="0.85"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                style={{ transformOrigin: "100px 100px" }}
              />

              {/* Faint diagnostic circle */}
              <circle cx="100" cy="100" r="74" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.75" />

              {/* Mid circular dash levels */}
              <motion.circle 
                cx="100" 
                cy="100" 
                r="64" 
                fill="none" 
                stroke="#22d3ee" 
                strokeWidth="1.5" 
                strokeDasharray="4 6" 
                opacity="0.5"
                animate={{ rotate: 180 }}
                transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
                style={{ transformOrigin: "100px 100px" }}
              />

              {/* Multi-tier solid security ring */}
              <circle cx="100" cy="100" r="54" fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="4" />
              <motion.circle 
                cx="100" 
                cy="100" 
                r="54" 
                fill="none" 
                stroke={currentState === 'listening' ? '#f43f5e' : '#0891b2'} 
                strokeWidth="1.5" 
                strokeDasharray="30 45" 
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                style={{ transformOrigin: "100px 100px" }}
              />

              {/* Dotted Tracker Ring */}
              <circle cx="100" cy="100" r="44" fill="none" stroke="rgba(34,211,238,0.4)" strokeWidth="1" strokeDasharray="1.5 2" />

              {/* Central Dynamic Energy Disc - Sourced with custom scale animation based on vocal energy */}
              <motion.circle 
                cx="100" 
                cy="100" 
                r="22" 
                fill={
                  currentState === 'listening' ? "url(#rosy-energy)" : "url(#cyan-energy)"
                }
                animate={currentState === 'listening' ? {
                  r: 22 + cyanIntens * 10,
                  opacity: 0.8 + cyanIntens * 0.2
                } : currentState === 'speaking' ? {
                  r: [20, 26, 20],
                  opacity: [0.75, 1, 0.75]
                } : {
                  r: [21, 23, 21],
                  opacity: [0.7, 0.82, 0.7]
                }}
                transition={{
                  duration: currentState === 'listening' ? 0.08 : 1.8,
                  repeat: currentState === 'listening' ? 0 : Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Gradients used inside the HUD compass */}
              <defs>
                <radialGradient id="cyan-energy" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
                  <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="rosy-energy" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fda4af" stopOpacity="1" />
                  <stop offset="70%" stopColor="#f43f5e" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#be123c" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>

            {/* High-Contrast Cyber Radial Reflection Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),transparent_50%)] pointer-events-none rounded-full" />

            {/* Central state icon */}
            <div className="absolute flex flex-col items-center justify-center gap-1.5 z-20 pointer-events-none">
              <motion.div
                animate={currentState === "speaking" ? {
                  scale: [1, 1.15, 1],
                  y: [0, -3, 0, 3, 0]
                } : currentState === "listening" ? {
                  scale: [0.96, 1.1, 0.96]
                } : {}}
                transition={{ repeat: Infinity, duration: currentState === "speaking" ? 0.5 : 1.5 }}
                className={`p-3.5 rounded-full bg-slate-950/80 border ${
                  currentState === "listening" && cyanIntens > 0.45 
                    ? "border-cyan-400 text-cyan-300"
                    : `border-slate-900 text-cyan-100`
                } shadow-xl backdrop-blur-md`}
              >
                {currentState === "listening" ? (
                  <Mic className={`h-5 w-5 animate-pulse ${cyanIntens > 0.45 ? "text-cyan-400" : "text-rose-400"}`} />
                ) : currentState === "speaking" ? (
                  <Volume2 className="h-5 w-5 text-emerald-400" />
                ) : currentState === "thinking" ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="h-5 w-5 border-2 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent rounded-full"
                  />
                ) : (
                  <MicOff className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200" />
                )}
              </motion.div>
              <span className="font-mono text-[8px] uppercase tracking-widest text-slate-300 font-bold bg-slate-950/90 px-2 py-0.5 rounded border border-slate-805/70 backdrop-blur-sm shadow-md">
                {currentState === "listening" ? "RECORD" : currentState === "speaking" ? "TARK SPEAK" : currentState === "thinking" ? "THINK" : "MANUAL"}
              </span>
            </div>

            {/* Visual scanline orbit line inside the sphere */}
            <motion.div
              animate={currentState === "speaking" ? {
                x: ["-100%", "100%"],
                opacity: [0, 0.7, 0]
              } : currentState === "thinking" ? {
                rotate: 360
              } : { y: [-15, 15, -15] }}
              transition={{
                repeat: Infinity,
                duration: currentState === "speaking" ? 1.5 : currentState === "thinking" ? 2 : 4,
                ease: "easeInOut"
              }}
              className={`absolute inset-0 w-full h-0.5 ${currentState === 'listening' ? (cyanIntens > 0.45 ? 'bg-cyan-500/40' : 'bg-rose-500/30') : 'bg-cyan-500/20'} pointer-events-none`}
              style={currentState === "thinking" ? { borderRadius: "50%", borderLeft: "2px solid rgba(245, 158, 11, 0.4)" } : { top: "50%" }}
            />
          </motion.div>
        </div>

        {/* Core Status indicator textual summary below */}
        <div className="mt-2.5 text-center px-4 font-mono text-[10px] text-slate-400 tracking-wider flex items-center gap-1.5 justify-center">
          <span className={`h-1.5 w-1.5 rounded-full ${currentState === 'listening' ? 'bg-rose-500' : currentState === 'speaking' ? 'bg-emerald-500' : 'bg-cyan-500'} animate-ping`} />
          <span className="uppercase">{activeConfig.statusText}</span>
        </div>

        {/* Command Shortcuts Helper Overlay - Activates when Continuous Voice is open */}
        <AnimatePresence>
          {showShortcuts && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-2 bg-slate-950/98 border border-purple-500/30 rounded-2xl p-4 flex flex-col z-40 shadow-[0_15px_40px_rgba(0,0,0,0.85)] overflow-hidden font-mono text-[11px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-805/60 pb-2 mb-2 shrink-0">
                <span className="flex items-center gap-2 text-[10px] font-bold text-purple-400 tracking-wider">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                  🤖 TARK COMPANION SHORTCUTS
                </span>
                <button
                  type="button"
                  onClick={() => setShowShortcuts(false)}
                  className="p-1 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-850 text-slate-400 hover:text-white transition duration-200 cursor-pointer"
                  title="Hide Shortcuts Helper Overlay"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Guide phrase */}
              <p className="font-sans text-[10px] text-slate-400 leading-normal mb-3 shrink-0">
                TARK detects voice controls continuously in <span className="text-emerald-400 font-bold">Conversation Mode</span>. Try dictating any of these phrases directly:
              </p>

              {/* Grid or simple listings scrolling box */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-[11px] select-text">
                {/* 1. Portal launching */}
                <div className="space-y-1.5 p-2 bg-slate-900/40 rounded-xl border border-slate-850/50">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-400 text-[9px] tracking-wide mb-1 uppercase select-none">
                    <ExternalLink className="h-3 w-3 text-cyan-400" />
                    🌐 Launch Web Portals
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 font-sans">
                    <div className="bg-slate-950/40 p-2 rounded border border-slate-900 flex justify-between items-center hover:border-cyan-500/20 transition-all">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-mono text-cyan-300 font-bold text-[10px] select-all">"open binance"</span>
                        <span className="text-slate-400 text-[9px] truncate">Loads the official Binance ecosystem dashboard.</span>
                      </div>
                      <span className="text-[8px] text-cyan-500 font-mono italic shrink-0">Binance</span>
                    </div>
                    <div className="bg-slate-950/40 p-2 rounded border border-slate-900 flex justify-between items-center hover:border-cyan-500/20 transition-all">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-mono text-cyan-300 font-bold text-[10px] select-all">"go to tradingview"</span>
                        <span className="text-slate-400 text-[9px] truncate">Launches global financial charting platform.</span>
                      </div>
                      <span className="text-[8px] text-cyan-500 font-mono italic shrink-0">Charts</span>
                    </div>
                  </div>
                </div>

                {/* 2. Web filtered search */}
                <div className="space-y-1.5 p-2 bg-slate-900/40 rounded-xl border border-slate-850/50">
                  <div className="flex items-center gap-1.5 font-bold text-amber-500 text-[9px] tracking-wide mb-1 uppercase select-none">
                    <Zap className="h-3 w-3 text-amber-500" />
                    🔍 Site-Matched Queries
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 font-sans">
                    <div className="bg-slate-950/40 p-2 rounded border border-slate-900 flex justify-between items-center hover:border-amber-500/20 transition-all">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-mono text-amber-300 font-bold text-[10px] select-all">"search youtube for lofi jazz"</span>
                        <span className="text-slate-400 text-[9px] truncate">Auto-pipes search query directly to YouTube streams.</span>
                      </div>
                      <span className="text-[8px] text-amber-500 font-mono italic shrink-0">Media</span>
                    </div>
                    <div className="bg-slate-950/40 p-2 rounded border border-slate-900 flex justify-between items-center hover:border-amber-500/20 transition-all">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-mono text-amber-300 font-bold text-[10px] select-all">"search github for fastify"</span>
                        <span className="text-slate-400 text-[9px] truncate">Pipes repository queries directly into GitHub search.</span>
                      </div>
                      <span className="text-[8px] text-amber-500 font-mono italic shrink-0">Repository</span>
                    </div>
                  </div>
                </div>

                {/* 3. Thread Optimization */}
                <div className="space-y-1.5 p-2 bg-slate-900/40 rounded-xl border border-slate-850/50">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-500 text-[9px] tracking-wide mb-1 uppercase select-none">
                    <Terminal className="h-3 w-3 text-emerald-500" />
                    ⚡ Local Hardware Automation
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 font-sans">
                    <div className="bg-slate-950/40 p-2 rounded border border-slate-900 flex justify-between items-center hover:border-emerald-500/20 transition-all">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-mono text-emerald-300 font-bold text-[10px] select-all">"optimize ram"</span>
                        <span className="text-slate-400 text-[9px] truncate">Squeezes host heap files and releases 2+ Gigabytes.</span>
                      </div>
                      <span className="text-[8px] text-emerald-500 font-mono italic shrink-0">Reclaim RAM</span>
                    </div>
                    <div className="bg-slate-950/40 p-2 rounded border border-slate-900 flex justify-between items-center hover:border-emerald-500/20 transition-all">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-mono text-emerald-300 font-bold text-[10px] select-all">"kill process [PID]"</span>
                        <span className="text-slate-400 text-[9px] truncate">Triggers instant Thread shutdown (e.g. 1999).</span>
                      </div>
                      <span className="text-[8px] text-emerald-500 font-mono italic shrink-0">Thread Kill</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer pro-tip */}
              <div className="mt-2 text-center text-[9px] text-slate-500 border-t border-slate-850 pt-2 shrink-0 select-none">
                💡 <span className="font-bold text-slate-450">Note:</span> Copy patterns, close overlay to press the Speak Sphere.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Voice Transcript Dialog panel (Tuttle styled assistant subtitles overlay) */}
      <div className="w-full bg-slate-950/80 border border-slate-850 p-4 rounded-xl font-sans text-xs space-y-3.5 box-border min-h-[140px] max-h-[160px] overflow-y-auto flex flex-col justify-center shadow-inner relative">
        <div className="absolute top-2 right-3 font-mono text-[7px] text-slate-500 uppercase tracking-widest leading-none">
          Live Audio Transducer HUD
        </div>

        {/* User utterance track */}
        {isListening && liveTranscript ? (
          <div className="space-y-1">
            <div className="font-mono text-[8px] text-rose-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>👤 SPEAKING... DETECTING SYNCED WORDS:</span>
            </div>
            <p className="normal-case italic text-rose-300 pr-4 pl-0.5 border-l-2 border-rose-500 font-medium bg-rose-950/10 p-1 rounded">
              "{liveTranscript}"
            </p>
          </div>
        ) : lastUserTranscript ? (
          <div className="space-y-1">
            <div className="font-mono text-[8px] text-rose-400 uppercase tracking-wider font-bold">
              👤 OWNER COMMITTED COMMAND:
            </div>
            <p className="normal-case italic text-slate-350 pr-4 pl-0.5 border-l border-rose-500/30 font-medium">
              "{lastUserTranscript}"
            </p>
          </div>
        ) : (
          <div className="text-center font-mono text-[9px] text-slate-500 italic py-1">
            Waiting for verbal Owner request dispatch...
          </div>
        )}

        {/* Split separator if both are present */}
        {lastUserTranscript && lastTarkReply && (
          <div className="border-t border-slate-900/60" />
        )}

        {/* TARK replica speech bubble representation */}
        {isThinking && !lastTarkReply ? (
          <div className="flex items-center gap-2 font-mono text-[9px] text-amber-400 animate-pulse">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-3 w-3 border border-t-amber-400 border-r-transparent rounded-full"
            />
            Analyzing command syntactic targets...
          </div>
        ) : lastTarkReply ? (
          <div className="space-y-1">
            <div className="font-mono text-[8px] text-emerald-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
              <span>🤖 TARK VOCAL RESPONSE:</span>
              {isSpeaking && (
                <div className="flex items-center gap-0.5 h-2 shrink-0">
                  <span className="w-0.5 bg-emerald-400 h-1 animate-bounce rounded" style={{ animationDelay: '0s', animationDuration: '0.4s' }} />
                  <span className="w-0.5 bg-emerald-400 h-2 animate-bounce rounded" style={{ animationDelay: '0.15s', animationDuration: '0.3s' }} />
                  <span className="w-0.5 bg-emerald-400 h-1.5 animate-bounce rounded" style={{ animationDelay: '0.3s', animationDuration: '0.5s' }} />
                </div>
              )}
            </div>
            <p className="font-mono text-[10px] leading-relaxed text-emerald-200/90 pl-1 border-l border-emerald-500/30 bg-emerald-950/5 p-1 px-1.5 rounded">
              {lastTarkReply}
            </p>
          </div>
        ) : null}

        {/* Speech API errors log */}
        {speechError && (
          <div className="text-[9px] text-rose-450 font-mono py-1 px-2.5 bg-rose-950/15 border border-rose-900/20 rounded-md animate-pulse">
            ⚠️ {speechError}
          </div>
        )}
      </div>

      {/* Manual Click to trigger mic trigger cue */}
      <div className="w-full text-center mt-2">
        <p className="text-[8px] sm:text-[9px] text-slate-500 font-mono tracking-wider">
          {isListening 
            ? "🎤 MICROPHONE ARMED. PRESS SPHERE OR MIC OFF AT BOTTOM TO TERMINATE." 
            : "🔴 TAP SPHERE OR HIT MICROPHONE TRIGGER AT BOTTOM TO TRANSMIT RAW VOCALS."}
        </p>
      </div>
    </div>
  );
};
