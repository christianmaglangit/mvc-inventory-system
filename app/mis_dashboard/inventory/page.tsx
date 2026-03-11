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
import * as XLSX from 'xlsx';

// --- Interfaces ---
interface InventoryItem {
  id: string;
  user_id: string; 
  building: string;
  department: string;
  user_full_name: string;
  computer_type?: string; 
  email?: string;
  device_name?: string;
  os_edition?: string;
  os_version?: string;
  status?: string;
  ms_office_version: string;
  ms_office_status?: string;
  processor_brand?: string;
  processor_gen?: string;
  processor_cpu?: string;
  processor_model?: string;
  ram: string;
  rom?: string; 
  storage_drive?: string;
  kaspersky: string;
  phone?: string;
  phone_connection_type?: string; 
  phone_type?: string; 
  phone_number?: string;
  printer?: string;
  printer_name?: string;
  backup?: string; 
  backup_schedule?: string; 
  
  // Computer Parts
  item_name?: string;
  brand_model?: string;
  serial_number?: string;
  quantity?: number;
  unit?: string;
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
  maxLength?: number;
}

// --- Dynamic Options Mapping ---
const generationOptionsMap: Record<string, string[]> = {
  'Intel': ['14th Gen', '13th Gen', '12th Gen', '11th Gen', '10th Gen', '9th Gen', '8th Gen', '7th Gen', '6th Gen', '5th Gen', '4th Gen', '3rd Gen', '2nd Gen', '1st Gen'],
  'AMD': ['Ryzen 9000 Series', 'Ryzen 8000 Series', 'Ryzen 7000 Series', 'Ryzen 5000 Series', 'Ryzen 3000 Series', 'Ryzen 2000 Series', 'Ryzen 1000 Series', 'Athlon', 'FX Series'],
  'Apple': ['M4 Family', 'M3 Family', 'M2 Family', 'M1 Family', 'Intel-based'],
};

const cpuOptionsMap: Record<string, string[]> = {
  'Intel': ['Core i9', 'Core i7', 'Core i5', 'Core i3', 'Pentium', 'Celeron', 'Xeon'],
  'AMD': ['Ryzen 9', 'Ryzen 7', 'Ryzen 5', 'Ryzen 3', 'Threadripper', 'Athlon', 'EPYC'],
  'Apple': ['M4 Max', 'M4 Pro', 'M4', 'M3 Max', 'M3 Pro', 'M3', 'M2 Ultra', 'M2 Max', 'M2 Pro', 'M2', 'M1 Ultra', 'M1 Max', 'M1 Pro', 'M1', 'Intel Core i9', 'Intel Core i7', 'Intel Core i5'],
};

