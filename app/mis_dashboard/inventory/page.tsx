'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Search, 
  Bell, 
  Download,
  ChevronLeft, 
  ChevronRight,
  Server,
  Network,
  HardDrive,
  Plus,
  SlidersHorizontal,
  MapPin,
  Tag,
  Edit,
  Trash2,
  Laptop,
  Cpu,
  FileText,
  Cable,
  X,
  LogOut // Added LogOut icon
} from 'lucide-react';

// --- Mock Data DBs for Different Categories ---

const PC_DB = [
  { id: '1', building: 'Admin', department: 'MIS', user: 'Sample Name', ipAddress: '192.168.1.105', macAddress: '00:1A:2B:3C:4D:5E', osVersion: 'Windows 11 Pro', msOffice: 'Office 2021', kaspersky: 'Active (2026)', processor: 'Intel Core i7-12700', ram: '16GB DDR4', hardDrive: '512GB NVMe SSD' },
  { id: '2', building: 'Plant Ops', department: 'Engineering', user: 'Maria Santos', ipAddress: '192.168.2.44', macAddress: 'A1:B2:C3:D4:E5:F6', osVersion: 'Windows 10 Pro', msOffice: 'Office 365', kaspersky: 'Active (2026)', processor: 'Ryzen 5', ram: '32GB', hardDrive: '1TB SSD' },
];

const PARTS_DB = [
  { id: 'PRT-001', name: 'Corsair Vengeance LPX 16GB', type: 'RAM', serial: 'CR-1928374', qty: 15, location: 'Storage Room A', status: 'In Stock' },
  { id: 'PRT-002', name: 'Samsung 980 PRO 1TB', type: 'Storage (SSD)', serial: 'SM-9928111', qty: 5, location: 'Storage Room A', status: 'Low Stock' },
  { id: 'PRT-003', name: 'Intel Core i5-12400F', type: 'Processor', serial: 'INT-55229', qty: 2, location: 'MIS Office', status: 'In Stock' },
];

// Status removed from DOCS_DB
const DOCS_DB = [
  { id: 'DOC-101', title: 'Microsoft Volume Licensing 2026', type: 'Software License', dateIssued: '2026-01-10', holder: 'MIS Manager' },
  { id: 'DOC-102', title: 'Cisco Switch Network Map', type: 'Network Diagram', dateIssued: '2025-11-20', holder: 'Filing Cabinet 2' },
  { id: 'DOC-103', title: 'Kaspersky Endpoint Security Key', type: 'License Key', dateIssued: '2025-05-15', holder: 'IT Safe' },
];

