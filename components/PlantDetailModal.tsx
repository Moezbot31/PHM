
import React from 'react';
import { X, Activity, Droplets, Sun, Sprout, Info, Zap, Thermometer, ShieldCheck } from 'lucide-react';
import { Plant } from '../types';

interface PlantDetailModalProps {
  plant: Plant;
  onClose: () => void;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({ plant, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
      <div 
        className="absolute inset-0 bg-ink/60 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl bg-white rounded-[3rem] lg:rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border border-stone-200/50">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 sm:p-3 bg-stone-100/80 backdrop-blur-md text-stone-400 hover:text-ink hover:bg-stone-200 rounded-xl sm:rounded-2xl transition-all z-20 shadow-sm"
        >
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>

        <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-y-auto no-scrollbar">
          {/* Image Section */}
          <div className="lg:w-2/5 relative h-72 lg:h-auto">
            <img 
              src={plant.imageUrl} 
              className="w-full h-full object-cover"
              alt={plant.name}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-white/10" />
            <div className="absolute bottom-8 left-8 right-8">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 text-[10px] font-black uppercase tracking-widest mb-4 ${
                plant.healthScore > 75 ? 'bg-success/20 text-success' : plant.healthScore > 50 ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'
              }`}>
                <Activity size={12} />
                {plant.status} Status
              </div>
              <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-none uppercase font-display">{plant.name}</h2>
              <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mt-2">{plant.category}</p>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 p-8 lg:p-12 space-y-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <Droplets size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Watering</span>
                </div>
                <p className="text-sm font-bold text-ink">{plant.watering}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-warning">
                  <Sun size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sunlight</span>
                </div>
                <p className="text-sm font-bold text-ink">{plant.sunlight}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-accent">
                  <Sprout size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Growth Stage</span>
                </div>
                <p className="text-sm font-bold text-ink">{plant.growthStage}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Info size={18} className="text-primary" />
                <h3 className="text-sm font-black text-ink uppercase tracking-widest">Botanical Intelligence</h3>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed font-medium">
                {plant.description}
              </p>
            </div>

            {plant.aiInsight && (
              <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 space-y-3">
                <div className="flex items-center gap-3 text-primary">
                  <Zap size={18} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Neural Insight</h4>
                </div>
                <p className="text-xs text-primary/80 font-bold leading-relaxed italic">
                  "{plant.aiInsight}"
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-stone-100 flex flex-wrap gap-4">
              <div className="px-5 py-3 bg-stone-100 rounded-2xl flex items-center gap-3">
                <Thermometer size={16} className="text-stone-400" />
                <div>
                  <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Hardiness</p>
                  <p className="text-xs font-bold text-ink">Zone 9-11</p>
                </div>
              </div>
              <div className="px-5 py-3 bg-stone-100 rounded-2xl flex items-center gap-3">
                <ShieldCheck size={16} className="text-stone-400" />
                <div>
                  <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Maintenance</p>
                  <p className="text-xs font-bold text-ink">{plant.maintenanceLevel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
