import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Activity, 
  Droplets, 
  Thermometer, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Play, 
  Square, 
  RefreshCw, 
  Zap,
  Bell,
  Clock,
  TrendingUp,
  ShieldCheck,
  Search,
  X,
  Info,
  Leaf,
  Wind,
  Sun,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Upload
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

import { PlantDetailModal } from './PlantDetailModal';
import { Plant, PlantCategory } from '../types';

interface IoTDataPoint {
  time: string;
  health: number;
  moisture: number;
  temperature: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'critical';
  message: string;
  timestamp: string;
}

const MONITOR_PLANTS = [
  {
    name: "Calathea Orbifolia",
    scientific: "orbifolia",
    origin: "Bolivia",
    difficulty: "Expert",
    height: "1m Max",
    growth: "Moderate",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80",
    description: "Striking oversized silver-green leaves with distinctive patterns. Requires high humidity and consistent moisture.",
    insight: "Humidity levels critically low. Neural sensors detect leaf edge desiccation. Initiating localized misting sequence."
  },
  {
    name: "Bird of Paradise",
    scientific: "reginae",
    origin: "S. Africa",
    difficulty: "Intermediate",
    height: "2m Max",
    growth: "Slow",
    image: "https://images.unsplash.com/photo-1612360424253-9fe8825fe3b4?auto=format&fit=crop&w=800&q=80",
    description: "Stunning architectural plant with large, banana-like leaves and spectacular orange and blue flowers.",
    insight: "Phototropic response detected. Specimen is orienting towards primary light source. Photosynthesis efficiency at 92%."
  },
  {
    name: "Rubber Plant",
    scientific: "elastica",
    origin: "S.E. Asia",
    difficulty: "Easy",
    height: "3m Max",
    growth: "Fast",
    image: "https://images.unsplash.com/photo-1598592232741-f7435991a20e?auto=format&fit=crop&w=800&q=80",
    description: "Robust indoor tree with glossy, dark burgundy leaves. Excellent for adding height to interior spaces.",
    insight: "Sap pressure is optimal. New leaf bud formation detected at terminal node. Growth rate accelerating."
  },
  {
    name: "ZZ Plant",
    scientific: "zamiifolia",
    origin: "E. Africa",
    difficulty: "Easy",
    height: "1m Max",
    growth: "Very Slow",
    image: "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=800&q=80",
    description: "The ultimate low-maintenance plant. Glossy, waxy leaves that can survive in very low light conditions.",
    insight: "Rhizome water storage is at 95% capacity. Metabolic activity is minimal but extremely stable. No hydration needed for 14 days."
  }
];

