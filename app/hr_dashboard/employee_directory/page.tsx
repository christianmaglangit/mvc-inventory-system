'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Users, Calendar, Search, 
  Bell, LogOut, Plus, Filter, Download,
  Edit, Trash2, ChevronLeft, ChevronRight, 
  UserCircle, Menu, X
} from 'lucide-react';

// --- Mock Data para sa Employees ---
const EMPLOYEE_DB = [
  { id: 'MVC-2024-001', name: 'Juan Dela Cruz', dept: 'Operations', position: 'Plant Supervisor', email: 'j.delacruz@mvc.com.ph', status: 'Active', joined: 'Jan 2024' },
  { id: 'MVC-2024-042', name: 'Maria Santos', dept: 'Engineering', position: 'Senior Engineer', email: 'm.santos@mvc.com.ph', status: 'Active', joined: 'Mar 2024' },
  { id: 'MVC-2025-012', name: 'Rico Blanco', dept: 'Finance', position: 'Accountant', email: 'r.blanco@mvc.com.ph', status: 'On Leave', joined: 'Jan 2025' },
  { id: 'MVC-2023-088', name: 'Ely Buendia', dept: 'MIS', position: 'IT Support', email: 'e.buendia@mvc.com.ph', status: 'Active', joined: 'Nov 2023' },
  { id: 'MVC-2025-005', name: 'Liza Soberano', dept: 'HR Dept.', position: 'HR Assistant', email: 'l.soberano@mvc.com.ph', status: 'Probation', joined: 'Feb 2026' },
];

export default function EmployeeDirectory() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile Nav State

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
      else router.push('/');
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const displayName = user?.user_metadata?.full_name || 'HR Manager';
  const displayRole = user?.user_metadata?.department || 'Human Resources';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden relative">
      
      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
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
          <button className="lg:hidden text-slate-400 p-1" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="HR Overview" 
            onClick={() => router.push('/hr_dashboard')} 
          />
          <NavItem 
            icon={<Users size={18} />} 
            label="Employee Directory" 
            active={true} 
          />
          <NavItem 
            icon={<Calendar size={18} />} 
            label="Attendance & Leaves" 
          />
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-xs font-bold text-slate-500 hover:text-red-900 hover:bg-red-50 group border border-transparent">
             <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
             <span>Sign Out</span>
           </button>
           
           <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 border border-slate-200">
             <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center font-black text-red-800 text-[10px] shrink-0">{initials}</div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
               <p className="text-[10px] text-slate-500 truncate font-medium">{displayRole}</p>
             </div>
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 md:px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            {/* HAMBURGER TOGGLE */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-md lg:hidden hover:bg-slate-100 text-slate-600"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm md:text-lg font-bold text-slate-800 tracking-tight">Employee Directory</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-red-900" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-slate-100 border border-slate-200 rounded-md py-2 pl-9 pr-4 text-xs w-40 md:w-64 focus:outline-none focus:bg-white transition-all shadow-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 text-slate-500 hover:text-red-900 transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-600 rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 space-y-6 custom-scrollbar">
          
          {/* Action Toolbar - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex gap-2">
              <button className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 hover:bg-slate-100">
                <Filter size={14} /> Filter
              </button>
              <button className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 hover:bg-slate-100">
                <Download size={14} /> Export
              </button>
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-900 text-white rounded-md text-[10px] font-bold shadow-md hover:bg-red-800 transition-all">
              <Plus size={16} /> Add New Employee
            </button>
          </div>

          {/* Employee Table */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap min-w-max">
                <thead className="bg-slate-50 uppercase tracking-wider font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Employee Name</th>
                    <th className="px-6 py-4">Employee ID</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Position</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-center sticky right-0 bg-slate-50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {EMPLOYEE_DB.filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase())).map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 bg-white sticky left-0 z-10 transition-colors group-hover:bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-red-900 group-hover:bg-red-50 transition-colors">
                            <UserCircle size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{emp.name}</p>
                            <p className="text-[10px] text-slate-400">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium">{emp.id}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium">{emp.dept}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{emp.position}</td>
                      <td className="px-6 py-4"><Badge status={emp.status} /></td>
                      <td className="px-6 py-4 text-slate-500">{emp.joined}</td>
                      <td className="px-6 py-4 sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-900"><Edit size={14} /></button>
                          <button className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-900"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - Mobile Friendly */}
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 gap-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase text-center">Showing 5 of 342 Employees</span>
              <div className="flex items-center gap-2">
                <button className="p-1.5 border rounded bg-white disabled:opacity-50 hover:bg-slate-50 transition-colors"><ChevronLeft size={16} /></button>
                <div className="flex gap-1">
                  {[1, 2, 3].map(p => (
                    <button key={p} className={`w-7 h-7 text-[10px] font-bold rounded border ${p === 1 ? 'bg-red-900 text-white border-red-900' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>{p}</button>
                  ))}
                </div>
                <button className="p-1.5 border rounded bg-white disabled:opacity-50 hover:bg-slate-50 transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 10px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; border: 2px solid #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}

// --- Helper Components ---

function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-xs font-medium group relative overflow-hidden ${active ? 'bg-red-50 text-red-900 font-bold border-l-4 border-red-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function Badge({ status }: { status: string }) {
  const styles: any = {
    'Active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'On Leave': 'bg-amber-100 text-amber-700 border-amber-200',
    'Probation': 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
}