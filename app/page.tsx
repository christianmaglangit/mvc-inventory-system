'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Activity } from 'lucide-react';

export default function MVCApp() {
  const [currentView, setCurrentView] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const redirectUser = (user: any) => {
    if (!user) return;
    const dept = user?.user_metadata?.department;
    const routes: Record<string, string> = {
      'IT Dept.': '/mis_dashboard',
      'HR Dept.': '/hr_dashboard',
      'Finance': '/finance_dashboard',
      'Marketing': '/marketing_dashboard',
      'Operations': '/operations_dashboard',
      'Logistics': '/logistics_dashboard'
    };
    
    const target = routes[dept] || '/dashboard';
    router.push(target);
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          redirectUser(user);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        redirectUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Activity className="animate-spin text-red-700 mb-4" size={40} />
      <p className="text-slate-500 text-sm font-mono tracking-widest uppercase italic">Initializing MVC Systems...</p>
    </div>
  );

  return currentView === 'signup' ? (
    <SignUpPage onSignInClick={() => setCurrentView('login')} onSignUpSuccess={() => setCurrentView('login')} />
  ) : (
    <LoginPage onSignUpClick={() => setCurrentView('signup')} />
  );
}

function LoginPage({ onSignUpClick }: { onSignUpClick: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;
    setAuthLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message);
        setAuthLoading(false);
      }
    } catch (err) {
      setAuthLoading(false);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 p-3">
               <img 
                 src="/images/mvc-logo.png" 
                 alt="MVC Logo" 
                 className="w-full h-full object-contain"
                 onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/150?text=MVC+LOGO" }}
               />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Sign In</h2>
            <p className="text-red-700 text-[11px] font-bold tracking-[0.25em] uppercase mt-1">Mabuhay Vinyl Corporation</p>
          </div>
        </div>
        
        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Corporate Email</label>
            <input 
              type="email" 
              required 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-red-700/10 focus:border-red-700 transition-all placeholder:text-slate-400 text-sm" 
              placeholder="name@mvc.com.ph" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Password</label>
            <input 
              type="password" 
              required 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-red-700/10 focus:border-red-700 transition-all placeholder:text-slate-400 text-sm" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            disabled={authLoading} 
            type="submit" 
            className="w-full py-4 bg-red-800 hover:bg-red-900 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-900/20 active:scale-[0.98]"
          >
            {authLoading ? (
              <Activity className="animate-spin" size={18} />
            ) : (
              <span className="tracking-widest uppercase text-xs font-black">Secure Login</span>
            )}
          </button>
        </form>
        
        <div className="text-center pt-4 border-t border-slate-100">
          <button onClick={onSignUpClick} className="text-[10px] text-slate-400 hover:text-red-700 transition-colors uppercase font-black tracking-widest">
            Create Access Account
          </button>
        </div>
      </div>
    </div>
  );
}

function SignUpPage({ onSignInClick, onSignUpSuccess }: { onSignInClick: () => void, onSignUpSuccess: () => void }) {
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', dept: 'IT Dept.' });
  const [authLoading, setAuthLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { 
          data: { 
            full_name: formData.fullName, 
            department: formData.dept 
          } 
        }
      });
      if (error) {
        alert(error.message);
        setAuthLoading(false);
      } else { 
        alert('Verification email sent! Check your inbox.'); 
        onSignUpSuccess(); 
      }
    } catch (err) {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <h2 className="text-2xl font-black text-slate-900 text-center mb-8 uppercase tracking-tighter italic border-b-4 border-red-800 pb-2 w-fit mx-auto">Registration</h2>
        <form className="space-y-4" onSubmit={handleSignUp}>
          <input placeholder="Full Name" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-red-800 text-sm" onChange={e => setFormData({...formData, fullName: e.target.value})} />
          
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Department</label>
            <select className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none text-sm appearance-none cursor-pointer" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})}>
              <option value="IT Dept.">IT Dept.</option>
              <option value="HR Dept.">HR Dept.</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
              <option value="Logistics">Logistics</option>
            </select>
          </div>

          <input type="email" placeholder="Email Address" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-red-800 text-sm" onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-red-800 text-sm" onChange={e => setFormData({...formData, password: e.target.value})} />
          
          <button disabled={authLoading} className="w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/20">
            {authLoading ? 'Syncing...' : 'Initialize Account'}
          </button>
          
          <button type="button" onClick={onSignInClick} className="w-full text-center text-[10px] text-slate-400 font-black uppercase mt-4 tracking-tighter hover:text-red-700 transition-colors">
            Already registered? Return to Login
          </button>
        </form>
      </div>
    </div>
  );
}