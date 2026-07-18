"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Plus, Trash2, Clock, ShieldCheck, Play, Power, RotateCw } from "lucide-react";
import { API_URL } from "@/config";

interface BlockedIP {
  ip: string;
  timestamp: string;
  expires_in: number;
}

export default function FirewallPage() {
  const [blacklist, setBlacklist] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualIp, setManualIp] = useState("");
  const [firewallActive, setFirewallActive] = useState(true);
  const [logs, setLogs] = useState<string[]>([
    "Firewall daemon started.",
    "Rules synchronized with SQLite storage engine.",
    "Ready for IP filter injection."
  ]);

  const fetchBlacklist = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/blacklist`);
      if (!res.ok) throw new Error("Failed to fetch blacklist");
      const data = await res.json();
      setBlacklist(data.blacklist || []);
    } catch (err) {
      console.error("Error loading blacklist", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlacklist();
    const interval = setInterval(() => {
      // Countdown local timer
      setBlacklist(prev => 
        prev.map(item => ({ ...item, expires_in: Math.max(0, item.expires_in - 1) }))
            .filter(item => item.expires_in > 0)
      );
    }, 1000);

    // Refresh from server every 10 seconds
    const serverInterval = setInterval(fetchBlacklist, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(serverInterval);
    };
  }, []);

  const handleManualBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIp) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/blacklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: manualIp })
      });
      if (res.ok) {
        setLogs(prev => [`Manually blocked IP ${manualIp}`, ...prev]);
        setManualIp("");
        fetchBlacklist();
      }
    } catch (err) {
      console.error("Error blocking IP", err);
    }
  };

  const handleUnblock = async (ip: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/blacklist/${ip}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setLogs(prev => [`Manually unblocked IP ${ip}`, ...prev]);
        setBlacklist(prev => prev.filter(item => item.ip !== ip));
      }
    } catch (err) {
      console.error("Error unblocking IP", err);
    }
  };

  const toggleFirewall = () => {
    setFirewallActive(!firewallActive);
    setLogs(prev => [
      `Firewall rule enforcement ${!firewallActive ? "ENABLED" : "DISABLED"}`,
      ...prev
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3">
            <ShieldAlert className="text-red-500 animate-pulse" size={32} /> 
            Mitigation & Firewall Control
          </h1>
          <p className="text-slate-400 mt-2">
            Inspect active blacklists, adjust rules, and enforce automated prevention strategies.
          </p>
        </div>
        
        <button 
          onClick={toggleFirewall}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg border ${
            firewallActive 
              ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
              : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30"
          }`}
        >
          <Power size={16} />
          Firewall Status: {firewallActive ? "ACTIVE" : "INACTIVE"}
        </button>
      </header>

      {/* Grid: Forms & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side Column: Block Form and Metrics */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <div className="glass p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-40">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Blocked Hosts</span>
              <h2 className="text-4xl font-extrabold text-red-500 mt-2">{blacklist.length}</h2>
            </div>
            <p className="text-xs text-slate-500">Blocked for violating threshold values or signature matching rules.</p>
          </div>

          {/* Block Form */}
          <div className="glass p-6 rounded-2xl border border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Plus size={16} className="text-red-400" /> Manual IP Blocklist
            </h2>
            <form onSubmit={handleManualBlock} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400">Target IP Address</label>
                <input 
                  type="text" 
                  required
                  value={manualIp}
                  onChange={(e) => setManualIp(e.target.value)}
                  placeholder="e.g. 192.168.1.100"
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm font-mono focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-slate-200"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(239,68,68,0.3)] transition-all"
              >
                Block Host Immediate
              </button>
            </form>
          </div>
        </div>

        {/* Center / Right Column: Active Blacklist Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-full">
            <div className="bg-[#0b0f19] px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Clock size={16} className="text-indigo-400" /> Active Blacklist Lease Registry
              </h2>
              <button 
                onClick={fetchBlacklist}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
                title="Refresh List"
              >
                <RotateCw size={14} />
              </button>
            </div>
            
            <div className="overflow-auto max-h-[380px] min-h-[320px] flex-1">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-500 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-3 border-b border-slate-800">Target IP</th>
                    <th className="px-6 py-3 border-b border-slate-800">Block Time</th>
                    <th className="px-6 py-3 border-b border-slate-800">TTL Remaining</th>
                    <th className="px-6 py-3 border-b border-slate-800 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {blacklist.length > 0 ? (
                    blacklist.map((item) => (
                      <tr key={item.ip} className="hover:bg-slate-800/10 transition-colors">
                        <td className="px-6 py-3.5 font-mono text-slate-200 font-semibold">{item.ip}</td>
                        <td className="px-6 py-3.5 text-xs text-slate-400">{item.timestamp}</td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-amber-400 font-semibold">{item.expires_in}s</span>
                            {/* Small mini-progress bar */}
                            <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full" 
                                style={{ width: `${(item.expires_in / 300) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <button 
                            onClick={() => handleUnblock(item.ip)}
                            className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-500/10 hover:text-emerald-400 border border-slate-700 hover:border-emerald-500/20 transition-all font-medium"
                          >
                            Unblock
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        {loading ? "Syncing kernel rules lease database..." : "No active blocks found. Network is clear!"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Audit Log Console */}
      <div className="glass p-5 rounded-2xl border border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
            Orion Mitigation Syslog Console
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Live logs</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 font-mono text-xs text-emerald-500/90 h-32 overflow-y-auto space-y-1 scrollbar-thin">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