const romList = ['128GB', '240GB', '256GB', '480GB', '500GB', '512GB', '1TB', '2TB'];
const printerList = ['Epson L3110', 'Epson L3210', 'Brother L210'];

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
    building: 'Admin', department: 'MIS', user_full_name: '', computer_type: 'Desktop', email: '', device_name: '',
    os_edition: 'Windows 10 Pro', os_version: '', status: 'Active',
    ms_office_version: 'Home & Business 2021', ms_office_status: 'Active', 
    processor_brand: 'Intel', processor_gen: '10th Gen', 
    processor_cpu: 'Core i5', processor_model: '', ram: '8GB', rom: '256GB', 
    storage_drive: 'SSD', kaspersky: 'Active', 
    phone: 'No', phone_connection_type: 'Local', phone_type: 'Landline', phone_number: '', 
    printer: 'No', printer_name: 'Epson L3110', 
    backup: 'No', backup_schedule: 'Daily', 
    // Parts Form Fields
    item_name: 'Monitor', brand_model: 'Dell', serial_number: '', quantity: 1, unit: 'Pcs', location: 'MIS STORAGE'
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
        const isPhoneConnected = formData.phone?.toLowerCase() === 'yes';
        
        payload = { ...payload,
          building: formData.building, department: formData.department,
          user_full_name: formData.user_full_name, computer_type: formData.computer_type, email: formData.email,
          device_name: formData.device_name, os_edition: formData.os_edition, 
          os_version: formData.os_version, status: formData.status, 
          ms_office_version: formData.ms_office_version, ms_office_status: formData.ms_office_status,
          processor_brand: formData.processor_brand, processor_gen: formData.processor_gen, processor_cpu: formData.processor_cpu, 
          processor_model: formData.processor_model, ram: formData.ram, rom: formData.rom, 
          storage_drive: formData.storage_drive, kaspersky: formData.kaspersky, 
          
          phone: formData.phone, 
          phone_connection_type: isPhoneConnected ? formData.phone_connection_type : '',
          phone_type: isPhoneConnected ? formData.phone_type : '',
          phone_number: isPhoneConnected ? formData.phone_number : '',
          
          printer: formData.printer, 
          printer_name: formData.printer?.toLowerCase() === 'yes' ? formData.printer_name : '',
          backup: formData.backup, 
          backup_schedule: formData.backup?.toLowerCase() === 'yes' ? formData.backup_schedule : '' 
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

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      Swal.fire('Info', 'No data to export', 'info');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";

    // Define Headers
    const headers = activeCategory === 'Personal Computer'
      ? ["Building", "Department", "User Full Name", "Computer Type", "Email", "Device Name", "OS Edition", "OS Version", "Status", "MS Office Version", "MS Office Status", "Processor Brand", "Processor Gen", "Processor CPU", "Processor Model", "RAM", "ROM/Capacity", "Storage Drive", "Kaspersky", "Phone Connected", "Phone Conn Type", "Phone Type", "Phone Number", "Printer Connected", "Printer Name", "Backup Configured", "Backup Schedule"]
      : ["Item Name", "Brand/Model", "User", "Quantity", "Unit", "Status", "Location"];

    const tableData = filteredData.map(item => {
      if (activeCategory === 'Personal Computer') {
        const isPhone = item.phone?.toLowerCase() === 'yes';
        return [
          item.building || "", item.department || "", item.user_full_name || "", item.computer_type || "",
          item.email || "", item.device_name || "", item.os_edition || "", item.os_version || "", item.status || "",
          item.ms_office_version || "", item.ms_office_status || "", item.processor_brand || "", item.processor_gen || "", item.processor_cpu || "",
          item.processor_model || "", item.ram || "", item.rom || "", item.storage_drive || "", item.kaspersky || "",
          item.phone || "", isPhone ? item.phone_connection_type || "" : "None", isPhone ? item.phone_type || "" : "None", isPhone ? item.phone_number || "" : "None",
          item.printer || "", item.printer?.toLowerCase() === 'yes' ? item.printer_name || "" : "None",
          item.backup || "", item.backup?.toLowerCase() === 'yes' ? item.backup_schedule || "" : "None"
        ];
      } else {
        return [
          item.item_name || "", item.brand_model || "", item.user_full_name || "N/A",
          item.quantity || "0", item.unit || "", item.status || "", item.location
        ];
      }
    });

    const finalData = [headers, ...tableData];
    const worksheet = XLSX.utils.aoa_to_sheet(finalData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeCategory.substring(0, 31)); 

    const colWidths = headers.map((header, index) => {
      const maxLength = finalData.reduce((max, row) => {
        const cellValue = row[index] ? row[index].toString() : "";
        return Math.max(max, cellValue.length);
      }, header.length);
      return { wch: maxLength + 2 };
    });

    worksheet['!cols'] = colWidths;
    XLSX.writeFile(workbook, `MVC_Inventory_${activeCategory.replace(/ /g, '_')}.xlsx`);
  };

  const handleExportPDF = () => {
    if (filteredData.length === 0) {
      Swal.fire('Info', 'No data to export', 'info');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text("MABUHAY VINYL CORPORATION - ILIGAN PLANT", 14, 15);
    doc.setFontSize(11);
    doc.text("Department: IT", 14, 22);
    doc.setFontSize(9);
    doc.text(`Inventory Report: ${activeCategory}`, 14, 28);

    const tableColumn = activeCategory === 'Personal Computer' 
      ? ["Bldg", "Dept", "User", "Type", "Device", "OS", "Status", "Office Ver", "Office Stat", "CPU", "RAM", "Drive", "Kaspersky", "Printer", "Phone Type", "Phone #", "Backup"]
      : ["Item Name", "Brand/Model", "User", "Qty", "Unit", "Status", "Location"];

    const tableRows = filteredData.map(item => {
        if (activeCategory === 'Personal Computer') {
           const isPhone = item.phone?.toLowerCase() === 'yes';
           return [
            item.building || "", item.department || "", item.user_full_name || "", item.computer_type || "",
            item.device_name || "", `${item.os_edition} ${item.os_version}`, 
            item.status || "", item.ms_office_version || "", item.ms_office_status || "", `${item.processor_brand} ${item.processor_cpu}`, 
            item.ram || "", `${item.rom} ${item.storage_drive}`, item.kaspersky || "",
            item.printer?.toLowerCase() === 'yes' ? item.printer_name : "None",
            isPhone ? `${item.phone_connection_type}-${item.phone_type}` : "None",
            isPhone ? item.phone_number : "None",
            item.backup?.toLowerCase() === 'yes' ? item.backup_schedule : "None"
          ]
        } else {
            return [
                item.item_name || "", item.brand_model || "", item.user_full_name || "N/A",
                item.quantity?.toString() || "0", item.unit || "", item.status || "", item.location || ""
              ]
        }
    });

    autoTable(doc, { head: [tableColumn], body: tableRows as any, startY: 30, styles: { fontSize: 7 }, headStyles: { fillColor: [127, 0, 0] } });
    doc.save(`MVC_${activeCategory.replace(/ /g, '_')}.pdf`);
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
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

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

        <div className="flex-1 overflow-auto p-4 md:p-8 flex flex-col custom-scrollbar">
          <div className="space-y-6 flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm w-fit gap-1">
                <TabBtn label="Personal Computer" active={activeCategory === 'Personal Computer'} onClick={() => setActiveCategory('Personal Computer')} />
                <TabBtn label="Computer Parts" active={activeCategory === 'Computer Parts'} onClick={() => setActiveCategory('Computer Parts')} />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={handleExportPDF} className="flex-1 sm:flex-none flex items-center justify-center border border-red-200 gap-2 px-4 py-2 bg-red-50 text-red-800 text-[10px] font-bold rounded-lg hover:bg-red-100 transition-all shadow-sm"><Download size={14} /> PDF</button>
                <button onClick={handleExportExcel} className="flex-1 sm:flex-none flex items-center justify-center border border-emerald-200 gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg hover:bg-emerald-100 transition-all shadow-sm"><Download size={14} /> Excel</button>
                <button onClick={() => { setEditingId(null); setFormData(initialForm); setIsModalOpen(true); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-900 text-white text-[10px] font-bold rounded-lg shadow-md active:scale-95 transition-all"><Plus size={14} /> Add Record</button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-slate-600 whitespace-nowrap min-w-max border-collapse">
                  
                  <thead className="bg-blue-50/50 font-bold border-b border-slate-200 uppercase text-slate-600 text-[10px] text-center">
                    {activeCategory === 'Personal Computer' ? (
                      <>
                        <tr>
                          <th rowSpan={2} className="px-3 py-3 border-r border-slate-200 align-middle">BUILDING</th>
                          <th rowSpan={2} className="px-3 py-3 border-r border-slate-200 align-middle">DEPARTMENT / OFFICE</th>
                          <th rowSpan={2} className="px-3 py-3 border-r border-slate-200 bg-white sticky left-0 z-20 shadow-sm text-slate-900 align-middle">USER &quot;Full Name&quot;</th>
                          <th rowSpan={2} className="px-3 py-3 border-r border-slate-200 align-middle">COMP. TYPE</th>
                          <th rowSpan={2} className="px-3 py-3 border-r border-slate-200 align-middle">EMAIL</th>
                          <th rowSpan={2} className="px-3 py-3 border-r border-slate-200 align-middle">DEVICE NAME</th>
                          <th colSpan={2} className="px-3 py-2 border-r border-b border-slate-200 text-center">Windos SPICIFICATION</th>
                          <th rowSpan={2} className="px-3 py-3 border-r border-slate-200 align-middle">STATUS</th>
                          <th colSpan={2} className="px-3 py-2 border-r border-b border-slate-200 text-center">MS OFFICE</th>
                          <th colSpan={4} className="px-3 py-2 border-r border-b border-slate-200 text-center">PROCESSOR</th>
                          <th rowSpan={2} className="px-3 py-3 border-r border-slate-200 align-middle">RAM</th>
                          <th rowSpan={2} className="px-3 py-3 border-r border-slate-200 align-middle">ROM / Capacity</th>
                          <th rowSpan={2} className="px-3 py-3 border-r border-slate-200 align-middle">Storage drive</th>
                          <th rowSpan={2} className="px-3 py-3 border-r border-slate-200 align-middle">KASPERSKY</th>
                          <th colSpan={3} className="px-3 py-2 border-r border-b border-slate-200 text-center">PHONE</th>
                          <th colSpan={2} className="px-3 py-2 border-r border-b border-slate-200 text-center">PRINTER</th>
                          <th colSpan={2} className="px-3 py-2 border-r border-b border-slate-200 text-center">BACKUP</th>
                          <th rowSpan={2} className="px-4 py-3 text-center sticky right-0 bg-slate-50 border-l shadow-sm align-middle z-20">Actions</th>
                        </tr>
                        <tr>
                          {/* WINDOWS */}
                          <th className="px-3 py-2 border-r border-slate-200 bg-blue-50/50">EDITION</th>
                          <th className="px-3 py-2 border-r border-slate-200 bg-blue-50/50">VERSION</th>
                          {/* MS OFFICE */}
                          <th className="px-3 py-2 border-r border-slate-200 bg-blue-50/50">VERSION</th>
                          <th className="px-3 py-2 border-r border-slate-200 bg-blue-50/50">STATUS</th>
                          {/* PROCESSOR */}
                          <th className="px-3 py-2 border-r border-slate-200 bg-blue-50/50">BRAND</th>
                          <th className="px-3 py-2 border-r border-slate-200 bg-blue-50/50">generation</th>
                          <th className="px-3 py-2 border-r border-slate-200 bg-blue-50/50">CPU</th>
                          <th className="px-3 py-2 border-r border-slate-200 bg-blue-50/50">model number</th>
                          {/* PHONE: Added Connection Type */}
                          <th className="px-3 py-2 border-r border-slate-200 bg-blue-50/50">Conn. Type</th>
                          <th className="px-3 py-2 border-r border-slate-200 bg-blue-50/50">Type</th>
                          <th className="px-3 py-2 border-r border-slate-200 bg-blue-50/50">Number</th>
                          {/* PRINTER */}
                          <th className="px-3 py-2 border-r border-slate-200 bg-blue-50/50">Conn.</th>
                          <th className="px-3 py-2 border-r border-slate-200 bg-blue-50/50">Name</th>
                          {/* BACKUP */}
                          <th className="px-3 py-2 border-r border-slate-200 bg-blue-50/50">Config.</th>
                          <th className="px-3 py-2 border-r border-slate-200 bg-blue-50/50">Schedule</th>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <th className="px-4 py-4 border-r border-slate-100 align-middle">Item Name</th>
                        <th className="px-4 py-4 border-r border-slate-100 align-middle">Brand</th>
                        <th className="px-4 py-4 border-r border-slate-100 bg-white sticky left-0 z-10 shadow-sm text-slate-900 text-left align-middle">User</th>
                        <th className="px-4 py-4 border-r border-slate-100 align-middle">Qty</th>
                        <th className="px-4 py-4 border-r border-slate-100 align-middle">Status</th>
                        <th className="px-4 py-4 border-r border-slate-100 align-middle">Location</th>
                        <th className="px-4 py-4 text-center sticky right-0 bg-slate-50 border-l shadow-sm align-middle">Actions</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-center">
                    {loading ? (
                      <tr><td colSpan={27} className="p-20 text-center"><Loader2 className="animate-spin inline text-red-900" size={32}/></td></tr>
                    ) : filteredData.length > 0 ? (
                      filteredData.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group text-slate-700">
                          {activeCategory === 'Personal Computer' ? (
                            <>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.building}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.department}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 font-bold text-slate-900 bg-white sticky left-0 z-10 transition-colors group-hover:bg-slate-50 uppercase">{item.user_full_name}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 font-semibold uppercase">{item.computer_type}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 text-blue-600 uppercase">{item.email}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 font-bold uppercase">{item.device_name}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.os_edition}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.os_version}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.status}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.ms_office_version}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">
                                <span className={`px-2 py-0.5 rounded-full font-bold border-slate-50 ${item.ms_office_status?.toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{item.ms_office_status}</span>
                              </td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.processor_brand}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.processor_gen}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.processor_cpu}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.processor_model}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 font-medium uppercase">{item.ram}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 font-medium text-blue-800 uppercase">{item.rom}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.storage_drive}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">
                                <span className={`px-2 py-0.5 rounded-full font-bold border-slate-50 ${item.kaspersky?.toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{item.kaspersky}</span>
                              </td>
                              
                              {/* PHONE DATA RENDERING */}
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.phone?.toLowerCase() === 'yes' ? item.phone_connection_type : '-'}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.phone?.toLowerCase() === 'yes' ? item.phone_type : '-'}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.phone?.toLowerCase() === 'yes' ? item.phone_number : '-'}</td>
                              
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.printer}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.printer?.toLowerCase() === 'yes' ? item.printer_name : '-'}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.backup}</td>
                              <td className="px-3 py-3.5 border-r border-slate-100 uppercase">{item.backup?.toLowerCase() === 'yes' ? item.backup_schedule : '-'}</td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3.5 border-r border-slate-50 font-bold text-slate-900 text-left uppercase">{item.item_name}</td>
                              <td className="px-4 border-slate-50 py-3.5 border-r text-left uppercase">{item.brand_model}</td>
                              <td className="px-4 py-3.5 border-r border-slate-50 bg-white sticky left-0 z-10 group-hover:bg-slate-50 text-left font-semibold uppercase">{item.user_full_name || 'N/A'}</td>
                              <td className="px-4 py-3.5 border-r border-slate-50 font-bold text-blue-600 uppercase">{item.quantity} {item.unit}</td>
                              <td className="px-4 py-3.5 border-r border-slate-50 uppercase"><span className={`px-2 py-0.5 rounded-full text-[10px] border-slate-50 font-bold ${item.status === 'New' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{item.status}</span></td>
                              <td className="px-4 py-3.5 border-r border-slate-50 italic text-slate-500 uppercase">{item.location}</td>
                            </>
                          )}
                          <td className="px-4 py-3.5 text-center sticky right-0 bg-white group-hover:bg-slate-50 border-l border-slate-100 shadow-sm z-10">
                            <div className="flex gap-1 justify-center">
                              <button onClick={() => handleEdit(item)} className="p-1 text-slate-400 hover:text-blue-600 transition-all"><Edit size={14} /></button>
                              <button onClick={() => handleDelete(item.id, item.user_full_name || item.item_name || "")} className="p-1 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={27} className="p-10 text-center italic text-slate-400 uppercase text-[10px]">No records found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <footer className="mt-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-200/80">
            Developed by Christian B. Maglangit
          </footer>
        </div>
      </main>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-all text-[11px]">
          <form onSubmit={handleSaveRecord} className="bg-white rounded-xl shadow-2xl w-full max-w-5xl border border-slate-200 overflow-hidden text-left flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center font-bold text-slate-800 uppercase tracking-widest shrink-0">
               <h2 className="text-xs sm:text-sm">{editingId ? 'Edit' : 'New'} Record ({activeCategory})</h2>
               <button type="button" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto">
              {activeCategory === 'Personal Computer' ? (
                <>
                  <div className="col-span-full font-bold text-slate-800 border-b pb-1 mb-2">User & Device Info</div>
                  <InputGroup label="Building" value={formData.building} onChange={(v) => setFormData({...formData, building: v})} type="select" options={['Admin', 'Security', 'IEM 1', 'IEM 2', 'QC', 'CONTRACTOR',]} />
                  <InputGroup label="Department" value={formData.department} onChange={(v) => setFormData({...formData, department: v})} type="select" options={['MIS', 'HR', 'TECHNICAL', 'EHS', 'ENGINEERING', 'MATERIALS', 'MARKETING & SALES', 'FINANCE & ACCOUNTING', 'SECURITY', 'IEM 1', 'IEM 2', 'QC', 'CONTRACTOR', ]} />
                  <InputGroup label="User Name" placeholder="Ex: Juan Dela Cruz" value={formData.user_full_name} onChange={(v) => setFormData({...formData, user_full_name: v})} required />
                  <InputGroup label="Computer Type" value={formData.computer_type || 'Desktop'} onChange={(v) => setFormData({...formData, computer_type: v})} type="select" options={['Desktop', 'NUC', 'Laptop']} />
                  <InputGroup label="Email" placeholder="user@domain.com" value={formData.email || ''} onChange={(v) => setFormData({...formData, email: v})} />
                  <InputGroup label="Device Name" placeholder="PC-01" value={formData.device_name || ''} onChange={(v) => setFormData({...formData, device_name: v})} />
                  <InputGroup label="Status" value={formData.status || ''} onChange={(v) => setFormData({...formData, status: v})} type="select" options={['Active', 'Inactive', 'Defective', 'Spare']} />

                  <div className="col-span-full font-bold text-slate-800 border-b pb-1 mb-2 mt-2">OS & Software</div>
                  <InputGroup label="OS Edition" value={formData.os_edition || ''} onChange={(v) => setFormData({...formData, os_edition: v})} type="select" options={['Windows 11 Pro', 'Windows 11 Home', 'Windows 10 Pro', 'Windows 10 Home', 'Windows 8.1', 'Windows 7', 'macOS', 'Linux']} />
                  <InputGroup label="OS Version" placeholder="Ex: 22H2" value={formData.os_version || ''} onChange={(v) => setFormData({...formData, os_version: v})} />
                  <InputGroup label="MS Office" value={formData.ms_office_version} onChange={(v) => setFormData({...formData, ms_office_version: v})} type="select" options={[
                    'Home & Business 2024', 'Home & Business 2021', 'Home & Business 2019', 'Home & Business 2016', 
                    'Professional Plus 2024', 'Professional Plus 2021', 'Professional Plus 2019', 'Professional Plus 2016', 
                    'Office 365', 'None'
                  ]} />
                  <InputGroup label="MS Office Status" value={formData.ms_office_status || 'Active'} onChange={(v) => setFormData({...formData, ms_office_status: v})} type="select" options={['Active', 'Not Active']} />

                  <InputGroup label="Kaspersky" value={formData.kaspersky} onChange={(v) => setFormData({...formData, kaspersky: v})} type="select" options={['Active', 'Not Active']} />

                  <div className="col-span-full font-bold text-slate-800 border-b pb-1 mb-2 mt-2">Processor Details</div>
                  
                  {/* --- DYNAMIC BRAND, GENERATION, AND CPU SELECTS --- */}
                  <InputGroup 
                    label="Brand" 
                    value={formData.processor_brand || 'Intel'} 
                    onChange={(v) => {
                      const newGens = generationOptionsMap[v] || ['N/A'];
                      const newCpus = cpuOptionsMap[v] || ['N/A'];
                      setFormData({...formData, processor_brand: v, processor_gen: newGens[0], processor_cpu: newCpus[0]});
                    }} 
                    type="select" 
                    options={['Intel', 'AMD', 'Apple']} 
                  />
                  <InputGroup 
                    label="Generation" 
                    value={formData.processor_gen || ''} 
                    onChange={(v) => setFormData({...formData, processor_gen: v})} 
                    type="select" 
                    options={generationOptionsMap[formData.processor_brand || 'Intel'] || ['N/A']} 
                  />
                  <InputGroup 
                    label="CPU" 
                    value={formData.processor_cpu || ''} 
                    onChange={(v) => setFormData({...formData, processor_cpu: v})} 
                    type="select" 
                    options={cpuOptionsMap[formData.processor_brand || 'Intel'] || ['N/A']} 
                  />
                  {/* ------------------------------------------- */}

                  <InputGroup label="Model Number" placeholder="Ex: 12400F" value={formData.processor_model || ''} onChange={(v) => setFormData({...formData, processor_model: v})} />

                  <div className="col-span-full font-bold text-slate-800 border-b pb-1 mb-2 mt-2">Storage & Memory</div>
                  <InputGroup label="RAM" value={formData.ram} onChange={(v) => setFormData({...formData, ram: v})} type="select" options={['4GB', '8GB', '16GB', '32GB', '64GB']} />
                  
                  {/* ROM/CAPACITY SELECT */}
                  <InputGroup 
                    label="ROM / Capacity" 
                    value={['128GB', '240GB', '256GB', '480GB', '500GB', '512GB', '1TB', '2TB'].includes(formData.rom || '') ? formData.rom || '256GB' : 'Others'} 
                    onChange={(v) => setFormData({...formData, rom: v === 'Others' ? '' : v})} 
                    type="select" 
                    options={['128GB', '240GB', '256GB', '480GB', '500GB', '512GB', '1TB', '2TB', 'Others']} 
                  />
                  {/* CUSTOM ROM FIELD IF 'OTHERS' IS SELECTED (or if it holds a custom value not in the list) */}
                  {(!['128GB', '240GB', '256GB', '480GB', '500GB', '512GB', '1TB', '2TB'].includes(formData.rom || '') || formData.rom === '') && (
                    <InputGroup label="Specify Capacity" placeholder="Ex: 4TB" value={formData.rom || ''} onChange={(v) => setFormData({...formData, rom: v})} required />
                  )}

                  <InputGroup label="Storage Drive" value={formData.storage_drive || ''} onChange={(v) => setFormData({...formData, storage_drive: v})} type="select" options={['SSD', 'HDD', 'NVMe', 'M.2']} />
                  
                  <div className="col-span-full font-bold text-slate-800 border-b pb-1 mb-2 mt-2">Peripherals</div>
                  
                  {/* --- PHONE LOGIC --- */}
                  <InputGroup label="Phone Connected?" value={formData.phone || 'No'} onChange={(v) => {
                    setFormData({
                      ...formData, 
                      phone: v, 
                      phone_connection_type: v.toLowerCase() === 'yes' ? 'Local' : '',
                      phone_type: v.toLowerCase() === 'yes' ? 'Landline' : '',
                      phone_number: ''
                    })
                  }} type="select" options={['Yes', 'No']} />
                  
                  {formData.phone?.toLowerCase() === 'yes' && (
                    <>
                      <InputGroup 
                        label="Connection Type" 
                        value={formData.phone_connection_type || 'Local'} 
                        onChange={(v) => {
                          setFormData({
                            ...formData, 
                            phone_connection_type: v, 
                            phone_type: v === 'Local' ? 'Landline' : 'Fanvil',
                            phone_number: ''
                          });
                        }} 
                        type="select" 
                        options={['Local', 'IP']} 
                      />
                      
                      <InputGroup 
                        label="Phone Type" 
                        value={formData.phone_type || (formData.phone_connection_type === 'Local' ? 'Landline' : 'Fanvil')} 
                        onChange={(v) => setFormData({...formData, phone_type: v})} 
                        type="select" 
                        options={formData.phone_connection_type === 'Local' ? ['Landline', 'Local'] : ['Fanvil', 'Cisco']} 
                      />

                      <InputGroup label="Phone Number" placeholder="Ex: 101" value={formData.phone_number || ''} onChange={(v) => setFormData({...formData, phone_number: v})} required />
                    </>
                  )}
                  {/* ------------------- */}
                  
                  <InputGroup label="Printer Connected?" value={formData.printer || 'No'} onChange={(v) => setFormData({...formData, printer: v})} type="select" options={['Yes', 'No']} />
                  {formData.printer?.toLowerCase() === 'yes' && (
                    <>
                      <InputGroup 
                        label="Printer Name" 
                        value={['Epson L3110', 'Epson L3210', 'Brother L210'].includes(formData.printer_name || '') ? formData.printer_name || 'Epson L3110' : 'Others'} 
                        onChange={(v) => setFormData({...formData, printer_name: v === 'Others' ? '' : v})} 
                        type="select" 
                        options={['Epson L3110', 'Epson L3210', 'Brother L210', 'Others']} 
                      />
                      {/* CUSTOM PRINTER NAME FIELD IF 'OTHERS' IS SELECTED */}
                      {(!['Epson L3110', 'Epson L3210', 'Brother L210'].includes(formData.printer_name || '') || formData.printer_name === '') && (
                        <InputGroup label="Specify Printer" placeholder="Ex: HP DeskJet" value={formData.printer_name || ''} onChange={(v) => setFormData({...formData, printer_name: v})} required />
                      )}
                    </>
                  )}
                  
                  {/* --- ADDED BACKUP SETTINGS --- */}
                  <div className="col-span-full font-bold text-slate-800 border-b pb-1 mb-2 mt-2">Backup Settings</div>
                  <InputGroup label="Backup Configured?" value={formData.backup || 'No'} onChange={(v) => setFormData({...formData, backup: v})} type="select" options={['Yes', 'No']} />
                  {formData.backup?.toLowerCase() === 'yes' && (
                    <InputGroup label="Backup Schedule" value={formData.backup_schedule || 'Daily'} onChange={(v) => setFormData({...formData, backup_schedule: v})} type="select" options={['Daily', 'Weekly', 'Monthly']} />
                  )}

                </>
              ) : (
                <>
                  <InputGroup label="Item Name" value={formData.item_name || ''} onChange={(v) => setFormData({...formData, item_name: v})} type="select" options={[
                    'Monitor', 'Keyboard', 'Mouse', 'System Unit', 'RAM', 'SSD/HDD', 'AVR/UPS', 'Printer', 'Laptop', 'Router/Switch',
                    'RJ45 Connectors', 'Power Cable', 'VGA/HDMI Cable', 'LAN Cable'
                  ]} />
                  <InputGroup label="Brand / Model" value={formData.brand_model || ''} onChange={(v) => setFormData({...formData, brand_model: v})} type="select" options={['Dell', 'HP', 'Lenovo', 'Logitech', 'Asus', 'Acer', 'Generic']} />
                  <InputGroup label="Quantity" type="number" value={formData.quantity || 1} onChange={(v) => setFormData({...formData, quantity: parseInt(v) || 0})} />
                  <InputGroup label="Unit" value={formData.unit || ''} onChange={(v) => setFormData({...formData, unit: v})} type="select" options={['Pcs', 'Set', 'Unit', 'Box', 'Roll', 'Meters', 'Pack']} />
                  <InputGroup label="Status" value={formData.status || ''} onChange={(v) => setFormData({...formData, status: v})} type="select" options={['New', 'Used', 'Unused', 'Defective']} />
                  {formData.status === 'Used' && (
                    <InputGroup label="Fullname" placeholder="Enter assigned user" value={formData.user_full_name} onChange={(v) => setFormData({...formData, user_full_name: v})} required />
                  )}
                  <InputGroup label="Location" value={formData.location || ''} onChange={(v) => setFormData({...formData, location: v})} type="select" options={['MIS STORAGE', 'MIS OFFICE', 'CABINET A', 'PLANT STORAGE']} />
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

function InputGroup({ label, placeholder, value, onChange, required, type = 'text', options = [], maxLength }: InputGroupProps) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label} {required && '*'}</label>
      {type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} className="p-2.5 border border-slate-200 rounded-lg text-xs outline-none bg-white focus:ring-2 focus:ring-red-900/10 focus:border-red-900 transition-all shadow-sm max-h-60 overflow-y-auto uppercase">
          {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input 
          type={type} 
          required={required} 
          placeholder={placeholder} 
          value={value} 
          onChange={e => {
            const val = e.target.value;
            onChange(type === 'text' ? val.toUpperCase() : val);
          }} 
          maxLength={maxLength}
          className="p-2.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-900/10 focus:border-red-900 transition-all shadow-sm uppercase" 
        />
      )}
    </div>
  );
}