export const IoTDashboard: React.FC = () => {
  // IoT State
  const [activePlant, setActivePlant] = useState(MONITOR_PLANTS[0]);
  const [health, setHealth] = useState(85);
  const [moisture, setMoisture] = useState(65);
  const [temperature, setTemperature] = useState(30);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [logs, setLogs] = useState<IoTDataPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [hudMetrics, setHudMetrics] = useState({
    lux: "12,400",
    co2: "415ppm",
    vpd: "0.85kPa",
    ph: "6.4"
  });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const faisalabadTempRef = useRef(temperature);

  // Fetch Faisalabad Temperature
  useEffect(() => {
    const fetchTemp = async () => {
      try {
        const res = await fetch('https://wttr.in/Faisalabad?format=%t');
        const text = await res.text();
        const temp = parseFloat(text.replace('°C', '').replace('+', ''));
        if (!isNaN(temp)) {
          faisalabadTempRef.current = temp;
          setTemperature(temp);
        }
      } catch (e) {
        console.warn("Faisalabad weather fetch failed:", e);
      }
    };
    fetchTemp();
    const interval = setInterval(fetchTemp, 600000); // Update every 10 mins
    return () => clearInterval(interval);
  }, []);

  // Global Event Listeners for Command Center Control
  useEffect(() => {
    // Buttons removed from UI
    return () => {};
  }, []);

  // Simulation Logic
  const updateSensors = useCallback(() => {
    if (!isMonitoring) return;

    setMoisture(prev => {
      const change = (Math.random() - 0.5) * 4;
      const next = Math.max(0, Math.min(100, prev + change));
      return next;
    });

    setTemperature(prev => {
      // Stay close to Faisalabad baseline with minor fluctuations
      const baseline = faisalabadTempRef.current;
      const noise = (Math.random() - 0.5) * 0.5;
      const next = baseline + (prev - baseline) * 0.9 + noise;
      return Math.round(next * 10) / 10;
    });

    // Health Score Logic: Low moisture or high temp decreases health
    setHealth(prev => {
      let healthChange = (Math.random() - 0.5) * 2;
      if (moisture < 30) healthChange -= 2;
      if (temperature > 32) healthChange -= 1.5;
      if (moisture > 40 && moisture < 70 && temperature < 28) healthChange += 1;
      
      return Math.max(0, Math.min(100, prev + healthChange));
    });

    // Add to logs
    const newPoint: IoTDataPoint = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      health: Math.round(health),
      moisture: Math.round(moisture),
      temperature: Math.round(temperature * 10) / 10
    };

    setLogs(prev => [...prev.slice(-19), newPoint]);

    // Alert Generation
    const newAlerts: Alert[] = [];
    if (moisture < 25) {
      newAlerts.push({ id: 'moisture-low', type: 'critical', message: 'Critical: Soil moisture below 25%', timestamp: new Date().toLocaleTimeString() });
    } else if (moisture < 40) {
      newAlerts.push({ id: 'moisture-warning', type: 'warning', message: 'Warning: Soil moisture dropping', timestamp: new Date().toLocaleTimeString() });
    }

    if (temperature > 35) {
      newAlerts.push({ id: 'temp-high', type: 'critical', message: 'Critical: Extreme heat detected (>35°C)', timestamp: new Date().toLocaleTimeString() });
    }

    if (health < 50) {
      newAlerts.push({ id: 'health-critical', type: 'critical', message: 'Critical: Plant health in danger zone', timestamp: new Date().toLocaleTimeString() });
    }

    // Merge alerts (avoid duplicates)
    setAlerts(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const uniqueNew = newAlerts.filter(a => !existingIds.has(a.id));
      return [...prev, ...uniqueNew];
    });
  }, [isMonitoring, moisture, temperature, health]);

  useEffect(() => {
    if (isMonitoring) {
      timerRef.current = setInterval(updateSensors, 3000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isMonitoring, updateSensors]);

  const stopLiveCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsLiveCameraActive(false);
    setUploadedImage(null); // Clear uploaded image when live is active or stopped
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  }, []);

  const startLiveCamera = async () => {
    setCameraError(null);
    setUploadedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsLiveCameraActive(true);
        
        // Start continuous analysis
        analysisIntervalRef.current = setInterval(() => {
          // Simulate AI analysis of the frame
          const newHealth = Math.round(65 + Math.random() * 35);
          setHealth(prev => (prev * 0.8 + newHealth * 0.2)); // Smooth transition
          
          // Occasionally update scan result with "Live" data
          if (Math.random() > 0.7) {
            const randomPlant = MONITOR_PLANTS[Math.floor(Math.random() * MONITOR_PLANTS.length)];
            setActivePlant(randomPlant);
            setScanResult({
              plantName: randomPlant.name,
              healthScore: Math.round(newHealth),
              issues: newHealth < 75 ? ["Detected leaf stress", "Light intensity fluctuation"] : ["Optimal health detected"],
              suggestions: ["Maintain current light levels", "Check soil moisture in 24h"],
              isLive: true,
              fingerprint: [
                { subject: 'Photosynthesis', A: 70 + Math.random() * 30, fullMark: 100 },
                { subject: 'Hydration', A: 60 + Math.random() * 40, fullMark: 100 },
                { subject: 'Nutrients', A: 75 + Math.random() * 25, fullMark: 100 },
                { subject: 'Stability', A: 80 + Math.random() * 20, fullMark: 100 },
                { subject: 'Resilience', A: 70 + Math.random() * 30, fullMark: 100 },
              ]
            });
          }
        }, 5000);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied or not available. Please check permissions.");
    }
  };

  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, [stopLiveCamera]);

  const analyzeImageWithAI = async (base64Image: string, mimeType: string, imageUrl: string) => {
    setIsScanning(true);
    setScanError(null);
    setAiAnalysis("Synchronizing with botanical neural cloud...");

    try {
      const getApiKey = () => {
        if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
        if (typeof process !== 'undefined' && process.env.API_KEY) return process.env.API_KEY;
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
          // @ts-ignore
          return import.meta.env.VITE_GEMINI_API_KEY;
        }
        return '';
      };

      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error("NEURAL LINK OFFLINE: API Key Missing. To use AI features in production, you must set the GEMINI_API_KEY or VITE_GEMINI_API_KEY environment variable. Falling back to simulated diagnostics.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-1.5-flash";
      
      const prompt = `Analyze this botanical specimen image for high-precision horticulture monitoring.
      
      CRITICAL INSTRUCTIONS:
      1. IDENTIFICATION: Identify the plant with 100% accuracy. If it is Conocarpus erectus (Buttonwood), Silver Buttonwood, or a specific cultivar/variety, you MUST state the exact common name and scientific name. Look for leaf texture, venation, and stipule characteristics.
      2. HEALTH ASSESSMENT: Evaluate health based on color (chlorosis, necrosis), leaf turgor, and structural integrity.
      3. METRIC DERIVATION: Estimate current environment based on visual cues (leaf orientation for LUX, growth vigor for CO2/VPD).
      
      Return a JSON object exactly matching this schema:
      {
        "plantName": "Exact Common Name",
        "scientificName": "Exact Genus species",
        "health": 0-100,
        "moisture": 10-90,
        "temperature": 18-35,
        "issues": ["Concise technical issue 1", "Concise technical issue 2"],
        "suggestions": ["Expert horticultural action 1", "Expert horticultural action 2"],
        "neuralInsight": "A deep professional botanical analysis (2-3 sentences) focused on the specimen's specific current state and phenotype.",
        "difficulty": "Easy/Intermediate/Expert",
        "origin": "Native Region",
        "growth": "Slow/Moderate/Fast",
        "height": "Typical max size (e.g. 10m)",
        "description": "Botanical summary of the species.",
        "radarData": {
          "Photosynthesis": 0-100,
          "Hydration": 0-100,
          "Nutrients": 0-100,
          "Stability": 0-100,
          "Resilience": 0-100
        },
        "environmentalMetrics": {
          "lux": 1000-20000,
          "co2": 350-600,
          "vpd": 0.5-2.5,
          "ph": 4.5-8.5
        }
      }`;

      const result = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64Image,
                  mimeType: mimeType
                }
              },
              {
                text: prompt
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(result.text || "{}");
      
      // Update state with AI response
      const identifiedPlant = {
        name: data.plantName || "Unknown Specimen",
        scientific: data.scientificName || "Species unknown",
        origin: data.origin || "Global",
        difficulty: data.difficulty || "Moderate",
        height: data.height || "Variable",
        growth: data.growth || "Moderate",
        image: imageUrl,
        description: data.description || `AI Analysis Result: ${data.neuralInsight}`,
        insight: data.neuralInsight
      };

      setActivePlant(identifiedPlant);
      setHealth(data.health || 85);
      setMoisture(data.moisture || 65);
      setTemperature(data.temperature || 24);
      setAiAnalysis(data.neuralInsight);
      setLogs([]); // Reset telemetry for the new identified plant

      if (data.environmentalMetrics) {
        setHudMetrics({
          lux: data.environmentalMetrics.lux?.toLocaleString() || "12,400",
          co2: `${data.environmentalMetrics.co2}ppm` || "415ppm",
          vpd: `${data.environmentalMetrics.vpd}kPa` || "0.85kPa",
          ph: data.environmentalMetrics.ph?.toFixed(1) || "6.4"
        });
      }

      setScanResult({
        plantName: data.plantName,
        healthScore: data.health,
        issues: data.issues?.length > 0 ? data.issues : ["Optimal metrics detected"],
        suggestions: data.suggestions?.length > 0 ? data.suggestions : ["Maintain current protocol"],
        fingerprint: Object.entries(data.radarData || {}).map(([subject, value]) => ({
          subject,
          A: value as number,
          fullMark: 100
        }))
      });

    } catch (err) {
      console.error("AI Analysis error details:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setScanError(`Neural analysis failed: ${errorMessage.substring(0, 100)}...`);
      
      // Fallback with a smarter guess if possible, or just the simulation
      const randomPlant = MONITOR_PLANTS[Math.floor(Math.random() * MONITOR_PLANTS.length)];
      setActivePlant({ ...randomPlant, image: imageUrl });
    } finally {
      setIsScanning(false);
    }
  };

  const handleScan = () => {
    if (isScanning) return;
    
    // If we have an image, re-run analysis. Otherwise, trigger upload.
    if (uploadedImage) {
      const base64Data = uploadedImage.split(',')[1];
      const mimeType = uploadedImage.split(';')[0].split(':')[1];
      analyzeImageWithAI(base64Data, mimeType, uploadedImage);
    } else if (isLiveCameraActive) {
      // For live, we could take a snapshot and analyze it
      setAiAnalysis("Capturing frame for deep neural inspection...");
      // Simulation of a manual snapshot scan
      setTimeout(() => {
        setAiAnalysis("Live frame analysis synchronized with node cluster.");
      }, 1500);
    } else {
      triggerFileUpload();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name, file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setUploadedImage(base64);
        setIsLiveCameraActive(false);
        const base64Data = base64.split(',')[1];
        
        // Ensure analysis is triggered
        analyzeImageWithAI(base64Data, file.type, base64);
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        setScanError("Failed to read the image file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
    // Reset target value to allow uploading the same file again
    event.target.value = '';
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      console.log("Triggering file upload...");
      fileInputRef.current.click();
    }
  };

  const resetSystem = () => {
    setHealth(85);
    setMoisture(65);
    setTemperature(24);
    setLogs([]);
    setAlerts([]);
    setScanResult(null);
  };

  const resolveAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const getStatus = () => {
    if (health < 50 || moisture < 25 || temperature > 35) return { label: 'Critical', color: 'text-danger', bg: 'bg-danger/10' };
    if (health < 75 || moisture < 40 || temperature > 30) return { label: 'Warning', color: 'text-warning', bg: 'bg-warning/10' };
    return { label: 'Healthy', color: 'text-success', bg: 'bg-success/10' };
  };

  const status = getStatus();

  return (
    <div className="relative min-h-screen bg-[#F5F5F3] selection:bg-primary selection:text-white pb-20">
      {/* Structural Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#141414 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 animate-in fade-in duration-700 max-w-full mx-auto px-4 md:px-8 py-4 sm:py-6 md:py-10">
        {/* Header: Enterprise Authority */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-6 md:mb-12 border-b border-ink/5 pb-6 sm:pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-paper shrink-0">
                <Activity size={18} />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-ink tracking-tight uppercase font-display">
                Botanical <span className="text-primary italic font-serif lowercase font-normal">Command Center</span>
              </h1>
            </div>
            <p className="text-ink/40 font-mono text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-bold">
              System_Integrity: {activePlant.scientific}_v4.2 • Faisalabad, PK • Monitoring_{MONITOR_PLANTS.length}_Nodes
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Control buttons and avatars removed as requested */}
          </div>
        </div>

        {/* Global Alert Banner (if needed) */}
        {alerts.length > 0 && (
          <div className="mb-8 p-4 bg-danger/5 border border-danger/20 rounded-xl flex items-center justify-between animate-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-danger/20 text-danger rounded-lg flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-danger uppercase tracking-tight">Active Anomalies Detected</p>
                <p className="text-[10px] text-danger/60 font-mono">{alerts[0].message}</p>
              </div>
            </div>
            <button onClick={() => resolveAlert(alerts[0].id)} className="text-[10px] font-bold text-danger uppercase hover:underline">Acknowledge</button>
          </div>
        )}

        {/* Dynamic Stats Grid: Professional Data Presentation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <StatCard 
            label="Vitality Index" 
            value={`${Math.round(health)}%`} 
            icon={<Activity size={24} />} 
            status={health < 50 ? 'Critical' : health < 75 ? 'Warning' : 'Healthy'}
            isStatus={true}
            data={logs.map(l => l.health)}
            insight={health > 80 ? "Cellular Equilibrium" : "Metabolic Divergence Detected"}
            details="PHOTOSYNTHETIC QUOTIENT: Evaluated via leaf surface pigmentation and stomata response. Current variance suggests optimal chlorophyll absorption. Ideal range for semi-tropical specimens: 70-95%."
          />
          <StatCard 
            label="Hydro State" 
            value={`${Math.round(moisture)}%`} 
            icon={<Droplets size={24} />} 
            status={moisture < 25 ? 'Critical' : moisture < 40 ? 'Warning' : 'Healthy'}
            data={logs.map(l => l.moisture)}
            insight={moisture < 40 ? "Active Desiccation Task" : "Hydration Synchronized"}
            details="SOIL WATER POTENTIAL: Measured at the root-zone node. Faisalabad's semi-arid soil requires precise substrate moisture monitoring. Calathea requires >60%RH, while ZZ stores water in rhizomes."
          />
          <StatCard 
            label="Thermal Map" 
            value={`${temperature.toFixed(1)}°C`} 
            icon={<Thermometer size={24} />} 
            status={temperature > 35 ? 'Critical' : temperature > 30 ? 'Warning' : 'Healthy'}
            data={logs.map(l => l.temperature)}
            insight={temperature > 30 ? "VPD Buffer Active" : "Thermal Stability State"}
            details="THERMAL BUFFER: Region-locked to Faisalabad, Punjab. High ambient heat increases Vapor Pressure Deficit (VPD). If >32°C, stomatal closure initiates to prevent catastrophic transpiration loss."
          />
          <StatCard 
            label="Sensor Mesh" 
            value={status.label} 
            icon={<ShieldCheck size={24} />} 
            status={status.label as any}
            isStatus={true}
            insight="Sector Mesh Operational"
            details="NETWORK TOPOLOGY: Multi-node botanical relay active. SNR: 42dBm. Current packet loss: <0.01%. Neural telemetry is encrypted and synchronized with the local Faisalabad sector-hub."
          />
        </div>

        {/* Main Infrastructure Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Primary Analytical Core */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-ink/5 bg-ink group">
              <div className="aspect-[16/10] sm:aspect-video relative">
                {isLiveCameraActive ? (
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : uploadedImage ? (
                  <img 
                    src={uploadedImage} 
                    alt="Analyzed Specimen" 
                    className="w-full h-full object-cover animate-in fade-in duration-700"
                  />
                ) : (
                  <img 
                    src={activePlant.image} 
                    alt="Active Node Feed" 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-1000 scale-105 group-hover:scale-100 grayscale hover:grayscale-0"
                    referrerPolicy="no-referrer"
                  />
                )}
                
                {/* Enterprise HUD Overlay */}
                <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-between pointer-events-none">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="bg-ink/80 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border border-white/10 flex items-center gap-2 sm:gap-3">
                      <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isLiveCameraActive ? 'bg-danger animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-white/20'}`} />
                      <div className="flex flex-col">
                        <span className="text-[8px] sm:text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                          Feed_Status: {isLiveCameraActive ? 'Active' : 'Standby'}
                        </span>
                        <span className="text-[7px] sm:text-[8px] font-mono text-white/40 uppercase tracking-widest mt-0.5">Reference: Node_042</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pointer-events-auto">
                      <button 
                        onClick={isLiveCameraActive ? stopLiveCamera : startLiveCamera}
                        className={`px-5 py-2.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 group shadow-lg ${isLiveCameraActive ? 'bg-[#ff4d4d] text-white hover:bg-[#ff3333]' : 'bg-[#0e1b0a] text-white hover:bg-[#1a3314]'}`}
                      >
                        {isLiveCameraActive ? <Square size={12} /> : <Play size={12} />}
                        {isLiveCameraActive ? 'Stop_Live_Feed' : 'Start_Live_Feed'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4 w-full">
                    <HUDMetric label="LUX" value={isLiveCameraActive ? (12000 + Math.random() * 1000).toFixed(0) : hudMetrics.lux} trend="+2%" />
                    <HUDMetric label="CO2" value={hudMetrics.co2} />
                    <HUDMetric label="VPD" value={hudMetrics.vpd} />
                    <HUDMetric label="PH" value={hudMetrics.ph} />
                  </div>
                </div>
                
                {/* Scan Overlay Line */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className={`w-full h-[1px] bg-primary/30 absolute ${isLiveCameraActive ? 'animate-[scan_3s_linear_infinite]' : 'hidden'}`} />
                </div>

                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md p-10 text-center">
                    <div className="space-y-4 max-w-sm">
                      <AlertCircle size={40} className="text-danger mx-auto" />
                      <p className="text-white font-mono text-xs uppercase tracking-widest font-bold">{cameraError}</p>
                      <button 
                        onClick={startLiveCamera}
                        className="px-6 py-2 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-transform hover:scale-105"
                      >
                        Retry Protocol
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Neural Diagnostics Hub */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Neural Processor */}
              <div className="bg-paper p-6 md:p-8 rounded-2xl border border-ink/5 shadow-sm group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-paper border border-ink/10 rounded-lg flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                      <Zap size={16} />
                    </div>
                    <h3 className="text-xs font-black text-ink uppercase tracking-wider">Neural_Diagnostics</h3>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary">Active</span>
                  </div>
                </div>

                <div className="p-4 bg-ink/[0.02] rounded-xl border border-ink/5 mb-4 group-hover:bg-white transition-colors">
                  <p className="text-xs md:text-sm font-medium text-ink/60 leading-relaxed italic font-serif">
                    {aiAnalysis ? `"${aiAnalysis}"` : `"Neural connection stable. Specimen metrics synchronized with global botanical cloud."`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono font-bold uppercase tracking-widest">
                  <div className="p-3 bg-paper rounded-lg border border-ink/5">
                    <p className="text-ink/20 mb-1">Confidence</p>
                    <p className="text-ink">94.2%</p>
                  </div>
                  <div className="p-3 bg-paper rounded-lg border border-ink/5">
                    <p className="text-ink/20 mb-1">Latency</p>
                    <p className="text-ink">12ms</p>
                  </div>
                </div>
              </div>

              {/* Optical Analysis Hub */}
              <div className="bg-paper p-6 md:p-8 rounded-2xl border border-ink/5 shadow-sm group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-paper border border-ink/10 rounded-lg flex items-center justify-center text-ink shadow-sm group-hover:scale-110 transition-transform">
                      <Search size={16} />
                    </div>
                    <h3 className="text-xs font-black text-ink uppercase tracking-wider">Vision_Capture</h3>
                  </div>
                </div>

                <div className="aspect-video bg-ink rounded-xl relative overflow-hidden mb-4 group/camera">
                  {isScanning ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm z-20">
                      <RefreshCw className="text-primary animate-spin" size={24} />
                      <div className="absolute inset-0 animate-[scan_2s_linear_infinite] bg-gradient-to-b from-transparent via-primary/20 to-transparent h-10 w-full" />
                    </div>
                  ) : scanResult ? (
                    <div className="absolute inset-0 bg-paper p-4 flex flex-col justify-center animate-in zoom-in duration-300">
                      <h4 className="text-sm font-black text-ink uppercase tracking-tight mb-2 truncate">{scanResult.plantName}</h4>
                      <div className="space-y-1.5 mb-4">
                        {scanResult.issues.slice(0, 2).map((issue: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-ink/60">
                            <span className="w-1 h-1 rounded-full bg-warning" /> {issue}
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => { setScanResult(null); setUploadedImage(null); triggerFileUpload(); }}
                        className="w-full py-2 bg-ink text-paper text-[9px] font-mono font-bold uppercase tracking-widest rounded-lg hover:bg-primary transition-colors"
                      >
                        Recalibrate_Scan
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={triggerFileUpload}
                      className="absolute inset-0 flex flex-col items-center justify-center hover:bg-white/[0.05] transition-colors"
                    >
                      <Camera size={24} className="text-white/20 mb-2" />
                      <span className="text-[10px] font-mono font-bold text-white/20 uppercase tracking-widest">Init_Cloud_Scan</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleScan}
                    disabled={isScanning}
                    className="flex-1 bg-primary text-paper py-3 rounded-lg font-bold text-[10px] tracking-widest uppercase hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {isScanning ? 'Processing...' : 'Run_Analysis'}
                  </button>
                  <button 
                    onClick={triggerFileUpload}
                    className="p-3 bg-[#acbcac] border border-ink/10 text-ink rounded-lg hover:bg-ink/5 transition-all"
                  >
                    <Upload size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Infrastructure Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:space-y-8">
            {/* Identity Control */}
            <div 
              onClick={() => setShowDetails(true)}
              className="bg-paper p-6 md:p-8 rounded-2xl border border-ink/5 shadow-sm group cursor-pointer hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-ink/5 pb-4">
                <Leaf size={16} className="text-primary" />
                <h3 className="text-xs font-black text-ink uppercase tracking-wider">Asset_Profile</h3>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-lg overflow-hidden grayscale group-hover:grayscale-0 transition-all border border-ink/5">
                  <img 
                    src={uploadedImage || activePlant.image} 
                    alt={activePlant.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-base font-black text-ink uppercase tracking-tight leading-tight mb-1 truncate max-w-[150px]">
                    {activePlant.name}
                  </h4>
                  <p className="text-[10px] font-bold text-primary italic font-serif">
                    {activePlant.scientific}
                  </p>
                  <p className="text-[8px] font-mono text-ink/30 uppercase mt-2 font-bold tracking-widest">Ref: Node_Registered</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <ProfileStat label="Region" value={activePlant.origin} />
                <ProfileStat label="Tier" value={activePlant.difficulty} />
                <ProfileStat label="Height" value={activePlant.height} />
                <ProfileStat label="Vigour" value={activePlant.growth} />
              </div>
            </div>

            {/* Protocol Terminal */}
            <div className="bg-ink p-6 md:p-8 rounded-2xl shadow-xl text-paper border border-white/5 flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-danger" />
                  <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest">Protocol_Log</h3>
                </div>
                <div className="px-2 py-0.5 bg-danger/10 text-danger rounded text-[8px] font-mono font-bold">
                  {alerts.length} ANOMALIES
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 font-mono text-[9px] lowercase">
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map(alert => (
                      <div key={alert.id} className="text-danger/80 border-l border-danger pl-3 py-1 bg-danger/5 animate-in slide-in-from-right-2">
                        <p className="font-bold uppercase tracking-tighter">[{alert.timestamp}] alert_critical</p>
                        <p className="opacity-60">{alert.message}</p>
                        <button onClick={() => resolveAlert(alert.id)} className="mt-1 text-[8px] underline border-none bg-transparent p-0 hover:text-danger">resolve_task</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white/20 py-4 text-center italic">-- no active anomalies --</div>
                )}

                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-2 text-white/20 text-[8px] font-bold uppercase tracking-widest mb-3">
                    <Activity size={10} /> Data_Stream
                  </div>
                  {logs.slice().reverse().map((log, i) => (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5 opacity-50 hover:opacity-100 transition-opacity">
                      <div className="flex flex-col">
                        <span className="text-white font-bold">Node_R{i}</span>
                        <span className="text-[8px] text-white/30">H:{log.health}% / M:{log.moisture}%</span>
                      </div>
                      <span className="text-white/20 whitespace-nowrap">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plant Detail Modal */}
        {showDetails && (
          <PlantDetailModal 
            plant={{
              id: 'monitor-' + activePlant.scientific,
              name: activePlant.name,
              scientificName: activePlant.scientific,
              price: 0,
              category: PlantCategory.INDOOR,
              imageUrl: activePlant.image,
              description: activePlant.description,
              size: activePlant.height,
              growthStage: activePlant.growth as any,
              sunlight: 'Bright Indirect',
              watering: 'Moderate',
              soil: 'Well-draining',
              maintenanceLevel: activePlant.difficulty as any,
              healthScore: Math.round(health),
              status: status.label as any,
              aiInsight: activePlant.insight
            }} 
            onClose={() => setShowDetails(false)} 
          />
        )}

        <style>{`
          @keyframes scan {
            0%, 100% { top: 0; }
            50% { top: 100%; }
          }
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileUpload} 
        />
      </div>
    </div>
  );
};

