import { AlertBadge } from "@/components/ui/AlertBadge";
import { ShieldAlert, Search } from "lucide-react";
import { API_URL } from "@/config";

export const revalidate = 0;

async function getAlerts() {
  try {
    const res = await fetch(`${API_URL}/alerts`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.alerts || [];
  } catch (error) {
    return [];
  }
}

export default async function AlertsPage() {
  const alerts = await getAlerts();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <header className="mb-8 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3">
            <ShieldAlert className="text-red-500" size={32} /> Alerts Registry
          </h1>
          <p className="text-slate-400 mt-2">Comprehensive log of all detected security events.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search alerts..." 
            className="pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-200 w-64 glass"
          />
        </div>
      </header>

      <div className="glass rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex-1 flex flex-col">
        <div className="overflow-auto flex-1 h-[600px]">
          <table className="w-full text-left text-sm text-slate-300 relative">
            <thead className="bg-slate-900/95 sticky top-0 z-10 text-slate-400 uppercase text-xs font-semibold shadow-md">
              <tr>
                <th className="px-6 py-4 border-b border-slate-800">ID</th>
                <th className="px-6 py-4 border-b border-slate-800">Timestamp</th>
                <th className="px-6 py-4 border-b border-slate-800">Threat Type</th>
                <th className="px-6 py-4 border-b border-slate-800">Source IP</th>
                <th className="px-6 py-4 border-b border-slate-800">Severity</th>
                <th className="px-6 py-4 border-b border-slate-800 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {alerts.length > 0 ? alerts.map((alert: any) => (
                <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 font-mono text-slate-500">#{alert.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{alert.timestamp}</td>
                  <td className="px-6 py-4 font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">{alert.type}</td>
                  <td className="px-6 py-4 font-mono text-slate-400">{alert.source_ip}</td>
                  <td className="px-6 py-4">
                    <AlertBadge severity={alert.severity} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-blue-400 hover:text-blue-300 text-xs font-medium px-3 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
                      Investigate
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No alerts found or backend is unreachable.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
