import os
import sys
import time
import json
import socket
import datetime
import subprocess
import traceback

# Optional robust package imports with clean fallbacks
try:
    import psutil
except ImportError:
    psutil = None

try:
    import requests
except ImportError:
    requests = None

# Official new Google GenAI client library check
try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

# Target Endpoint Setup (Local development or deployment mesh fallback)
APP_URL = os.environ.get("APP_URL", "http://localhost:3000")
API_ENDPOINT = f"{APP_URL}/api/agent/report".rstrip("/")

# Local Transaction & Autonomous System execution log file
LOG_FILE = "tark_autonomy.log"

def write_local_log(entry: str):
    """Pipes autonomous actions to local system log path."""
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] {entry}"
    print(formatted)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(formatted + "\n")
    except Exception as e:
        print(f"Failed to commit log telemetry: {e}")

# Maintain the past 5 loops error states for Self-Healing
error_context_history = []

def get_system_state():
    """PERCEPTION STAGE: Collect system state telemetry."""
    state = {
        "timestamp": datetime.datetime.now().isoformat(),
        "local_time": datetime.datetime.now().strftime("%I:%M:%S %p"),
        "os_platform": sys.platform,
        "metrics": {
            "cpu_percent": 15.0,
            "memory_usage_mb": 142.0,
            "memory_percent": 34.0,
            "network_reachable": True
        },
        "processes": [],
        "last_log_history": [],
        "failed_commands_retry_payload": error_context_history[-3:] # Pass the last 3 failures for context correction
    }

    # Gather CPU & Memory metrics securely
    if psutil:
        try:
            state["metrics"]["cpu_percent"] = psutil.cpu_percent(interval=0.1)
            mem = psutil.virtual_memory()
            state["metrics"]["memory_percent"] = mem.percent
            state["metrics"]["memory_usage_mb"] = int(mem.used / (1024 * 1024))
        except Exception as ex:
            write_local_log(f"[WARNING] Could not parse memory state via psutil: {ex}")

    # Gather high-resource active local processes
    if psutil:
        try:
            for p in sorted(psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']),
                            key=lambda x: x.info.get('cpu_percent', 0) or 0, reverse=True)[:5]:
                try:
                    state["processes"].append({
                        "pid": p.info['pid'],
                        "name": p.info['name'],
                        "cpu": p.info['cpu_percent'] or 0.1,
                        "memory": int((p.info['memory_info'].rss or 0) / (1024 * 1024)) if p.info['memory_info'] else 10
                    })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass
        except Exception as ex:
            write_local_log(f"[WARNING] Could not list system threads: {ex}")
    else:
        # Static mock-fallback list if psutil is unavailable on the local device setup
        state["processes"] = [
            {"pid": 104, "name": "tark_core.bin", "cpu": 0.5, "memory": 34},
            {"pid": 1999, "name": "npm_stale_temp.sh", "cpu": 12.4, "memory": 98},
            {"pid": 4543, "name": "unauthorized_probe.bin", "cpu": 6.8, "memory": 44}
        ]

    # Verify live network link
    try:
        socket.setdefaulttimeout(3)
        socket.socket(socket.AF_INET, socket.SOCK_STREAM).connect(("8.8.8.8", 53))
        state["metrics"]["network_reachable"] = True
    except socket.error:
        state["metrics"]["network_reachable"] = False

    # Get last 10 logs of transactions
    if os.path.exists(LOG_FILE):
        try:
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                state["last_log_history"] = f.readlines()[-10:]
        except Exception:
            pass

    return state

