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
    // Check initial session
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

    // Listen for Auth Changes (This fixes the "stuck" loading)
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950">
      <Activity className="animate-spin text-red-600 mb-4" size={40} />
      <p className="text-slate-400 text-sm font-mono tracking-widest uppercase">Initializing MVC Systems...</p>
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
        setAuthLoading(false); // Reset if error occurs
      }
      // If success, the onAuthStateChange in the parent component will handle redirect
    } catch (err) {
      setAuthLoading(false);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 bg-slate-900 p-10 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-950/30 rounded-xl flex items-center justify-center border border-red-900/50 p-2">
               <img 
                 src="/mvc-logo.png" 
                 alt="MVC Logo" 
                 className="w-full h-full object-contain"
                 onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/150?text=MVC+LOGO" }}
               />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">MVC Login</h2>
            <p className="text-red-600 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">Mabuhay Vinyl Corporation</p>
          </div>
        </div>
        
        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Corporate Email</label>
            <input 
              type="email" 
              required 
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-red-600 transition-all placeholder:text-slate-600" 
              placeholder="name@mvc.com.ph" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Password</label>
            <input 
              type="password" 
              required 
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-red-600 transition-all placeholder:text-slate-600" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            disabled={authLoading} 
            type="submit" 
            className="w-full py-3.5 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-950/50 active:scale-[0.98]"
          >
            {authLoading ? (
              <>
                <Activity className="animate-spin" size={18} />
                <span className="tracking-widest uppercase text-xs">Authenticating...</span>
              </>
            ) : (
              <span className="tracking-widest uppercase text-xs font-black">Sign In</span>
            )}
          </button>
        </form>
        
        <div className="text-center">
          <button onClick={onSignUpClick} className="text-xs text-slate-500 hover:text-red-500 transition-colors uppercase font-bold tracking-widest">
            Create New Account
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
    <div className="min-h-screen flex bg-slate-950 items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 p-10 rounded-2xl border border-slate-800 shadow-2xl">
        <h2 className="text-xl font-black text-white text-center mb-8 uppercase tracking-tighter">Registration</h2>
        <form className="space-y-4" onSubmit={handleSignUp}>
          <input placeholder="Full Name" required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-red-600" onChange={e => setFormData({...formData, fullName: e.target.value})} />
          <select className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})}>
            <option value="IT Dept.">IT Dept.</option>
            <option value="HR Dept.">HR Dept.</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Operations">Operations</option>
            <option value="Logistics">Logistics</option>
          </select>
          <input type="email" placeholder="Email Address" required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-red-600" onChange={e => setFormData({...formData, email: e.target.value})} />
          <input type="password" placeholder="Password" required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-red-600" onChange={e => setFormData({...formData, password: e.target.value})} />
          <button disabled={authLoading} className="w-full py-3.5 bg-white text-black rounded-lg font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">
            {authLoading ? 'Creating Account...' : 'Register Account'}
          </button>
          <button type="button" onClick={onSignInClick} className="w-full text-center text-xs text-slate-500 font-bold uppercase mt-2">Back to Login</button>
        </form>
      </div>
    </div>
  );
}