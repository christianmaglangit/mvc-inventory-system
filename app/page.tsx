'use client';

import React, { useState } from 'react';
import { 
  FlaskConical, 
  Activity, 
  Ship, 
  Truck, 
  AlertTriangle, 
  Search, 
  Bell, 
  Menu,
  Factory,
  Gauge,
  User,
  Building2,
  Lock,
  Mail
} from 'lucide-react';

// --- Mock Data for MVC ---
type ChemicalStock = {
  id: string;
  product: string;
  grade: string;
  tankLevel: number; // percentage
  volume: string;
  status: 'Normal' | 'Warning' | 'Critical';
  pressure: string;
};

const TANK_DATA: ChemicalStock[] = [
  { id: 'TK-101', product: 'Caustic Soda (NaOH)', grade: 'Membrane Grade 50%', tankLevel: 85, volume: '12,450 L', status: 'Normal', pressure: '120 kPa' },
  { id: 'TK-102', product: 'Hydrochloric Acid (HCl)', grade: 'Industrial 32%', tankLevel: 42, volume: '5,200 L', status: 'Normal', pressure: '105 kPa' },
  { id: 'TK-103', product: 'Liquid Chlorine (Cl₂)', grade: '99.5% Min', tankLevel: 92, volume: '8,100 kg', status: 'Warning', pressure: '850 kPa' },
  { id: 'TK-104', product: 'Sodium Hypochlorite', grade: 'Standard', tankLevel: 24, volume: '2,400 L', status: 'Normal', pressure: '110 kPa' },
];

export default function MVCApp() {
  // State to manage which view is currently active
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'dashboard'>('login');

  // Render logic based on currentView state
  if (currentView === 'dashboard') {
    return <DashboardPage onLogout={() => setCurrentView('login')} />;
  }

  if (currentView === 'signup') {
    return (
      <SignUpPage 
        onSignInClick={() => setCurrentView('login')} 
        onSignUpSuccess={() => setCurrentView('dashboard')} 
      />
    );
  }

  // Default to Login Page
  return (
    <LoginPage 
      onSignUpClick={() => setCurrentView('signup')} 
      onLoginSuccess={() => setCurrentView('dashboard')} 
    />
  );
}

// ==========================================
// 1. LOGIN PAGE COMPONENT
// ==========================================
function LoginPage({ onSignUpClick, onLoginSuccess }: { onSignUpClick: () => void, onLoginSuccess: () => void }) {
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      
      {/* Left Side - Hero Image / Branding */}
      <div className="hidden lg:flex w-1/2 bg-red-950 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-red-900 to-slate-900 opacity-90"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative z-10 text-center text-white p-12">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full mx-auto flex items-center justify-center mb-6 border border-white/20">
            <FlaskConical size={48} className="text-red-200" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">Mabuhay Vinyl Corp.</h1>
          <p className="text-red-100 text-lg max-w-md mx-auto">
            Enhancing operational efficiency and ensuring accuracy through a reliable and intelligent inventory management system.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="inline-flex lg:hidden w-12 h-12 bg-red-900 rounded-lg items-center justify-center mb-4">
              <FlaskConical className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Sign In</h2>
            <p className="mt-2 text-slate-600">Welcome back! Please enter your details.</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); onLoginSuccess(); }}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Corporate ID / Email</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-slate-400" />
                  </div>
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    className="block w-full pl-10 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 sm:text-sm" 
                    placeholder="id@mvc.com.ph"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-slate-400" />
                  </div>
                  <input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                    className="block w-full pl-10 px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 sm:text-sm" 
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-red-900 focus:ring-red-900 border-slate-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">Remember me</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-red-900 hover:text-red-700">Forgot password?</a>
              </div>
            </div>

            <button type="submit" className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-900 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-900 transition-colors shadow-lg shadow-red-900/30">
              Sign in to Dashboard
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">Don't have an account? </span>
            <button onClick={onSignUpClick} className="font-semibold text-red-900 hover:text-red-700 transition-colors">
              Sign up for access
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-8">
            © 2026 Mabuhay Vinyl Corporation.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. SIGN UP PAGE COMPONENT (NEW)
