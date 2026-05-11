
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, 
  Activity, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  X,
  Maximize2,
  Minimize2,
  Heart,
  Thermometer,
  Droplets,
  Sun
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { CameraView } from './CameraView';

interface HealthLog {
  time: string;
  score: number;
  confidence: number;
}

export const LiveHealthMonitor: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [healthScore, setHealthScore] = useState(85);
  const [confidence, setConfidence] = useState(94);
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [insights, setInsights] = useState<string[]>([
    "Neural link established with Node_042",
    "Calibrating photonic sensors...",
    "Ready for real-time analysis"
  ]);

  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addInsight = useCallback((msg: string) => {
    setInsights(prev => [msg, ...prev.slice(0, 4)]);
  }, []);

  const startMonitoring = () => {
    setIsActive(true);
    setIsScanning(true);
    addInsight("Initiating continuous health monitoring...");
    
    analysisIntervalRef.current = setInterval(() => {
      const newScore = Math.max(0, Math.min(100, healthScore + (Math.random() - 0.5) * 5));
      const newConf = Math.max(90, Math.min(99, confidence + (Math.random() - 0.5) * 2));
      
      setHealthScore(newScore);
      setConfidence(newConf);
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setLogs(prev => [...prev.slice(-19), { time: timeStr, score: Math.round(newScore), confidence: Math.round(newConf) }]);

      if (Math.random() > 0.8) {
        const triggers = [
          "Photosynthetic efficiency stable",
          "Leaf turgor pressure optimal",
          "Stomatal conductance normal",
          "Chlorophyll fluorescence detected",
          "Transpiration rate within bounds"
        ];
        addInsight(triggers[Math.floor(Math.random() * triggers.length)]);
      }
    }, 3000);
  };

  const stopMonitoring = () => {
    setIsActive(false);
    setIsScanning(false);
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    addInsight("Monitoring suspended. System on standby.");
  };

  useEffect(() => {
    return () => {
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    };
  }, []);

   return (
    <div className={`space-y-6 md:space-y-8 animate-in fade-in duration-1000 ${isFullscreen ? 'fixed inset-0 z-[100] bg-ink p-4 sm:p-10 overflow-y-auto' : ''}`}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 sm:gap-6">
        <div>
          <div className="inline-flex items-center gap-3 px-3 sm:px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] border border-primary/20 mb-3 sm:mb-4">
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isActive ? 'bg-danger animate-pulse' : 'bg-stone-400'}`} />
            {isActive ? 'Live Neural Feed • Active' : 'Neural Feed • Standby'}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-foreground tracking-tighter uppercase font-display leading-[0.9] sm:leading-none">
            HEALTH <span className="text-primary italic font-serif lowercase font-normal">monitor</span>
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[8px] sm:text-[10px] mt-2 sm:mt-3">Continuous AI-driven diagnostic engine</p>
        </div>
        
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-3 sm:p-4 bg-white border border-stone-200 rounded-xl sm:rounded-2xl text-stone-400 hover:text-primary transition-all shadow-sm"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button 
            onClick={isActive ? stopMonitoring : startMonitoring}
            className={`flex-1 sm:flex-none px-4 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-lg ${
              isActive ? 'bg-danger text-white hover:bg-danger/90' : 'bg-primary text-white hover:bg-primary/90'
            }`}
          >
            {isActive ? <X size={16} /> : <Activity size={16} />}
            {isActive ? 'Stop Monitoring' : 'Start Feed'}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Live Feed View */}
        <div className="xl:col-span-8 space-y-6 md:space-y-8">
          <div className="relative rounded-3xl sm:rounded-[3rem] overflow-hidden shadow-2xl border-4 sm:border-[12px] border-white bg-ink aspect-video group">
            {isActive ? (
              <CameraView isActive={true} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 sm:p-10">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/5 rounded-full flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-700">
                  <Camera size={32} className="text-white/20 sm:w-[40px] sm:h-[40px]" />
                </div>
                <p className="text-white/40 font-black text-xs sm:text-sm uppercase tracking-[0.3em]">Camera Feed Offline</p>
                <p className="text-white/20 text-[8px] sm:text-[10px] font-medium uppercase tracking-widest mt-2 px-4">Activate neural link to begin monitoring</p>
              </div>
            )}
 
            {/* HUD Overlays */}
            {isActive && (
              <div className="absolute inset-0 pointer-events-none p-4 sm:p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="bg-black/40 backdrop-blur-xl px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/10 flex items-center gap-2 sm:gap-3">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-danger animate-pulse shadow-[0_0_10px_rgba(231,111,81,0.8)]" />
                    <span className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-[0.3em]">REC • 4K • AI_V3</span>
                  </div>
                  <div className="bg-black/40 backdrop-blur-xl px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/10">
                    <span className="text-[8px] sm:text-[10px] font-black text-white uppercase tracking-[0.3em]">CONF: {confidence.toFixed(0)}%</span>
                  </div>
                </div>
 
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  <HUDMetric label="HEALTH" value={`${healthScore.toFixed(0)}%`} color={healthScore > 75 ? 'text-success' : 'text-warning'} />
                  <HUDMetric label="LUX" value="12,400" />
                  <HUDMetric label="VPD" value="0.85" />
                  <HUDMetric label="CO2" value="415" />
                </div>
              </div>
            )}

            {/* Scanning Line */}
            {isScanning && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="w-full h-1 bg-primary/60 shadow-[0_0_30px_rgba(45,90,39,0.8)] absolute animate-[scan_4s_linear_infinite]" />
              </div>
            )}
          </div>

          {/* Real-time Health Chart */}
          <div className="glass-card p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] border border-white shadow-sm">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight uppercase font-display">Neural Health Trend</h3>
                <p className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Real-time telemetry analysis</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10">
                <TrendingUp size={14} className="text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live Stream</span>
              </div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={logs}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D4F3C" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2D4F3C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#2D4F3C" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar: Diagnostics & Insights */}
        <div className="xl:col-span-4 space-y-8">
          {/* Diagnostic Panel */}
          <div className="bg-ink p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] shadow-2xl text-white border border-white/5 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/20 text-primary rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-primary/10">
                  <Zap size={18} className="sm:w-5 sm:h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight uppercase font-display">AI Diagnostics</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Heart size={16} className="text-danger" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Vitality</span>
                  </div>
                  <span className="text-lg font-black">{healthScore.toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={16} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Stability</span>
                  </div>
                  <span className="text-lg font-black">{confidence.toFixed(0)}%</span>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Neural Insights</h4>
                <div className="space-y-3">
                  {insights.map((insight, i) => (
                    <div key={i} className="flex gap-3 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p className="text-[11px] font-medium text-white/60 leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Sensors */}
          <div className="glass-card p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] border border-white shadow-sm space-y-6 sm:space-y-8">
            <h3 className="text-lg sm:text-xl font-black text-foreground tracking-tight uppercase font-display">Environment</h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <SensorRow icon={<Thermometer size={16} />} label="Temperature" value="24.2°C" status="Optimal" />
              <SensorRow icon={<Droplets size={16} />} label="Humidity" value="62%" status="Optimal" />
              <SensorRow icon={<Sun size={16} />} label="Light Intensity" value="12.4k LUX" status="High" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

 const HUDMetric: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = "text-white" }) => (
  <div className="bg-black/40 backdrop-blur-xl p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
    <span className="text-[7px] sm:text-[8px] font-black text-white/40 uppercase tracking-widest mb-0.5 sm:mb-1">{label}</span>
    <span className={`text-xs sm:text-sm font-black tracking-tighter ${color}`}>{value}</span>
  </div>
);

const SensorRow: React.FC<{ icon: React.ReactNode; label: string; value: string; status: string }> = ({ icon, label, value, status }) => (
  <div className="flex items-center justify-between p-3 sm:p-4 bg-stone-50 rounded-xl sm:rounded-2xl border border-stone-100">
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="text-stone-400">{icon}</div>
      <div>
        <p className="text-[8px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xs sm:text-sm font-black text-ink leading-none">{value}</p>
      </div>
    </div>
    <span className="text-[7px] sm:text-[8px] font-black text-primary uppercase tracking-widest px-1.5 py-0.5 sm:px-2 sm:py-1 bg-primary/10 rounded-md border border-primary/10">{status}</span>
  </div>
);
