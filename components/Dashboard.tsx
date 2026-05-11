import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import { Plant, DashboardStats } from '../types';
import { PlantCard } from './PlantCard';
import { PlantDetailModal } from './PlantDetailModal';
import { 
  Activity, 
  Leaf, 
  AlertTriangle, 
  CheckCircle2, 
  Droplets, 
  Sun, 
  Thermometer,
  TrendingUp,
  BarChart3,
  Calendar,
  X,
  Sprout,
  Info,
  ShieldCheck,
  Zap
} from 'lucide-react';

const DAILY_DATA = [
  { name: '00:00', health: 85, moisture: 60, temp: 18, growth: 10 },
  { name: '04:00', health: 84, moisture: 58, temp: 17, growth: 10 },
  { name: '08:00', health: 86, moisture: 65, temp: 20, growth: 12 },
  { name: '12:00', health: 88, moisture: 62, temp: 24, growth: 15 },
  { name: '16:00', health: 87, moisture: 55, temp: 25, growth: 18 },
  { name: '20:00', health: 85, moisture: 60, temp: 21, growth: 20 },
  { name: '23:59', health: 85, moisture: 62, temp: 19, growth: 22 },
];

const WEEKLY_DATA = [
  { name: 'Mon', health: 85, moisture: 65, temp: 22, growth: 10 },
  { name: 'Tue', health: 88, moisture: 60, temp: 24, growth: 15 },
  { name: 'Wed', health: 82, moisture: 45, temp: 25, growth: 25 },
  { name: 'Thu', health: 78, moisture: 40, temp: 23, growth: 35 },
  { name: 'Fri', health: 85, moisture: 70, temp: 21, growth: 50 },
  { name: 'Sat', health: 90, moisture: 75, temp: 20, growth: 65 },
  { name: 'Sun', health: 92, moisture: 80, temp: 22, growth: 80 },
];

const MONTHLY_DATA = [
  { name: 'Week 1', health: 80, moisture: 55, temp: 20, growth: 20 },
  { name: 'Week 2', health: 85, moisture: 60, temp: 22, growth: 40 },
  { name: 'Week 3', health: 82, moisture: 50, temp: 24, growth: 60 },
  { name: 'Week 4', health: 90, moisture: 70, temp: 21, growth: 85 },
];

const GROWTH_DATA = [
  { month: 'Jan', growth: 12 },
  { month: 'Feb', growth: 18 },
  { month: 'Mar', growth: 25 },
  { month: 'Apr', growth: 30 },
  { month: 'May', growth: 45 },
  { month: 'Jun', growth: 40 },
];

interface DashboardProps {
  plants: Plant[];
  stats: DashboardStats;
}

type Timeframe = 'daily' | 'weekly' | 'monthly';

