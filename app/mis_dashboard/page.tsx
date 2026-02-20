'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Settings, 
  Search, 
  Bell, 
  HardDrive,
  Server,
  Network,
  Activity,
  Laptop,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  Plus
} from 'lucide-react';

export default function SummaryDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-900 selection:text-white overflow-hidden">
      
      {/* --- Sidebar --- */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 z-20 shadow-sm">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-900 rounded flex items-center justify-center shadow-md">
              <Server className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-red-900">MVC<span className="text-slate-400 font-normal">.MIS</span></span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={18} />} 
            label="Overview" 
            active={activeTab === 'Dashboard'} 
            onClick={() => setActiveTab('Dashboard')} 
          />
          <NavItem 
            icon={<HardDrive size={18} />} 
            label="Inventory Data" 
            active={activeTab === 'Inventory'} 
            onClick={() => router.push('/mis_dashboard/inventory')} 
          />
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-100">

           <div className="mt-4 flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 border border-slate-200">
             <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center font-bold text-red-800 text-xs border border-red-200">
               JD
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-slate-900 truncate">Sample Name</p>
               <p className="text-[10px] text-slate-500 truncate">IT Technician</p>
             </div>
           </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Dashboard</h1>
            <span className="h-4 w-px bg-slate-200"></span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Systems Normal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-red-900 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Quick search..." 
                className="bg-slate-100 border border-slate-200 rounded-md py-2 pl-9 pr-4 text-xs w-64 text-slate-700 focus:outline-none focus:border-red-900/30 focus:ring-1 focus:ring-red-900/30 transition-all placeholder:text-slate-400 focus:bg-white"
              />
            </div>
            <button className="p-2 text-slate-500 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-600 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-6 md:p-8 space-y-6 custom-scrollbar">
          
          {/* Top Level KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Total IT Equipment" value="1,452" trend="+12 this month" icon={<HardDrive size={20} />} color="blue" />
            <KpiCard title="Actively Deployed" value="1,120" trend="85% Utilization" icon={<CheckCircle2 size={20} />} color="emerald" />
            <KpiCard title="In Maintenance" value="15" trend="3 Pending Repair" icon={<Activity size={20} />} color="amber" />
            <KpiCard title="Action Required" value="8" trend="Licenses / Low Stock" icon={<AlertTriangle size={20} />} color="red" isAlert />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (Wider) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Category Breakdown */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800">Inventory Distribution by Category</h3>
                  <button onClick={() => router.push('/dashboard/inventory')} className="text-xs font-semibold text-red-900 hover:underline flex items-center gap-1">
                    View Full Inventory <ArrowUpRight size={14} />
                  </button>
                </div>
                
                <div className="space-y-5">
                  <CategoryBar label="Workstations (PCs & Laptops)" count="420" percentage={65} color="bg-blue-600" />
                  <CategoryBar label="Network Infrastructure (Switches, APs)" count="145" percentage={25} color="bg-indigo-600" />
                  <CategoryBar label="Peripherals (Monitors, Printers)" count="850" percentage={85} color="bg-emerald-600" />
                  <CategoryBar label="Servers & Storage" count="37" percentage={10} color="bg-slate-700" />
                </div>
              </div>

              {/* Recent Activity Log */}
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Recent IT Activity</h3>
                <div className="space-y-4">
                  <ActivityItem 
                    action="Equipment Deployed" 
                    desc="Dell XPS 15 assigned to Maria Santos (Engineering)" 
                    time="10 mins ago" 
                    icon={<Laptop size={14} className="text-emerald-600" />} 
                    bg="bg-emerald-100" 
                  />
                  <ActivityItem 
                    action="Maintenance Updated" 
                    desc="Epson L3210 Printer moved to 'In Repair'" 
                    time="2 hours ago" 
                    icon={<Settings size={14} className="text-amber-600" />} 
                    bg="bg-amber-100" 
                  />
                  <ActivityItem 
                    action="New Equipment Added" 
                    desc="Batch of 10 Ubiquiti U6 Pro APs registered to DB" 
                    time="Yesterday" 
                    icon={<Plus size={14} className="text-blue-600" />} 
                    bg="bg-blue-100" 
                  />
                </div>
              </div>

            </div>

            {/* Right Column (Narrower) */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Critical Alerts Panel */}
              <div className="bg-white border border-red-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-red-50 border-b border-red-100 p-4 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-red-700" />
                  <h3 className="font-bold text-red-900">Action Center</h3>
                </div>
                <div className="p-2">
                  <AlertItem 
                    title="Kaspersky Expired" 
                    desc="Logistics PC (IP: 192.168.3.12)" 
                    type="critical" 
                  />
                  <AlertItem 
                    title="Low Stock Warning" 
                    desc="Only 2 Cisco 9200 Switches remaining" 
                    type="warning" 
                  />
                  <AlertItem 
                    title="Maintenance Overdue" 
                    desc="Server Rack UPS battery requires replacement" 
                    type="warning" 
                  />
                </div>
              </div>

              {/* Department Allocation Summary */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Equipment by Department</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Finance</span>
                    <span className="font-bold text-slate-900">124</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Engineering / Ops</span>
                    <span className="font-bold text-slate-900">85</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Logistics & Supply</span>
                    <span className="font-bold text-slate-900">62</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 font-medium">Human Resources</span>
                    <span className="font-bold text-slate-900">45</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Custom Scrollbar CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}

// --- Component Library for Summary View ---

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-xs font-medium group relative overflow-hidden
      ${active 
        ? 'bg-red-50 text-red-900 font-bold' 
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }`}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-900"></div>}
      <span className={`relative z-10 transition-transform ${active ? 'translate-x-1' : ''}`}>{icon}</span>
      <span className={`relative z-10 transition-transform ${active ? 'translate-x-1' : ''}`}>{label}</span>
    </button>
  );
}

function KpiCard({ title, value, trend, icon, color, isAlert }: any) {
  return (
    <div className={`p-5 rounded-lg border transition-all shadow-sm bg-white
      ${isAlert ? 'border-red-200' : 'border-slate-200'}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wide">{title}</h3>
        <div className={`p-1.5 rounded-md 
          ${color === 'blue' ? 'bg-blue-100 text-blue-700' : 
            color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 
            color === 'amber' ? 'bg-amber-100 text-amber-700' : 
            'bg-red-100 text-red-700'}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
      <p className={`text-xs mt-2 font-medium ${isAlert ? 'text-red-600' : 'text-slate-500'}`}>{trend}</p>
    </div>
  );
}

function CategoryBar({ label, count, percentage, color }: any) {
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold mb-1.5">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-900">{count} units</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}

function ActivityItem({ action, desc, time, icon, bg }: any) {
  return (
    <div className="flex gap-4 p-3 rounded-md hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-800">{action}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium h-fit">
        <Clock size={10} />
        {time}
      </div>
    </div>
  );
}

function AlertItem({ title, desc, type }: { title: string, desc: string, type: 'critical' | 'warning' }) {
  return (
    <div className="p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer">
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full ${type === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></span>
        <span className={`text-xs font-bold ${type === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>{title}</span>
      </div>
      <p className="text-xs text-slate-600 pl-4">{desc}</p>
    </div>
  );
}