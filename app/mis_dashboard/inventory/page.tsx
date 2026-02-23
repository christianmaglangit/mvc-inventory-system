'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Search, Bell, Server, HardDrive,
  Plus, Laptop, Cpu, FileText, Cable, X, LogOut, 
  Edit, Trash2, Loader2, Download 
} from 'lucide-react';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2'; 

// --- Interfaces ---
interface InventoryItem {
  id: string;
  user_id: string;
  building: string;
  department: string;
  user_full_name: string;
  ip_address: string;
  mac_address: string;
  os_version: string;
  ms_office_version: string;
  kaspersky: string;
  processor: string;
  ram: string;
  hard_drive: string;
  // --- Computer Parts Specific Fields (Based sa imong SQL) ---
  item_name?: string;
  brand_model?: string;
  serial_number?: string;
  quantity?: number;
  unit?: string;
  status?: string;
  location?: string;
  created_at?: string;
}

interface InputGroupProps {
  label: string;
  placeholder?: string;
  value: string | number;
  onChange: (v: string) => void;
  required?: boolean;
  type?: 'text' | 'select' | 'number';
  options?: string[];
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('Inventory');
  const [activeCategory, setActiveCategory] = useState('Personal Computer');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const initialForm = {
    // PC
    building: 'Admin', department: '', user_full_name: '', ip_address: '', mac_address: '',
    os_version: '', ms_office_version: '', kaspersky: 'Active', processor: '', ram: '', hard_drive: '',
    // Parts (Base sa SQL nimo)
    item_name: '', brand_model: '', serial_number: '', quantity: 0, unit: 'Pcs', status: 'New', location: 'MIS STORAGE'
  };

  const [formData, setFormData] = useState(initialForm);
  const router = useRouter();

