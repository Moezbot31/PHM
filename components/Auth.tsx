
import React, { useState } from 'react';
import { UserRole, User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  isAdminMode?: boolean;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, isAdminMode = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Role Logic Simulation
    let role = UserRole.CUSTOMER;
    if (isAdminMode) {
      if (email.includes('super')) role = UserRole.SUPER_ADMIN;
      else if (email.includes('admin')) role = UserRole.BUSINESS_ADMIN;
      else if (email.includes('staff')) role = UserRole.STAFF;
      else {
        setError("Invalid administrative credentials. Use provisioned staff or admin email.");
        return;
      }
    }
    
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role: role,
      isSubscribed: email.includes('pro'),
      wishlist: [],
      history: []
    };
    onLogin(mockUser);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className={`bg-white/40 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden border-2 p-10 transition-all ${isAdminMode ? 'border-foreground/20' : 'border-border/50'}`}>
        <div className="text-center mb-10">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto text-2xl mb-6 transition-colors ${isAdminMode ? 'bg-foreground text-white shadow-lg shadow-foreground/20' : 'bg-success/10 text-success'}`}>
            <i className={`fas ${isAdminMode ? 'fa-user-shield' : 'fa-user-circle'}`} />
          </div>
          <h2 className="text-3xl font-black text-foreground tracking-tight font-display">
            {isAdminMode ? 'Internal Portal' : (isLogin ? 'Welcome Back' : 'Join FloraVision')}
          </h2>
          <p className="text-muted-foreground font-black text-[10px] uppercase mt-2 tracking-[0.2em]">
            {isAdminMode ? 'Staff & Administration Login' : 'Experience the future of horticulture'}
          </p>
          
          {error && (
            <div className="mt-6 p-4 bg-danger/10 text-danger rounded-2xl text-[10px] font-black uppercase tracking-wider animate-in shake-in border border-danger/20">
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase ml-2 tracking-widest">Email Identity</label>
            <input 
              type="email" required placeholder={isAdminMode ? "staff.name@flora.com" : "customer@garden.com"}
              className="w-full p-4 bg-primary/5 border-2 border-transparent focus:border-success/50 rounded-2xl outline-none transition-all font-bold text-foreground shadow-sm focus:bg-white"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase ml-2 tracking-widest">Password</label>
            <input 
              type="password" required placeholder="••••••••"
              className="w-full p-4 bg-primary/5 border-2 border-transparent focus:border-success/50 rounded-2xl outline-none transition-all font-bold text-foreground shadow-sm focus:bg-white"
            />
          </div>
          
          <button type="submit" className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl ${isAdminMode ? 'bg-primary hover:bg-primary/90 shadow-primary/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'} text-white transform hover:scale-[1.02] active:scale-[0.98]`}>
            {isAdminMode ? 'AUTHORIZE' : (isLogin ? 'SIGN IN' : 'REGISTER')}
          </button>

          {!isAdminMode && (
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-center text-[11px] font-black text-success uppercase tracking-widest hover:text-success/80 transition-colors">
              {isLogin ? "New here? Sign Up" : "Back to Login"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
