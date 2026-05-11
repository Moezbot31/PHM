
import React, { useState, useMemo, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Plant, PlantCategory, UserRole, Order, User } from '../types';

interface AdminPanelProps {
  plants: Plant[];
  userRole: UserRole;
  onAdd: (plant: Plant) => void;
  onRemove: (id: string) => void;
  onUpdateStock: (id: string, newStock: number) => void;
  onUpdatePlant: (id: string, updatedData: Partial<Plant>) => void;
}

const MOCK_ORDERS: Order[] = [
  { id: 'ORD-001', date: '2024-05-20', items: ['Monstera'], total: 12500, status: 'Shipped', trackingNumber: 'FV-99210' },
  { id: 'ORD-002', date: '2024-05-21', items: ['Areca Palm', 'Boxwood'], total: 17500, status: 'Pending' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ plants, userRole, onAdd, onRemove, onUpdateStock, onUpdatePlant }) => {
  const isStaff = userRole === UserRole.STAFF;
  const isAdmin = userRole === UserRole.BUSINESS_ADMIN || userRole === UserRole.SUPER_ADMIN;
  
  const [activeView, setActiveView] = useState<any>(isStaff ? 'inventory' : 'analytics');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [staffList, setStaffList] = useState<Partial<User>[]>([
    { id: 's1', email: 'staff.ali@flora.com', role: UserRole.STAFF }
  ]);
  
  const [formData, setFormData] = useState<Partial<Plant>>({
    name: '',
    price: 0,
    category: PlantCategory.INDOOR,
    stock: 0,
    imageUrl: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=400',
    description: '',
    size: 'Medium',
    growthStage: 'Sapling',
    sunlight: 'Bright Indirect',
    watering: 'Moderate',
    soil: 'Loamy'
  });

  const [newStaff, setNewStaff] = useState({ email: '', password: '' });

  // Load editing data into form
  useEffect(() => {
    if (editingId) {
      const plant = plants.find(p => p.id === editingId);
      if (plant) {
        setFormData(plant);
        setIsAdding(true);
      }
    } else {
      setFormData({
        name: '',
        price: 0,
        category: PlantCategory.INDOOR,
        stock: 0,
        imageUrl: 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=400',
        description: '',
        size: 'Medium',
        growthStage: 'Sapling',
        sunlight: 'Bright Indirect',
        watering: 'Moderate',
        soil: 'Loamy'
      });
    }
  }, [editingId, plants]);

  const stats = useMemo(() => {
    const totalRev = plants.reduce((acc, p) => acc + (p.price * p.stock), 0);
    const lowStock = plants.filter(p => p.stock < 5).length;
    const mostPreviewed = [...plants].sort((a, b) => (b.previewCount || 0) - (a.previewCount || 0))[0];
    return { totalRev, lowStock, mostPreviewed };
  }, [plants]);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.email) return;
    setStaffList([...staffList, { id: Date.now().toString(), email: newStaff.email, role: UserRole.STAFF }]);
    setNewStaff({ email: '', password: '' });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdatePlant(editingId, formData);
    } else {
      onAdd({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        maintenanceLevel: 'Easy',
        previewCount: 0
      } as Plant);
    }
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-1000">
      {/* Role-Specific Header */}
      <div className="bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] shadow-sm border border-border/50 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6 px-2">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform hover:rotate-6 ${isStaff ? 'bg-warning shadow-warning/20' : 'bg-foreground shadow-foreground/20'}`}>
            <i className={`fas ${isStaff ? 'fa-user-pen' : 'fa-gauge-high'} text-xl`} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tighter uppercase font-display">
              {isStaff ? 'Operations Hub' : 'Admin Console'}
            </h2>
            <p className="text-[10px] font-black text-success uppercase tracking-[0.2em] mt-1">{userRole} Session</p>
          </div>
        </div>

        <nav className="flex bg-primary/5 p-1.5 rounded-[2rem] gap-1 overflow-x-auto no-scrollbar w-full md:w-auto">
          {isAdmin && (
            <button onClick={() => setActiveView('analytics')} className={`flex-1 md:flex-none px-8 py-3 rounded-[1.5rem] font-black text-[10px] tracking-widest uppercase transition-all duration-300 ${activeView === 'analytics' ? 'bg-white shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Metrics</button>
          )}
          <button onClick={() => setActiveView('inventory')} className={`flex-1 md:flex-none px-8 py-3 rounded-[1.5rem] font-black text-[10px] tracking-widest uppercase transition-all duration-300 ${activeView === 'inventory' ? 'bg-white shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Inventory</button>
          {isAdmin && (
            <>
              <button onClick={() => setActiveView('orders')} className={`flex-1 md:flex-none px-8 py-3 rounded-[1.5rem] font-black text-[10px] tracking-widest uppercase transition-all duration-300 ${activeView === 'orders' ? 'bg-white shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Orders</button>
              <button onClick={() => setActiveView('staff')} className={`flex-1 md:flex-none px-8 py-3 rounded-[1.5rem] font-black text-[10px] tracking-widest uppercase transition-all duration-300 ${activeView === 'staff' ? 'bg-white shadow-md text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Manage Staff</button>
            </>
          )}
        </nav>
      </div>

      {activeView === 'analytics' && isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-700">
           <div className="bg-success p-10 rounded-[4rem] text-white shadow-2xl shadow-success/20 group hover:-translate-y-2 transition-all duration-500">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-3">Portfolio Value</p>
              <h3 className="text-5xl font-black tracking-tighter">Rs. {stats.totalRev.toLocaleString()}</h3>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Real-time valuation</span>
              </div>
           </div>
           <div className="bg-white/40 backdrop-blur-xl p-10 rounded-[4rem] shadow-sm border border-border/50 group hover:-translate-y-2 transition-all duration-500">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Supply Shortfalls</p>
              <h3 className="text-5xl font-black text-danger tracking-tighter">{stats.lowStock} Items</h3>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-danger/60">Requires restock</span>
              </div>
           </div>
           <div className="bg-foreground p-10 rounded-[4rem] text-white shadow-2xl shadow-foreground/20 group hover:-translate-y-2 transition-all duration-500">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-3">Trend Leader</p>
              <h3 className="text-2xl font-black truncate tracking-tight font-display">{stats.mostPreviewed?.name}</h3>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Highest engagement</span>
              </div>
           </div>
        </div>
      )}

      {activeView === 'inventory' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-white/40 backdrop-blur-xl p-8 rounded-[3rem] border border-border/50 shadow-sm">
            <h3 className="text-2xl font-black text-foreground tracking-tight font-display">Master Catalog</h3>
            <button 
              onClick={() => { 
                if(isAdding) { setEditingId(null); setIsAdding(false); }
                else { setIsAdding(true); setEditingId(null); }
              }} 
              className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${isAdding ? 'bg-foreground text-white' : 'bg-primary text-white shadow-primary/20 hover:scale-105'}`}
            >
              <i className={`fas ${isAdding ? 'fa-times' : 'fa-plus'}`} /> 
              {isAdding ? 'CANCEL ACTION' : 'ADD NEW SPECIMEN'}
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleFormSubmit} className="bg-white p-12 rounded-[4rem] border-2 border-success/10 shadow-2xl space-y-10 animate-in zoom-in-95 duration-500">
              <div className="flex justify-between items-center border-b border-border pb-8">
                 <h4 className="text-2xl font-black text-foreground uppercase tracking-tighter font-display">
                   {editingId ? 'Modify Inventory Data' : 'Asset Creation Wizard'}
                 </h4>
                 <div className="flex gap-3">
                   <span className="bg-accent/10 text-accent px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/20">Live Update</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1 space-y-8">
                   <div className="aspect-[4/5] bg-primary/5 rounded-[3rem] overflow-hidden border-2 border-dashed border-primary/20 relative group flex items-center justify-center shadow-inner transition-all hover:border-success/50">
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} className="w-full h-full object-cover animate-in fade-in duration-700" alt="Preview" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="text-center p-10 opacity-20 group-hover:opacity-40 transition-opacity">
                          <i className="fas fa-camera text-5xl mb-4" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Image</p>
                        </div>
                      )}
                      <div className="absolute top-6 right-6 bg-success text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">Live Asset</div>
                   </div>
                   <div className="space-y-3">
                     <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Asset Image URL</label>
                     <input 
                      required
                      placeholder="Enter CDN or Unsplash URL" 
                      className="w-full p-5 bg-primary/5 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-success/50 outline-none border border-border focus:bg-white transition-all shadow-sm" 
                      value={formData.imageUrl}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                     />
                     <p className="text-[9px] text-muted-foreground font-bold px-2 uppercase tracking-widest">Tip: Use high-resolution images for best AR performance.</p>
                   </div>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Official Name</label>
                    <input required className="w-full p-5 bg-primary/5 rounded-2xl font-bold border border-border focus:bg-white focus:ring-2 focus:ring-success/50 outline-none transition-all shadow-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Market Price (PKR)</label>
                    <input type="number" required className="w-full p-5 bg-primary/5 rounded-2xl font-bold border border-border focus:bg-white focus:ring-2 focus:ring-success/50 outline-none transition-all shadow-sm" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Botanical Category</label>
                    <select className="w-full p-5 bg-primary/5 rounded-2xl font-bold border border-border appearance-none focus:bg-white focus:ring-2 focus:ring-success/50 outline-none transition-all shadow-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                      {Object.values(PlantCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Current Stock</label>
                    <input type="number" className="w-full p-5 bg-primary/5 rounded-2xl font-bold border border-border focus:bg-white focus:ring-2 focus:ring-success/50 outline-none transition-all shadow-sm" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                  </div>
                  <div className="sm:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Full Description</label>
                    <textarea className="w-full p-6 bg-primary/5 rounded-3xl font-bold h-32 resize-none border border-border focus:bg-white focus:ring-2 focus:ring-success/50 outline-none transition-all shadow-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full py-7 bg-primary text-white rounded-[2.5rem] font-black tracking-[0.2em] uppercase hover:bg-primary/90 transition-all shadow-2xl shadow-primary/20 transform hover:scale-[1.02] active:scale-[0.98]">
                {editingId ? 'Commit Asset Changes' : 'Initialize & Publish Asset'}
              </button>
            </form>
          )}

          <div className="bg-white/40 backdrop-blur-xl rounded-[4rem] shadow-sm border border-border/50 overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-primary/5">
                  <tr>
                    <th className="px-12 py-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Botanical Entity</th>
                    <th className="px-10 py-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Stock Level</th>
                    <th className="px-10 py-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Unit Price</th>
                    <th className="px-12 py-8 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Action Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {plants.map(p => (
                    <tr key={p.id} className="hover:bg-primary/5 transition-all group">
                      <td className="px-12 py-8">
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <img src={p.imageUrl} className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${p.stock < 5 ? 'bg-danger' : 'bg-success'}`} />
                          </div>
                          <div>
                            <p className="font-black text-foreground tracking-tight text-lg">{p.name}</p>
                            <p className="text-[10px] font-black text-success uppercase tracking-widest mt-1">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-4">
                          <input 
                            type="number" 
                            value={p.stock} 
                            className={`w-20 p-3 bg-white/50 rounded-2xl text-center font-black border-2 transition-all shadow-sm ${p.stock < 5 ? 'border-danger/20 text-danger bg-danger/5' : 'border-border text-foreground'}`}
                            onChange={(e) => onUpdateStock(p.id, Number(e.target.value))}
                          />
                          {p.stock < 5 && <AlertTriangle size={18} className="text-danger animate-pulse" />}
                         </div>
                      </td>
                      <td className="px-10 py-8 font-black text-foreground text-lg">Rs. {p.price.toLocaleString()}</td>
                      <td className="px-12 py-8 text-right">
                        <div className="flex justify-end gap-4">
                          <button 
                            onClick={() => setEditingId(p.id)}
                            className="w-12 h-12 bg-primary/5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-2xl flex items-center justify-center transition-all shadow-sm"
                            title="Edit Details"
                          >
                            <i className="fas fa-edit" />
                          </button>
                          <button 
                            onClick={() => { if(confirm("Confirm deletion of this asset?")) onRemove(p.id); }}
                            className="w-12 h-12 bg-primary/5 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-2xl flex items-center justify-center transition-all shadow-sm"
                            title="Purge Asset"
                          >
                            <i className="fas fa-trash-alt" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeView === 'staff' && isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-700">
          <div className="bg-white/40 backdrop-blur-xl p-12 rounded-[4rem] shadow-sm border border-border/50">
            <h4 className="text-2xl font-black text-foreground mb-10 flex items-center gap-4 font-display">
              <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center text-success">
                <i className="fas fa-id-card-clip" />
              </div>
              Provision Account
            </h4>
            <form onSubmit={handleCreateStaff} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Professional Email</label>
                <input 
                  placeholder="staff.member@floravision.pk" 
                  className="w-full p-5 bg-primary/5 rounded-2xl font-bold border border-border outline-none focus:bg-white focus:ring-2 focus:ring-success/50 transition-all shadow-sm" 
                  value={newStaff.email}
                  onChange={e => setNewStaff({...newStaff, email: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Temporary Access Key</label>
                <input type="password" placeholder="••••••••" className="w-full p-5 bg-primary/5 rounded-2xl font-bold border border-border outline-none focus:bg-white focus:ring-2 focus:ring-success/50 transition-all shadow-sm" />
              </div>
              <button className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-primary/90 transition-all mt-6 transform hover:scale-[1.02]">Generate Digital ID</button>
            </form>
          </div>
          <div className="bg-white/40 backdrop-blur-xl p-12 rounded-[4rem] shadow-sm border border-border/50">
            <h4 className="text-2xl font-black text-foreground mb-10 tracking-tight font-display">Personnel Directory</h4>
            <div className="space-y-5">
              {staffList.map(s => (
                <div key={s.id} className="flex justify-between items-center p-6 bg-primary/5 rounded-[2.5rem] border border-border hover:border-success/30 transition-all group">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-success rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-success/20 group-hover:rotate-6 transition-transform">
                        {s.email?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground tracking-tight">{s.email}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Active • {s.role}</p>
                      </div>
                   </div>
                   <button 
                    onClick={() => setStaffList(prev => prev.filter(st => st.id !== s.id))}
                    className="w-10 h-10 bg-white text-muted-foreground hover:text-danger rounded-xl shadow-sm flex items-center justify-center transition-all hover:bg-danger/10"
                   >
                     <i className="fas fa-user-xmark text-[11px]" />
                   </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'orders' && isAdmin && (
        <div className="bg-white/40 backdrop-blur-xl rounded-[4rem] shadow-sm border border-border/50 overflow-hidden animate-in fade-in duration-700">
           <div className="p-10 border-b border-border/50 flex justify-between items-center bg-primary/5">
             <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter font-display">Fulfillment Pipeline</h3>
             <div className="flex gap-3">
               <span className="px-5 py-2 bg-accent/10 text-accent text-[10px] font-black rounded-full uppercase tracking-widest border border-accent/20">Real-time Sync</span>
             </div>
           </div>
           <div className="overflow-x-auto no-scrollbar">
             <table className="w-full text-left min-w-[800px]">
               <thead>
                 <tr className="bg-primary/5">
                   <th className="px-12 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Invoice Ref</th>
                   <th className="px-12 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Transaction Sum</th>
                   <th className="px-12 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Logistics Stage</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/50">
                 {MOCK_ORDERS.map(o => (
                   <tr key={o.id} className="hover:bg-primary/5 transition-all">
                     <td className="px-12 py-8">
                       <p className="font-black text-foreground tracking-tight text-lg">{o.id}</p>
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{o.date}</p>
                     </td>
                     <td className="px-12 py-8 font-black text-success text-lg">Rs. {o.total.toLocaleString()}</td>
                     <td className="px-12 py-8 text-right">
                        <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          o.status === 'Shipped' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'
                        }`}>{o.status}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}
    </div>
  );
};
