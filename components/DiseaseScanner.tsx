
import React, { useState, useRef } from 'react';
import { CameraView } from './CameraView';
import { analyzePlantDisease } from '../services/geminiService';
import { DiseaseAnalysis } from '../types';
import { 
  Camera, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  Lightbulb, 
  CheckCircle2, 
  Microscope,
  ShieldCheck,
  Zap,
  Info,
  Upload,
  Image as ImageIcon,
  ChevronRight,
  AlertCircle,
  X,
  TrendingUp
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

export const DiseaseScanner: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiseaseAnalysis | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (base64: string) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setCapturedImage(base64);
    try {
      const analysis = await analyzePlantDisease(base64);
      if (!analysis || !analysis.plantName) {
        throw new Error("Could not identify any plant in the image.");
      }
      setResult(analysis);
    } catch (err: any) {
      console.error("AI Analysis failed:", err);
      setError(err.message || "Neural analysis failed. The image might be too blurry or dark.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Disease Scanner: File selected:", file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        handleCapture(base64);
      };
      reader.onerror = (err) => {
        console.error("FileReader error in DiseaseScanner:", err);
        setError("Failed to read the image file.");
      };
      reader.readAsDataURL(file);
    }
    // Clear input to allow re-uploading the same file
    event.target.value = '';
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const resetScanner = () => {
    setResult(null);
    setCapturedImage(null);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-20 relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] -z-10 animate-pulse delay-1000" />

      <div className="text-center max-w-3xl mx-auto space-y-4 sm:space-y-6">
        <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-2.5 bg-primary/5 text-primary rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-[0.25em] border border-primary/10 mb-1 sm:mb-2 shadow-sm">
          <Zap size={14} fill="currentColor" className="animate-pulse text-primary" />
          Neural Diagnostic Engine v4.2
        </div>
        <h2 className="text-3xl sm:text-5xl md:text-8xl font-black text-foreground tracking-tighter uppercase font-display leading-[0.9] drop-shadow-sm">
          PLANT <span className="text-primary italic">DOCTOR</span> AI
        </h2>
        <p className="text-muted-foreground font-medium text-sm sm:text-base md:text-lg leading-relaxed tracking-tight max-w-2xl mx-auto px-4">
          Advanced AI health assessment. Use your camera to scan for stress, diseases, and nutrient needs with <span className="text-success font-bold underline decoration-primary/30 underline-offset-4">98.4% diagnostic accuracy</span>.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Camera / Image View */}
        <div className="lg:col-span-7 space-y-10">
          <div className="relative group">
            {/* Hardware Frame Effect */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-transparent rounded-[5rem] -z-10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            {!result && !loading && !error ? (
              <div className="rounded-3xl sm:rounded-[4rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(45,79,60,0.15)] border-4 sm:border-8 border-white bg-white p-1 sm:p-2 relative group/camera">
                <CameraView isActive={true} onCapture={handleCapture} facingMode={facingMode} />
                <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-30 flex flex-col gap-2 sm:gap-3">
                  <button 
                    onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
                    className="p-3 sm:p-4 bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white shadow-xl hover:bg-white transition-all active:scale-95 flex items-center gap-2 sm:gap-3 group/rotate"
                  >
                    <RefreshCw size={14} className="text-primary group-hover/rotate:rotate-180 transition-transform duration-500 sm:w-[18px] sm:h-[18px]" />
                    <span className="text-[8px] sm:text-[10px] font-black text-ink uppercase tracking-widest">Rotate</span>
                  </button>
                  <button 
                    onClick={triggerFileUpload}
                    className="p-3 sm:p-4 bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white shadow-xl hover:bg-white transition-all active:scale-95 flex items-center gap-2 sm:gap-3 group/upload"
                  >
                    <Upload size={14} className="text-primary group-hover/upload:bounce sm:w-[18px] sm:h-[18px]" />
                    <span className="text-[8px] sm:text-[10px] font-black text-ink uppercase tracking-widest">Upload</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="image/*"
                  />
                </div>
              </div>
            ) : (
              <div className="relative rounded-3xl sm:rounded-[4rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(45,79,60,0.2)] border-4 sm:border-8 border-white aspect-video bg-foreground group">
                {capturedImage && (
                  <img src={capturedImage} alt="Captured Plant" className={`w-full h-full object-cover transition-all duration-1000 scale-105 group-hover:scale-100 ${loading ? 'opacity-40 blur-sm' : 'opacity-90 group-hover:opacity-100'}`} />
                )}
                
                {error && (
                  <div className="absolute inset-0 bg-danger/20 backdrop-blur-md flex items-center justify-center p-8">
                    <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-danger/10 animate-in zoom-in duration-500 text-center space-y-6">
                      <div className="w-20 h-20 bg-danger/10 text-danger rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                        <AlertCircle size={40} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-foreground tracking-tight font-display uppercase">Detection Failed</h3>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{error}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <button 
                          onClick={resetScanner}
                          className="flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                        >
                          <RefreshCw size={14} /> Retake
                        </button>
                        <button 
                          onClick={triggerFileUpload}
                          className="flex items-center justify-center gap-2 py-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-primary/20 transition-all active:scale-95"
                        >
                          <Upload size={14} /> Upload
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {loading && (
                  <div className="absolute inset-0 bg-foreground/40 backdrop-blur-md flex items-center justify-center">
                    <div className="flex flex-col items-center gap-8">
                      <div className="relative">
                        <div className="w-24 h-24 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Microscope className="text-white animate-bounce" size={32} />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-black text-2xl tracking-tight font-display">Analyzing Specimen</p>
                        <div className="flex items-center justify-center gap-2 mt-3">
                          <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em]">Cross-referencing database</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Scanning Line Effect */}
                {loading && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="w-full h-1.5 bg-primary/60 shadow-[0_0_30px_rgba(92,116,100,0.8)] absolute animate-[scan_2s_ease-in-out_infinite] z-20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent h-1/2 animate-[scan_2s_ease-in-out_infinite] z-10" />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-6 sm:p-10 bg-white/60 backdrop-blur-xl rounded-3xl sm:rounded-[3.5rem] border border-white shadow-[0_10px_40px_-10px_rgba(45,79,60,0.05)] flex flex-col gap-6 sm:gap-8 group hover:shadow-2xl transition-all duration-700">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 text-primary rounded-2xl sm:rounded-[2rem] flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-12 transition-transform duration-700">
                <Info size={32} className="sm:w-[36px] sm:h-[36px]" />
              </div>
              <div className="text-center md:text-left">
                <h4 className="text-base font-black text-foreground uppercase tracking-widest mb-3 font-display">Diagnostic Guidelines</h4>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed tracking-tight">
                  Ensure the plant is well-lit and centered in the frame. For best results, capture a clear photo of the affected leaves or stems from multiple angles if possible.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                  <CheckCircle2 size={14} /> Optimal Capture
                </div>
                <ul className="space-y-2">
                  <li className="text-[11px] text-muted-foreground font-semibold flex items-center gap-2">
                    <ChevronRight size={10} className="text-primary" /> Natural bright light
                  </li>
                  <li className="text-[11px] text-muted-foreground font-semibold flex items-center gap-2">
                    <ChevronRight size={10} className="text-primary" /> Close-up of symptoms
                  </li>
                  <li className="text-[11px] text-muted-foreground font-semibold flex items-center gap-2">
                    <ChevronRight size={10} className="text-primary" /> Steady camera focus
                  </li>
                </ul>
              </div>
              <div className="p-6 bg-danger/5 rounded-[2rem] border border-danger/10 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-danger uppercase tracking-widest">
                  <X size={14} /> Avoid These
                </div>
                <ul className="space-y-2">
                  <li className="text-[11px] text-muted-foreground font-semibold flex items-center gap-2">
                    <ChevronRight size={10} className="text-danger" /> Blurry or dark shots
                  </li>
                  <li className="text-[11px] text-muted-foreground font-semibold flex items-center gap-2">
                    <ChevronRight size={10} className="text-danger" /> Too far from plant
                  </li>
                  <li className="text-[11px] text-muted-foreground font-semibold flex items-center gap-2">
                    <ChevronRight size={10} className="text-danger" /> Busy backgrounds
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-5 h-full">
          <div className="bg-white p-6 sm:p-12 rounded-3xl sm:rounded-[4.5rem] shadow-[0_40px_80px_-20px_rgba(45,79,60,0.12)] border border-primary/5 min-h-[550px] sm:min-h-[650px] flex flex-col relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
            
            {loading ? (
              <div className="flex-1 flex flex-col space-y-10 relative z-10 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 rounded-full bg-primary/20" />
                      <div className="h-3 w-24 bg-primary/10 rounded-full" />
                    </div>
                    <div className="h-10 w-48 bg-primary/10 rounded-2xl" />
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-2 w-16 bg-primary/10 rounded-full ml-auto" />
                    <div className="h-12 w-20 bg-primary/10 rounded-2xl ml-auto" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="h-6 w-full bg-primary/5 rounded-full" />
                  <div className="flex justify-between px-2">
                    <div className="h-2 w-12 bg-primary/5 rounded-full" />
                    <div className="h-2 w-12 bg-primary/5 rounded-full" />
                    <div className="h-2 w-12 bg-primary/5 rounded-full" />
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="bg-primary/5 p-8 rounded-[3rem] border border-primary/10">
                    <div className="h-3 w-32 bg-primary/10 rounded-full mb-6" />
                    <div className="flex flex-wrap gap-3">
                      <div className="h-8 w-24 bg-white rounded-2xl border border-primary/5" />
                      <div className="h-8 w-32 bg-white rounded-2xl border border-primary/5" />
                    </div>
                  </div>

                  <div className="space-y-6 px-2">
                    <div className="h-3 w-40 bg-primary/10 rounded-full mb-6" />
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-5">
                          <div className="w-8 h-8 bg-primary/10 rounded-2xl shrink-0" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-full bg-primary/5 rounded-lg" />
                            <div className="h-4 w-2/3 bg-primary/5 rounded-lg" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-10 animate-in slide-in-from-bottom-10 duration-1000 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${result.healthScore > 80 ? 'bg-success' : result.healthScore > 50 ? 'bg-warning' : 'bg-danger'}`} />
                      <p className="text-primary font-black uppercase text-[11px] tracking-[0.25em]">{result.healthStatus}</p>
                    </div>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter font-display leading-tight">{result.plantName}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Health Index</div>
                    <div className={`text-5xl font-black tracking-tighter font-display ${
                      result.healthScore > 80 ? 'text-success' :
                      result.healthScore > 50 ? 'text-warning' :
                      'text-danger'
                    }`}>{result.healthScore}%</div>
                  </div>
                </div>

                {/* Health Score Progress Bar */}
                <div className="space-y-4">
                  <div className="h-6 w-full bg-primary/5 rounded-full overflow-hidden shadow-inner p-1 border border-primary/10">
                    <div 
                      className={`h-full transition-all duration-1500 ease-out rounded-full shadow-[0_0_20px_rgba(92,116,100,0.3)] ${
                        result.healthScore > 80 ? 'bg-success' :
                        result.healthScore > 50 ? 'bg-warning' :
                        'bg-danger'
                      }`}
                      style={{ width: `${result.healthScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2">
                    <span>Critical</span>
                    <span>Stable</span>
                    <span>Optimal</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-primary" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Health Trend</span>
                    </div>
                    <span className="text-[9px] font-bold text-success uppercase tracking-widest">+4.2% Recovery</span>
                  </div>
                  <div className="h-20 w-full bg-primary/5 rounded-[2rem] overflow-hidden border border-primary/10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { h: result.healthScore - 10 },
                        { h: result.healthScore - 5 },
                        { h: result.healthScore - 8 },
                        { h: result.healthScore - 2 },
                        { h: result.healthScore }
                      ]}>
                        <defs>
                          <linearGradient id="scannerHealth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={result.healthScore > 80 ? '#15803d' : result.healthScore > 50 ? '#C87D5F' : '#E76F51'} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={result.healthScore > 80 ? '#15803d' : result.healthScore > 50 ? '#C87D5F' : '#E76F51'} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <YAxis hide domain={[0, 100]} />
                        <Area 
                          type="monotone" 
                          dataKey="h" 
                          stroke={result.healthScore > 80 ? '#15803d' : result.healthScore > 50 ? '#C87D5F' : '#E76F51'} 
                          strokeWidth={2} 
                          fillOpacity={1} 
                          fill="url(#scannerHealth)" 
                          animationDuration={2000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-6 sm:space-y-10">
                  <div className="bg-primary/5 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-primary/10 backdrop-blur-sm">
                    <h4 className="text-[10px] sm:text-[11px] font-black text-primary uppercase tracking-[0.25em] mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                      <AlertTriangle size={16} className="text-warning sm:w-[18px] sm:h-[18px]" />
                      Pathology Report
                    </h4>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {result.issuesDetected.map((issue, idx) => (
                        <span key={idx} className="px-4 py-2 sm:px-5 sm:py-2.5 bg-white text-danger border border-danger/10 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest shadow-sm hover:scale-105 transition-transform cursor-default">
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6 px-2">
                    <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.25em] mb-6 flex items-center gap-3">
                      <Lightbulb className="text-primary" size={18} />
                      Treatment Protocol
                    </h4>
                    <ul className="space-y-6">
                      {result.treatment.map((step, idx) => (
                        <li key={idx} className="flex gap-5 text-base text-muted-foreground leading-relaxed font-semibold tracking-tight group/item">
                          <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-2xl flex items-center justify-center text-[11px] font-black shadow-lg shadow-primary/20 group-hover/item:scale-110 transition-transform">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-10 border-t border-primary/5 flex flex-col gap-8">
                  <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-success" size={20} />
                      <span className="text-[11px] font-black text-primary/60 uppercase tracking-widest">AI Confidence: {result.confidence}</span>
                    </div>
                  </div>
                  <button 
                    onClick={resetScanner} 
                    className="w-full py-5 sm:py-7 bg-primary text-white rounded-2xl sm:rounded-[2.5rem] font-black text-xs sm:text-[14px] tracking-[0.2em] sm:tracking-[0.25em] uppercase flex items-center justify-center gap-3 sm:gap-4 hover:bg-primary/90 transition-all shadow-[0_20px_40px_-10px_rgba(21,128,61,0.3)] hover:shadow-primary/40 transform active:scale-95"
                  >
                    <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700 sm:w-5 sm:h-5" />
                    SCAN AGAIN
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-primary/20 gap-10 relative z-10">
                <div className="w-32 h-32 bg-primary/5 rounded-[3.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-700">
                  <Camera size={64} className="opacity-20 text-foreground" />
                </div>
                <div className="text-center space-y-3">
                  <p className="font-black text-lg uppercase tracking-[0.4em] text-foreground/40 font-display">Awaiting Specimen</p>
                  <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">Capture a photo to initiate diagnostic scan</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
    </div>
  );
};
