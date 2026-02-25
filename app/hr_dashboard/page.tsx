'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Users, UserPlus, FileBadge, Calendar, 
  Search, Bell, LogOut, ArrowUpRight, TrendingUp,
  Briefcase, Menu, X
} from 'lucide-react';

export default function HRDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Menu State

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
      else router.push('/');
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) router.push('/');
    else alert("Error logging out");
  };

  const displayName = user?.user_metadata?.full_name || 'HR Manager';
  const displayRole = user?.user_metadata?.department || 'Human Resources';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-red-900 selection:text-white relative">
      
      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR (RESPONSIVE) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-900 rounded flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-red-900">MVC<span className="text-slate-400 font-normal">.HR</span></span>
          </div>
          {/* Close for mobile */}
          <button className="lg:hidden text-slate-400 hover:text-red-900 transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="HR Overview" 
            active={activeTab === 'Dashboard'} 
            onClick={() => { setActiveTab('Dashboard'); setIsSidebarOpen(false); }} 
          />
          <NavItem 
            icon={<Users size={18} />} 
            label="Employee Directory" 
            active={activeTab === 'Directory'} 
            onClick={() => router.push('/hr_dashboard/employee_directory')}
          />
          <NavItem 
            icon={<Calendar size={18} />} 
            label="Attendance & Leaves" 
            active={activeTab === 'Attendance'} 
            onClick={() => { setActiveTab('Attendance'); setIsSidebarOpen(false); }} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-xs font-bold text-slate-500 hover:text-red-900 hover:bg-red-50 group border border-transparent hover:border-red-100"
           >
             <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
             <span>Sign Out</span>
           </button>
           
           <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 border border-slate-200">
             <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center font-black text-red-800 text-[10px] border border-red-200 shrink-0">
               {initials}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
               <p className="text-[10px] text-slate-500 truncate font-medium">{displayRole}</p>
             </div>
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            {/* HAMBURGER BUTTON */}
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-red-900 hover:bg-slate-50 rounded-md transition-all"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            <h1 className="text-sm md:text-lg font-bold text-slate-800 tracking-tight">HR Dashboard</h1>
            <span className="h-4 w-px bg-slate-200 hidden sm:block"></span>
            <span className="text-xs text-slate-500 font-medium hidden sm:block">Iligan Plant Operations</span>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-2 text-slate-500 hover:text-red-900 transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-600 rounded-full"></span>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 space-y-6 custom-scrollbar">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total Employees" value="342" trend="+4 this month" icon={<Users size={20} />} color="blue" />
            <KpiCard title="On Leave" value="12" trend="8 Vacation / 4 Sick" icon={<Calendar size={20} />} color="amber" />
            <KpiCard title="New Hires" value="5" trend="Onboarding Phase" icon={<UserPlus size={20} />} color="emerald" />
            <KpiCard title="Open Positions" value="8" trend="3 Urgent Priority" icon={<Briefcase size={20} />} color="indigo" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <TrendingUp size={18} className="text-red-900" />
                  Headcount by Department
                </h3>
                <div className="space-y-5">
                  <CategoryBar label="Operations (Plant)" count="180" percentage={80} color="bg-red-900" />
                  <CategoryBar label="Engineering" count="45" percentage={35} color="bg-blue-600" />
                  <CategoryBar label="Logistics" count="38" percentage={25} color="bg-amber-500" />
                  <CategoryBar label="Finance & Admin" count="32" percentage={20} color="bg-slate-700" />
                  <CategoryBar label="MIS / IT" count="12" percentage={10} color="bg-indigo-600" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Pending Leave Requests</h3>
                  <button className="text-xs font-bold text-red-900 hover:underline">Review All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b">
                      <tr>
                        <th className="px-6 py-3">Employee</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Duration</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">Rico Blanco</td>
                        <td className="px-6 py-4 text-slate-600">Vacation Leave</td>
                        <td className="px-6 py-4 text-slate-600">Feb 24 - 26</td>
                        <td className="px-6 py-4"><StatusBadge label="Pending" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                   <button 
                    onClick={() => router.push('/hr_dashboard/employee_directory')}
                    className="p-3 border border-slate-200 rounded-lg hover:border-red-900 hover:bg-red-50 transition-all flex flex-col items-center gap-2 group text-center"
                   >
                     <UserPlus className="text-slate-400 group-hover:text-red-900" size={20} />
                     <span className="text-[10px] font-bold uppercase">View Directory</span>
                   </button>
                   <button className="p-3 border border-slate-200 rounded-lg hover:border-red-900 hover:bg-red-50 transition-all flex flex-col items-center gap-2 group text-center">
                     <FileBadge className="text-slate-400 group-hover:text-red-900" size={20} />
                     <span className="text-[10px] font-bold uppercase">Gen. Report</span>
                   </button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-lg p-5 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold mb-2">Policy Update</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    The 2026 Employee Health & Safety guidelines have been updated.
                  </p>
                  <button className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1">
                    Download PDF <ArrowUpRight size={14} />
                  </button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                   <FileBadge size={100} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}} />
    </div>
  );
}

// --- HELPER COMPONENTS (UNCHANGED) ---
function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-xs font-medium group relative overflow-hidden ${active ? 'bg-red-50 text-red-900 font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-900"></div>}
      <span className={active ? 'translate-x-1 transition-transform' : ''}>{icon}</span>
      <span className={active ? 'translate-x-1 transition-transform' : ''}>{label}</span>
    </button>
  );
}

function KpiCard({ title, value, trend, icon, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    indigo: 'bg-indigo-100 text-indigo-700'
  };
  return (
    <div className="p-5 rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wide">{title}</h3>
        <div className={`p-1.5 rounded-md ${colorMap[color]}`}>{icon}</div>
      </div>
      <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      <p className="text-xs mt-2 font-medium text-slate-500">{trend}</p>
    </div>
  );
}

function CategoryBar({ label, count, percentage, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold mb-1.5">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-900">{count} Employees</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wider">
      {label}
    </span>
  );
}