// ==========================================
function SignUpPage({ onSignInClick, onSignUpSuccess }: { onSignInClick: () => void, onSignUpSuccess: () => void }) {
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      
      {/* Left Side - Branding (Reused) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
         <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-red-950 opacity-90"></div>
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
         
         <div className="relative z-10 text-center text-white p-12">
            <div className="w-20 h-20 bg-red-900/50 backdrop-blur-md rounded-xl mx-auto flex items-center justify-center mb-6 border border-red-500/20">
              <Activity size={40} className="text-red-200" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Join the Network</h1>
            <p className="text-slate-300 max-w-sm mx-auto">
              Create your employee account to access real-time inventory data, logistics tracking, and safety reports.
            </p>
         </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
            <p className="mt-2 text-slate-600">Register for MVC Inventory System access.</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={(e) => { e.preventDefault(); onSignUpSuccess(); }}>
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-slate-400" />
                </div>
                <input type="text" required className="block w-full pl-10 px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 sm:text-sm" placeholder="Juan Dela Cruz" />
              </div>
            </div>

            {/* Department & ID Row */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-slate-700">Department</label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 size={16} className="text-slate-400" />
                  </div>
                  <select className="block w-full pl-10 px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 sm:text-sm">
                    <option>Operations</option>
                    <option>Logistics</option>
                    <option>Safety</option>
                    <option>Management</option>
                  </select>
                </div>
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-slate-700">Corp ID</label>
                <input type="text" required className="block w-full px-3 py-2 mt-1 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 sm:text-sm" placeholder="MVC-####" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Corporate Email</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-slate-400" />
                </div>
                <input type="email" required className="block w-full pl-10 px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 sm:text-sm" placeholder="name@mvc.com.ph" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-slate-400" />
                </div>
                <input type="password" required className="block w-full pl-10 px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 sm:text-sm" placeholder="••••••••" />
              </div>
              <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters.</p>
            </div>

            <button type="submit" className="group w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors">
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center text-sm border-t border-slate-200 pt-6">
            <span className="text-slate-500">Already have an account? </span>
            <button onClick={onSignInClick} className="font-semibold text-red-900 hover:text-red-700 transition-colors">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. DASHBOARD PAGE COMPONENT
// ==========================================
function DashboardPage({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <Menu className="h-6 w-6 text-slate-500 cursor-pointer hover:text-slate-700" />
              <div className="flex items-center gap-2">
                <div className="bg-red-900 p-1.5 rounded">
                  <FlaskConical className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight text-red-900">MVC<span className="text-slate-400 font-normal">.SYS</span></span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-red-900/10 transition-all">
                <Search size={16} className="text-slate-400" />
                <input type="text" placeholder="Search Plant Data..." className="bg-transparent border-none text-sm focus:outline-none w-48 text-slate-600" />
              </div>
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-600 rounded-full"></span>
              </button>
              <div className="h-8 w-px bg-slate-200 mx-1"></div>
              <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors" onClick={onLogout}>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">Engr. J. Dela Cruz</p>
                  <p className="text-xs text-slate-500">Plant Supervisor</p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-800 font-bold border border-red-200">
                  JD
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Title & Actions */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Iligan Plant Overview</h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Operational Status: Normal
              <span className="text-slate-300">|</span>
              Last Updated: 14:30 PM
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
              Generate Report
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-900 hover:bg-red-800">
              <Activity className="-ml-1 mr-2 h-4 w-4" />
              Live Monitor
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Production Rate" value="98.5%" sub="Daily Target Met" icon={<Factory className="text-red-700" />} color="maroon" />
          <StatCard title="Safety Incidents" value="0" sub="342 Days Incident Free" icon={<AlertTriangle className="text-emerald-600" />} color="emerald" />
          <StatCard title="Active Vessels" value="3" sub="Snoopy 1: In Transit" icon={<Ship className="text-indigo-600" />} color="indigo" />
          <StatCard title="Tank Farm Load" value="76%" sub="Capacity Available" icon={<Gauge className="text-amber-600" />} color="amber" />
        </div>

        {/* Tank Monitoring Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <FlaskConical size={18} className="text-slate-400"/>
              Chemical Tank Levels
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Zone A</span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-slate-100">
             {TANK_DATA.map((tank) => (
               <div key={tank.id} className="bg-white p-6 hover:bg-slate-50 transition-colors">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{tank.id}</span>
                        {tank.status === 'Warning' && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <AlertTriangle size={10} /> Check Pressure
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-800 mt-1">{tank.product}</h4>
                      <p className="text-xs text-slate-500">{tank.grade}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-2xl font-bold text-slate-900">{tank.tankLevel}%</p>
                     <p className="text-xs text-slate-500">{tank.volume}</p>
                   </div>
                 </div>
                 
                 {/* Progress Bar */}
                 <div className="relative pt-1">
                   <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-100 shadow-inner">
                     <div 
                        style={{ width: `${tank.tankLevel}%` }} 
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 
                          ${tank.status === 'Warning' ? 'bg-amber-500' : 'bg-red-800'}`}
                     ></div>
                   </div>
                 </div>

                 <div className="flex justify-between text-xs border-t border-slate-100 pt-3">
                    <span className="text-slate-500">Pressure: <strong className="text-slate-700">{tank.pressure}</strong></span>
                    <span className="text-red-700 font-medium cursor-pointer hover:underline">View Sensors &rarr;</span>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Logistics Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
             <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Truck size={18} className="text-slate-400"/>
              Logistics & Shipments
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Shipment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cargo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ETA</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200 text-sm">
                <tr>
                  <td className="px-6 py-4 font-mono text-slate-600">SHP-2026-001</td>
                  <td className="px-6 py-4 text-slate-900">Batangas Depot</td>
                  <td className="px-6 py-4 text-slate-600">Caustic Soda (Bulk)</td>
                  <td className="px-6 py-4"><StatusBadge status="In Transit" /></td>
                  <td className="px-6 py-4 text-slate-600">Feb 18, 18:00</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-slate-600">SHP-2026-002</td>
                  <td className="px-6 py-4 text-slate-900">Cebu Office</td>
                  <td className="px-6 py-4 text-slate-600">Chlorine Cylinders</td>
                  <td className="px-6 py-4"><StatusBadge status="Loading" /></td>
                  <td className="px-6 py-4 text-slate-600">Feb 19, 08:00</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-slate-600">SHP-2026-003</td>
                  <td className="px-6 py-4 text-slate-900">Manila North Harbor</td>
                  <td className="px-6 py-4 text-slate-600">Hydrochloric Acid</td>
                  <td className="px-6 py-4"><StatusBadge status="Scheduled" /></td>
                  <td className="px-6 py-4 text-slate-600">Feb 21, 12:00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}

// --- Helper Components ---

function StatCard({ title, value, sub, icon, color }: any) {
  const bgColors: Record<string, string> = {
    maroon: 'bg-red-50 text-red-900',
    emerald: 'bg-emerald-50 text-emerald-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    amber: 'bg-amber-50 text-amber-700',
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColors[color]}`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">Today</span>
      </div>
      <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
      <p className="text-sm text-slate-500 font-medium mt-1">{title}</p>
      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
        {sub}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    'In Transit': 'bg-red-100 text-red-900', // Maroon theme for logistics
    'Loading': 'bg-amber-100 text-amber-800',
    'Scheduled': 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-slate-100'}`}>
      {status}
    </span>
  );
}