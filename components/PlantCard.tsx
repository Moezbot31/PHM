
import React from 'react';
import { Plant } from '../types';
import { Activity, Droplets, Sun, TrendingUp } from 'lucide-react';

interface PlantCardProps {
  plant: Plant;
  onClick?: () => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({ plant, onClick }) => {
  const getStatusColor = (score: number) => {
    if (score > 75) return 'bg-success';
    if (score > 50) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white/5 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all duration-500 group relative overflow-hidden cursor-pointer active:scale-95"
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <TrendingUp size={14} className="text-white/20" />
      </div>
      <div className="flex items-center gap-4 lg:gap-5 mb-6">
        <div className="relative">
          <img 
            src={plant.imageUrl} 
            className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl object-cover shadow-2xl group-hover:scale-110 transition-transform duration-700" 
            referrerPolicy="no-referrer" 
            alt={plant.name}
          />
          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-ink ${getStatusColor(plant.healthScore)}`} />
        </div>
        <div className="min-w-0">
          <h4 className="font-black text-sm lg:text-base truncate tracking-tight text-white">{plant.name}</h4>
          <p className="text-[8px] lg:text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">{plant.category}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[9px] lg:text-[10px] font-black text-white/40 uppercase tracking-widest">Health Index</span>
          <span className={`text-[11px] lg:text-xs font-black ${
            plant.healthScore > 75 ? 'text-success' : plant.healthScore > 50 ? 'text-warning' : 'text-danger'
          }`}>{plant.healthScore}%</span>
        </div>
        <div className="h-1.5 lg:h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${getStatusColor(plant.healthScore)}`}
            style={{ width: `${plant.healthScore}%` }}
          />
        </div>
      </div>
    </div>
  );
};