def get_gemini_actions(system_state):
    """DECISION STAGE: Query Gemini model via structural schema matching."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        write_local_log("[ALERT] GEMINI_API_KEY is not configured in environment context. Running simulation decisions.")
        # Simulated recovery decision loop for offline demo continuity
        return {
            "analysis": "No active API connections. Standing by to protect the local environment scope.",
            "execute_commands": [
                {"target": "process_manager", "action": "throttle", "pid": 1999}
            ],
            "log_output": "TARK Simulating telemetry offline loop."
        }

    if not genai:
        write_local_log("[ALERT] google-genai library missing, skipping AI synthesis. Run: pip install google-genai")
        return None

    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
You are the TARK Autonomous Execution Engine (Phase 4). You have full control of Akhilesh's local machine system.
Analyze the provided system state telemetry and determine necessary automations, health corrections, and process limits.

Current System State:
{json.dumps(system_state, indent=2)}

DIRECTIONS & SECURITY REQUIREMENTS:
1. If you see high-resource memory hogs (like npm_stale_temp.sh) or high risks (unauthorized_probe.bin), issue a 'kill/throttle/quarantine' command.
2. If network reachability is false, suggest network baseline recovery commands.
3. If any previous commands threw errors, self-heal! Fix your shell parameter structure and try a safer, alternate approach.
4. Respond strictly in valid JSON format matching our defined JSON schema:
{{
  "analysis": "Brief statement of what you observe.",
  "execute_commands": [
    {{"target": "terminal", "command": "string_of_actual_bash_or_powershell_cmd"}},
    {{"target": "process_manager", "action": "kill/throttle/quarantine", "pid": 1234}},
    {{"target": "scheduler", "action": "queue_job", "job_details": {{"task": "desc", "time": "10:00 AM"}}}}
  ],
  "log_output": "The exact technical status log string to output in the command center UI view."
}}
"""

        # Using official schemas mapping structure
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )
        
        # Clean Response string
        clean_text = response.text.strip()
        # strip markdown code blocks if the model wrapped it
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()

        return json.loads(clean_text)

    except Exception as err:
        write_local_log(f"[ERROR] Chat decision framework generated execution exception: {err}")
        return None

def execute_autonomous_action(cmd_block):
    """ACTION STAGE: Executes native system/terminal actions safely."""
    target = cmd_block.get("target") or ""
    
    if target == "terminal":
        command = cmd_block.get("command") or ""
        write_local_log(f"[EXECUTE TERMINAL] Launching shell instruction: {command}")
        
        try:
            # Safe command execution execution context
            # Use shell=True for windows convenience, limit timeout to 15s to prevent blocking loops
            result = subprocess.run(
                command,
                shell=True,
                text=True,
                capture_output=True,
                timeout=15
            )
            
            if result.returncode == 0:
                stdout_log = result.stdout.strip() or "Process returned success."
                write_local_log(f"[SUCCESS] {stdout_log}")
                return True, stdout_log
            else:
                stderr_log = result.stderr.strip() or f"Returned failure code: {result.returncode}"
                write_local_log(f"[EXECUTION_FAULT] {stderr_log}")
                # Record loop error state context to trigger self-healing prompt
                error_context_history.append({
                    "failed_command": command,
                    "error_log": stderr_log,
                    "timestamp": datetime.datetime.now().isoformat()
                })
                return False, stderr_log
                
        except Exception as e:
            err_msg = str(e)
            write_local_log(f"[TERMINAL CRITICAL FAULT] CMD execution failed: {err_msg}")
            error_context_history.append({
                "failed_command": command,
                "error_log": err_msg,
                "timestamp": datetime.datetime.now().isoformat()
            })
            return False, err_msg

    elif target == "process_manager":
        pid = cmd_block.get("pid")
        action = cmd_block.get("action")
        write_local_log(f"[PROCESS SECURITY ACTION] Issue {action.upper()} on Target Process ID {pid}")
        
        if psutil and pid:
            try:
                p = psutil.Process(pid)
                if action in ["kill", "terminate"]:
                    p.terminate()
                    write_local_log(f"[SUCCESS] Terminated PID {pid} successfully via psutil client API.")
                    return True, f"Successfully terminated PID {pid}"
                elif action in ["throttle", "quarantine"]:
                    # Simulated throttling context
                    p.suspend()
                    write_local_log(f"[SUCCESS] Safe Throttled/Suspended PID {pid} thread slice.")
                    return True, f"Suspended and quarantined Thread ID {pid}"
            except Exception as e:
                err_msg = f"Process security limit warning: {e}"
                write_local_log(err_msg)
                return False, err_msg
        else:
            return True, f"Simulated security action {action} on PID {pid} skipped (no active psutil library / local execution sandbox)"

    elif target == "scheduler":
        job = cmd_block.get("job_details") or {}
        write_local_log(f"[SCHEDULER AGENT RUN] Queued job description successfully: {job}")
        return True, f"Queued job target context: {job}"

    return False, "Unknown command target module"