const WIRES_DB = [
  { id: 'CBL-001', type: 'CAT6 Ethernet Cable (Blue)', length: '100 Meters (Roll)', qty: 3, location: 'Server Room', status: 'In Stock' },
  { id: 'CBL-002', type: 'HDMI 2.1 Display Cable', length: '2 Meters', qty: 45, location: 'Storage Room B', status: 'In Stock' },
  { id: 'CBL-003', type: 'C13 Standard Power Cord', length: '1.5 Meters', qty: 120, location: 'Storage Room B', status: 'In Stock' },
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('Inventory');
  const [activeCategory, setActiveCategory] = useState('Personal Computer'); // For the table view
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for controlling the Add Record Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState('Personal Computer'); // For the dropdown inside the modal
  
  const router = useRouter();

  // Function to open modal and set default dropdown to current tab
  const handleOpenModal = () => {
    setModalCategory(activeCategory);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-900 selection:text-white overflow-hidden relative">
      
      {/* --- Sidebar --- */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 z-20 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-900 rounded flex items-center justify-center shadow-md">
              <Server className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-red-900">MVC<span className="text-slate-400 font-normal"> I.S</span></span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
            <NavItem 
              icon={<LayoutDashboard size={18} />} 
              label="Overview" 
              active={activeTab === 'Dashboard'} 
              onClick={() => router.push('/mis_dashboard')} 
            />
            <NavItem 
              icon={<HardDrive size={18} />} 
              label="Inventory Data" 
              active={activeTab === 'Inventory'} 
              onClick={() => router.push('/mis_dashboard/inventory')} 
            />
        </nav>

        <div className="p-4 border-t border-slate-100">
           {/* Replaced System Settings with Logout Button */}
           <button 
             onClick={() => router.push('/')}
             className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-xs font-medium text-slate-500 hover:text-red-900 hover:bg-red-50 group"
           >
             <LogOut size={18} className="group-hover:text-red-900 transition-colors" />
             <span>Logout</span>
           </button>
           
           <div className="mt-4 flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 border border-slate-200">
             <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center font-bold text-red-800 text-xs border border-red-200">JD</div>
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
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">Inventory Data</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-red-900 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Quick search..." 
                className="bg-slate-100 border border-slate-200 rounded-md py-2 pl-9 pr-4 text-xs w-64 text-slate-700 focus:outline-none focus:border-red-900/30 focus:ring-1 focus:ring-red-900/30 transition-all placeholder:text-slate-400 focus:bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 text-slate-500 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors relative">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-6 md:p-8 space-y-6 custom-scrollbar">
         
          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            
            {/* Left: Dropdown Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 sm:pb-0">
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={14} className="text-slate-500" />
                </div>
                <select defaultValue="" className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-900/20 transition-colors appearance-none cursor-pointer">
                  <option value="all">All Buildings</option>
                  <option value="admin">Admin Building</option>
                  <option value="plant">Plant Ops</option>
                  <option value="logistics">Logistics Center</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SlidersHorizontal size={14} className="text-slate-500" />
                </div>
                <select defaultValue="" className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-900/20 transition-colors appearance-none cursor-pointer">
                  <option value="all">All Departments</option>
                  <option value="mis">MIS</option>
                  <option value="hr">Human Resources</option>
                  <option value="finance">Finance</option>
                  <option value="engineering">Engineering</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                </div>
              </div>

            </div>
            
            {/* Right: Primary Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-red-900 text-xs font-semibold transition-colors border border-slate-200 rounded-md hover:bg-slate-50">
                <Download size={14} /> Export PDF
              </button>
              <button 
                onClick={handleOpenModal}
                className="flex items-center gap-2 px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded-md text-xs font-bold shadow-md transition-all"
              >
                <Plus size={16} /> Add Record
              </button>
            </div>
          </div>
           
          {/* Data Table Wrapper */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
            
             {/* --- Category Tabs --- */}
             <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50/50 custom-scrollbar">
                <CategoryTab 
                  label="Personal Computer" 
                  icon={<Laptop size={16} />} 
                  active={activeCategory === 'Personal Computer'} 
                  onClick={() => setActiveCategory('Personal Computer')} 
                />
                <CategoryTab 
                  label="Computer Parts" 
                  icon={<Cpu size={16} />} 
                  active={activeCategory === 'Computer Parts'} 
                  onClick={() => setActiveCategory('Computer Parts')} 
                />
                <CategoryTab 
                  label="Documents" 
                  icon={<FileText size={16} />} 
                  active={activeCategory === 'Documents'} 
                  onClick={() => setActiveCategory('Documents')} 
                />
                <CategoryTab 
                  label="Wires & Cables" 
                  icon={<Cable size={16} />} 
                  active={activeCategory === 'Wires & Cables'} 
                  onClick={() => setActiveCategory('Wires & Cables')} 
                />
             </div>

            {/* Conditionally Render Table Based on Active Tab */}
            <div className="overflow-x-auto custom-scrollbar">
              
              {/* TABLE: PERSONAL COMPUTER */}
              {activeCategory === 'Personal Computer' && (
                <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap min-w-max">
                  <thead className="bg-slate-50/80 uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 sticky left-0 bg-slate-50/95 z-10 w-10"><input type="checkbox" className="rounded border-slate-300 text-red-900 focus:ring-red-900" /></th>
                      <th className="px-4 py-3 sticky left-10 bg-slate-50/95 z-10 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">USER</th>
                      <th className="px-4 py-3">BUILDING</th>
                      <th className="px-4 py-3">DEPARTMENT</th>
                      <th className="px-4 py-3">IP ADDRESS</th>
                      <th className="px-4 py-3">MAC ADDRESS</th>
                      <th className="px-4 py-3">OS VERSION</th>
                      <th className="px-4 py-3">MS OFFICE</th>
                      <th className="px-4 py-3">KASPERSKY</th>
                      <th className="px-4 py-3">PROCESSOR</th>
                      <th className="px-4 py-3">RAM</th>
                      <th className="px-4 py-3">HARD DRIVE</th>
                      <th className="px-4 py-3 text-center sticky right-0 bg-slate-50/95 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {PC_DB.filter(i => i.user.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-slate-50/80 z-10"><input type="checkbox" className="rounded border-slate-300 text-red-900" /></td>
                        <td className="px-4 py-3 font-bold text-slate-900 sticky left-10 bg-white group-hover:bg-slate-50/80 z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">{item.user}</td>
                        <td className="px-4 py-3">{item.building}</td>
                        <td className="px-4 py-3">{item.department}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{item.ipAddress}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{item.macAddress}</td>
                        <td className="px-4 py-3">{item.osVersion}</td>
                        <td className="px-4 py-3">{item.msOffice}</td>
                        <td className="px-4 py-3 text-emerald-700 font-bold">{item.kaspersky}</td>
                        <td className="px-4 py-3">{item.processor}</td>
                        <td className="px-4 py-3">{item.ram}</td>
                        <td className="px-4 py-3">{item.hardDrive}</td>
                        <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-slate-50/80 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          <ActionButtons />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* TABLE: COMPUTER PARTS */}
              {activeCategory === 'Computer Parts' && (
                <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap min-w-max">
                  <thead className="bg-slate-50/80 uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 sticky left-0 bg-slate-50/95 z-10 w-10"><input type="checkbox" className="rounded border-slate-300 text-red-900 focus:ring-red-900" /></th>
                      <th className="px-4 py-3 sticky left-10 bg-slate-50/95 z-10 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">PART NAME</th>
                      <th className="px-4 py-3">PART ID</th>
                      <th className="px-4 py-3">HARDWARE TYPE</th>
                      <th className="px-4 py-3">SERIAL NUMBER</th>
                      <th className="px-4 py-3">STOCK QUANTITY</th>
                      <th className="px-4 py-3">LOCATION</th>
                      <th className="px-4 py-3">STATUS</th>
                      <th className="px-4 py-3 text-center sticky right-0 bg-slate-50/95 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {PARTS_DB.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-slate-50/80 z-10"><input type="checkbox" className="rounded border-slate-300 text-red-900" /></td>
                        <td className="px-4 py-3 font-bold text-slate-900 sticky left-10 bg-white group-hover:bg-slate-50/80 z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">{item.name}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{item.id}</td>
                        <td className="px-4 py-3">{item.type}</td>
                        <td className="px-4 py-3 font-mono">{item.serial}</td>
                        <td className="px-4 py-3 font-bold">{item.qty} Units</td>
                        <td className="px-4 py-3"><MapPin size={12} className="inline mr-1 text-slate-400"/>{item.location}</td>
                        <td className="px-4 py-3"><Badge status={item.status} /></td>
                        <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-slate-50/80 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          <ActionButtons />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* TABLE: DOCUMENTS */}
              {activeCategory === 'Documents' && (
                <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap min-w-max">
                  <thead className="bg-slate-50/80 uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 sticky left-0 bg-slate-50/95 z-10 w-10"><input type="checkbox" className="rounded border-slate-300 text-red-900 focus:ring-red-900" /></th>
                      <th className="px-4 py-3 sticky left-10 bg-slate-50/95 z-10 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">DOCUMENT TITLE</th>
                      <th className="px-4 py-3">DOC ID</th>
                      <th className="px-4 py-3">DOCUMENT TYPE</th>
                      <th className="px-4 py-3">DATE ISSUED</th>
                      <th className="px-4 py-3">HOLDER / LOCATION</th>
                      <th className="px-4 py-3 text-center sticky right-0 bg-slate-50/95 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {DOCS_DB.filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-slate-50/80 z-10"><input type="checkbox" className="rounded border-slate-300 text-red-900" /></td>
                        <td className="px-4 py-3 font-bold text-slate-900 sticky left-10 bg-white group-hover:bg-slate-50/80 z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">{item.title}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{item.id}</td>
                        <td className="px-4 py-3">{item.type}</td>
                        <td className="px-4 py-3">{item.dateIssued}</td>
                        <td className="px-4 py-3">{item.holder}</td>
                        <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-slate-50/80 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          <ActionButtons />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* TABLE: WIRES & CABLES */}
              {activeCategory === 'Wires & Cables' && (
                <table className="w-full text-left text-xs text-slate-600 whitespace-nowrap min-w-max">
                  <thead className="bg-slate-50/80 uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 sticky left-0 bg-slate-50/95 z-10 w-10"><input type="checkbox" className="rounded border-slate-300 text-red-900 focus:ring-red-900" /></th>
                      <th className="px-4 py-3 sticky left-10 bg-slate-50/95 z-10 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">CABLE TYPE</th>
                      <th className="px-4 py-3">ITEM ID</th>
                      <th className="px-4 py-3">LENGTH / SPEC</th>
                      <th className="px-4 py-3">QUANTITY</th>
                      <th className="px-4 py-3">LOCATION</th>
                      <th className="px-4 py-3">STATUS</th>
                      <th className="px-4 py-3 text-center sticky right-0 bg-slate-50/95 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {WIRES_DB.filter(i => i.type.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-slate-50/80 z-10"><input type="checkbox" className="rounded border-slate-300 text-red-900" /></td>
                        <td className="px-4 py-3 font-bold text-slate-900 sticky left-10 bg-white group-hover:bg-slate-50/80 z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">{item.type}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{item.id}</td>
                        <td className="px-4 py-3">{item.length}</td>
                        <td className="px-4 py-3 font-bold">{item.qty} Units</td>
                        <td className="px-4 py-3"><MapPin size={12} className="inline mr-1 text-slate-400"/>{item.location}</td>
                        <td className="px-4 py-3"><Badge status={item.status} /></td>
                        <td className="px-4 py-3 text-center sticky right-0 bg-white group-hover:bg-slate-50/80 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          <ActionButtons />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 bg-slate-50/30">
              <span>Showing records for {activeCategory}</span>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded border border-slate-200 hover:bg-white hover:text-red-900 disabled:opacity-50 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center gap-1">
                  <button className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-900 font-bold shadow-sm">1</button>
                </div>
                <button className="p-1.5 rounded border border-slate-200 hover:bg-white hover:text-red-900 transition-colors disabled:opacity-50">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* --- ADD RECORD MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus size={20} className="text-red-900"/>
                Add New Record
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-900 transition-colors bg-white rounded p-1 shadow-sm border border-slate-200">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
              
              {/* Category Dropdown Selector */}
              <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Select Asset Type to Add</label>
                <select 
                  value={modalCategory} 
                  onChange={(e) => setModalCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-900 transition-all cursor-pointer"
                >
                  <option value="Personal Computer">Personal Computer</option>
                  <option value="Computer Parts">Computer Parts</option>
                  <option value="Documents">Documents</option>
                  <option value="Wires & Cables">Wires & Cables</option>
                </select>
              </div>

              {/* Dynamic Form based on Selection */}
              <form className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {modalCategory === 'Personal Computer' && (
                  <>
                    <FormField label="User (Full Name)" placeholder="e.g. Juan Dela Cruz" />
                    <FormField label="Building" placeholder="e.g. Main HQ" />
                    <FormField label="Department / Office" placeholder="e.g. Finance" />
                    <FormField label="IP Address" placeholder="e.g. 192.168.1.100" />
                    <FormField label="MAC Address" placeholder="e.g. 00:1A:2B:3C:4D:5E" />
                    <FormField label="OS Version" placeholder="e.g. Windows 11 Pro" />
                    <FormField label="MS Office Version" placeholder="e.g. Office 2021" />
                    
                    {/* Kaspersky Status Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Kaspersky Status</label>
                      <select defaultValue="Active" className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-900 transition-all cursor-pointer">
                        <option value="Active">Active</option>
                        <option value="Not Active">Not Active</option>
                      </select>
                    </div>

                    <FormField label="Processor" placeholder="e.g. Intel Core i7-12700" />
                    <FormField label="RAM" placeholder="e.g. 16GB DDR4" />
                    
                    {/* Updated Hard Drive Input with Brand/Model */}
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      <label className="text-xs font-bold text-slate-700">Hard Drive / Storage Details</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <select defaultValue="SSD" className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-900 cursor-pointer w-full sm:w-32 shrink-0">
                          <option value="SSD">SSD</option>
                          <option value="HDD">HDD</option>
                          <option value="NVMe">NVMe M.2</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Capacity (e.g. 512GB)" 
                          className="w-full sm:w-1/3 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-900 transition-all placeholder:text-slate-400"
                        />
                        <input 
                          type="text" 
                          placeholder="Brand / Model (e.g. Seagate ST500)" 
                          className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-900 transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </>
                )}

                {modalCategory === 'Computer Parts' && (
                  <>
                    <FormField label="Part Name" placeholder="e.g. Corsair Vengeance LPX 16GB" />
                    <FormField label="Part ID" placeholder="e.g. PRT-001" />
                    <FormField label="Hardware Type" placeholder="e.g. RAM" />
                    <FormField label="Serial Number" placeholder="e.g. CR-1928374" />
                    <FormField label="Stock Quantity" type="number" placeholder="0" />
                    <FormField label="Location" placeholder="e.g. Storage Room A" />
                    
                    {/* Status Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Status</label>
                      <select defaultValue="In Stock" className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-900 transition-all cursor-pointer">
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                      </select>
                    </div>
                  </>
                )}

                {modalCategory === 'Documents' && (
                  <>
                    <FormField label="Document Title" placeholder="e.g. Microsoft Volume Licensing" />
                    <FormField label="Document ID" placeholder="e.g. DOC-101" />
                    <FormField label="Document Type" placeholder="e.g. Software License" />
                    <FormField label="Date Issued" type="date" placeholder="" />
                    <FormField label="Holder / Location" placeholder="e.g. MIS Manager" />
                  </>
                )}

                {modalCategory === 'Wires & Cables' && (
                  <>
                    <FormField label="Cable Type" placeholder="e.g. CAT6 Ethernet Cable" />
                    <FormField label="Item ID" placeholder="e.g. CBL-001" />
                    <FormField label="Length / Spec" placeholder="e.g. 100 Meters" />
                    <FormField label="Stock Quantity" type="number" placeholder="0" />
                    <FormField label="Location" placeholder="e.g. Server Room" />
                    
                    {/* Status Dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700">Status</label>
                      <select defaultValue="In Stock" className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-900 transition-all cursor-pointer">
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                      </select>
                    </div>
                  </>
                )}

              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded-md text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); setIsModalOpen(false); }} 
                className="px-6 py-2 bg-red-900 hover:bg-red-800 text-white rounded-md text-sm font-bold shadow-md transition-all"
              >
                Save {modalCategory}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global CSS for hiding scrollbar visually but keeping functionality */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}

// --- Helper Components ---

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-xs font-medium group relative overflow-hidden
      ${active ? 'bg-red-50 text-red-900 font-bold' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-900"></div>}
      <span className={`relative z-10 transition-transform ${active ? 'translate-x-1' : ''}`}>{icon}</span>
      <span className={`relative z-10 transition-transform ${active ? 'translate-x-1' : ''}`}>{label}</span>
    </button>
  );
}

function CategoryTab({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap
        ${active ? 'border-red-900 text-red-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function Badge({ status }: { status: string }) {
  const styles: any = {
    'In Stock': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Active': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Low Stock': 'bg-amber-100 text-amber-800 border-amber-200',
    'Expiring Soon': 'bg-amber-100 text-amber-800 border-amber-200',
  };
  const defaultStyle = 'bg-slate-100 text-slate-600 border-slate-200';
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status] || defaultStyle}`}>
      {status}
    </span>
  );
}

function ActionButtons() {
  return (
    <div className="flex items-center justify-center gap-2">
      <button className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit Record">
        <Edit size={16} />
      </button>
      <button className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete Record">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function FormField({ label, placeholder, type = 'text' }: { label: string, placeholder: string, type?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder} 
        className="px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-900/50 focus:border-red-900 transition-all placeholder:text-slate-400"
      />
    </div>
  );
}