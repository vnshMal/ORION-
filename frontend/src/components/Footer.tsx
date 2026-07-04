"use client";

import { useEffect, useState } from "react";
import { Database, Shield, Server, Terminal, Radio } from "lucide-react";

export function Footer() {
  const [latency, setLatency] = useState<number | null>(null);
  const [dbStatus, setDbStatus] = useState<"connected" | "disconnected">("connected");

  useEffect(() => {
    // Check connection to backend
    const checkBackend = async () => {
      const start = Date.now();
      try {
        const res = await fetch("http://127.0.0.1:8000/", { cache: "no-store" });
        if (res.ok) {
          setLatency(Date.now() - start);
          setDbStatus("connected");
        } else {
          setDbStatus("disconnected");
        }
      } catch (err) {
        setDbStatus("disconnected");
        setLatency(null);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full bg-[#070b12] border-t border-slate-800/50 py-4 px-6 mt-auto text-xs text-slate-500 z-20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Left Side: System Metadata */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1">
          <span className="font-semibold text-slate-400 flex items-center gap-1.5">
            <Shield size={12} className="text-blue-500" />
            ORION IDS v1.1.0
          </span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span className="text-slate-500 font-mono flex items-center gap-1">
            <Radio size={12} className="text-indigo-400" />
            NIC: Wi-Fi (Npcap adapter)
          </span>
        </div>

        {/* Right Side: Network Status Indicators */}
        <div className="flex flex-wrap items-center gap-5 text-[11px] tracking-wide font-medium">
          
          {/* Backend API Server Status */}
          <div className="flex items-center gap-1.5">
            <Server size={11} className={dbStatus === "connected" ? "text-emerald-400" : "text-red-400"} />
            <span>API SERVER:</span>
            {dbStatus === "connected" ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                ONLINE 
                {latency !== null && <span className="font-normal font-mono text-[10px] text-slate-500">({latency}ms)</span>}
              </span>
            ) : (
              <span className="text-red-500 font-bold">OFFLINE</span>
            )}
          </div>

          {/* SQLite database status */}
          <div className="flex items-center gap-1.5">
            <Database size={11} className={dbStatus === "connected" ? "text-emerald-400" : "text-red-400"} />
            <span>DB (SQLite):</span>
            <span className={dbStatus === "connected" ? "text-emerald-400 font-bold" : "text-red-500 font-bold"}>
              {dbStatus === "connected" ? "CONNECTED" : "OFFLINE"}
            </span>
          </div>

          {/* Overall status arc indicator */}
          <div className="flex items-center gap-1.5 border-l border-slate-800/80 pl-4">
            <span className={`w-2 h-2 rounded-full ${dbStatus === "connected" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" : "bg-red-500"}`}></span>
            <span className="text-slate-400 font-bold uppercase tracking-wider">
              {dbStatus === "connected" ? "ALL ENGINES OPERATIONAL" : "API CONNECTION ERROR"}
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}
