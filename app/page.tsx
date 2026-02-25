'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Activity, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function MVCApp() {
  // Added 'forgot' to the allowed views
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'forgot'>('login');
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
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

  // Router logic for the three views
  if (currentView === 'signup') {
    return <SignUpPage onSignInClick={() => setCurrentView('login')} onSignUpSuccess={() => setCurrentView('login')} />;
  }
  
  if (currentView === 'forgot') {
    return <ForgotPasswordPage onBackToLogin={() => setCurrentView('login')} />;
  }

  return <LoginPage onSignUpClick={() => setCurrentView('signup')} onForgotClick={() => setCurrentView('forgot')} />;
}

function LoginPage({ onSignUpClick, onForgotClick }: { onSignUpClick: () => void, onForgotClick: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;
    setAuthLoading(true);
    setNotification(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setNotification({ type: 'error', message: error.message });
        setAuthLoading(false);
      }
    } catch (err) {
      setAuthLoading(false);
      setNotification({ type: 'error', message: "An unexpected error occurred." });
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 p-2">
               <img 
                 src="/images/mvc-logo.png" 
                 alt="MVC Logo" 
                 className="w-full h-full object-contain"
                 onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/150?text=MVC+LOGO" }}
               />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Sign In</h2>
            <p className="text-red-700 text-[10px] font-bold tracking-[0.25em] uppercase mt-1">Mabuhay Vinyl Corporation</p>
          </div>
        </div>
        
        <form className="space-y-4" onSubmit={handleLogin}>
          {notification && (
            <div className={`p-3 rounded-xl flex items-start gap-2 text-xs font-bold leading-relaxed ${notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
              {notification.type === 'error' ? <AlertCircle size={16} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={16} className="shrink-0 mt-0.5" />}
              <span>{notification.message}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Corporate Email</label>
            <input 
              type="email" 
              required 
              onChange={(e) => { setEmail(e.target.value); setNotification(null); }} 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-red-700/10 focus:border-red-700 transition-all placeholder:text-slate-400 text-sm" 
              placeholder="name@gmail.com" 
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
              {/* Added Forgot Password Link right above the input */}
              <button type="button" onClick={onForgotClick} className="text-[10px] font-bold text-slate-400 hover:text-red-700 transition-colors uppercase">
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                onChange={(e) => { setPassword(e.target.value); setNotification(null); }} 
                className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-red-700/10 focus:border-red-700 transition-all placeholder:text-slate-400 text-sm" 
                placeholder="••••••••" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-700 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <button 
            disabled={authLoading} 
            type="submit" 
            className="w-full py-3 bg-red-800 hover:bg-red-900 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 active:scale-[0.98]"
          >
            {authLoading ? (
              <Activity className="animate-spin" size={16} />
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
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setNotification(null);

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
    } catch (err) {
      setNotification({ type: 'error', message: 'An unexpected error occurred during registration.' });
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-3 mb-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 p-2">
               <img 
                 src="/images/mvc-logo.png" 
                 alt="MVC Logo" 
                 className="w-full h-full object-contain"
                 onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/150?text=MVC+LOGO" }}
               />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Registration</h2>
            <p className="text-red-700 text-[10px] font-bold tracking-[0.25em] uppercase mt-1">Mabuhay Vinyl Corporation</p>
          </div>
        </div>
        
        <form className="space-y-4" onSubmit={handleSignUp}>
          {notification && (
            <div className={`p-3 rounded-xl flex items-start gap-2 text-xs font-bold leading-relaxed ${notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
              {notification.type === 'error' ? <AlertCircle size={16} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={16} className="shrink-0 mt-0.5" />}
              <span>{notification.message}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Full Name</label>
            <input 
              placeholder="Juan Dela Cruz" 
              required 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-red-800 text-sm" 
              value={formData.fullName} // <-- Added value prop to control the input
              onChange={e => { 
                // Auto-capitalize the first letter of each word
                const formattedName = e.target.value.replace(/\b\w/g, char => char.toUpperCase());
                setFormData({...formData, fullName: formattedName}); 
                setNotification(null); 
              }} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Department</label>
            <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none text-sm appearance-none cursor-pointer" value={formData.dept} onChange={e => setFormData({...formData, dept: e.target.value})}>
              <option value="IT Dept.">IT Dept.</option>
              <option value="HR Dept.">HR Dept.</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Email</label>
            <input type="email" placeholder="name@gmail.com" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-red-800 text-sm" onChange={e => { setFormData({...formData, email: e.target.value}); setNotification(null); }} />
          </div>

          <div className="space-y-1 relative">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Password</label>
            <div className="relative">
               <input 
                 type={showPassword ? "text" : "password"} 
                 placeholder="••••••••" 
                 required 
                 className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-red-800 text-sm" 
                 onChange={e => { setFormData({...formData, password: e.target.value}); setNotification(null); }} 
               />
               <button
                 type="button"
                 onClick={() => setShowPassword(!showPassword)}
                 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 transition-colors"
               >
                 {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
               </button>
            </div>
          </div>
          
          <button disabled={authLoading} className="w-full py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-900/20 mt-2">
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

// Added ForgotPasswordPage component
function ForgotPasswordPage({ onBackToLogin }: { onBackToLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'error' | 'success', message: string } | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setNotification(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`, 
      });
      
      if (error) {
        setNotification({ type: 'error', message: error.message });
      } else {
        setNotification({ type: 'success', message: 'Password reset link sent! Please check your email.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: "An unexpected error occurred." });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 p-2">
               <img 
                 src="/images/mvc-logo.png" 
                 alt="MVC Logo" 
                 className="w-full h-full object-contain"
                 onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/150?text=MVC+LOGO" }}
               />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Reset Password</h2>
            <p className="text-red-700 text-[10px] font-bold tracking-[0.25em] uppercase mt-1">Mabuhay Vinyl Corporation</p>
          </div>
        </div>
        
        <form className="space-y-4" onSubmit={handleResetPassword}>
          {notification && (
            <div className={`p-3 rounded-xl flex items-start gap-2 text-xs font-bold leading-relaxed ${notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
              {notification.type === 'error' ? <AlertCircle size={16} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={16} className="shrink-0 mt-0.5" />}
              <span>{notification.message}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Corporate Email</label>
            <input 
              type="email" 
              required 
              onChange={(e) => { setEmail(e.target.value); setNotification(null); }} 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-red-700/10 focus:border-red-700 transition-all placeholder:text-slate-400 text-sm" 
              placeholder="name@gmail.com" 
            />
          </div>

          <button 
            disabled={authLoading} 
            type="submit" 
            className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-[0.98] mt-2"
          >
            {authLoading ? (
              <Activity className="animate-spin" size={16} />
            ) : (
              <span className="tracking-widest uppercase text-xs font-black">Send Reset Link</span>
            )}
          </button>
        </form>
        
        <div className="text-center pt-4 border-t border-slate-100">
          <button onClick={onBackToLogin} className="text-[10px] text-slate-400 hover:text-red-700 transition-colors uppercase font-black tracking-widest">
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
}