def report_to_central_command(block_log, analysis, execute_commands, system_state):
    """Pipes execution logs to central browser interface Command Center server."""
    if not requests:
        return

    payload = {
        "blockLog": block_log,
        "analysis": analysis,
        "executeCommands": execute_commands,
        "systemMetrics": {
            "cpu": int(system_state["metrics"]["cpu_percent"]),
            "networkIn": 44,  # Auto metrics calculation placeholder
            "networkOut": 22
        },
        "syncState": {
            "processes": system_state["processes"]
        }
    }

    try:
        r = requests.post(API_ENDPOINT, json=payload, timeout=5)
        if r.status_code == 200:
            resp_data = r.json()
            write_local_log(f"[COMMAND SYNC] Broadcast complete. Command Center safe_mode: {resp_data.get('safeMode')}")
        else:
            write_local_log(f"[WARNING] Server reported communication channel error {r.status_code}")
    except Exception as e:
        write_local_log(f"[WARNING] Failed to stream action payload to Command Server: {e}")

def run_autonomous_loop():
    """Central loop orchestrator with strict time and error safeguards."""
    write_local_log("[INIT] ==============================================")
    write_local_log("[INIT] STARTING TARK AUTONOMOUS AGENT (PHASE 4)")
    write_local_log(f"[INIT] Host Command Server Target: {APP_URL}")
    write_local_log("[INIT] ==============================================")

    # Ensure local Log file exists
    if not os.path.exists(LOG_FILE):
        with open(LOG_FILE, "w") as f:
            f.write(f"[SYSTEM CREATE] File log pipeline built at {datetime.datetime.now().isoformat()}\n")

    while True:
        try:
            # 1. PERCEPTION STAGE
            state_data = get_system_state()
            write_local_log(f"[LOOP TRIGGER] Telemetry scan mapped. Core resource footprint RAM Percent: {state_data['metrics']['memory_percent']}%")

            # 2. DECISION STAGE
            decision = get_gemini_actions(state_data)
            
            if decision:
                analysis = decision.get("analysis") or "Standing by."
                commands = decision.get("execute_commands") or []
                log_output = decision.get("log_output") or "System active."

                write_local_log(f"[AI DECISION] {analysis}")
                
                # 3. ACTION STAGE (Execute sequence of commands)
                executed_outcomes = []
                for cmd in commands:
                    success, outcome = execute_autonomous_action(cmd)
                    executed_outcomes.append(f"Cmd: {json.dumps(cmd)} -> Success: {success} ({outcome})")

                # Combine action logs to stream to the dashboard
                summary_block_log = f"[TARK AUTO LOOP] {log_output} | Actions committed: {len(commands)} runs."
                write_local_log(summary_block_log)

                # 4. REPORT STAGE (Stream to central Web UI)
                report_to_central_command(summary_block_log, analysis, commands, state_data)

            else:
                write_local_log("[WARNING] Decision system connection timed out. Releasing resources to reserve pools.")

        except Exception as main_ex:
            write_local_log(f"[CRITICAL OUT-OF-BOUNDS FAULT] Loop crash recovery engaged: {main_ex}")
            traceback.print_exc()

        # 30 seconds interval logic
        time.sleep(30)

if __name__ == "__main__":
    run_autonomous_loop()
