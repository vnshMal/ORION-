"use client";

import { useEffect, useState } from "react";
import { Settings, Save, AlertTriangle, CheckCircle, Database, ShieldCheck, ToggleLeft } from "lucide-react";
import { API_URL } from "@/config";

export default function SettingsPage() {
  const [alertThreshold, setAlertThreshold] = useState(50);
  const [reputationIncrement, setReputationIncrement] = useState(10);
  const [blacklistDuration, setBlacklistDuration] = useState(300);
  const [activeInterface, setActiveInterface] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/config`);
        if (!res.ok) throw new Error("Failed to fetch configs");
        const data = await res.json();
        setAlertThreshold(data.alert_threshold);
        setReputationIncrement(data.reputation_increment);
        setBlacklistDuration(data.blacklist_duration);
        setActiveInterface(data.active_interface);
      } catch (err) {
        console.error("Config fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alert_threshold: alertThreshold,
          reputation_increment: reputationIncrement,
          blacklist_duration: blacklistDuration,
          active_interface: activeInterface
        })
      });
      if (!res.ok) throw new Error("Failed to update configs");
      setMessage({ text: "Configurations deployed successfully to core ORION service.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to save settings.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3">
          <Settings className="text-indigo-400 animate-pulse" size={32} /> 
          System Configuration
        </h1>
        <p className="text-slate-400 mt-2">
          Tune intrusion score limits, blacklist expirations, and active packet capturing interfaces.
        </p>
      </header>

      {/* Success/Error message banner */}
      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm animate-in slide-in-from-top-2 duration-300 ${
          message.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          {message.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Settings Form */}
        <div className="lg:col-span-2 glass p-6 rounded-2xl border border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-widest mb-6 flex items-center gap-2">
            <ToggleLeft size={16} className="text-indigo-400" /> Pipeline Tuning parameters
          </h2>
          
          {loading ? (
            <p className="text-slate-500 text-sm py-4">Reading configuration space...</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Alert scoring threshold */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Alert Severity Threshold</label>
                  <span className="text-xs font-bold text-indigo-400">{alertThreshold} Points</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="150" 
                  value={alertThreshold} 
                  onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[11px] text-slate-500">
                  Scores exceeding this metric will generate alerts inside the SOC registry. Critical alerts require score &gt; 120.
                </p>
              </div>

              {/* Reputation modifier */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Reputation Modifier Increment</label>
                  <span className="text-xs font-bold text-indigo-400">+{reputationIncrement} Reputation/Incident</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  value={reputationIncrement} 
                  onChange={(e) => setReputationIncrement(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[11px] text-slate-500">
                  Amount added to an attacker profile's risk index for each repeated threat trigger.
                </p>
              </div>

              {/* Blacklist lease TTL */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase">IP Blacklist TTL Cooldown</label>
                  <span className="text-xs font-bold text-indigo-400">{blacklistDuration} Seconds</span>
                </div>
                <input 
                  type="range" 
                  min="60" 
                  max="1800" 
                  step="60"
                  value={blacklistDuration} 
                  onChange={(e) => setBlacklistDuration(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[11px] text-slate-500">
                  Time (seconds) high-impact threats categorized as Critical are blocked at the sniffer layer.
                </p>
              </div>

              {/* Active interface */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase">Network Sniffing Interface (NIC)</label>
                <input 
                  type="text" 
                  required
                  value={activeInterface}
                  onChange={(e) => setActiveInterface(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-500 text-slate-200"
                />
                <p className="text-[11px] text-slate-500">
                  The primary network interface bound to the Scapy Sniffer engine.
                </p>
              </div>

              <button 
                type="submit"
                disabled={saving}
                className="py-3 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(99,102,241,0.3)] transition-all flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? "Applying Configs..." : "Commit Settings"}
              </button>

            </form>
          )}
        </div>

        {/* Informative Side cards */}
        <div className="space-y-6">
          <div className="glass p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Database size={16} className="text-blue-400" /> Database Registry
            </h3>
            <div className="space-y-2 text-xs text-slate-400 font-mono">
              <div>
                <span className="text-slate-500">ENGINE:</span> SQLite3
              </div>
              <div>
                <span className="text-slate-500">PATH:</span> backend/alerts.db
              </div>
              <div>
                <span className="text-slate-500">RETENTION:</span> 50 Alerts (Limit)
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              The internal database records timestamped IP logs, threat weights, and classification tags.
            </p>
          </div>

          <div className="glass p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-400" /> Compliance Enforcer
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              ORION operates in compliance with standard network auditing regulations. Captured payloads are obfuscated to protect privacy, storing only size metrics.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
