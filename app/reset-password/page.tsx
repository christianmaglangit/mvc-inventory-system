'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Activity, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setNotification({ type: 'success', message: 'Ready to reset your password. Please enter a new one below.' });
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;
    
    if (password !== confirmPassword) {
      setNotification({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setAuthLoading(true);
    setNotification(null);

    try {
      // 1. Update the password
      const { error } = await supabase.auth.updateUser({ password: password });
      
      if (error) {
        setNotification({ type: 'error', message: error.message });
      } else {
        // 2. FORCE SIGN OUT: I-logout diritso ang user aron dili siya maka-sulod sa dashboard
        await supabase.auth.signOut();

        setNotification({ type: 'success', message: 'Password updated successfully! Redirecting to login...' });
        
        // 3. I-balik sa Main Login Page human sa 3 ka segundo
        setTimeout(() => {
          router.push('/'); 
        }, 3000);
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
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Set New Password</h2>
            <p className="text-red-700 text-[10px] font-bold tracking-[0.25em] uppercase mt-1">Mabuhay Vinyl Corporation</p>
          </div>
        </div>
        
        <form className="space-y-4" onSubmit={handleUpdatePassword}>
          {notification && (
            <div className={`p-3 rounded-xl flex items-start gap-2 text-xs font-bold leading-relaxed ${notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
              {notification.type === 'error' ? <AlertCircle size={16} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={16} className="shrink-0 mt-0.5" />}
              <span>{notification.message}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">New Password</label>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-800 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Confirm Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                onChange={(e) => { setConfirmPassword(e.target.value); setNotification(null); }} 
                className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:ring-2 focus:ring-red-700/10 focus:border-red-700 transition-all placeholder:text-slate-400 text-sm" 
                placeholder="••••••••" 
              />
            </div>
          </div>
          
          <button 
            disabled={authLoading} 
            type="submit" 
            className="w-full py-3 bg-red-800 hover:bg-red-900 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 active:scale-[0.98] mt-2"
          >
            {authLoading ? (
              <Activity className="animate-spin" size={16} />
            ) : (
              <span className="tracking-widest uppercase text-xs font-black">Update Password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}