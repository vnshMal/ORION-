import { Map } from "lucide-react";
import { MapWrapper } from "@/components/MapWrapper";
import { API_URL } from "@/config";

export const revalidate = 0;

async function getHeatmapPoints() {
  try {
    const res = await fetch(`${API_URL}/heatmap`, { cache: "no-store", next: { revalidate: 0 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.heatmap || [];
  } catch (error) {
    return [];
  }
}

export default async function MapPage() {
  const points = await getHeatmapPoints();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-50 flex items-center gap-3">
          <Map className="text-indigo-500" size={32} /> Global Threat Map
        </h1>
        <p className="text-slate-400 mt-2">Geographical visualization of alert origins derived from IP geolocation.</p>
      </header>

      <div className="relative rounded-2xl">
        <MapWrapper points={points} />
        {/* Glow behind map */}
        <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] -z-10 rounded-full pointer-events-none"></div>
      </div>
    </div>
  );
}
