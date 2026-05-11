
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CameraView } from './CameraView';
import { GARDEN_TOOLS } from '../constants';
import { LandscapeItem, Plant, Tool } from '../types';

type DesignMode = 'static' | 'live';
type Category = 'plants' | 'objects' | 'surfaces';

interface SavedDesign {
  id: string;
  name: string;
  items: LandscapeItem[];
  bgImage?: string;
  timestamp: number;
}

interface LandscapeDesignerProps {
  initialItems?: LandscapeItem[];
  onItemsChange?: (items: LandscapeItem[]) => void;
  availablePlants: Plant[];
}

export const LandscapeDesigner: React.FC<LandscapeDesignerProps> = ({ 
  initialItems = [], 
  onItemsChange,
  availablePlants
}) => {
  const [items, setItems] = useState<LandscapeItem[]>(initialItems);
  const [history, setHistory] = useState<LandscapeItem[][]>([]);
  const [designMode, setDesignMode] = useState<DesignMode>('static');
  const [activeCategory, setActiveCategory] = useState<Category>('plants');
  const [selectedItemId, setSelectedItemId] = useState<string>(availablePlants[0]?.id || '');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [currentDesignName, setCurrentDesignName] = useState('Garden Concept Alpha');
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onItemsChange?.(items);
  }, [items]);

  useEffect(() => {
    if (initialItems.length !== items.length) {
      setItems(initialItems);
    }
  }, [initialItems]);

  const SURFACE_ASSETS = [
    { id: 's1', name: 'Premium Turf', imageUrl: 'https://images.unsplash.com/photo-1533460004989-cef01064af7c?auto=format&fit=crop&w=400', type: 'surface' },
    { id: 's2', name: 'Gravel Path', imageUrl: 'https://images.unsplash.com/photo-1508182314998-3bd49473002f?auto=format&fit=crop&w=400', type: 'surface' },
    { id: 's3', name: 'Paved Walkway', imageUrl: 'https://images.unsplash.com/photo-1590059392253-df2676f4e183?auto=format&fit=crop&w=400', type: 'surface' }
  ];

  const currentPalette = useMemo(() => {
    if (activeCategory === 'plants') return availablePlants;
    if (activeCategory === 'objects') return GARDEN_TOOLS;
    return SURFACE_ASSETS;
  }, [activeCategory, availablePlants]);

  const getItemData = (itemId: string) => {
    return [...availablePlants, ...GARDEN_TOOLS, ...SURFACE_ASSETS].find(x => x.id === itemId);
  };

  const proximityAlerts = useMemo(() => {
    const alerts: Record<string, boolean> = {};
    items.forEach((item, i) => {
      items.forEach((other, j) => {
        if (i === j) return;
        const dx = item.x - other.x;
        const dy = item.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const itemData = getItemData(item.itemId);
        const category = (itemData as Plant)?.category || (itemData as Tool)?.category;
        const threshold = category === 'Tree' ? 14 : 8;
        
        if (distance < threshold) {
          alerts[item.instanceId] = true;
          alerts[other.instanceId] = true;
        }
      });
    });
    return alerts;
  }, [items, availablePlants]);

  const aiSuggestions = useMemo(() => {
    const itemCount = items.length;
    const overcrowded = Object.values(proximityAlerts).filter(v => v).length;
    const hasObjects = items.some(i => i.type === 'tool');
    
    if (overcrowded > 0) return "PROXIMITY ALERT: Some assets are clipping. Re-position benches or larger plants for better circulation.";
    if (itemCount === 0) return "Your canvas is empty. Start with hardscaping (benches/paths) or a focal tree.";
    if (!hasObjects && itemCount > 2) return "Aesthetic Tip: Add a Stone Fountain or Bench to create a human-centered focal point.";
    return "Composition Harmony: High. The balance between flora and artifacts is currently optimal.";
  }, [items, proximityAlerts]);

  const addItem = (e: React.MouseEvent<HTMLDivElement>) => {
    if (designMode === 'static' && !uploadedImage && !e.shiftKey) return;
    if (!selectedItemId) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newItem: LandscapeItem = {
      instanceId: Math.random().toString(36).substr(2, 9),
      itemId: selectedItemId,
      type: activeCategory === 'plants' ? 'plant' : 'tool',
      x, y, rotation: 0, scale: activeCategory === 'surfaces' ? 2 : (activeCategory === 'objects' ? 0.8 : 1)
    };
    
    setHistory([...history, items]);
    setItems([...items, newItem]);
  };

  const saveDesign = () => {
    const name = prompt("Enter a name for this variation:", currentDesignName) || `Variation ${savedDesigns.length + 1}`;
    const newDesign: SavedDesign = {
      id: Date.now().toString(),
      name,
      items: [...items],
      bgImage: uploadedImage || undefined,
      timestamp: Date.now()
    };
    setSavedDesigns(prev => [newDesign, ...prev]);
    setCurrentDesignName(name);
  };

  const loadDesign = (design: SavedDesign) => {
    setHistory([...history, items]);
    setItems(design.items);
    if (design.bgImage) {
      setUploadedImage(design.bgImage);
      setDesignMode('static');
    }
    setCurrentDesignName(design.name);
    setIsComparing(false);
  };

  const toggleCompare = (id: string) => {
    setCompareList(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id].slice(-4)
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => setUploadedImage(re.target?.result as string);
      reader.readAsDataURL(file);
      setDesignMode('static');
    }
  };

  const startSpatialToolPreview = (toolId: string) => {
    setActiveCategory('objects');
    setSelectedItemId(toolId);
    setDesignMode('live');
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 animate-in fade-in duration-1000">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100/50">
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
          <div className="flex bg-slate-50 p-1.5 rounded-[2rem] w-full sm:w-auto">
            <button 
              onClick={() => setDesignMode('static')} 
              className={`flex-1 sm:flex-none px-8 py-3 rounded-[1.5rem] font-black text-[10px] tracking-widest transition-all duration-300 ${designMode === 'static' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              BLUEPRINT
            </button>
            <button 
              onClick={() => setDesignMode('live')} 
              className={`flex-1 sm:flex-none px-8 py-3 rounded-[1.5rem] font-black text-[10px] tracking-widest transition-all duration-300 ${designMode === 'live' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              LIVE AR
            </button>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={() => history.length > 0 && setItems(history[history.length-1])} 
              disabled={history.length === 0} 
              className="flex-1 sm:flex-none w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl disabled:opacity-30 flex items-center justify-center transition-all hover:bg-slate-100"
            >
              <i className="fas fa-undo" />
            </button>
            <button 
              onClick={() => setIsComparing(!isComparing)} 
              className={`flex-1 sm:flex-none px-8 py-3 rounded-2xl font-black text-[9px] tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-3 ${isComparing ? 'bg-success text-white shadow-lg shadow-success/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
            >
              <i className="fas fa-columns" /> Compare {compareList.length > 0 && `(${compareList.length})`}
            </button>
          </div>
        </div>

        <div className="flex gap-3 w-full lg:w-auto">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="flex-1 lg:flex-none bg-slate-50 text-slate-600 px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-slate-100 transition-all"
          >
            Upload Site
          </button>
          <button 
            onClick={saveDesign} 
            className="flex-1 lg:flex-none bg-success text-white px-10 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-lg shadow-success/20 hover:scale-105 active:scale-95 transition-all"
          >
            Save Version
          </button>
          <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileUpload} />
        </div>
      </div>

      {isComparing ? (
        <div className="animate-in zoom-in-95 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter font-display">Design Contrast</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Select and compare your architectural concepts</p>
            </div>
            <button 
              onClick={() => setIsComparing(false)} 
              className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-success transition-all shadow-xl"
            >
              <i className="fas fa-arrow-left mr-3" /> Exit Comparison
            </button>
          </div>
          
          <div className={`grid gap-10 ${compareList.length >= 3 ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : compareList.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {compareList.map(id => {
              const design = savedDesigns.find(d => d.id === id);
              if (!design) return null;
              return (
                <div key={id} className="bg-white p-10 rounded-[4rem] border border-slate-100/50 shadow-sm space-y-8 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="aspect-[16/10] bg-slate-50 rounded-[3rem] relative overflow-hidden border border-slate-100/50 shadow-inner">
                    {design.bgImage && <img src={design.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-60" />}
                    <div className="absolute inset-0">
                      <DesignerOverlay items={design.items} getItemData={getItemData} onRemove={() => {}} alerts={{}} isStatic />
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-2">
                    <div>
                      <h4 className="font-black text-2xl text-slate-900 tracking-tight font-display">{design.name}</h4>
                      <div className="flex gap-3 mt-3">
                        <span className="text-[9px] font-black bg-success/10 text-success px-3 py-1 rounded-full uppercase tracking-widest">{design.items.filter(i => i.type === 'plant').length} Flora</span>
                        <span className="text-[9px] font-black bg-accent/10 text-accent px-3 py-1 rounded-full uppercase tracking-widest">{design.items.filter(i => i.type === 'tool').length} Objects</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => loadDesign(design)} 
                      className="bg-slate-50 text-slate-600 px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest hover:bg-success hover:text-white transition-all uppercase shadow-sm"
                    >
                      Activate
                    </button>
                  </div>
                </div>
              );
            })}
            {compareList.length === 0 && (
              <div className="col-span-full py-48 bg-white rounded-[5rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                   <i className="fas fa-layer-group text-4xl opacity-30" />
                </div>
                <p className="font-black uppercase tracking-widest text-sm">Select items from the archive to compare</p>
                <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Use the plus icons in the side panel</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
          {/* Main Canvas */}
          <div className="lg:col-span-3 relative h-[60vh] lg:h-[75vh] rounded-[4rem] overflow-hidden border-[12px] border-white shadow-2xl bg-slate-50 group/canvas">
            <div ref={containerRef} onClick={addItem} className="w-full h-full relative cursor-crosshair">
              {designMode === 'live' ? (
                <CameraView isActive={true} overlayContent={<div className="absolute inset-0 pointer-events-none"><DesignerOverlay items={items} getItemData={getItemData} onRemove={(id) => setItems(prev => prev.filter(i => i.instanceId !== id))} alerts={proximityAlerts} /></div>} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100/50 relative">
                  {uploadedImage && <img src={uploadedImage} className="w-full h-full object-cover" />}
                  {!uploadedImage && (
                    <div className="text-center opacity-20 group-hover/canvas:opacity-40 transition-opacity duration-500">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <i className="fas fa-camera text-3xl" />
                      </div>
                      <p className="font-black text-xs uppercase tracking-[0.2em]">Awaiting Site Image</p>
                    </div>
                  )}
                  <div className="absolute inset-0 pointer-events-none">
                    <DesignerOverlay items={items} getItemData={getItemData} onRemove={(id) => setItems(prev => prev.filter(i => i.instanceId !== id))} alerts={proximityAlerts} />
                  </div>
                </div>
              )}
            </div>

            {/* AI HUD */}
            <div className="absolute top-4 right-4 sm:top-10 sm:right-10 pointer-events-none max-w-[180px] sm:max-w-xs transition-all">
               <div className={`backdrop-blur-xl p-3 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${Object.keys(proximityAlerts).length > 0 ? 'border-danger/30 bg-danger/5' : 'border-white/20 bg-white/10'}`}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                    <div className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full animate-pulse ${Object.keys(proximityAlerts).length > 0 ? 'bg-danger shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-success shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Spatial Intelligence</p>
                  </div>
                  <p className="text-[9px] sm:text-xs font-bold text-slate-800 leading-relaxed italic line-clamp-3 sm:line-clamp-none">"{aiSuggestions}"</p>
               </div>
            </div>

            {/* Category Selector */}
            <div className="absolute bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-wrap justify-center items-center gap-1 sm:gap-2 bg-slate-900/90 backdrop-blur-2xl p-1.5 sm:p-2.5 rounded-2xl sm:rounded-[2.5rem] shadow-2xl border border-white/10 w-[90%] sm:w-auto">
              {[
                { id: 'plants', icon: 'fa-leaf', label: 'Flora' },
                { id: 'objects', icon: 'fa-chair', label: 'Artifacts' },
                { id: 'surfaces', icon: 'fa-mountain', label: 'Surfaces' }
              ].map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id as Category)} 
                  className={`px-3 sm:px-8 py-2 sm:py-3.5 rounded-xl sm:rounded-full font-black text-[8px] sm:text-[9px] tracking-widest uppercase transition-all duration-300 flex items-center gap-1.5 sm:gap-3 ${activeCategory === cat.id ? 'bg-success text-white shadow-lg shadow-success/20' : 'text-slate-400 hover:text-white'}`}
                >
                  <i className={`fas ${cat.icon}`} /> <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Panel */}
          <div className="space-y-8 h-auto lg:h-[75vh] flex flex-col">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100/50 shadow-sm flex-1 overflow-hidden flex flex-col">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 px-2">Project Assets</h4>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
                {currentPalette.map((p: any) => (
                  <div key={p.id} className={`flex items-center gap-5 p-4 rounded-3xl border-2 transition-all duration-300 ${selectedItemId === p.id ? 'bg-success/5 border-success shadow-sm' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}>
                    <button onClick={() => setSelectedItemId(p.id)} className="flex-1 flex items-center gap-4 text-left">
                      <div className="w-12 h-12 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-sm">
                        <img src={p.imageUrl} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black uppercase leading-none mb-1.5 truncate tracking-tight">{p.name}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.category || 'Asset'}</p>
                      </div>
                    </button>
                    {activeCategory === 'objects' && (
                      <button 
                        onClick={() => startSpatialToolPreview(p.id)} 
                        className="w-10 h-10 bg-success/10 text-success rounded-xl hover:bg-success hover:text-white transition-all shadow-sm flex items-center justify-center"
                      >
                        <i className="fas fa-eye text-[11px]" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface p-10 rounded-[4rem] shadow-2xl text-white border border-white/5">
               <div className="flex justify-between items-center mb-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Archive</h4>
                  <span className="text-[9px] font-black bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">Saved</span>
               </div>
               <div className="space-y-4 max-h-64 overflow-y-auto no-scrollbar">
                  {savedDesigns.map(d => (
                    <div key={d.id} className="flex items-center gap-3 group">
                      <button 
                        onClick={() => toggleCompare(d.id)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${compareList.includes(d.id) ? 'bg-success text-white shadow-lg shadow-success/20' : 'bg-white/5 text-white/30 hover:bg-white/10 border border-white/5'}`}
                      >
                        <i className={`fas ${compareList.includes(d.id) ? 'fa-check' : 'fa-plus'} text-[11px]`} />
                      </button>
                      <button 
                        onClick={() => loadDesign(d)}
                        className="flex-1 flex items-center justify-between p-5 bg-white/5 rounded-[1.5rem] hover:bg-white/10 transition-all border border-white/5 group-hover:border-white/10"
                      >
                        <div className="flex flex-col items-start truncate pr-3">
                          <span className="text-[12px] font-black truncate uppercase tracking-tight">{d.name}</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <i className="fas fa-chevron-right text-[10px] opacity-20 group-hover:opacity-50 transition-opacity" />
                      </button>
                    </div>
                  ))}
                  {savedDesigns.length === 0 && (
                    <div className="text-center py-12 opacity-20 border-2 border-dashed border-white/10 rounded-[2.5rem]">
                      <p className="text-[10px] font-black uppercase tracking-widest">Empty Workspace</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DesignerOverlay = ({ items, getItemData, onRemove, alerts, isStatic = false }: any) => (
  <>
    {items.map((item: LandscapeItem) => {
      const data = getItemData(item.itemId);
      const isSurface = item.itemId.startsWith('s');
      return (
        <div
          key={item.instanceId}
          className={`absolute pointer-events-auto group animate-in zoom-in-75 duration-300 ${isStatic ? 'scale-[0.8]' : ''}`}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            transform: `translate(-50%, -100%) scale(${item.scale})`,
            zIndex: isSurface ? 1 : Math.floor(item.y)
          }}
        >
          <div className="relative">
            {alerts[item.instanceId] && <div className="absolute inset-0 -m-4 border-2 border-red-500/30 rounded-full animate-pulse blur-md" />}
            <img 
              src={data?.imageUrl} 
              className={`${isSurface ? 'w-80 h-60 rounded-[3rem] object-cover mix-blend-multiply opacity-80' : item.type === 'tool' ? 'w-32 h-32 object-contain' : 'w-56 h-72 object-contain'} drop-shadow-2xl transition-transform group-hover:scale-105 duration-500`}
              style={{ filter: `brightness(1.05) contrast(${isSurface ? 0.8 : 1.1})` }}
            />
            {!isSurface && <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/30 blur-2xl rounded-full scale-y-[0.25] -z-10" />}
          </div>
          {!isStatic && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 flex gap-2 bg-slate-900/95 backdrop-blur-xl p-2 rounded-xl transition-all border border-white/10 shadow-2xl">
              <button onClick={(e) => { e.stopPropagation(); onRemove(item.instanceId); }} className="text-red-400 px-3 py-1 hover:text-red-500 text-[10px] font-black uppercase flex items-center gap-2">
                <i className="fas fa-trash-alt text-[8px]" /> Remove
              </button>
            </div>
          )}
        </div>
      );
    })}
  </>
);
