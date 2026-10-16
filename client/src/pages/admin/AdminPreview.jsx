import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import Header from '../../components/common/Header';
import StatCard from '../../components/common/StatCard';
import { MapPin, Shield, Layers, Home, Tent, Navigation, CloudRain, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminPreview() {
  const { user } = useAuth();

  const { data: regionData } = useQuery({
    queryKey: ['myRegion', user?.regionId?._id || user?.regionId],
    queryFn: async () => {
      const regId = user?.regionId?._id || user?.regionId;
      if (!regId) return null;
      return (await api.get(`/regions/${regId}`)).data.data;
    },
    enabled: Boolean(user?.regionId)
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Banner with District Identification */}
        <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 to-slate-900/60 p-6 backdrop-blur flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
              <MapPin className="w-3.5 h-3.5" />
              Regional Jurisdiction: {regionData?.region?.name || 'Wayanad District'} ({regionData?.region?.code || 'WYD'})
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              District Disaster Management Authority (DDMA) Command
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Official: <strong className="text-white">{user?.name}</strong> • {user?.designation} ({user?.department})
            </p>
          </div>

          <div className="text-right flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-left">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Data Isolation Scope</div>
              <div className="text-xs font-mono font-bold text-emerald-400">Strictly Region WYD</div>
            </div>
          </div>
        </div>

        {/* District Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Sectors / Zones"
            value={regionData?.zones?.length || 3}
            subtext="Chooralmala, Vythiri & Mananthavady"
            icon={Layers}
            color="cyan"
          />
          <StatCard
            title="Relief Shelters"
            value="3"
            subtext="Meppadi School, St. Joseph, Vythiri"
            icon={Tent}
            color="emerald"
          />
          <StatCard
            title="Designated Routes"
            value="3"
            subtext="2 Clear • 1 Blocked (Mudslide)"
            icon={Navigation}
            color="amber"
          />
          <StatCard
            title="Weather Feed"
            value="Active"
            subtext="Open-Meteo Centroid Polling"
            icon={CloudRain}
            color="blue"
          />
        </div>

        {/* Monitored Zones Overview */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Monitored Vulnerable Sectors in {regionData?.region?.name || 'Wayanad'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                GeoJSON polygon zones with calibrated rainfall thresholds for landslide & flash-flood detection
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              3 Sectors Armed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {regionData?.zones?.map((zone) => (
              <div key={zone._id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-400">{zone.code}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    Risk Score: {zone.slopeRiskScore}/10
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{zone.name}</h3>
                <div className="text-xs text-slate-400">
                  Est. Population: <strong className="text-slate-200">{zone.populationEstimate?.toLocaleString()}</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Calibration: <span className="text-emerald-400 font-medium">Locally Calibrated (Meppadi Steep Slope)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 2 Transition Notice */}
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-cyan-300">Phase 1 Foundation Complete & Verified</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Role isolation middleware and region scoping active. Ready for Phase 2: Live Leaflet zone map, 30-min Open-Meteo cumulative rainfall fetcher, and the automated risk tier engine!
            </p>
          </div>
          <Link
            to="/superadmin"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 whitespace-nowrap transition"
          >
            <span>Superadmin Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
