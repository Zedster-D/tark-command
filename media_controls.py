#!/usr/bin/env python3
"""
TARK Neural Interface - Autonomous Media Control Automation
This module implements safe web browser automation and OS URI protocol mappings
to play video links and music search requests based on natural language intent.
"""

import sys
import json
import re
import webbrowser
import urllib.parse
from typing import Dict, Any, Optional

def play_on_youtube(search_query: str) -> Dict[str, Any]:
    """
    Formats the search query into a YouTube search target and automatically
    launches the default web browser to execute and autoplay the stream.
    """
    if not search_query or not search_query.strip():
        return {
            "success": False,
            "error": "EMPTY_QUERY",
            "message": "YouTube playback requires a search query or track topic."
        }
        
    query_cleaned = search_query.strip()
    encoded_query = urllib.parse.quote_plus(query_cleaned)
    url = f"https://www.youtube.com/results?search_query={encoded_query}"
    
    print(f"[MEDIA AUTOMATION] Directing default web browser to YouTube search matrix: {url}")
    try:
        # Launching the default browser safely via Standard Library
        opened = webbrowser.open(url)
        return {
            "success": opened,
            "engine": "youtube",
            "query": query_cleaned,
            "url": url,
            "message": f"Successfully dispatched YouTube automation for: '{query_cleaned}'"
        }
    except Exception as e:
        return {
            "success": False,
            "error": "BROWSER_FAILURE",
            "details": str(e),
            "message": "Could not access or execute standard web browser subprocess host."
        }

def play_on_spotify(search_query: Optional[str] = None) -> Dict[str, Any]:
    """
    Triggers local Spotify media routing. If a query is provided, it attempts
    to dispatch the native application URI protocol ('spotify:search:<query>'),
    falling back to the robust browser web player search page.
    """
    if not search_query or not search_query.strip():
        # Fallback default vibe if no query is explicit
        url = "https://open.spotify.com/genre/discover"
        print(f"[MEDIA AUTOMATION] Opening fallback Spotify discovery portal: {url}")
        try:
            opened = webbrowser.open(url)
            return {
                "success": opened,
                "engine": "spotify",
                "mode": "discovery",
                "url": url,
                "message": "Defaulting Spotify discovery browser page active."
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    query_cleaned = search_query.strip()
    encoded_query = urllib.parse.quote_plus(query_cleaned)
    
    # OS native URI routing approach
    app_uri = f"spotify:search:{encoded_query}"
    web_fallback_url = f"https://open.spotify.com/search/{encoded_query}"
    
    print(f"[MEDIA AUTOMATION] Attempting OS protocol bridge: {app_uri}")
    try:
        # Try native app registered protocol
        opened_app = webbrowser.open(app_uri)
        if opened_app:
            return {
                "success": True,
                "engine": "spotify",
                "mode": "native_uri",
                "query": query_cleaned,
                "uri": app_uri,
                "message": f"Dispatched native URI command packet for search routing: '{query_cleaned}'"
            }
    except Exception:
        # Fallback to web interface
        print("[MEDIA AUTOMATION] Application protocol refused. Falling back to Spotify web search interface.")
        
    try:
        opened_web = webbrowser.open(web_fallback_url)
        return {
            "success": opened_web,
            "engine": "spotify",
            "mode": "web_fallback",
            "query": query_cleaned,
            "url": web_fallback_url,
            "message": f"Dispatched Spotify web client search automation: '{query_cleaned}'"
        }
    except Exception as e:
        return {
            "success": False,
            "error": "SPOTIFY_DISPATCH_FAILED",
            "details": str(e),
            "message": "Failed to link search command to Spotify application registry or web interface."
        }

def parse_media_command(command: str) -> Dict[str, Any]:
    """
    Natural Language Parser to identify intent and extract target query strings
    for automated YouTube and Spotify command pipelines.
    """
    if not command or not command.strip():
        return {
            "success": False,
            "error": "EMPTY_COMMAND",
            "message": "Command sequence cannot be empty."
        }

    cmd_lower = command.lower()
    
    # 1. Check for YouTube search & play trigger patterns
    youtube_pattern = re.compile(
        r"(?:play|search|open|video)\s+(?:on|in|to)?\s*youtube\s+(?:for|about|to)?\s*(.*)", re.IGNORECASE
    )
    youtube_pattern_rev = re.compile(
        r"(?:play|watch|put on)\s+(.*?)\s+(?:on|in)\s*youtube", re.IGNORECASE
    )
    
    match_yt = youtube_pattern.search(cmd_lower)
    match_yt_rev = youtube_pattern_rev.search(cmd_lower)
    
    if match_yt:
        query = match_yt.group(1).strip()
        if query:
            return play_on_youtube(query)
            
    if match_yt_rev:
        query = match_yt_rev.group(1).strip()
        if query:
            return play_on_youtube(query)
            
    # Broad catch-all YouTube trigger
    if "youtube" in cmd_lower:
        # Attempt to subtract 'youtube' and extract residual text
        cleaned_msg = re.sub(r"\b(tark|jarvis|play|on|in|open|search)\b", "", cmd_lower)
        query = cleaned_msg.replace("youtube", "").strip()
        return play_on_youtube(query if query else "lo-fi beats")

    # 2. Check for Spotify play trigger patterns
    spotify_pattern = re.compile(
        r"(?:play|search|open|music)\s+(?:on|in|to)?\s*spotify\s+(?:for|about|to)?\s*(.*)", re.IGNORECASE
    )
    spotify_pattern_rev = re.compile(
        r"(?:play|stream|listen to)\s+(.*?)\s+(?:on|in)\s*spotify", re.IGNORECASE
    )
    
    match_sp = spotify_pattern.search(cmd_lower)
    match_sp_rev = spotify_pattern_rev.search(cmd_lower)
    
    if match_sp:
        query = match_sp.group(1).strip()
        return play_on_spotify(query if query else None)
        
    if match_sp_rev:
        query = match_sp_rev.group(1).strip()
        return play_on_spotify(query if query else None)
        
    # Broad catch-all Spotify trigger
    if "spotify" in cmd_lower:
        cleaned_msg = re.sub(r"\b(tark|jarvis|play|on|in|open|search|listen|stream|to)\b", "", cmd_lower)
        query = cleaned_msg.replace("spotify", "").strip()
        return play_on_spotify(query if query else None)

    # 3. Default fallback heuristic if voice prompt contains action triggers but is engine-agnostic
    if "play" in cmd_lower:
        # Exclude common nouns and find query
        query = re.sub(r"\b(tark|jarvis|play|some|music|video|song|on)\b", "", cmd_lower).strip()
        # Defaulting agnostic play commands to YouTube for wider coverage search results
        return play_on_youtube(query if query else "lo-fi chill beats")

    return {
        "success": False,
        "error": "UNRECOGNIZED_INTENT",
        "message": "Let me know if you would like me to play media via YouTube or Spotify."
    }

if __name__ == "__main__":
    # Allow testing directly via script command lines
    if len(sys.argv) > 1:
        user_input = " ".join(sys.argv[1:])
        print(f"[TESTING BRIDGE] Executing intent analysis for: '{user_input}'")
        result = parse_media_command(user_input)
        print(json.dumps(result, indent=2))
    else:
        print("[TARK AUTOMATION ACTIVE] Try running the command with a query:")
        print("  python3 media_controls.py 'Play some synthwave on YouTube'")
        print("  python3 media_controls.py 'Open Spotify and stream Daft Punk'")
