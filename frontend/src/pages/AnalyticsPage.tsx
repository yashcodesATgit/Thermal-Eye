import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ChatAssistant } from '../components/ChatAssistant';
import api from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Layers,
  MapPin,
  Bot,
  Filter,
  Calendar,
  Cpu,
  Activity
} from 'lucide-react';

interface SummaryData {
  totalObservations: number;
  classificationDistribution: Record<string, number>;
  severityDistribution: Record<string, number>;
  industrialFirePercentage: number;
  highCriticalAlerts: number;
  persistentEvents: number;
  highFrpEvents: number;
  anomalousEvents: number;
  modelVersion: string;
  benchmarkDisclosure: string;
}

interface RegionalItem {
  state: string;
  totalObservations: number;
  industrialObservations: number;
  gasFlares: number;
  wildfires: number;
  persistentEvents: number;
}

interface TemporalItem {
  date: string;
  industrial_fire: number;
  gas_flare: number;
  wildfire: number;
  agricultural: number;
  unknown: number;
  total: number;
}

export default function AnalyticsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [regionalData, setRegionalData] = useState<RegionalItem[]>([]);
  const [temporalData, setTemporalData] = useState<TemporalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [days, setDays] = useState<number>(7);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedState, selectedClassification, selectedSeverity, days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, any> = { days };
      if (selectedState !== 'all') params.state = selectedState;
      if (selectedClassification !== 'all') params.classification = selectedClassification;
      if (selectedSeverity !== 'all') params.severity = selectedSeverity;

      const [sumRes, regRes, tempRes] = await Promise.all([
        api.get('/api/v1/analytics/summary', { params }),
        api.get('/api/v1/analytics/regional'),
        api.get('/api/v1/analytics/temporal', { params })
      ]);

      setSummary(sumRes.data);
      setRegionalData(regRes.data.states || []);
      setTemporalData(tempRes.data.series || []);
    } catch (err: any) {
      setError('Failed to fetch analytics from backend database.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOnMap = (stateFilter?: string, classFilter?: string) => {
    let url = '/?';
    if (stateFilter && stateFilter !== 'all') url += `state=${encodeURIComponent(stateFilter)}&`;
    if (classFilter && classFilter !== 'all') url += `classification=${encodeURIComponent(classFilter)}`;
    navigate(url);
  };

  const handleAskAI = () => {
    const promptText = `Analyze ThermalTrace activity: Total ${summary?.totalObservations || 0} observations, ${summary?.industrialFirePercentage || 0}% predicted industrial fires, ${summary?.persistentEvents || 0} persistent events across India. Why is this period significant?`;
    window.dispatchEvent(new CustomEvent('ask-ai-hotspot', { detail: { hotspotId: promptText } }));
  };

  const classDist = summary?.classificationDistribution || {};
  const totalObs = summary?.totalObservations || 0;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080C14] text-[#E8EDF5]">
      <Navbar />

      <main className="flex-1 w-full p-6 overflow-y-auto max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E2D45] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#2D7DD2]/10 border border-[#2D7DD2]/30 rounded-lg text-[#2D7DD2]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#E8EDF5]">
                Thermal Anomaly Analytics
              </h1>
            </div>
            <p className="text-xs text-[#7A8FA8] mt-1">
              Quantitative intelligence and time-series trend analysis generated dynamically from PostGIS satellite observations.
            </p>
          </div>

          <button
            onClick={handleAskAI}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors w-fit"
          >
            <Bot className="w-4 h-4 text-amber-400" />
            <span>Ask AI About This Analysis</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#111827] border border-[#1E2D45] p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between shadow-xl">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-[#7A8FA8]">
              <Calendar className="w-4 h-4 text-[#2D7DD2]" />
              <span>Time Window:</span>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-[#080C14] border border-[#1E2D45] rounded-lg px-3 py-1.5 text-xs text-[#E8EDF5] focus:outline-none"
              >
                <option value={7}>Past 7 Days</option>
                <option value={14}>Past 14 Days</option>
                <option value={30}>Past 30 Days</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-[#7A8FA8]">
              <Filter className="w-3.5 h-3.5" />
              <span>State:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-[#080C14] border border-[#1E2D45] rounded-lg px-3 py-1.5 text-xs text-[#E8EDF5] focus:outline-none"
              >
                <option value="all">All States</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Odisha">Odisha</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-[#7A8FA8]">
              <span>Classification:</span>
              <select
                value={selectedClassification}
                onChange={(e) => setSelectedClassification(e.target.value)}
                className="bg-[#080C14] border border-[#1E2D45] rounded-lg px-3 py-1.5 text-xs text-[#E8EDF5] focus:outline-none"
              >
                <option value="all">All Classes</option>
                <option value="industrial_fire">Industrial Fire</option>
                <option value="gas_flare">Gas Flare</option>
                <option value="wildfire">Wildfire</option>
                <option value="agricultural">Agricultural</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-[#7A8FA8]">
              <span>Severity:</span>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-[#080C14] border border-[#1E2D45] rounded-lg px-3 py-1.5 text-xs text-[#E8EDF5] focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => handleViewOnMap(selectedState, selectedClassification)}
            className="px-3 py-1.5 bg-[#2D7DD2]/20 hover:bg-[#2D7DD2]/30 text-[#2D7DD2] border border-[#2D7DD2]/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Apply to Map</span>
          </button>
        </div>

        {/* Top Analytics Metrics */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#7A8FA8] flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#2D7DD2] border-t-transparent rounded-full animate-spin"></div>
            <span>Calculating thermal telemetry metrics from PostgreSQL backend...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-400 bg-red-950/20">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-[#111827] border border-[#1E2D45] p-4 rounded-xl shadow-lg">
                <span className="text-[10px] font-bold text-[#7A8FA8] uppercase tracking-wider block">Total Observations</span>
                <span className="text-2xl font-extrabold text-[#E8EDF5] mt-1 block">{summary?.totalObservations}</span>
              </div>
              <div className="bg-[#111827] border border-[#1E2D45] p-4 rounded-xl shadow-lg">
                <span className="text-[10px] font-bold text-[#7A8FA8] uppercase tracking-wider block">Industrial Ratio</span>
                <span className="text-2xl font-extrabold text-[#2D7DD2] mt-1 block">{summary?.industrialFirePercentage}%</span>
              </div>
              <div className="bg-[#111827] border border-[#1E2D45] p-4 rounded-xl shadow-lg">
                <span className="text-[10px] font-bold text-[#7A8FA8] uppercase tracking-wider block">High/Critical Alerts</span>
                <span className="text-2xl font-extrabold text-red-400 mt-1 block">{summary?.highCriticalAlerts}</span>
              </div>
              <div className="bg-[#111827] border border-[#1E2D45] p-4 rounded-xl shadow-lg">
                <span className="text-[10px] font-bold text-[#7A8FA8] uppercase tracking-wider block">Persistent Events</span>
                <span className="text-2xl font-extrabold text-amber-400 mt-1 block">{summary?.persistentEvents}</span>
              </div>
              <div className="bg-[#111827] border border-[#1E2D45] p-4 rounded-xl shadow-lg">
                <span className="text-[10px] font-bold text-[#7A8FA8] uppercase tracking-wider block">Anomalous Signals</span>
                <span className="text-2xl font-extrabold text-orange-400 mt-1 block">{summary?.anomalousEvents}</span>
              </div>
            </div>

            {/* Classification Distribution Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#111827] border border-[#1E2D45] p-5 rounded-xl md:col-span-2 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#1E2D45] pb-3">
                  <h3 className="font-bold text-sm text-[#E8EDF5] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#2D7DD2]" />
                    <span>ML Classification Breakdown</span>
                  </h3>
                  <span className="text-[10px] font-mono text-[#7A8FA8]">xgboost-v1-1m-v2</span>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'industrial_fire', label: 'Industrial Fire', color: 'bg-red-500' },
                    { key: 'gas_flare', label: 'Gas Flare', color: 'bg-amber-400' },
                    { key: 'wildfire', label: 'Wildfire', color: 'bg-orange-500' },
                    { key: 'agricultural', label: 'Agricultural', color: 'bg-emerald-400' },
                    { key: 'unknown', label: 'Unknown / Abstention', color: 'bg-[#7A8FA8]' },
                  ].map((c) => {
                    const count = classDist[c.key] || 0;
                    const pct = totalObs > 0 ? ((count / totalObs) * 100).toFixed(1) : '0';
                    return (
                      <div key={c.key} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-[#E8EDF5]">{c.label}</span>
                          <span className="font-mono text-[#7A8FA8]">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#080C14] rounded-full overflow-hidden border border-[#1E2D45]">
                          <div className={`h-full ${c.color}`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Model Disclosure Box */}
              <div className="bg-[#111827] border border-[#1E2D45] p-5 rounded-xl space-y-3 shadow-xl">
                <div className="flex items-center gap-2 border-b border-[#1E2D45] pb-3">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-[#E8EDF5]">ML Scientific Disclosure</h3>
                </div>

                <div className="space-y-2 text-xs text-[#7A8FA8]">
                  <div className="bg-[#080C14] p-3 rounded-lg border border-[#1E2D45]">
                    <span className="text-[10px] uppercase font-bold text-[#7A8FA8] block">Benchmark Metric</span>
                    <span className="text-sm font-bold text-emerald-400 mt-0.5 block">93.70% Accuracy</span>
                    <span className="text-[11px] text-[#7A8FA8] mt-1 block">Synthetic Engineering Benchmark (`thermalwatch-ml-1m-v2`)</span>
                  </div>

                  <div className="bg-amber-950/20 border border-amber-500/20 p-3 rounded-lg text-amber-200/90 text-[11px] leading-relaxed">
                    <strong className="text-amber-300 block mb-0.5">Important Notice:</strong>
                    The 93.70% benchmark was evaluated on synthetic rule-generated data. Real-world ground-truth validation is NOT established. ThermalTrace ML provides probabilistic model predictions.
                  </div>
                </div>
              </div>
            </div>

            {/* Temporal Series Breakdown Section */}
            {temporalData.length > 0 && (
              <div className="bg-[#111827] border border-[#1E2D45] p-5 rounded-xl space-y-3 shadow-xl">
                <h3 className="font-bold text-sm text-[#E8EDF5] flex items-center gap-2 border-b border-[#1E2D45] pb-3">
                  <Activity className="w-4 h-4 text-[#2D7DD2]" />
                  <span>Daily Time-Series Trend Breakdown</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#162033] text-[#7A8FA8] uppercase font-bold text-[10px]">
                      <tr>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Industrial Fire</th>
                        <th className="px-3 py-2">Gas Flare</th>
                        <th className="px-3 py-2">Wildfire</th>
                        <th className="px-3 py-2">Agricultural</th>
                        <th className="px-3 py-2">Unknown</th>
                        <th className="px-3 py-2 text-right">Daily Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2D45]/60 text-[#E8EDF5]">
                      {temporalData.map((row, i) => (
                        <tr key={i} className="hover:bg-[#162033]/40">
                          <td className="px-3 py-2 font-mono text-[#2D7DD2]">{row.date}</td>
                          <td className="px-3 py-2 font-mono text-red-400 font-bold">{row.industrial_fire}</td>
                          <td className="px-3 py-2 font-mono text-amber-400">{row.gas_flare}</td>
                          <td className="px-3 py-2 font-mono text-orange-400">{row.wildfire}</td>
                          <td className="px-3 py-2 font-mono text-emerald-400">{row.agricultural}</td>
                          <td className="px-3 py-2 font-mono text-[#7A8FA8]">{row.unknown}</td>
                          <td className="px-3 py-2 font-mono text-right font-bold">{row.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="bg-[#111827] border border-[#1E2D45] rounded-xl overflow-hidden shadow-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E2D45] pb-3">
                <h3 className="font-bold text-sm text-[#E8EDF5] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#2D7DD2]" />
                  <span>Regional Activity Ranking Across India</span>
                </h3>
                <span className="text-xs text-[#7A8FA8]">{regionalData.length} States Monitored</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#162033] text-[#7A8FA8] uppercase font-bold tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">State / Region</th>
                      <th className="px-4 py-3">Total Observations</th>
                      <th className="px-4 py-3">Industrial Predictions</th>
                      <th className="px-4 py-3">Gas Flares</th>
                      <th className="px-4 py-3">Persistent Events</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2D45]/60 text-[#E8EDF5]">
                    {regionalData.map((row, i) => (
                      <tr key={i} className="hover:bg-[#162033]/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-[#E8EDF5]">{row.state}</td>
                        <td className="px-4 py-3 font-mono">{row.totalObservations}</td>
                        <td className="px-4 py-3 font-mono text-red-400 font-bold">{row.industrialObservations}</td>
                        <td className="px-4 py-3 font-mono text-amber-400">{row.gasFlares}</td>
                        <td className="px-4 py-3 font-mono text-orange-400">{row.persistentEvents}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleViewOnMap(row.state)}
                            className="px-2.5 py-1 bg-[#2D7DD2]/20 hover:bg-[#2D7DD2]/30 text-[#2D7DD2] rounded text-[11px] font-medium transition-colors"
                          >
                            View on Map
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <ChatAssistant />
    </div>
  );
}
