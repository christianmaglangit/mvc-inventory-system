'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, HardDrive, Server, Activity, Laptop, 
  AlertTriangle, CheckCircle2, Clock, ShieldAlert, ArrowUpRight, 
  Search, Bell, LogOut, Loader2
} from 'lucide-react';

export default function SummaryDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // --- States para sa actual data ---
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activePC: 0,
    partsInStorage: 0,
    alerts: [] as any[]
  });

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      
      // 1. Get User Session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      const currentUser = session.user;
      setUser(currentUser);

      try {
        // 2. Fetch Personal Computer Count (Only yours)
        const { count: pcCount, data: pcData } = await supabase
          .from('inventory_pc')
          .select('*', { count: 'exact' })
          .eq('user_id', currentUser.id);

        // 3. Fetch Computer Parts Count (Only yours)
        const { count: partsCount } = await supabase
          .from('inventory_computer_parts')
          .select('*', { count: 'exact' })
          .eq('user_id', currentUser.id);

        // 4. Filter Alerts (Example: Kaspersky Not Active)
        const expiredKaspersky = pcData?.filter(pc => 
          pc.kaspersky?.toLowerCase().includes('not active')
        ) || [];

        setStats({
          totalEquipment: (pcCount || 0) + (partsCount || 0),
          activePC: pcCount || 0,
          partsInStorage: partsCount || 0,
          alerts: expiredKaspersky
        });

      } catch (error) {
        console.error("Error connecting inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const displayName = user?.user_metadata?.full_name || 'MIS User';
  const displayRole = user?.user_metadata?.department || 'IT Department';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 z-20 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-900 rounded flex items-center justify-center shadow-md">
              <Server className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-red-900">MVC.IS</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="Overview" active={true} />
          <NavItem icon={<HardDrive size={18} />} label="Inventory Data" onClick={() => router.push('/mis_dashboard/inventory')} />
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-bold text-slate-500 hover:text-red-900 hover:bg-red-50 group border border-transparent">
             <LogOut size={18} /> <span>Sign Out</span>
           </button>
           <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 border border-slate-200">
             <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center font-black text-red-800 text-[10px] shrink-0">{initials}</div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-bold truncate">{displayName}</p>
               <p className="text-[10px] text-slate-500 truncate">{displayRole}</p>
             </div>
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">System Summary</h1>
            <span className="h-4 w-px bg-slate-200"></span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Data
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8 space-y-6 custom-scrollbar">
          {loading ? (
            <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-red-900" size={32}/></div>
          ) : (
            <>
              {/* KPI Cards Connected to Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard title="Total Assets" value={stats.totalEquipment} trend="Personal items tracked" icon={<HardDrive size={20} />} color="blue" />
                <KpiCard title="Personal Computers" value={stats.activePC} trend="Currently Deployed" icon={<Laptop size={20} />} color="emerald" />
                <KpiCard title="Parts in Storage" value={stats.partsInStorage} trend="In MIS Office" icon={<Activity size={20} />} color="amber" />
                <KpiCard title="Alerts" value={stats.alerts.length} trend="Needs Attention" icon={<AlertTriangle size={20} />} color="red" isAlert={stats.alerts.length > 0} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Distribution Bar */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Inventory Breakdown</h3>
                    <div className="space-y-5">
                      <CategoryBar label="Workstations (PC)" count={stats.activePC} percentage={(stats.activePC / stats.totalEquipment) * 100 || 0} color="bg-blue-600" />
                      <CategoryBar label="Spare Parts / Storage" count={stats.partsInStorage} percentage={(stats.partsInStorage / stats.totalEquipment) * 100 || 0} color="bg-amber-500" />
                    </div>
                </div>

                {/* Action Center - Real Alerts */}
                <div className="lg:col-span-1 bg-white border border-red-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-red-50 border-b border-red-100 p-4 flex items-center gap-2">
                      <ShieldAlert size={18} className="text-red-700" />
                      <h3 className="font-bold text-red-900">Action Center</h3>
                    </div>
                    <div className="p-2 divide-y divide-slate-100">
                      {stats.alerts.length > 0 ? stats.alerts.map((alert, idx) => (
                        <AlertItem key={idx} title="Kaspersky Expired" desc={`User: ${alert.user_full_name}`} type="critical" />
                      )) : (
                        <div className="p-4 text-center text-xs text-slate-400 italic">No critical alerts for now.</div>
                      )}
                    </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// --- KPI & Helper Components (Parehas ra sa imong style) ---
function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-xs font-medium relative ${active ? 'bg-red-50 text-red-900 font-bold border-l-4 border-red-900' : 'text-slate-500 hover:bg-slate-50'}`}>
      {icon} {label}
    </button>
  );
}

function KpiCard({ title, value, trend, icon, color, isAlert }: any) {
  return (
    <div className={`p-5 rounded-lg border bg-white shadow-sm ${isAlert ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
      <div className="flex justify-between items-start mb-2 text-slate-500">
        <h3 className="text-[10px] font-bold uppercase tracking-widest">{title}</h3>
        <div className={`p-1.5 rounded-md ${color === 'blue' ? 'bg-blue-100 text-blue-700' : color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : color === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      <p className="text-[10px] mt-2 text-slate-500 font-medium">{trend}</p>
    </div>
  );
}

function CategoryBar({ label, count, percentage, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold mb-1.5">
        <span>{label}</span>
        <span className="text-slate-500">{count} items</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function AlertItem({ title, desc, type }: any) {
  return (
    <div className="p-3 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${type === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></span>
        <span className="text-xs font-bold">{title}</span>
      </div>
      <p className="text-[10px] text-slate-500 ml-4">{desc}</p>
    </div>
  );
}