export const Dashboard: React.FC<DashboardProps> = ({ plants, stats }) => {
  const [timeframe, setTimeframe] = React.useState<Timeframe>('weekly');
  const [chartType, setChartType] = React.useState<'area' | 'line'>('area');
  const [selectedPlant, setSelectedPlant] = React.useState<Plant | null>(null);

  const dynamicData = React.useMemo(() => {
    const baseData = timeframe === 'daily' ? DAILY_DATA : timeframe === 'monthly' ? MONTHLY_DATA : WEEKLY_DATA;
    
    // Adjust data based on current plants to make it "dynamic"
    return baseData.map((d, i) => {
      const plantFactor = plants.length > 0 ? (plants.reduce((acc, p) => acc + p.healthScore, 0) / plants.length) / 85 : 1;
      return {
        ...d,
        health: Math.min(100, Math.round(d.health * plantFactor)),
        moisture: Math.min(100, Math.round(d.moisture * (1 + (Math.sin(i) * 0.1)))),
        growth: Math.min(100, Math.round(d.growth * (plants.length / 4 || 1)))
      };
    });
  }, [timeframe, plants]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-stone-200 shadow-2xl animate-in fade-in zoom-in duration-300 min-w-[180px]">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-3 border-b border-stone-100 pb-2">{label}</p>
          <div className="space-y-3">
            {payload.map((entry: any, index: number) => {
              const isGrowth = entry.dataKey === 'growth';
              let stageLabel = '';
              if (isGrowth) {
                const val = entry.value;
                if (val < 20) stageLabel = 'Sapling';
                else if (val < 45) stageLabel = 'Vegetative';
                else if (val < 75) stageLabel = 'Flowering';
                else stageLabel = 'Mature';
              }

              return (
                <div key={index} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                      <span className="text-[10px] font-black text-stone-600 uppercase tracking-wider">{entry.name}</span>
                    </div>
                    <span className="text-sm font-black text-ink">{entry.value}%</span>
                  </div>
                  {isGrowth && (
                    <div className="flex items-center gap-1.5 ml-4">
                      <div className="w-1 h-1 rounded-full bg-primary/30" />
                      <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                        Status: {stageLabel}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 md:space-y-12 animate-in fade-in duration-1000 pb-20">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground tracking-tighter font-display uppercase leading-none">System <span className="text-primary italic">Analytics</span></h1>
          <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[8px] sm:text-[10px] mt-2 sm:mt-3">Historical Performance & Aggregate Data</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex bg-stone-100/80 backdrop-blur-md p-1 rounded-2xl border border-stone-200 shadow-inner">
            {(['area', 'line'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  chartType === type 
                    ? 'bg-white text-primary shadow-sm scale-105' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex bg-stone-100/80 backdrop-blur-md p-1 rounded-2xl border border-stone-200 shadow-inner">
            {(['daily', 'weekly', 'monthly'] as Timeframe[]).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  timeframe === t 
                    ? 'bg-white text-primary shadow-sm scale-105' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          label="Total Specimens" 
          value={stats.totalPlants} 
          icon={<Leaf size={22} />} 
          trend="+2 this month"
          color="success"
          insight="Expanding Botanical Library"
        />
        <StatCard 
          label="Active Nodes" 
          value={stats.monitoredPlants} 
          icon={<Activity size={22} />} 
          trend="100% coverage"
          color="accent"
          insight="All Sensors Operational"
        />
        <StatCard 
          label="Avg. Health" 
          value={`${stats.averageHealthScore}%`} 
          icon={<CheckCircle2 size={22} />} 
          trend="Stable"
          color="success"
          insight="Optimal Metabolic Rate"
        />
        <StatCard 
          label="Critical Alerts" 
          value={stats.activeAlerts} 
          icon={<AlertTriangle size={22} />} 
          trend="Requires attention"
          isAlert={stats.activeAlerts > 0}
          color="danger"
          insight={stats.activeAlerts > 0 ? "Immediate Action Required" : "No Critical Threats"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white/50 backdrop-blur-xl p-4 sm:p-6 lg:p-10 rounded-3xl lg:rounded-[3.5rem] shadow-sm border border-white/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-10">
            <div>
              <h3 className="text-lg lg:text-2xl font-black text-foreground tracking-tight font-display uppercase">Health & Moisture</h3>
              <p className="text-muted-foreground text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-1 sm:mt-2">Weekly aggregate performance</p>
            </div>
            <div className="flex gap-2 sm:gap-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(45,79,60,0.5)]" />
                <span className="text-[8px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Health</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent shadow-[0_0_8px_rgba(200,125,95,0.5)]" />
                <span className="text-[8px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Moisture</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] lg:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={dynamicData}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2D4F3C" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#2D4F3C" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C87D5F" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#C87D5F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(92, 116, 100, 0.1)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 800, fill: '#5C7464' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 800, fill: '#5C7464' }}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="health" 
                    name="Health Index"
                    stroke="#2D4F3C" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorHealth)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#2D4F3C' }}
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="moisture" 
                    name="Moisture Level"
                    stroke="#C87D5F" 
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMoisture)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#C87D5F' }}
                    animationDuration={1500}
                  />
                </AreaChart>
              ) : (
                <LineChart data={dynamicData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(92, 116, 100, 0.1)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 800, fill: '#5C7464' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 800, fill: '#5C7464' }}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="health" 
                    name="Health Index"
                    stroke="#2D4F3C" 
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#2D4F3C', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#2D4F3C' }}
                    animationDuration={1500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="moisture" 
                    name="Moisture Level"
                    stroke="#C87D5F" 
                    strokeWidth={4}
                    dot={{ r: 4, fill: '#C87D5F', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#C87D5F' }}
                    animationDuration={1500}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Analytics */}
        <div className="bg-white/50 backdrop-blur-xl p-4 sm:p-6 lg:p-10 rounded-3xl lg:rounded-[3.5rem] shadow-sm border border-white/40 flex flex-col">
          <div className="flex items-center gap-3 mb-4 sm:mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <BarChart3 size={18} />
            </div>
            <h3 className="text-lg lg:text-xl font-black text-foreground tracking-tight font-display uppercase">Growth Index</h3>
          </div>
          <div className="flex-1 min-h-[200px] lg:min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GROWTH_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(92, 116, 100, 0.1)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 800, fill: '#5C7464' }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(92, 116, 100, 0.05)', radius: 10 }}
                  content={<CustomTooltip />}
                />
                <Bar dataKey="growth" name="Growth Index" fill="#5C7464" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 lg:mt-8 p-6 lg:p-8 bg-primary/5 rounded-[2rem] border border-primary/10">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="text-primary" size={16} />
              <span className="text-[9px] lg:text-[10px] font-black text-primary uppercase tracking-[0.2em]">AI Insight</span>
            </div>
            <p className="text-[11px] lg:text-xs font-bold text-primary/80 leading-relaxed">
              Biomass increased by 15% this quarter. Optimal light conditions in the greenhouse are driving accelerated growth.
            </p>
          </div>
        </div>
      </div>

      {/* Growth Stage Progression Chart */}
      <div className="bg-white/50 backdrop-blur-xl p-4 sm:p-6 lg:p-10 rounded-3xl lg:rounded-[3.5rem] shadow-sm border border-white/40">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-10">
          <div>
            <h3 className="text-lg lg:text-2xl font-black text-foreground tracking-tight font-display uppercase">Growth Stage Progression</h3>
            <p className="text-muted-foreground text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-1 sm:mt-2">Average growth stage index over the last 7 days</p>
          </div>
          <div className="flex gap-4 lg:gap-6">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(92,116,100,0.5)]" />
              <span className="text-[8px] lg:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Growth Stage Index</span>
            </div>
          </div>
        </div>
        <div className="h-[250px] lg:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dynamicData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(92, 116, 100, 0.1)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 800, fill: '#5C7464' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 800, fill: '#5C7464' }}
                domain={[0, 100]}
              />
              <Tooltip 
                content={<CustomTooltip />}
              />
              <Line 
                type="monotone" 
                dataKey="growth" 
                name="Growth Stage"
                stroke="#5C7464" 
                strokeWidth={4} 
                dot={{ r: 5, fill: '#5C7464', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0, fill: '#5C7464' }}
                animationDuration={2000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 sm:mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6">
          {[
            { label: 'Sapling', range: '0-20', color: 'bg-primary/5 text-primary border-primary/10' },
            { label: 'Vegetative', range: '21-45', color: 'bg-accent/10 text-accent border-accent/20' },
            { label: 'Flowering', range: '46-75', color: 'bg-warning/10 text-warning border-warning/20' },
            { label: 'Mature', range: '76-100', color: 'bg-danger/10 text-danger border-danger/20' }
          ].map(stage => (
            <div key={stage.label} className={`p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border ${stage.color} flex flex-col items-center justify-center transition-transform hover:scale-105 duration-300`}>
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-1 sm:mb-2">{stage.label}</span>
              <span className="text-[10px] sm:text-sm font-black opacity-80">{stage.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Specimen Health Distribution */}
      <div className="bg-ink p-6 md:p-12 rounded-[2.5rem] lg:rounded-[4.5rem] shadow-2xl text-white border border-white/5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 lg:mb-12">
          <div>
            <h3 className="text-xl sm:text-3xl font-black tracking-tight font-display uppercase leading-none">Specimen <span className="text-accent italic">Health</span></h3>
            <p className="text-white/40 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mt-2 sm:mt-3">Real-time status of all monitored nodes</p>
          </div>
          <div className="flex gap-3">
            <span className="px-4 lg:px-5 py-2 bg-white/5 rounded-full text-[8px] lg:text-[10px] font-black uppercase tracking-widest border border-white/10">Active: {plants.length}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-8">
          {plants.map(p => (
            <PlantCard 
              key={p.id} 
              plant={p} 
              onClick={() => setSelectedPlant(p)} 
            />
          ))}
        </div>
      </div>

      {/* Growth Timeline & Optimization Engine (Moved from Live Monitor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8 glass-card p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3.5rem] shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg lg:text-xl font-black text-foreground tracking-tight uppercase font-display">Growth Timeline</h3>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">Developmental Lifecycle Tracking</p>
            </div>
            <TrendingUp className="text-primary" size={20} />
          </div>
          
          <div className="h-48 lg:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={GROWTH_DATA.map(d => ({ name: d.month, biomass: d.growth }))}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '10px 16px' }}
                  labelStyle={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '9px', marginBottom: '2px', color: '#15803d' }}
                />
                <Area type="monotone" dataKey="biomass" stroke="#15803d" strokeWidth={4} fillOpacity={1} fill="url(#colorGrowth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 glass-card p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3.5rem] shadow-sm border border-white flex flex-col justify-center text-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
            <Activity size={24} />
          </div>
          <h3 className="text-lg font-black text-foreground tracking-tight uppercase font-display">Optimization Engine</h3>
          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
            AI models are currently optimizing all nodes for maximum biomass production. Current efficiency: <span className="text-primary font-black">98.4%</span>
          </p>
          <div className="pt-4">
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[98.4%] animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Plant Detail Modal */}
      {selectedPlant && (
        <PlantDetailModal 
          plant={selectedPlant} 
          onClose={() => setSelectedPlant(null)} 
        />
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; trend: string; isAlert?: boolean; color: string; insight?: string }> = ({ label, value, icon, trend, isAlert, color, insight }) => {
  const colorMap: Record<string, string> = {
    success: 'bg-success/10 text-success border-success/20 shadow-success/10',
    accent: 'bg-accent/10 text-accent border-accent/20 shadow-accent/10',
    danger: 'bg-danger/10 text-danger border-danger/20 shadow-danger/10',
    warning: 'bg-warning/10 text-warning border-warning/20 shadow-warning/10'
  };

  return (
    <div className={`bg-white/40 backdrop-blur-xl p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-border/50 shadow-sm hover:shadow-xl transition-all duration-700 group hover:-translate-y-2 ${isAlert ? 'ring-2 ring-danger/20 ring-offset-4 ring-offset-transparent' : ''}`}>
      <div className="flex justify-between items-start mb-4 sm:mb-6">
        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-lg ${colorMap[color] || 'bg-primary/10 text-primary'}`}>
          {React.cloneElement(icon as React.ReactElement, { size: 18 })}
        </div>
        <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border shadow-sm ${colorMap[color] || 'text-muted-foreground'}`}>
          {trend}
        </span>
      </div>
      <h4 className="text-muted-foreground text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] mb-1 sm:mb-2 ml-1">{label}</h4>
      <p className={`text-2xl sm:text-4xl font-black tracking-tighter font-display ${isAlert ? 'text-danger' : 'text-foreground'}`}>{value}</p>
      
      {insight && (
        <div className="mt-4 pt-4 border-t border-border/10">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={10} className="text-primary" />
            {insight}
          </p>
        </div>
      )}
    </div>
  );
};
