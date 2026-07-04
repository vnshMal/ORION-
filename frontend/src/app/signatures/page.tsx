"use client";

import { useEffect, useState } from "react";
import { FileCode, Plus, Trash2, Power, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { AlertBadge } from "@/components/ui/AlertBadge";

interface Signature {
  id: number;
  name: string;
  protocol: string;
  pattern: string;
  severity: string;
  active: boolean;
}

export default function SignaturesPage() {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Form State
  const [name, setName] = useState("");
  const [protocol, setProtocol] = useState("TCP");
  const [pattern, setPattern] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchSignatures = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/signatures");
      if (!res.ok) throw new Error("Failed to fetch signatures");
      const data = await res.json();
      setSignatures(data.signatures || []);
    } catch (err: any) {
      setError(err.message || "Failed to load signatures from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  const handleToggle = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/signatures/${id}/toggle`, {
        method: "POST"
      });
      if (res.ok) {
        setSignatures(prev => prev.map(sig => 
          sig.id === id ? { ...sig, active: !sig.active } : sig
        ));
      }
    } catch (err) {
      console.error("Error toggling signature", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/signatures/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSignatures(prev => prev.filter(sig => sig.id !== id));
      }
    } catch (err) {
      console.error("Error deleting signature", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, protocol, pattern, severity, active: true })
      });
      if (!res.ok) throw new Error("Failed to create signature");
      
      setName("");
      setPattern("");
      setSeverity("Medium");
      setShowForm(false);
      fetchSignatures();
    } catch (err: any) {
      alert(err.message || "Failed to save rule");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3">
            <FileCode className="text-blue-500 animate-pulse" size={32} /> 
            Signature Rules Manager
          </h1>
          <p className="text-slate-400 mt-2">
            Configure packet header matching rules to intercept known exploit signatures at line speed.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={fetchSignatures}
            className="p-2.5 bg-slate-900 border border-slate-700/60 hover:bg-slate-800 text-slate-300 rounded-xl transition-all"
            title="Refresh rules"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-[0_4px_20px_rgba(59,130,246,0.3)] transition-all"
          >
            <Plus size={16} />
            {showForm ? "Close Form" : "Create Signature"}
          </button>
        </div>
      </header>

      {/* Signature Addition Form */}
      {showForm && (
        <div className="glass p-6 rounded-2xl border border-slate-800 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Plus className="text-blue-400" size={18} /> Add New Signature Rule
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rule Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ICMP Ping Sweep"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Protocol</label>
              <select 
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-200"
              >
                <option value="TCP">TCP</option>
                <option value="UDP">UDP</option>
                <option value="ICMP">ICMP</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Severity</label>
              <select 
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-blue-500 text-slate-200"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Matching Pattern</label>
              <input 
                type="text" 
                required
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. flags == 'S' or payload_contains('UNION')"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-200"
              />
            </div>

            <div>
              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              >
                {submitting ? "Deploying..." : "Deploy Rule"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Alerts / Error Panel */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Rules Registry Table */}
      <div className="glass rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#0b0f19] text-slate-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4 border-b border-slate-800">Status</th>
                <th className="px-6 py-4 border-b border-slate-800">Rule Name</th>
                <th className="px-6 py-4 border-b border-slate-800">Protocol</th>
                <th className="px-6 py-4 border-b border-slate-800">Evaluator Expression</th>
                <th className="px-6 py-4 border-b border-slate-800">Severity</th>
                <th className="px-6 py-4 border-b border-slate-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {signatures.length > 0 ? (
                signatures.map((sig) => (
                  <tr key={sig.id} className={`hover:bg-slate-800/20 transition-colors ${!sig.active ? "opacity-60" : ""}`}>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggle(sig.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-all ${
                          sig.active 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.2)]" 
                            : "bg-slate-900 border-slate-800 text-slate-500"
                        }`}
                        title={sig.active ? "Click to Deactivate" : "Click to Activate"}
                      >
                        <Power size={10} />
                        {sig.active ? "ACTIVE" : "INACTIVE"}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-100">{sig.name}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs px-2 py-1 bg-slate-950/80 border border-slate-800 rounded text-indigo-400 font-bold uppercase">
                        {sig.protocol}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-400 bg-slate-950/20 rounded-md py-1 border border-slate-800/20">
                      {sig.pattern}
                    </td>
                    <td className="px-6 py-4">
                      <AlertBadge severity={sig.severity} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(sig.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete Rule"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    {loading ? "Loading signature rules registry..." : "No intrusion signatures registered."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Banner */}
      <div className="glass p-5 rounded-2xl border border-slate-800/80 flex items-start gap-4">
        <ShieldCheck className="text-blue-400 mt-0.5 shrink-0" size={20} />
        <div className="text-xs text-slate-400 space-y-1">
          <p className="font-bold text-slate-300">How signatures operate:</p>
          <p>
            When packets flow through the sniffer pipeline, the Signature Engine iterates over active rules.
            Evaluating protocols like TCP, UDP, or ICMP, signatures matching the packet dimensions trigger instant alerts before ML ingestion, optimizing latency.
          </p>
        </div>
      </div>

    </div>
  );
}
