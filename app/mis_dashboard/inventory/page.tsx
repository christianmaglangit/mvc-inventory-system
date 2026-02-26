'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Search, Server, HardDrive,
  Plus, X, LogOut, Edit, Trash2, Loader2, Download, Menu 
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
  const [activeCategory, setActiveCategory] = useState('Personal Computer');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const initialForm = {
    building: 'Admin', department: 'MIS', user_full_name: '', ip_address: '', mac_address: '',
    os_version: 'Windows 10 Pro', ms_office_version: 'Office 2019', kaspersky: 'Active', 
    processor: 'Core i3', ram: '8GB', hard_drive: '256GB SSD',
    item_name: 'Monitor', brand_model: 'Dell', serial_number: '', quantity: 1, unit: 'Pcs', status: 'New', location: 'MIS STORAGE'
  };

  const [formData, setFormData] = useState(initialForm);
  const router = useRouter();

  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getTableName = (cat: string) => {
    const map: Record<string, string> = {
      'Personal Computer': 'inventory_pc',
      'Computer Parts': 'inventory_computer_parts',
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
        .eq('user_id', user.id)
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
        payload = { ...payload,
          item_name: formData.item_name, brand_model: formData.brand_model,
          serial_number: formData.serial_number, quantity: formData.quantity,
          unit: formData.unit, status: formData.status, location: formData.location,
          user_full_name: formData.status === 'Used' ? formData.user_full_name : ""
        };
      }

      const { error } = editingId 
        ? await supabase.from(table).update(payload).eq('id', editingId).eq('user_id', user.id)
        : await supabase.from(table).insert([payload]);

      if (error) throw error;

      await Swal.fire({ title: 'Success!', text: 'Record saved.', icon: 'success', confirmButtonColor: '#7f0000' });
      setIsModalOpen(false);
      setEditingId(null);
      setFormData(initialForm);
      fetchData();
    } catch (error: any) {
      Swal.fire('Database Error', error.message, 'error');
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

    const tableColumn = activeCategory === 'Personal Computer' 
      ? ["Building", "Dept", "User", "IP Address", "MAC", "OS", "Office", "Kaspersky", "CPU", "RAM", "HDD"]
      : ["Item Name", "Brand/Model", "User", "Qty", "Unit", "Status", "Location"];

    const tableRows = filteredData.map(item => activeCategory === 'Personal Computer' ? [
        item.building || "", item.department || "", item.user_full_name || "",
        item.ip_address || "", item.mac_address || "", item.os_version || "", 
        item.ms_office_version || "", item.kaspersky || "", item.processor || "", 
        item.ram || "", item.hard_drive || ""
      ] : [
        item.item_name || "", item.brand_model || "", item.user_full_name || "N/A",
        item.quantity?.toString() || "0", item.unit || "", item.status || "", item.location || ""
      ]);

    autoTable(doc, { head: [tableColumn], body: tableRows as any, startY: 30, styles: { fontSize: 7 }, headStyles: { fillColor: [127, 0, 0] } });
    doc.save(`MVC_${activeCategory.replace(' ', '_')}.pdf`);
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
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await supabase.from(getTableName(activeCategory)).delete().eq('id', id).eq('user_id', user.id);
          fetchData();
        } catch (error: any) {
          Swal.fire('Error', error.message, 'error');
        }
      }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const displayName = user?.user_metadata?.full_name || 'MIS User';
  const displayDept = user?.user_metadata?.department || 'IT Department';
  const initials = displayName.split(' ').map((n: any) => n[0]).join('').toUpperCase().substring(0, 2);

  const filteredData = inventoryList.filter(item => 
    (item.user_full_name || item.item_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden relative text-[11px]">
      
      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-900 rounded flex items-center justify-center shadow-md">
              <Server className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-red-900">MVC.IS</span>
          </div>
          <button className="lg:hidden text-slate-400 p-1" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="Overview" onClick={() => router.push('/mis_dashboard')} />
          <NavItem icon={<HardDrive size={18} />} label="Inventory Data" active={true} />
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-xs font-bold text-slate-500 hover:text-red-900 hover:bg-red-50 group border border-transparent">
             <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
             <span>Sign Out</span>
           </button>
           <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-50 border border-slate-200">
             <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center font-black text-red-800 text-[10px] shrink-0">{initials}</div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-bold truncate">{displayName}</p>
               <p className="text-[10px] text-slate-500 truncate">{displayDept}</p>
             </div>
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-md lg:hidden hover:bg-slate-100 text-slate-600"><Menu size={20} /></button>
            <h1 className="text-sm md:text-lg font-bold tracking-tight">Inventory Management</h1>
          </div>
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-red-900" size={16} />
            <input type="text" placeholder="Search my records..." className="bg-slate-100 border border-slate-200 rounded-md py-2 pl-9 pr-4 text-xs w-48 md:w-64 focus:outline-none focus:bg-white transition-all shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 space-y-6 custom-scrollbar">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm w-fit gap-1">
              <TabBtn label="Personal Computer" active={activeCategory === 'Personal Computer'} onClick={() => setActiveCategory('Personal Computer')} />
              <TabBtn label="Computer Parts" active={activeCategory === 'Computer Parts'} onClick={() => setActiveCategory('Computer Parts')} />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={handleExportPDF} className="flex-1 sm:flex-none flex items-center justify-center border border-slate-200 gap-2 px-4 py-2 bg-white text-[10px] font-bold rounded-lg hover:bg-slate-50 transition-all shadow-sm"><Download size={14} /> PDF</button>
              <button onClick={() => { setEditingId(null); setFormData(initialForm); setIsModalOpen(true); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-900 text-white text-[10px] font-bold rounded-lg shadow-md active:scale-95 transition-all"><Plus size={14} /> Add Record</button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-slate-600 whitespace-nowrap min-w-max border-collapse">
                <thead className="bg-slate-50 font-bold border-b border-slate-200 uppercase text-slate-500">
                  {activeCategory === 'Personal Computer' ? (
                    <tr>
                      <th className="px-4 py-4 border-r border-slate-100">Building</th><th className="px-4 py-4 border-r border-slate-100">Dept</th>
                      <th className="px-4 py-4 border-r border-slate-100 bg-white sticky left-0 z-10 shadow-sm text-slate-900">User (Full Name)</th>
                      <th className="px-4 py-4 border-r border-slate-100">IP Address</th><th className="px-4 py-4 border-r border-slate-100">MAC Address</th>
                      <th className="px-4 py-4 border-r border-slate-100">OS Version</th><th className="px-4 py-4 border-r border-slate-100">MS Office</th>
                      <th className="px-4 py-4 border-r border-slate-100">Kaspersky</th><th className="px-4 py-4 border-r border-slate-100">Processor</th>
                      <th className="px-4 py-4 border-r border-slate-100">RAM</th><th className="px-4 py-4 border-r border-slate-100">Hard Drive</th>
                      <th className="px-4 py-4 text-center sticky right-0 bg-slate-50 border-l shadow-sm">Actions</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-4 py-4 border-r border-slate-100">Item Name</th><th className="px-4 py-4 border-r border-slate-100">Brand</th>
                      <th className="px-4 py-4 border-r border-slate-100 bg-white sticky left-0 z-10 shadow-sm text-slate-900 text-left">User</th><th className="px-4 py-4 border-r border-slate-100">Qty</th>
                      <th className="px-4 py-4 border-r border-slate-100">Status</th><th className="px-4 py-4 border-r border-slate-100">Location</th>
                      <th className="px-4 py-4 text-center sticky right-0 bg-slate-50 border-l shadow-sm">Actions</th>
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
                            <td className="px-4 py-3.5 border-r border-slate-50"><span className={`px-2 py-0.5 rounded-full font-bold border-slate-50 ${item.kaspersky?.toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{item.kaspersky}</span></td>
                            <td className="px-4 py-3.5 border-r border-slate-50">{item.processor}</td><td className="px-4 py-3.5 border-r border-slate-50">{item.ram}</td><td className="px-4 border-slate-50 py-3.5 border-r">{item.hard_drive}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3.5 border-r border-slate-50 font-bold text-slate-900">{item.item_name}</td><td className="px-4 border-slate-50 py-3.5 border-r">{item.brand_model}</td>
                            <td className="px-4 py-3.5 border-r border-slate-50 bg-white sticky left-0 z-10 group-hover:bg-slate-50 text-left font-semibold">{item.user_full_name || 'N/A'}</td><td className="px-4 py-3.5 border-r border-slate-50 font-bold text-blue-600">{item.quantity} {item.unit}</td>
                            <td className="px-4 py-3.5 border-r border-slate-50"><span className={`px-2 py-0.5 rounded-full text-[10px] border-slate-50 font-bold ${item.status === 'New' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{item.status}</span></td>
                            <td className="px-4 py-3.5 border-r border-slate-50 italic text-slate-500">{item.location}</td>
                          </>
                        )}
                        <td className="px-4 py-3.5 text-center sticky right-0 bg-white group-hover:bg-slate-50 border-l border-slate-100 shadow-sm">
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handleEdit(item)} className="p-1 text-slate-400 hover:text-blue-600 transition-all"><Edit size={14} /></button>
                            <button onClick={() => handleDelete(item.id, item.user_full_name || item.item_name || "")} className="p-1 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={15} className="p-10 text-center italic text-slate-400 uppercase text-[10px]">No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-all text-[11px]">
          <form onSubmit={handleSaveRecord} className="bg-white rounded-xl shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden text-left flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center font-bold text-slate-800 uppercase tracking-widest shrink-0">
               <h2 className="text-xs sm:text-sm">{editingId ? 'Edit' : 'New'} Record ({activeCategory})</h2>
               <button type="button" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="p-4 sm:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 overflow-y-auto">
              {activeCategory === 'Personal Computer' ? (
                <>
                  <InputGroup label="Building" value={formData.building} onChange={(v) => setFormData({...formData, building: v})} type="select" options={['Admin', 'IEM 1', 'QC']} />
                  <InputGroup label="Department" value={formData.department} onChange={(v) => setFormData({...formData, department: v.toUpperCase()})} type="select" options={['MIS', 'HR', 'MARKETING', 'FINANCE', 'SECURITY' ]} />
                  <InputGroup label="User Name" placeholder="Ex: Juan Dela Cruz" value={formData.user_full_name} onChange={(v) => setFormData({...formData, user_full_name: toTitleCase(v)})} required />
                  <InputGroup label="IP Address" placeholder="Ex: 192.168.1.1" value={formData.ip_address} onChange={(v) => setFormData({...formData, ip_address: v})} />
                  <InputGroup label="MAC Address" placeholder="Ex: 00-1A-2B-3C-4D-5E" value={formData.mac_address} onChange={(v) => setFormData({...formData, mac_address: v.toUpperCase()})} />
                  <InputGroup label="OS Version" value={formData.os_version} onChange={(v) => setFormData({...formData, os_version: v})} type="select" options={['Windows 11 Pro', 'Windows 10 Pro', 'Windows 10 Home', 'Windows 7']} />
                  <InputGroup label="MS Office" value={formData.ms_office_version} onChange={(v) => setFormData({...formData, ms_office_version: v})} type="select" options={['Office 2021', 'Office 2019', 'Office 2016', 'Office 2013', 'Office 365']} />
                  <InputGroup label="Kaspersky" value={formData.kaspersky} onChange={(v) => setFormData({...formData, kaspersky: v})} type="select" options={['Active', 'Not Active']} />
                  <InputGroup label="Processor" value={formData.processor} onChange={(v) => setFormData({...formData, processor: v})} type="select" options={['Core i9', 'Core i7', 'Core i5', 'Core i3', 'Ryzen 9', 'Ryzen 7', 'Ryzen 5', 'Celeron', 'Pentium']} />
                  <InputGroup label="RAM" value={formData.ram} onChange={(v) => setFormData({...formData, ram: v})} type="select" options={['4GB', '8GB', '16GB', '32GB', '64GB']} />
                  <InputGroup label="Hard Drive" value={formData.hard_drive} onChange={(v) => setFormData({...formData, hard_drive: v})} type="select" options={['120GB SSD', '240GB SSD', '256GB SSD', '480GB SSD', '500GB SSD', '512GB SSD', '1TB SSD', '500GB HDD', '1TB HDD']} />
                </>
              ) : (
                <>
                  <InputGroup label="Item Name" value={formData.item_name} onChange={(v) => setFormData({...formData, item_name: v})} type="select" options={[
                    'Monitor', 'Keyboard', 'Mouse', 'System Unit', 'RAM', 'SSD/HDD', 'AVR/UPS', 'Printer', 'Laptop', 'Router/Switch',
                    'RJ45 Connectors (Cat6)', 'RJ45 Connectors (Cat5e)', 'Rubber Boots (RJ45)', 'Power Cable', 'VGA Cable', 'HDMI Cable', 
                    'LAN Cable (Cat6)', 'LAN Cable (Cat5e)', 'Patch Cord', 'USB Cable', 'Display Port Cable', 'Power Strip / Extension'
                  ]} />
                  <InputGroup label="Brand / Model" value={formData.brand_model} onChange={(v) => setFormData({...formData, brand_model: v})} type="select" options={['Dell', 'HP', 'Lenovo', 'Logitech', 'Asus', 'Acer', 'Samsung', 'TP-Link', 'Cisco', 'Epson', 'Canon', 'Generic']} />
                  <InputGroup label="Quantity" type="number" value={formData.quantity} onChange={(v) => setFormData({...formData, quantity: parseInt(v) || 0})} />
                  <InputGroup label="Unit" value={formData.unit} onChange={(v) => setFormData({...formData, unit: v})} type="select" options={['Pcs', 'Set', 'Unit', 'Box', 'Roll', 'Meters', 'Pack']} />
                  <InputGroup label="Status" value={formData.status} onChange={(v) => setFormData({...formData, status: v})} type="select" options={['New', 'Used', 'Unused', 'Defective']} />
                  {formData.status === 'Used' && (
                    <InputGroup label="Fullname" placeholder="Enter assigned user" value={formData.user_full_name} onChange={(v) => setFormData({...formData, user_full_name: toTitleCase(v)})} required />
                  )}
                  <InputGroup label="Location" value={formData.location} onChange={(v) => setFormData({...formData, location: v})} type="select" options={['MIS STORAGE', 'MIS OFFICE', 'CABINET A', 'CABINET B', 'PLANT STORAGE']} />
                </>
              )}
            </div>
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-[10px] font-bold text-slate-500 uppercase px-4 hover:text-slate-800 transition-colors">Cancel</button>
              <button disabled={isSaving} type="submit" className={`px-10 py-2.5 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg ${editingId ? 'bg-blue-600 shadow-blue-900/20' : 'bg-red-900 shadow-red-900/20'}`}>
                {isSaving ? <Loader2 className="animate-spin" size={14} /> : "Save Record"}
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

function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-xs font-medium group relative overflow-hidden ${active ? 'bg-red-50 text-red-900 font-bold border-l-4 border-red-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
      <span>{icon}</span><span>{label}</span>
    </button>
  );
}

function TabBtn({ label, icon, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-5 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-tight rounded-md transition-all ${active ? 'bg-red-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>{icon} {label}</button>
  );
}

function InputGroup({ label, placeholder, value, onChange, required, type = 'text', options = [] }: InputGroupProps) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
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