  const toTitleCase = (str: string) => {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getTableName = (cat: string) => {
    const map: Record<string, string> = {
      'Personal Computer': 'inventory_pc',
      'Computer Parts': 'inventory_computer_parts',
      'Documents': 'inventory_docs',
      'Wires & Cables': 'inventory_wires'
    };
    return map[cat] || 'inventory_pc';
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
      else router.push('/'); 
    };
    fetchUser();
  }, [router]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(getTableName(activeCategory))
        .select('*')
        .eq('user_id', user.id) // Private data logic
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventoryList(data || []);
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      setInventoryList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [activeCategory, user]);

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const table = getTableName(activeCategory);
      let payload: any = { user_id: user.id };

      if (activeCategory === 'Personal Computer') {
        payload = { ...payload,
          building: formData.building, department: formData.department,
          user_full_name: formData.user_full_name, ip_address: formData.ip_address,
          mac_address: formData.mac_address, os_version: formData.os_version,
          ms_office_version: formData.ms_office_version, kaspersky: formData.kaspersky,
          processor: formData.processor, ram: formData.ram, hard_drive: formData.hard_drive
        };
      } else {
        // Computer Parts Payload base sa imong SQL columns
        payload = { ...payload,
          item_name: formData.item_name,
          brand_model: formData.brand_model,
          serial_number: formData.serial_number,
          quantity: formData.quantity,
          unit: formData.unit,
          status: formData.status,
          location: formData.location
        };
      }

      if (editingId) {
        const { error } = await supabase.from(table).update(payload).eq('id', editingId).eq('user_id', user.id);
        if (error) throw error;
        Swal.fire({ title: 'Updated!', icon: 'success', confirmButtonColor: '#7f0000' });
      } else {
        const { error } = await supabase.from(table).insert([payload]);
        if (error) throw error;
        Swal.fire({ title: 'Success!', icon: 'success', confirmButtonColor: '#7f0000' });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData(initialForm);
      fetchData();
    } catch (error: any) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text("MABUHAY VINYL CORPORATION", 14, 15);
    doc.setFontSize(10);
    doc.text(`Inventory Report: ${activeCategory}`, 14, 22);

    const tableRows: any[] = [];
    const tableColumn = activeCategory === 'Personal Computer' 
      ? ["Building", "Dept", "User", "IP Address", "MAC", "OS", "Office", "Kaspersky", "CPU", "RAM", "HDD"]
      : ["Item Name", "Brand/Model", "Serial Number", "Qty", "Unit", "Status", "Location"];

    filteredData.forEach(item => {
      tableRows.push(activeCategory === 'Personal Computer' ? [
        item.building, item.department, item.user_full_name,
        item.ip_address, item.mac_address, item.os_version, item.ms_office_version,
        item.kaspersky, item.processor, item.ram, item.hard_drive
      ] : [
        item.item_name, item.brand_model, item.serial_number,
        item.quantity, item.unit, item.status, item.location
      ]);
    });

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30, styles: { fontSize: 7 }, headStyles: { fillColor: [127, 0, 0] } });
    doc.save(`MVC_Inventory_${activeCategory.replace(' ', '_')}.pdf`);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setFormData({ ...initialForm, ...item } as any);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Delete record of ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7f0000',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await supabase.from(getTableName(activeCategory)).delete().eq('id', id).eq('user_id', user.id);
          Swal.fire('Deleted!', '', 'success');
          fetchData();
        } catch (error: any) {
          Swal.fire('Error', error.message, 'error');
        }
      }
    });
  };

  const initials = user?.user_metadata?.full_name?.split(' ').map((n: any) => n[0]).join('').toUpperCase().substring(0, 2) || 'MT';

  const filteredData = inventoryList.filter(item => 
    (item.user_full_name || item.item_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden relative">
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 z-20 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 font-bold text-red-900 gap-3">
          <div className="w-8 h-8 bg-red-900 rounded flex items-center justify-center text-white shadow-md"><Server size={20} /></div>
          <span>MVC.MIS</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="Overview" active={activeTab === 'Dashboard'} onClick={() => router.push('/mis_dashboard')} />
          <NavItem icon={<HardDrive size={18} />} label="Inventory Data" active={activeTab === 'Inventory'} onClick={() => setActiveTab('Inventory')} />
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
           <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-xs font-bold text-slate-500 hover:text-red-900 group">
             <LogOut size={18} /><span>Sign Out</span>
           </button>
           <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 border border-slate-200">
             <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center font-black text-red-800 text-[10px] shrink-0">{initials}</div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-bold truncate">{user?.user_metadata?.full_name || 'MIS User'}</p>
               <p className="text-[10px] text-slate-500 truncate font-medium">{user?.user_metadata?.department || 'IT Department'}</p>
             </div>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <h1 className="text-lg font-bold tracking-tight">Inventory Management</h1>
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input type="text" placeholder="Search my records..." className="bg-slate-100 border rounded-md py-2 pl-9 pr-4 text-xs w-64 focus:outline-none focus:bg-white transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8 space-y-6 custom-scrollbar">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm w-fit gap-1">
            <TabBtn label="Personal Computer" icon={<Laptop size={14}/>} active={activeCategory === 'Personal Computer'} onClick={() => setActiveCategory('Personal Computer')} />
            <TabBtn label="Computer Parts" icon={<Cpu size={14}/>} active={activeCategory === 'Computer Parts'} onClick={() => setActiveCategory('Computer Parts')} />
          </div>

          <div className="flex justify-between items-center">
            <h2 className="font-bold text-slate-800">{activeCategory} List</h2>
            <div className="flex items-center gap-3">
              <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 hover:text-red-900 transition-all shadow-sm"><Download size={16} /> Export PDF</button>
              <button onClick={() => { setEditingId(null); setFormData(initialForm); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-red-900 text-white rounded-lg text-xs font-bold hover:bg-red-800 shadow-md active:scale-95 transition-all"><Plus size={16} /> Add Record</button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-[11px] text-slate-600 whitespace-nowrap min-w-max border-collapse">
                <thead className="bg-slate-50/80 font-bold border-b border-slate-200 uppercase text-slate-500">
                  {activeCategory === 'Personal Computer' ? (
                    <tr>
                      <th className="px-4 py-4 border-r border-slate-100">Building</th><th className="px-4 py-4 border-r border-slate-100">Dept</th>
                      <th className="px-4 py-4 border-r border-slate-100 bg-white sticky left-0 z-10 shadow-sm">User (Full Name)</th>
                      <th className="px-4 py-4 border-r border-slate-100">IP Address</th><th className="px-4 py-4 border-r border-slate-100">MAC Address</th>
                      <th className="px-4 py-4 border-r border-slate-100">OS Version</th><th className="px-4 py-4 border-r border-slate-100">MS Office</th>
                      <th className="px-4 py-4 border-r border-slate-100">Kaspersky</th><th className="px-4 py-4 border-r border-slate-100">Processor</th>
                      <th className="px-4 py-4 border-r border-slate-100">RAM</th><th className="px-4 py-4 border-r border-slate-100">Hard Drive</th>
                      <th className="px-4 py-4 text-center sticky right-0 bg-slate-50 z-10 border-l border-slate-200">Actions</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-4 py-4 border-r border-slate-100">Item Name</th><th className="px-4 py-4 border-r border-slate-100">Brand/Model</th>
                      <th className="px-4 py-4 border-r border-slate-100">Serial Number</th><th className="px-4 py-4 border-r border-slate-100">Qty</th>
                      <th className="px-4 py-4 border-r border-slate-100">Status</th><th className="px-4 py-4 border-r border-slate-100">Location</th>
                      <th className="px-4 py-4 text-center sticky right-0 bg-slate-50 border-l border-slate-200">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={15} className="p-20 text-center"><Loader2 className="animate-spin inline text-red-900" size={32}/></td></tr>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group text-slate-700">
                        {activeCategory === 'Personal Computer' ? (
                          <>
                            <td className="px-4 py-3.5 border-r border-slate-50">{item.building}</td><td className="px-4 py-3.5 border-r border-slate-50">{item.department}</td>
                            <td className="px-4 py-3.5 border-r border-slate-50 font-bold text-slate-900 bg-white sticky left-0 z-10 transition-colors group-hover:bg-slate-50">{item.user_full_name}</td>
                            <td className="px-4 py-3.5 border-r border-slate-50 font-mono text-blue-600">{item.ip_address}</td><td className="px-4 py-3.5 border-r border-slate-50 font-mono">{item.mac_address}</td>
                            <td className="px-4 py-3.5 border-r border-slate-50">{item.os_version}</td><td className="px-4 py-3.5 border-r border-slate-50">{item.ms_office_version}</td>
                            <td className="px-4 py-3.5 border-r border-slate-50"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.kaspersky?.toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{item.kaspersky}</span></td>
                            <td className="px-4 py-3.5 border-r border-slate-50">{item.processor}</td><td className="px-4 py-3.5 border-r border-slate-50">{item.ram}</td><td className="px-4 py-3.5 border-r border-slate-50">{item.hard_drive}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3.5 border-r border-slate-50 font-bold text-slate-900">{item.item_name}</td><td className="px-4 py-3.5 border-r border-slate-50">{item.brand_model}</td>
                            <td className="px-4 py-3.5 border-r border-slate-50 font-mono">{item.serial_number || 'N/A'}</td><td className="px-4 py-3.5 border-r border-slate-50 font-bold text-blue-600">{item.quantity} {item.unit}</td>
                            <td className="px-4 py-3.5 border-r border-slate-50"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'New' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span></td>
                            <td className="px-4 py-3.5 border-r border-slate-50 italic">{item.location}</td>
                          </>
                        )}
                        <td className="px-4 py-3.5 text-center sticky right-0 bg-white group-hover:bg-slate-50 border-l border-slate-100">
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"><Edit size={14} /></button>
                            <button onClick={() => handleDelete(item.id, item.user_full_name || item.item_name || "")} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={12} className="p-10 text-center italic text-slate-400 uppercase tracking-widest text-[10px]">No personal records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
          <form onSubmit={handleSaveRecord} className="bg-white rounded-xl shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center font-bold text-slate-800">
              <h2 className="text-sm uppercase tracking-widest flex items-center gap-2">
                 {editingId ? <Edit size={18} className="text-blue-600" /> : <Plus size={18} className="text-red-900" />} 
                 {editingId ? 'Update Record' : 'Register Asset'} ({activeCategory})
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="p-8 grid grid-cols-3 gap-6 overflow-y-auto max-h-[70vh]">
              {activeCategory === 'Personal Computer' ? (
                <>
                  <InputGroup label="Building" value={formData.building} onChange={(v) => setFormData({...formData, building: toTitleCase(v)})} type="select" options={['Admin', 'Plant Ops', 'Logistics']} />
                  <InputGroup label="Department" placeholder="Ex: MIS DEPARTMENT" value={formData.department} onChange={(v) => setFormData({...formData, department: v.toUpperCase()})} />
                  <InputGroup label="User Name" placeholder="Ex: Sample Name" value={formData.user_full_name} onChange={(v) => setFormData({...formData, user_full_name: toTitleCase(v)})} required />
                  <InputGroup label="IP Address" placeholder="Ex: 192.168.1.1" value={formData.ip_address} onChange={(v) => setFormData({...formData, ip_address: v})} />
                  <InputGroup label="MAC Address" placeholder="Ex: 00-1A-2B-3C-4D-5E" value={formData.mac_address} onChange={(v) => setFormData({...formData, mac_address: v.toUpperCase()})} />
                  <InputGroup label="OS Version" placeholder="Ex: Windows 11 Pro" value={formData.os_version} onChange={(v) => setFormData({...formData, os_version: toTitleCase(v)})} />
                  <InputGroup label="MS Office" placeholder="Ex: Office 2021" value={formData.ms_office_version} onChange={(v) => setFormData({...formData, ms_office_version: toTitleCase(v)})} />
                  <InputGroup label="Kaspersky" value={formData.kaspersky} onChange={(v) => setFormData({...formData, kaspersky: v})} type="select" options={['Active', 'Not Active']} />
                  <InputGroup label="Processor" placeholder="Ex: Intel Core I7" value={formData.processor} onChange={(v) => setFormData({...formData, processor: toTitleCase(v)})} />
                  <InputGroup label="RAM" placeholder="Ex: 16GB DDR4" value={formData.ram} onChange={(v) => setFormData({...formData, ram: v.toUpperCase()})} />
                  <InputGroup label="HDD" placeholder="Ex: 512GB SSD" value={formData.hard_drive} onChange={(v) => setFormData({...formData, hard_drive: v.toUpperCase()})} />
                </>
              ) : (
                <>
                  {/* Fields para sa inventory_computer_parts table */}
                  <InputGroup label="Item Name" placeholder="Ex: Mouse, Keyboard, Monitor" value={formData.item_name} onChange={(v) => setFormData({...formData, item_name: toTitleCase(v)})} required />
                  <InputGroup label="Brand / Model" placeholder="Ex: Dell 24 inch" value={formData.brand_model} onChange={(v) => setFormData({...formData, brand_model: toTitleCase(v)})} />
                  <InputGroup label="Serial Number" placeholder="Ex: SN-12345" value={formData.serial_number} onChange={(v) => setFormData({...formData, serial_number: v.toUpperCase()})} />
                  <InputGroup label="Quantity" type="number" value={formData.quantity} onChange={(v) => setFormData({...formData, quantity: parseInt(v) || 0})} />
                  <InputGroup label="Unit" value={formData.unit} onChange={(v) => setFormData({...formData, unit: toTitleCase(v)})} type="select" options={['Pcs', 'Set', 'Box', 'Unit']} />
                  <InputGroup label="Status" value={formData.status} onChange={(v) => setFormData({...formData, status: v})} type="select" options={['New', 'Used', 'Defective']} />
                  <InputGroup label="Location" placeholder="Ex: Storage Shelf A" value={formData.location} onChange={(v) => setFormData({...formData, location: toTitleCase(v)})} />
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-[10px] font-bold text-slate-500 uppercase px-4 hover:text-slate-800 transition-colors">Cancel</button>
              <button disabled={isSaving} type="submit" className={`px-10 py-2.5 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${editingId ? 'bg-blue-600 shadow-blue-900/20' : 'bg-red-900 shadow-red-900/20'}`}>
                {isSaving ? <Loader2 className="animate-spin" size={14} /> : (editingId ? "Update Record" : "Save Record")}
              </button>
            </div>
          </form>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 12px; width: 12px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 10px; border: 2px solid #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}} />
    </div>
  );
}

// --- SHARED COMPONENTS ---
function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-xs font-medium group relative overflow-hidden ${active ? 'bg-red-50 text-red-900 font-bold border-l-4 border-red-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
      <span>{icon}</span><span>{label}</span>
    </button>
  );
}

function TabBtn({ label, icon, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-5 py-2 text-[10px] font-bold uppercase tracking-tight rounded-md transition-all ${active ? 'bg-red-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>{icon} {label}</button>
  );
}

function InputGroup({ label, placeholder, value, onChange, required, type = 'text', options = [] }: InputGroupProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label} {required && '*'}</label>
      {type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} className="p-2.5 border border-slate-200 rounded-lg text-xs outline-none bg-white focus:ring-2 focus:ring-red-900/10 focus:border-red-900 transition-all shadow-sm">
          {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input type={type} required={required} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="p-2.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-900/10 focus:border-red-900 transition-all shadow-sm" />
      )}
    </div>
  );
}