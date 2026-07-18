"use client";

import { useState } from "react";
import { Cpu, AlertTriangle, ShieldCheck, ChevronRight, BarChart2, Zap, Play } from "lucide-react";
import { API_URL } from "@/config";

interface PredictResponse {
  anomaly: boolean;
  details: {
    type: string;
    severity: string;
  };
}

export default function MLModelPage() {
  const [srcBytes, setSrcBytes] = useState(1500);
  const [dstBytes, setDstBytes] = useState(120);
  const [protocol, setProtocol] = useState("0"); // TCP
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictResponse | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredicting(true);
    setPredictionResult(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          src_bytes: srcBytes,
          dst_bytes: dstBytes,
          protocol_type: parseInt(protocol)
        })
      });

      if (!res.ok) throw new Error("Failed to predict");
      const data = await res.json();
      setPredictionResult(data);
    } catch (err) {
      console.error(err);
      alert("Error contacting the ML engine.");
    } finally {
      setPredicting(false);
    }
  };

  const featureImportance = [
    { name: "src_bytes", score: 45, label: "Source Bytes (Header/Packet Size)", color: "from-blue-500 to-cyan-500" },
    { name: "dst_bytes", score: 38, label: "Destination Bytes (Payload Volume)", color: "from-indigo-500 to-purple-500" },
    { name: "protocol_type", score: 17, label: "Protocol Mapping (TCP/UDP/Other)", color: "from-pink-500 to-rose-500" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3">
          <Cpu className="text-purple-500 animate-pulse" size={32} /> 
          Machine Learning Classifier Center
        </h1>
        <p className="text-slate-400 mt-2">
          Inspect performance diagnostics of the NSL-KDD Random Forest engine and run test packets.
        </p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-slate-100">
            <Zap size={64} />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Model Accuracy</span>
          <h2 className="text-4xl font-extrabold text-cyan-400 mt-2">97.33%</h2>
          <p className="text-xs text-slate-500 mt-2">Holdout validation set accuracy.</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-slate-100">
            <Zap size={64} />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Model Precision</span>
          <h2 className="text-4xl font-extrabold text-indigo-400 mt-2">97.23%</h2>
          <p className="text-xs text-slate-500 mt-2">Rejection rate of normal traffic false alerts.</p>
        </div>

        <div className="glass p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-slate-100">
            <Zap size={64} />
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Model Recall</span>
          <h2 className="text-4xl font-extrabold text-purple-400 mt-2">99.80%</h2>
          <p className="text-xs text-slate-500 mt-2">True detection percentage of malicious packets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Feature Importance Card */}
        <div className="glass p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BarChart2 size={16} className="text-cyan-400" /> Feature Importance Distribution
            </h2>
            <div className="space-y-6">
              {featureImportance.map((feat) => (
                <div key={feat.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-300 font-mono">{feat.name}</span>
                    <span className="text-slate-400">{feat.label} • <strong className="text-slate-200">{feat.score}%</strong></span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800/40">
                    <div 
                      className={`h-full bg-gradient-to-r ${feat.color} rounded-full`} 
                      style={{ width: `${feat.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-6 border-t border-slate-800/60 pt-4">
            * Random Forest ensemble computes split gini impurities to weight input parameters.
          </div>
        </div>

        {/* Inference Playground Card */}
        <div className="glass p-6 rounded-2xl border border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Play size={16} className="text-purple-400" /> Dynamic Telemetry Simulation
          </h2>
          <form onSubmit={handlePredict} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Src Bytes (Packet Size)</label>
                <input 
                  type="number"
                  required
                  value={srcBytes}
                  onChange={(e) => setSrcBytes(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-purple-500 text-slate-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Dst Bytes (Payload Size)</label>
                <input 
                  type="number"
                  required
                  value={dstBytes}
                  onChange={(e) => setDstBytes(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-purple-500 text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Protocol Type</label>
              <select 
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-purple-500 text-slate-200"
              >
                <option value="0">TCP (Transmission Control Protocol)</option>
                <option value="1">UDP (User Datagram Protocol)</option>
                <option value="2">Other (ICMP, ARP, etc.)</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={predicting}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2"
            >
              {predicting ? "Running Classifier..." : "Execute Test Inference"}
            </button>
          </form>

          {/* Playground Result */}
          {predictionResult && (
            <div className={`mt-6 p-4 rounded-xl border animate-in fade-in duration-300 ${
              predictionResult.anomaly 
                ? "bg-red-500/10 border-red-500/30 text-red-400" 
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}>
              <div className="flex items-start gap-3">
                {predictionResult.anomaly ? (
                  <AlertTriangle className="text-red-500 mt-0.5 shrink-0" size={20} />
                ) : (
                  <ShieldCheck className="text-emerald-400 mt-0.5 shrink-0" size={20} />
                )}
                <div>
                  <h3 className="font-bold text-sm">
                    {predictionResult.anomaly ? "Intrusion Flagged! 🚨" : "Normal Telemetry Signature"}
                  </h3>
                  <p className="text-xs mt-1 text-slate-300">
                    Type: <span className="font-semibold">{predictionResult.details?.type}</span> | Severity: <span className="font-semibold">{predictionResult.details?.severity}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