const GROWTH_DATA = [
  { week: 'W1', biomass: 10, stage: 'Seedling' },
  { week: 'W2', biomass: 25, stage: 'Seedling' },
  { week: 'W3', biomass: 45, stage: 'Vegetative' },
  { week: 'W4', biomass: 70, stage: 'Vegetative' },
  { week: 'W5', biomass: 85, stage: 'Budding' },
  { week: 'W6', biomass: 92, stage: 'Budding' },
];

const HUDMetric: React.FC<{ label: string; value: string; trend?: string }> = ({ label, value, trend }) => {
  const isPositive = trend?.includes('+');
  const isNegative = trend?.includes('-');

  return (
    <div className="bg-ink/90 backdrop-blur-3xl p-3 sm:p-5 lg:p-6 rounded-xl sm:rounded-[1.5rem] border border-white/10 text-left group hover:bg-black transition-all duration-700 relative overflow-hidden flex flex-col justify-between h-full shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      <div>
        <p className="text-[8px] sm:text-[10px] font-mono font-bold text-white/30 uppercase tracking-[0.25em] mb-1 sm:mb-2">{label}</p>
        <p className="text-sm sm:text-lg lg:text-xl font-mono font-black text-white tracking-widest">{value}</p>
      </div>

      {trend && (
        <div className={`mt-3 flex items-center gap-1 ${isPositive ? 'text-primary' : isNegative ? 'text-danger' : 'text-white/20'}`}>
          <div className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 ${isPositive ? 'bg-primary/10 border border-primary/20' : isNegative ? 'bg-danger/10 border border-danger/20' : 'bg-white/5 border border-white/10'}`}>
            {isPositive && <ArrowUpRight size={10} />}
            {isNegative && <ArrowDownRight size={10} />}
            {trend}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ 
  label: string; 
  value: string; 
  icon: React.ReactNode; 
  status: 'Healthy' | 'Warning' | 'Critical'; 
  isStatus?: boolean;
  data?: number[];
  insight?: string;
  details?: string;
}> = ({ label, value, icon, status, isStatus, data, insight, details }) => {
  const [isDetailed, setIsDetailed] = useState(false);
  const statusConfig = {
    Healthy: { text: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10', dot: 'bg-primary' },
    Warning: { text: 'text-warning', bg: 'bg-warning/5', border: 'border-warning/10', dot: 'bg-warning' },
    Critical: { text: 'text-danger', bg: 'bg-danger/5', border: 'border-danger/10', dot: 'bg-danger' }
  };

  const config = statusConfig[status];

  return (
    <div 
      onMouseEnter={() => setIsDetailed(true)}
      onMouseLeave={() => setIsDetailed(false)}
      className={`bg-paper p-5 sm:p-6 rounded-2xl border border-ink/5 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col min-h-[220px] ${status === 'Critical' ? 'ring-1 ring-danger/20' : ''}`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-ink/[0.01] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
      
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-xl bg-white border border-ink/5 ${config.text} transition-transform group-hover:scale-110`}>
          {React.cloneElement(icon as React.ReactElement, { size: 20 })}
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider ${config.text} ${config.bg} ${config.border}`}>
          <span className={`w-1 h-1 rounded-full ${config.dot} ${status === 'Critical' ? 'animate-pulse' : ''}`} />
          {status}
        </div>
      </div>

      <div className={`transition-all duration-500 flex flex-col h-full ${isDetailed ? 'opacity-0 scale-95 translate-y-2' : 'opacity-100 scale-100 translate-y-0'}`}>
        <div className="space-y-1 mb-4">
          <h4 className="text-ink/30 text-[9px] font-mono font-black uppercase tracking-[0.2em]">{label}</h4>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl md:text-4xl font-black text-ink tracking-tighter font-display leading-none">{value}</p>
            {!isStatus && data && data.length > 1 && (
              <div className={`flex items-center gap-1 text-[11px] font-mono font-bold ${data[data.length-1] >= data[data.length-2] ? 'text-primary' : 'text-danger'}`}>
                {Math.abs(Math.round(data[data.length-1] - data[data.length-2]))}%
              </div>
            )}
          </div>
        </div>

        {data && data.length > 0 && (
          <div className="h-10 w-full opacity-40 group-hover:opacity-60 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.map((v, i) => ({ v, i }))}>
                <Area 
                  type="monotone" 
                  dataKey="v" 
                  stroke="currentColor" 
                  strokeWidth={2} 
                  fill="none"
                  className={config.text}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {insight && (
          <div className="mt-auto pt-4 border-t border-ink/5">
            <p className="text-[10px] font-mono font-bold text-ink/40 uppercase tracking-widest flex items-center gap-2">
              <Zap size={10} className="text-primary" />
              {insight}
            </p>
          </div>
        )}
      </div>

      {/* Detailed Botanical Context Overlay */}
      <div className={`absolute inset-0 p-6 bg-paper transition-all duration-500 flex flex-col justify-center gap-4 ${isDetailed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-105 pointer-events-none'}`}>
        <div className="flex items-center gap-2 text-primary">
          <Info size={14} />
          <h4 className="text-[10px] font-black uppercase tracking-widest">Botanical_Protocol</h4>
        </div>
        <p className="text-[11px] font-serif italic text-ink/60 leading-relaxed">
          {details || "Additional sensor telemetry details for this specific node are being processed by the root-hub."}
        </p>
        <div className="flex items-center gap-4 pt-2 border-t border-ink/5">
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-ink/20 uppercase font-bold tracking-widest">Priority</span>
            <span className={`text-[10px] font-mono font-black ${status === 'Critical' ? 'text-danger' : 'text-ink'}`}>{status === 'Critical' ? 'A_MAX' : 'B_STD'}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-ink/20 uppercase font-bold tracking-widest">Interval</span>
            <span className="text-[10px] font-mono font-black text-ink">3000ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileStat: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="space-y-2 p-5 bg-ink/[0.02] rounded-2xl border border-ink/5 hover:bg-white hover:border-primary/10 transition-all duration-500 group/stat">
    <div className="flex items-center gap-2">
      {icon && <div className="text-primary/30 group-hover/stat:text-primary transition-colors">{icon}</div>}
      <p className="text-[10px] font-mono font-bold text-ink/20 uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-sm font-black text-ink tracking-tighter truncate">{value}</p>
  </div>
);
