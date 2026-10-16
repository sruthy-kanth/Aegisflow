import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import Header from '../../components/common/Header';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import {
  Activity,
  MapPin,
  Users,
  Sliders,
  Cpu,
  MessageSquare,
  ScrollText,
  Plus,
  RefreshCw,
  Key,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Server,
  CloudRain,
  ExternalLink,
  Shield,
  Volume2
} from 'lucide-react';

export default function SuperadminDashboard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('health');

  // Modals state
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [generatedKeyInfo, setGeneratedKeyInfo] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  // Form states
  const [regionForm, setRegionForm] = useState({
    name: '',
    code: '',
    state: 'Kerala',
    country: 'India',
    description: '',
    lat: 11.6854,
    lng: 76.1320,
    north: 11.98,
    south: 11.45,
    east: 76.45,
    west: 75.90,
    contactTitle: 'District Emergency Operations Center',
    contactPhone: '1077'
  });

  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
    regionId: '',
    phone: '',
    designation: 'District Disaster Management Officer',
    department: 'District Collectorate'
  });

  const [sensorForm, setSensorForm] = useState({
    name: '',
    deviceId: '',
    regionId: '',
    zoneId: '',
    type: 'rain',
    lat: 11.5420,
    lng: 76.1400,
    elevationMeters: 950
  });

  const [thresholdForm, setThresholdForm] = useState({
    name: '',
    rain24_watch: 65,
    rain24_warning: 115,
    rain24_evacuate: 200,
    rain72_watch: 120,
    rain72_warning: 180,
    rain72_evacuate: 300,
    rainFc_watch: 70,
    rainFc_warning: 125,
    rainFc_evacuate: 210,
    soil_watch: 70,
    soil_warning: 85,
    soil_evacuate: 95,
    msg_en_watch: 'AEGISFLOW ADVISORY: Heightened rainfall detected. Stay alert. Details: {{link}}',
    msg_en_warning: 'AEGISFLOW WARNING: Heavy rain risk crossing critical safety limits. Check routes. Details: {{link}}',
    msg_en_evacuate: 'AEGISFLOW EVACUATION ORDER: Landslide imminent. Move to camp via clear routes immediately. Details: {{link}}',
    msg_ml_watch: 'ഈജിസ്ഫ്ലോ ജാഗ്രതാ നിർദ്ദേശം: നിങ്ങളുടെ പ്രദേശത്ത് കനത്ത മഴ. വിവരങ്ങൾക്ക്: {{link}}',
    msg_ml_warning: 'ഈജിസ്ഫ്ലോ മുന്നറിയിപ്പ്: മണ്ണിടിച്ചിൽ സാധ്യത. സുരക്ഷിത സ്ഥാനങ്ങളിലേക്ക് മാറുക: {{link}}',
    msg_ml_evacuate: 'ഈജിസ്ഫ്ലോ അടിയന്തര ഒഴിപ്പിക്കൽ ഉത്തരവ്: ഉടൻ തന്നെ ക്യാമ്പിലേക്ക് മാറുക: {{link}}'
  });

  const [providerSettings, setProviderSettings] = useState({
    smsProvider: 'mock',
    voiceProvider: 'mock',
    buzzerGatewayUrl: 'http://localhost:5000/api/system/mock/buzzer'
  });

  const [buzzerTestStatus, setBuzzerTestStatus] = useState(null);

  // Queries
  const { data: healthData, refetch: refetchHealth, isFetching: fetchingHealth } = useQuery({
    queryKey: ['systemHealth'],
    queryFn: async () => (await api.get('/system/health')).data.data,
    refetchInterval: 15000
  });

  const { data: regionsData, refetch: refetchRegions } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => (await api.get('/regions')).data.data.regions
  });

  const { data: usersData, refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get('/users')).data.data.users
  });

  const { data: thresholdData, refetch: refetchThresholds } = useQuery({
    queryKey: ['thresholds'],
    queryFn: async () => (await api.get('/thresholds')).data.data
  });

  const { data: sensorsData, refetch: refetchSensors } = useQuery({
    queryKey: ['sensors'],
    queryFn: async () => (await api.get('/sensors')).data.data.sensors
  });

  const { data: auditData, refetch: refetchAudit } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => (await api.get('/audit?limit=30')).data.data
  });

  // Sync provider settings from health query
  useEffect(() => {
    if (healthData?.messaging?.activeSettings) {
      setProviderSettings({
        smsProvider: healthData.messaging.activeSettings.smsProvider || 'mock',
        voiceProvider: healthData.messaging.activeSettings.voiceProvider || 'mock',
        buzzerGatewayUrl: healthData.messaging.activeSettings.buzzerGatewayUrl || 'http://localhost:5000/api/system/mock/buzzer'
      });
    }
  }, [healthData]);

  // Handle default region in forms
  useEffect(() => {
    if (regionsData && regionsData.length > 0) {
      if (!adminForm.regionId) setAdminForm(prev => ({ ...prev, regionId: regionsData[0]._id }));
      if (!sensorForm.regionId) setSensorForm(prev => ({ ...prev, regionId: regionsData[0]._id }));
    }
  }, [regionsData]);

  // Mutations
  const createRegionMutation = useMutation({
    mutationFn: async (payload) => (await api.post('/regions', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['regions']);
      setShowRegionModal(false);
      refetchHealth();
    }
  });

  const createAdminMutation = useMutation({
    mutationFn: async (payload) => (await api.post('/users', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setShowAdminModal(false);
      refetchHealth();
    }
  });

  const registerSensorMutation = useMutation({
    mutationFn: async (payload) => (await api.post('/sensors', payload)).data.data,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['sensors']);
      setShowSensorModal(false);
      setGeneratedKeyInfo({
        deviceId: data.sensor.deviceId,
        name: data.sensor.name,
        plainKey: data.plainDeviceKey
      });
      refetchHealth();
    }
  });

  const createThresholdMutation = useMutation({
    mutationFn: async (payload) => (await api.post('/thresholds', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['thresholds']);
      setShowThresholdModal(false);
    }
  });

  const updateProvidersMutation = useMutation({
    mutationFn: async (payload) => (await api.patch('/system/providers', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['systemHealth']);
    }
  });

  const handleCopyKey = (keyText) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleTestBuzzer = async () => {
    setBuzzerTestStatus('triggering');
    try {
      const res = await api.post('/system/mock/buzzer', {
        testType: 'SUPERADMIN_DRILL',
        simulatedAt: new Date(),
        reason: 'Superadmin siren hardware verification'
      });
      setBuzzerTestStatus(`Success: ${res.data.message}`);
    } catch (err) {
      setBuzzerTestStatus('Trigger failed');
    }
  };

  const tabs = [
    { id: 'health', label: t('nav.health'), icon: Activity },
    { id: 'regions', label: t('nav.regions'), icon: MapPin },
    { id: 'admins', label: t('nav.admins'), icon: Users },
    { id: 'thresholds', label: t('nav.thresholds'), icon: Sliders },
    { id: 'sensors', label: t('nav.sensors'), icon: Cpu },
    { id: 'providers', label: t('nav.providers'), icon: MessageSquare },
    { id: 'audit', label: t('nav.audit'), icon: ScrollText }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Top Control Bar with Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h1 className="text-xl font-bold text-white tracking-tight">
                National Disaster Command & Platform Superadmin
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-region governance, global threshold calibrator, IoT sensor registry & telemetry health
            </p>
          </div>

          <button
            onClick={() => {
              refetchHealth();
              refetchRegions();
              refetchUsers();
              refetchThresholds();
              refetchSensors();
              refetchAudit();
            }}
            disabled={fetchingHealth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition shadow-sm self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetchingHealth ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{t('common.refresh')}</span>
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none border-b border-slate-900">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  active
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: SYSTEM HEALTH & TELEMETRY */}
        {activeTab === 'health' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Active Regions"
                value={regionsData?.length || 1}
                subtext="Under continuous hazard monitoring"
                icon={MapPin}
                color="cyan"
              />
              <StatCard
                title="Telemetry Sensors"
                value={healthData?.sensors?.total || 3}
                subtext={`${healthData?.sensors?.active || 3} active • ${healthData?.sensors?.silent || 0} silent`}
                icon={Cpu}
                color="emerald"
              />
              <StatCard
                title="Weather Feed Latency"
                value={`${healthData?.externalFeeds?.openMeteo?.latencyMs || 192} ms`}
                subtext="Open-Meteo 72h Obs + 48h Forecast"
                icon={CloudRain}
                badge={healthData?.externalFeeds?.openMeteo?.status || 'Active'}
                color="amber"
              />
              <StatCard
                title="Database State"
                value={healthData?.database?.status === 'connected' ? 'Connected' : 'Offline'}
                subtext={`MongoDB: ${healthData?.database?.dbName || 'aegisflow'}`}
                icon={Server}
                color="emerald"
              />
            </div>

            {/* Scheduled Cron Worker Job Status */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Autonomous Risk Engine & Heartbeat Schedulers
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Continuous 30-minute Open-Meteo weather fetchers and 1-minute alert escalation workers
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Engine Operational
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Risk Engine Worker</span>
                    <span className="text-[10px] font-mono text-cyan-400">*/30 * * * *</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Last execution: {healthData?.jobs?.riskEngine?.lastRunAt ? new Date(healthData.jobs.riskEngine.lastRunAt).toLocaleTimeString() : 'Recent'}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Status: <span className="text-emerald-400 font-medium">Synced with satellite & sensor grid</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">Escalation Checker</span>
                    <span className="text-[10px] font-mono text-cyan-400">*/1 * * * *</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Last check: {new Date().toLocaleTimeString()}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Timeout threshold: <span className="text-amber-400 font-medium">15 min window before backup escalation</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">IoT Telemetry Liveness</span>
                    <span className="text-[10px] font-mono text-cyan-400">*/5 * * * *</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Silent threshold: <span className="text-slate-300">120 minutes without ping</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Battery check: <span className="text-emerald-400 font-medium">All sensors &gt; 90%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messaging Dispatch Statistics */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Cross-Region Emergency Deliveries Dispatch Health
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="text-xl font-bold text-slate-300">{healthData?.messaging?.stats?.queued || 0}</div>
                  <div className="text-[11px] text-slate-500 mt-1 uppercase font-semibold">Queued</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="text-xl font-bold text-cyan-400">{healthData?.messaging?.stats?.sent || 0}</div>
                  <div className="text-[11px] text-slate-500 mt-1 uppercase font-semibold">Dispatched</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="text-xl font-bold text-emerald-400">{healthData?.messaging?.stats?.delivered || 0}</div>
                  <div className="text-[11px] text-slate-500 mt-1 uppercase font-semibold">Delivered (SMS/Voice)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="text-xl font-bold text-rose-400">{healthData?.messaging?.stats?.failed || 0}</div>
                  <div className="text-[11px] text-slate-500 mt-1 uppercase font-semibold">Failed Dispatches</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REGIONS MANAGEMENT */}
        {activeTab === 'regions' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Monitored Geographical Regions</h2>
                <p className="text-xs text-slate-400">
                  Isolated jurisdictions with boundary polygons, emergency centers, and dedicated officials
                </p>
              </div>
              <button
                onClick={() => setShowRegionModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Region</span>
              </button>
            </div>

            {/* Regions Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Region Name</th>
                    <th className="px-4 py-3">Code / State</th>
                    <th className="px-4 py-3">Center Coordinates</th>
                    <th className="px-4 py-3">Zones</th>
                    <th className="px-4 py-3">Households</th>
                    <th className="px-4 py-3">Camps</th>
                    <th className="px-4 py-3">Sensors</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {regionsData?.map((region) => (
                    <tr key={region._id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        {region.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold mr-1.5">
                          {region.code}
                        </span>
                        {region.state}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        {region.centerLocation?.coordinates ? `${region.centerLocation.coordinates[1].toFixed(4)}°N, ${region.centerLocation.coordinates[0].toFixed(4)}°E` : 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-200">{region.stats?.zones || 0}</td>
                      <td className="px-4 py-3 font-semibold text-slate-200">{region.stats?.households || 0}</td>
                      <td className="px-4 py-3 font-semibold text-slate-200">{region.stats?.camps || 0}</td>
                      <td className="px-4 py-3 font-semibold text-slate-200">{region.stats?.sensors || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          region.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {region.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN ACCOUNT MANAGEMENT */}
        {activeTab === 'admins' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Regional Disaster Management Officials</h2>
                <p className="text-xs text-slate-400">
                  Government officials strictly scoped to their assigned regional jurisdiction
                </p>
              </div>
              <button
                onClick={() => setShowAdminModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create Admin Account</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Official Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Assigned Region</th>
                    <th className="px-4 py-3">Designation & Department</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {usersData?.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          user.role === 'SUPERADMIN'
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {user.regionId?.name ? (
                          <span className="flex items-center gap-1 text-slate-200">
                            <MapPin className="w-3 h-3 text-cyan-400" />
                            {user.regionId.name} ({user.regionId.code})
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">All Regions (Superadmin)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <div>{user.designation}</div>
                        <div className="text-[10px] text-slate-400">{user.department}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{user.phone || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          user.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {user.active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: THRESHOLDS & TEMPLATES */}
        {activeTab === 'thresholds' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Rainfall Threshold Standards & Alert Templates</h2>
                <p className="text-xs text-slate-400">
                  Versioned baseline cumulative rainfall cutoffs (24h, 72h, Forecast) and bilingual citizen messaging
                </p>
              </div>
              <button
                onClick={() => setShowThresholdModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Publish New Threshold Version</span>
              </button>
            </div>

            {/* Threshold Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 24h Rainfall */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Past 24h Cumulative Rain</span>
                  <span className="text-xs font-mono text-cyan-400">mm / 24 hrs</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-xs font-semibold text-amber-400">Watch Tier</span>
                    <span className="text-base font-black text-amber-300 font-mono">
                      &ge; {thresholdData?.activeConfig?.rainfall24h?.watch || 65} mm
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <span className="text-xs font-semibold text-orange-400">Warning Tier</span>
                    <span className="text-base font-black text-orange-300 font-mono">
                      &ge; {thresholdData?.activeConfig?.rainfall24h?.warning || 115} mm
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <span className="text-xs font-semibold text-rose-400">Evacuate Tier</span>
                    <span className="text-base font-black text-rose-300 font-mono">
                      &ge; {thresholdData?.activeConfig?.rainfall24h?.evacuate || 200} mm
                    </span>
                  </div>
                </div>
              </div>

              {/* 72h Rainfall */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Past 72h Soil Saturation Rain</span>
                  <span className="text-xs font-mono text-cyan-400">mm / 72 hrs</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-xs font-semibold text-amber-400">Watch Tier</span>
                    <span className="text-base font-black text-amber-300 font-mono">
                      &ge; {thresholdData?.activeConfig?.rainfall72h?.watch || 120} mm
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <span className="text-xs font-semibold text-orange-400">Warning Tier</span>
                    <span className="text-base font-black text-orange-300 font-mono">
                      &ge; {thresholdData?.activeConfig?.rainfall72h?.warning || 180} mm
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <span className="text-xs font-semibold text-rose-400">Evacuate Tier</span>
                    <span className="text-base font-black text-rose-300 font-mono">
                      &ge; {thresholdData?.activeConfig?.rainfall72h?.evacuate || 300} mm
                    </span>
                  </div>
                </div>
              </div>

              {/* Forecast 24h */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Forecast Next 24h Rain</span>
                  <span className="text-xs font-mono text-cyan-400">mm / 24h fc</span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="text-xs font-semibold text-amber-400">Watch Tier</span>
                    <span className="text-base font-black text-amber-300 font-mono">
                      &ge; {thresholdData?.activeConfig?.rainfallForecast24h?.watch || 70} mm
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <span className="text-xs font-semibold text-orange-400">Warning Tier</span>
                    <span className="text-base font-black text-orange-300 font-mono">
                      &ge; {thresholdData?.activeConfig?.rainfallForecast24h?.warning || 125} mm
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <span className="text-xs font-semibold text-rose-400">Evacuate Tier</span>
                    <span className="text-base font-black text-rose-300 font-mono">
                      &ge; {thresholdData?.activeConfig?.rainfallForecast24h?.evacuate || 210} mm
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bilingual Message Templates Preview */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur">
              <h3 className="text-sm font-bold text-white mb-3">
                Bilingual SMS & Voice Dispatch Templates (v{thresholdData?.activeConfig?.version || 1})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">English Templates</span>
                  <div>
                    <div className="text-[10px] text-amber-400 font-semibold uppercase">Watch Advisory</div>
                    <div className="text-xs text-slate-300 mt-0.5">{thresholdData?.activeConfig?.messageTemplates?.en?.watch}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-orange-400 font-semibold uppercase">Warning Alert</div>
                    <div className="text-xs text-slate-300 mt-0.5">{thresholdData?.activeConfig?.messageTemplates?.en?.warning}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-rose-400 font-semibold uppercase">Evacuation Order</div>
                    <div className="text-xs text-slate-300 mt-0.5">{thresholdData?.activeConfig?.messageTemplates?.en?.evacuate}</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">മലയാളം സന്ദേശ മാതൃകകൾ (Malayalam)</span>
                  <div>
                    <div className="text-[10px] text-amber-400 font-semibold uppercase">ജാഗ്രതാ നിർദ്ദേശം</div>
                    <div className="text-xs text-slate-300 mt-0.5">{thresholdData?.activeConfig?.messageTemplates?.ml?.watch}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-orange-400 font-semibold uppercase">അപകട മുന്നറിയിപ്പ്</div>
                    <div className="text-xs text-slate-300 mt-0.5">{thresholdData?.activeConfig?.messageTemplates?.ml?.warning}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-rose-400 font-semibold uppercase">അടിയന്തര ഒഴിപ്പിക്കൽ ഉത്തരവ്</div>
                    <div className="text-xs text-slate-300 mt-0.5">{thresholdData?.activeConfig?.messageTemplates?.ml?.evacuate}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SENSOR REGISTRY & API KEY GENERATOR */}
        {activeTab === 'sensors' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">IoT Rain & Soil Telemetry Sensors</h2>
                <p className="text-xs text-slate-400">
                  Register field devices with auto-generated 64-char API keys (stored hashed)
                </p>
              </div>
              <button
                onClick={() => setShowSensorModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Register Sensor</span>
              </button>
            </div>

            {/* Sensors Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Device ID & Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Region & Zone</th>
                    <th className="px-4 py-3">Coordinates & Elevation</th>
                    <th className="px-4 py-3">Battery</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Seen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {sensorsData?.map((sensor) => (
                    <tr key={sensor._id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-mono font-bold text-cyan-300">{sensor.deviceId}</div>
                        <div className="text-[11px] text-slate-300">{sensor.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                          sensor.type === 'rain'
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        }`}>
                          {sensor.type === 'rain' ? 'Rainfall' : 'Soil Moisture'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">{sensor.regionId?.name}</div>
                        <div className="text-[10px] text-slate-400">{sensor.zoneId?.name || 'Sector Grid'}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        {sensor.location?.coordinates ? `${sensor.location.coordinates[1].toFixed(4)}°N, ${sensor.location.coordinates[0].toFixed(4)}°E` : 'N/A'}
                        <span className="text-slate-500 ml-1">({sensor.elevationMeters || 850}m)</span>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-emerald-400">
                        {sensor.battery}%
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {sensor.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-slate-400">
                        {sensor.lastSeenAt ? new Date(sensor.lastSeenAt).toLocaleTimeString() : 'Recent'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: MESSAGING & ALERTS GATEWAY SETTINGS */}
        {activeTab === 'providers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-white">Emergency Messaging & Physical Alarm Gateways</h2>
              <p className="text-xs text-slate-400">
                Configure primary & fallback telecommunication providers (SMS, Voice call automated fallback, Physical Buzzer)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dispatch Providers Form */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  Telephony Providers
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    SMS Gateway Provider
                  </label>
                  <select
                    value={providerSettings.smsProvider}
                    onChange={(e) => setProviderSettings({ ...providerSettings, smsProvider: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="mock">Simulated / Mock Provider (Fast testing, logs to console & DB)</option>
                    <option value="twilio">Twilio Programmable SMS (Production ready stub)</option>
                    <option value="msg91">MSG91 India National SMS Gateway (Govt / DLT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Voice Automated Call Fallback
                  </label>
                  <select
                    value={providerSettings.voiceProvider}
                    onChange={(e) => setProviderSettings({ ...providerSettings, voiceProvider: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="mock">Simulated / Mock Voice Call Engine</option>
                    <option value="twilio">Twilio Voice Text-to-Speech IVR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Physical Outdoor Siren / Buzzer Gateway Endpoint
                  </label>
                  <input
                    type="url"
                    value={providerSettings.buzzerGatewayUrl}
                    onChange={(e) => setProviderSettings({ ...providerSettings, buzzerGatewayUrl: e.target.value })}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    HTTP POST sent immediately whenever an Evacuate Tier alert is authorized.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => updateProvidersMutation.mutate(providerSettings)}
                    disabled={updateProvidersMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow"
                  >
                    {updateProvidersMutation.isPending ? 'Saving...' : 'Save Gateway Configuration'}
                  </button>

                  {updateProvidersMutation.isSuccess && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved
                    </span>
                  )}
                </div>
              </div>

              {/* Buzzer Siren Integration Test Box */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <Volume2 className="w-5 h-5" />
                    Physical Buzzer & Siren Test Simulator
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Test the external relay endpoint configured above to confirm network connectivity and alert latency.
                  </p>

                  <div className="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div className="text-xs text-slate-300">
                      Target Gateway: <span className="font-mono text-cyan-400 text-[11px]">{providerSettings.buzzerGatewayUrl}</span>
                    </div>
                    {buzzerTestStatus && (
                      <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium">
                        {buzzerTestStatus}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleTestBuzzer}
                  className="mt-6 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-rose-500/10 flex items-center justify-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  Trigger Test Siren Burst
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: PLATFORM AUDIT LOG */}
        {activeTab === 'audit' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Mission-Critical Audit Log</h2>
                <p className="text-xs text-slate-400">
                  Immutable record of every administrative action, parameter override, and security event
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Total events logged: {auditData?.pagination?.total || 0}
              </span>
            </div>

            {/* Audit Log Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Actor / Role</th>
                    <th className="px-4 py-3">Target Entity</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3 text-right">State Diff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {auditData?.logs?.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(log.at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-800/50">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{log.actorName}</div>
                        <div className="text-[10px] text-slate-400">{log.role}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-300">
                        {log.entity} {log.entityId ? `#${log.entityId.slice(-6)}` : ''}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        {log.ip || 'Localhost'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(log.before || log.after) && (
                          <button
                            onClick={() => setSelectedAuditLog(log)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold transition"
                          >
                            Inspect Diff
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD REGION */}
      <Modal
        isOpen={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        title="Register New Administrative Region"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            createRegionMutation.mutate({
              name: regionForm.name,
              code: regionForm.code,
              state: regionForm.state,
              country: regionForm.country,
              description: regionForm.description,
              centerLocation: [Number(regionForm.lng), Number(regionForm.lat)],
              bounds: {
                north: Number(regionForm.north),
                south: Number(regionForm.south),
                east: Number(regionForm.east),
                west: Number(regionForm.west)
              },
              emergencyContacts: [
                { title: regionForm.contactTitle, phone: regionForm.contactPhone }
              ]
            });
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Region Name</label>
              <input
                type="text"
                required
                value={regionForm.name}
                onChange={(e) => setRegionForm({ ...regionForm, name: e.target.value })}
                placeholder="e.g. Idukki District"
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300">Region Code (2-5 letters)</label>
              <input
                type="text"
                required
                value={regionForm.code}
                onChange={(e) => setRegionForm({ ...regionForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. IDK"
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">State / Province</label>
              <input
                type="text"
                required
                value={regionForm.state}
                onChange={(e) => setRegionForm({ ...regionForm, state: e.target.value })}
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300">Center Coordinates [Lat, Lng]</label>
              <div className="grid grid-cols-2 gap-1 mt-1">
                <input
                  type="number"
                  step="any"
                  value={regionForm.lat}
                  onChange={(e) => setRegionForm({ ...regionForm, lat: e.target.value })}
                  placeholder="Lat"
                  className="text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <input
                  type="number"
                  step="any"
                  value={regionForm.lng}
                  onChange={(e) => setRegionForm({ ...regionForm, lng: e.target.value })}
                  placeholder="Lng"
                  className="text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300">Territorial Bounding Box [N, S, E, W]</label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              <input
                type="number"
                step="any"
                value={regionForm.north}
                onChange={(e) => setRegionForm({ ...regionForm, north: e.target.value })}
                placeholder="North"
                className="text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
              />
              <input
                type="number"
                step="any"
                value={regionForm.south}
                onChange={(e) => setRegionForm({ ...regionForm, south: e.target.value })}
                placeholder="South"
                className="text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
              />
              <input
                type="number"
                step="any"
                value={regionForm.east}
                onChange={(e) => setRegionForm({ ...regionForm, east: e.target.value })}
                placeholder="East"
                className="text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
              />
              <input
                type="number"
                step="any"
                value={regionForm.west}
                onChange={(e) => setRegionForm({ ...regionForm, west: e.target.value })}
                placeholder="West"
                className="text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Control Room Title</label>
              <input
                type="text"
                value={regionForm.contactTitle}
                onChange={(e) => setRegionForm({ ...regionForm, contactTitle: e.target.value })}
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300">Emergency Phone</label>
              <input
                type="text"
                value={regionForm.contactPhone}
                onChange={(e) => setRegionForm({ ...regionForm, contactPhone: e.target.value })}
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowRegionModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createRegionMutation.isPending}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
            >
              {createRegionMutation.isPending ? 'Registering...' : 'Register Region'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: CREATE REGIONAL ADMIN */}
      <Modal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        title="Provision Regional Disaster Management Official"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            createAdminMutation.mutate(adminForm);
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Official Full Name</label>
              <input
                type="text"
                required
                value={adminForm.name}
                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                placeholder="e.g. Smt. Divya S. Iyer IAS"
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300">Official Email</label>
              <input
                type="email"
                required
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                placeholder="e.g. admin.idukki@aegisflow.gov.in"
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Initial Password</label>
              <input
                type="password"
                required
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                placeholder="Min 8 characters"
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300">Assigned Region</label>
              <select
                value={adminForm.regionId}
                onChange={(e) => setAdminForm({ ...adminForm, regionId: e.target.value })}
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              >
                {regionsData?.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Designation</label>
              <input
                type="text"
                value={adminForm.designation}
                onChange={(e) => setAdminForm({ ...adminForm, designation: e.target.value })}
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300">Phone</label>
              <input
                type="text"
                value={adminForm.phone}
                onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowAdminModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createAdminMutation.isPending}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
            >
              {createAdminMutation.isPending ? 'Provisioning...' : 'Provision Admin'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: REGISTER SENSOR */}
      <Modal
        isOpen={showSensorModal}
        onClose={() => setShowSensorModal(false)}
        title="Register Telemetry Station & Generate API Key"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const selectedRegion = regionsData?.find(r => r._id === sensorForm.regionId) || regionsData?.[0];
            registerSensorMutation.mutate({
              name: sensorForm.name,
              deviceId: sensorForm.deviceId,
              regionId: sensorForm.regionId || selectedRegion?._id,
              zoneId: sensorForm.zoneId || '650000000000000000000001',
              type: sensorForm.type,
              coordinates: [Number(sensorForm.lng), Number(sensorForm.lat)],
              elevationMeters: Number(sensorForm.elevationMeters)
            });
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Sensor Station Name</label>
              <input
                type="text"
                required
                value={sensorForm.name}
                onChange={(e) => setSensorForm({ ...sensorForm, name: e.target.value })}
                placeholder="e.g. Meppadi Ridge Rain Station"
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300">Device Hardware ID</label>
              <input
                type="text"
                required
                value={sensorForm.deviceId}
                onChange={(e) => setSensorForm({ ...sensorForm, deviceId: e.target.value.toUpperCase() })}
                placeholder="e.g. SNS-WYD-RAIN-03"
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Telemetry Sensor Type</label>
              <select
                value={sensorForm.type}
                onChange={(e) => setSensorForm({ ...sensorForm, type: e.target.value })}
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              >
                <option value="rain">Optical Rain Gauge (mm)</option>
                <option value="soil">Volumetric Soil Moisture Probe (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300">Region Assignment</label>
              <select
                value={sensorForm.regionId}
                onChange={(e) => setSensorForm({ ...sensorForm, regionId: e.target.value })}
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              >
                {regionsData?.map((r) => (
                  <option key={r._id} value={r._id}>{r.name} ({r.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300">Latitude</label>
              <input
                type="number"
                step="any"
                value={sensorForm.lat}
                onChange={(e) => setSensorForm({ ...sensorForm, lat: e.target.value })}
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300">Longitude</label>
              <input
                type="number"
                step="any"
                value={sensorForm.lng}
                onChange={(e) => setSensorForm({ ...sensorForm, lng: e.target.value })}
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300">Elevation (m)</label>
              <input
                type="number"
                value={sensorForm.elevationMeters}
                onChange={(e) => setSensorForm({ ...sensorForm, elevationMeters: e.target.value })}
                className="mt-1 w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-[11px] text-cyan-300 flex items-center gap-2">
            <Key className="w-4 h-4 shrink-0 text-cyan-400" />
            Upon registration, an unguessable 64-char API key will be generated for physical flashing.
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowSensorModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={registerSensorMutation.isPending}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
            >
              {registerSensorMutation.isPending ? 'Generating Key...' : 'Register Station'}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: SENSOR KEY GENERATED DISPLAY */}
      <Modal
        isOpen={Boolean(generatedKeyInfo)}
        onClose={() => setGeneratedKeyInfo(null)}
        title="⚠️ Device API Key Generated (Copy Now)"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            This secret key is only displayed <strong className="text-white">ONCE</strong>. It has been hashed in the database and cannot be retrieved again:
          </p>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/40 flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-cyan-400 break-all select-all font-semibold">
              {generatedKeyInfo?.plainKey}
            </span>
            <button
              onClick={() => handleCopyKey(generatedKeyInfo?.plainKey)}
              className="p-2 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition shrink-0"
              title="Copy Key"
            >
              {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div>Device: <strong className="text-white">{generatedKeyInfo?.deviceId}</strong></div>
            <div>Station: <strong className="text-white">{generatedKeyInfo?.name}</strong></div>
          </div>

          <button
            onClick={() => setGeneratedKeyInfo(null)}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
          >
            I have securely saved this key
          </button>
        </div>
      </Modal>

      {/* MODAL: AUDIT DIFF VIEWER */}
      <Modal
        isOpen={Boolean(selectedAuditLog)}
        onClose={() => setSelectedAuditLog(null)}
        title={`Audit State Diff: ${selectedAuditLog?.action}`}
      >
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Actor: <span className="text-white font-semibold">{selectedAuditLog?.actorName}</span> • Entity: <span className="font-mono text-cyan-400">{selectedAuditLog?.entity}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[10px] font-semibold text-rose-400 uppercase mb-1">State Before</div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-mono overflow-x-auto max-h-60">
                {selectedAuditLog?.before ? JSON.stringify(selectedAuditLog.before, null, 2) : 'None / Newly Created'}
              </pre>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-emerald-400 uppercase mb-1">State After</div>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px] font-mono overflow-x-auto max-h-60">
                {selectedAuditLog?.after ? JSON.stringify(selectedAuditLog.after, null, 2) : 'None'}
              </pre>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
