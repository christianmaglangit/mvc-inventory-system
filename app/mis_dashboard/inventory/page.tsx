'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Search, Server, HardDrive,
  Plus, X, LogOut, Edit, Trash2, Loader2, Download, Menu, Filter, Phone
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
  backup_time?: string; 
  
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

const epsList = [
  'Kaspersky', 'Microsoft', 'Symantec', 'McAfee', 'Trend Micro', 
  'Sophos', 'CrowdStrike', 'SentinelOne', 'Bitdefender', 'ESET', 
  'VMware', 'Palo Alto Networks', 'Cisco', 'Fortinet', 'Avast', 
  'AVG', 'Malwarebytes', 'None'
];

const romList = ['128GB', '240GB', '256GB', '480GB', '500GB', '512GB', '1TB', '2TB'];
const printerList = ['Epson L3110', 'Epson L3210', 'Brother L210'];

export default function InventoryPage() {
  const [activeCategory, setActiveCategory] = useState('Personal Computer');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- MULTI-SELECT STATE ---
  const [selectedExportDepts, setSelectedExportDepts] = useState<string[]>([]);
  const [showDeptFilter, setShowDeptFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

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
    
    // --- PHONE STATE LOGIC ---
    phone: 'No', 
    phone_quantity: 1,
    phone_conn_types: ['Local'],
    phone_types: ['Landline'],
    phone_numbers: [''],
    
    printer: 'No', printer_name: 'Epson L3110', 
    backup: 'No', backup_schedule: 'Select', backup_time: 'Select',
    // Parts Form Fields
    item_name: 'Monitor', brand_model: 'Dell', serial_number: '', quantity: 1, unit: 'Pcs', location: 'MIS STORAGE'
  };

  const [formData, setFormData] = useState<any>(initialForm);
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
      setSelectedExportDepts([]); // Reset filter on category change/fetch
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowDeptFilter(false);
      }
    };
    
    if (showDeptFilter) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDeptFilter]);

  const verifyPassword = async (password: string) => {
    if (!user?.email) return false;
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: password,
    });
    return !error;
  };

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
          
          // COMBINE PHONE ARRAYS INTO SINGLE STRINGS WITH ' / ' SEPARATOR
          phone_connection_type: isPhoneConnected ? formData.phone_conn_types.slice(0, formData.phone_quantity).join(' / ') : '',
          phone_type: isPhoneConnected ? formData.phone_types.slice(0, formData.phone_quantity).join(' / ') : '',
          phone_number: isPhoneConnected ? formData.phone_numbers.slice(0, formData.phone_quantity).join(' / ') : '',
          
          printer: formData.printer, 
          printer_name: formData.printer?.toLowerCase() === 'yes' ? formData.printer_name : '',
          backup: formData.backup, 
          backup_schedule: formData.backup?.toLowerCase() === 'yes' ? formData.backup_schedule : '',
          backup_time: formData.backup?.toLowerCase() === 'yes' ? formData.backup_time : ''
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

  // Extract unique departments for the filter dropdown
  const uniqueDepartments = Array.from(new Set(inventoryList.map(item => item.department?.toUpperCase()).filter(Boolean))).sort();

  const toggleDept = (dept: string) => {
    setSelectedExportDepts(prev => 
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  // --- FILTER & SORT DATA ---
  const filteredData = inventoryList.filter(item => {
    const matchesSearch = (item.user_full_name || item.item_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const itemDept = item.department?.toUpperCase() || "";
    const matchesDept = selectedExportDepts.length === 0 || selectedExportDepts.includes(itemDept);
    
    return matchesSearch && matchesDept;
  }).sort((a, b) => {
    if (selectedExportDepts.length > 0 && activeCategory === 'Personal Computer') {
      const deviceA = a.device_name || "";
      const deviceB = b.device_name || "";
      return deviceA.localeCompare(deviceB, undefined, { numeric: true, sensitivity: 'base' });
    }
    return 0; 
  });

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      Swal.fire('Info', 'No data to export for this selection', 'info');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";

    // Define Headers
    const headers = activeCategory === 'Personal Computer'
      ? ["Building", "Department", "User Full Name", "Computer Type", "Email", "Device Name", "OS Edition", "OS Version", "Status", "MS Office Version", "MS Office Status", "Processor Brand", "Processor Gen", "Processor CPU", "Processor Model", "RAM", "ROM/Capacity", "Storage Drive", "EPS", "Phone Connected", "Phone Conn Type", "Phone Type", "Phone Number", "Printer Connected", "Printer Name", "Backup Configured", "Backup Schedule", "Backup Time"]
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
          item.backup || "", item.backup?.toLowerCase() === 'yes' ? item.backup_schedule || "" : "None",
          item.backup?.toLowerCase() === 'yes' ? item.backup_time || "" : "None"
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
      return { wch: Math.min(maxLength + 2, 50) }; // cap width
    });

    worksheet['!cols'] = colWidths;
    
    const fileNameSuffix = selectedExportDepts.length === 0 ? '' : `_Filtered`;
    XLSX.writeFile(workbook, `MVC_Inventory_${activeCategory.replace(/ /g, '_')}${fileNameSuffix}.xlsx`);
  };

  const handleExportPDF = () => {
    if (filteredData.length === 0) {
      Swal.fire('Info', 'No data to export for this selection', 'info');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text("MABUHAY VINYL CORPORATION - ILIGAN PLANT", 14, 15);
    doc.setFontSize(11);
    
    const deptString = selectedExportDepts.length === 0 ? 'IT (All Records)' : selectedExportDepts.join(', ');
    doc.text(`Department: ${deptString}`, 14, 22);
    
    doc.setFontSize(9);
    doc.text(`Inventory Report: ${activeCategory}`, 14, 28);

    const tableColumn = activeCategory === 'Personal Computer' 
      ? ["Bldg", "Dept", "User", "Type", "Device", "OS", "Status", "Office Ver", "Office Stat", "CPU", "RAM", "Drive", "EPS", "Printer", "Phone Type", "Phone #", "Backup"]
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
            item.backup?.toLowerCase() === 'yes' ? `${item.backup_schedule || ''} @ ${item.backup_time || ''}` : "None"
          ]
        } else {
            return [
                item.item_name || "", item.brand_model || "", item.user_full_name || "N/A",
                item.quantity?.toString() || "0", item.unit || "", item.status || "", item.location || ""
              ]
        }
    });

    autoTable(doc, { head: [tableColumn], body: tableRows as any, startY: 30, styles: { fontSize: 7 }, headStyles: { fillColor: [127, 0, 0] } });
    
    const fileNameSuffix = selectedExportDepts.length === 0 ? '' : `_Filtered`;
    doc.save(`MVC_Inventory_${activeCategory.replace(/ /g, '_')}${fileNameSuffix}.pdf`);
  };

  const handleEdit = async (item: InventoryItem) => {
    const { value: password } = await Swal.fire({
      title: 'Authentication Required',
      text: 'Enter your password to edit this record',
      input: 'password',
      inputPlaceholder: 'Enter your password',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonColor: '#7f0000',
    });

    if (password) {
      const isValid = await verifyPassword(password);
      if (isValid) {
        setEditingId(item.id);
        
        // Parse Multiple Phone Logic for Editing
        const isPhone = item.phone?.toLowerCase() === 'yes';
        const pConn = item.phone_connection_type ? item.phone_connection_type.split(' / ') : ['Local'];
        const pType = item.phone_type ? item.phone_type.split(' / ') : ['Landline'];
        const pNum = item.phone_number ? item.phone_number.split(' / ') : [''];
        const pQty = isPhone ? Math.max(1, pNum.length) : 1;

        setFormData({ 
          ...initialForm, 
          ...item,
          phone_quantity: pQty,
          phone_conn_types: pConn,
          phone_types: pType,
          phone_numbers: pNum
        });
        
        setIsModalOpen(true);
      } else {
        Swal.fire('Error', 'Incorrect password', 'error');
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const { value: password } = await Swal.fire({
      title: 'Authentication Required',
      text: `Enter your password to delete the record for ${name}`,
      input: 'password',
      inputPlaceholder: 'Enter your password',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonColor: '#7f0000',
      confirmButtonText: 'Verify & Delete'
    });

    if (password) {
      const isValid = await verifyPassword(password);
      if (isValid) {
        try {
          await supabase.from(getTableName(activeCategory)).delete().eq('id', id).eq('user_id', user.id);
          fetchData();
          Swal.fire('Deleted!', 'The record has been deleted.', 'success');
        } catch (error: any) {
          Swal.fire('Error', error.message, 'error');
        }
      } else {
        Swal.fire('Error', 'Incorrect password', 'error');
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const displayName = user?.user_metadata?.full_name || 'MIS User';
  const displayDept = user?.user_metadata?.department || 'IT Department';
  const initials = displayName.split(' ').map((n: any) => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="flex h-[100dvh] bg-slate-50 text-slate-900 font-sans overflow-hidden relative text-[11px]">
      
      {/* OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
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

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        {/* MAIN HEADER */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-50 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 rounded-md lg:hidden hover:bg-slate-100 text-slate-600"><Menu size={20} /></button>
            <h1 className="text-sm md:text-lg font-bold tracking-tight">Inventory Management</h1>
          </div>
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-red-900" size={16} />
            <input type="text" placeholder="Search my records..." className="bg-slate-100 border border-slate-200 rounded-md py-2 pl-9 pr-4 text-xs w-48 md:w-64 focus:outline-none focus:bg-white transition-all shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </header>

        {/* --- MAIN CONTENT AREA (Isolated Scroll) --- */}
        <div className="flex-1 flex flex-col p-4 md:p-8 gap-4 min-h-0 relative z-0">
          
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0">
            {/* TABS CONTAINER */}
            <div className="flex bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm w-full sm:w-fit gap-1 shrink-0">
              <TabBtn label="Personal Computer" active={activeCategory === 'Personal Computer'} onClick={() => setActiveCategory('Personal Computer')} />
              <TabBtn label="Computer Parts" active={activeCategory === 'Computer Parts'} onClick={() => setActiveCategory('Computer Parts')} />
            </div>

            {/* ACTION BUTTONS & FILTER CONTAINER */}
            <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto">
              
              {/* --- MULTI-DEPARTMENT EXPORT FILTER --- */}
              <div 
                ref={filterRef}
                className="relative flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-sm px-3 py-2 w-full sm:w-auto shrink-0 cursor-pointer hover:bg-slate-50 transition-colors" 
                onClick={() => setShowDeptFilter(!showDeptFilter)}
              >
                 <Filter size={14} className="text-slate-400 mr-2 shrink-0" />
                 <span className="text-[10px] font-bold uppercase text-slate-600 truncate max-w-[120px] sm:max-w-[150px]">
                   {selectedExportDepts.length === 0 ? 'All Departments' : `${selectedExportDepts.length} Selected`}
                 </span>

                 {/* Custom Checkbox Dropdown Menu */}
                 {showDeptFilter && (
                   <div className="absolute top-full mt-1 right-0 sm:left-0 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto p-2" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer mb-1 border-b border-slate-100" onClick={() => setSelectedExportDepts([])}>
                        <input type="checkbox" checked={selectedExportDepts.length === 0} readOnly className="accent-red-900 pointer-events-none" />
                        <span className="text-[10px] font-bold uppercase text-slate-600">All Departments</span>
                      </div>
                      {uniqueDepartments.map((dept, i) => (
                        <div key={i} className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer" onClick={() => toggleDept(dept as string)}>
                          <input type="checkbox" checked={selectedExportDepts.includes(dept as string)} readOnly className="accent-red-900 pointer-events-none" />
                          <span className="text-[10px] font-bold uppercase text-slate-600">{dept}</span>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
              
              <button onClick={handleExportPDF} className="w-full sm:w-auto flex-1 flex items-center justify-center border border-red-200 gap-2 px-4 py-2 bg-red-50 text-red-800 text-[10px] font-bold rounded-lg hover:bg-red-100 transition-all shadow-sm whitespace-nowrap"><Download size={14} /> PDF</button>
              <button onClick={handleExportExcel} className="w-full sm:w-auto flex-1 flex items-center justify-center border border-emerald-200 gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg hover:bg-emerald-100 transition-all shadow-sm whitespace-nowrap"><Download size={14} /> Excel</button>
              <button onClick={() => { setEditingId(null); setFormData(initialForm); setIsModalOpen(true); }} className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-900 text-white text-[10px] font-bold rounded-lg shadow-md active:scale-95 transition-all whitespace-nowrap"><Plus size={14} /> Add Record</button>
            </div>
          </div>

          {/* --- STRICTLY CONFINED SCROLLING TABLE CONTAINER --- */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden relative z-0">
            <div className="flex-1 overflow-auto custom-scrollbar relative">
              <table className="w-full text-left text-slate-600 whitespace-nowrap min-w-max border-separate border-spacing-0">
                
                <thead className="sticky top-0 z-30 shadow-md shadow-slate-200/50">
                  {activeCategory === 'Personal Computer' ? (
                    <>
                      <tr>
                        <th rowSpan={2} className="px-3 py-3 border-r border-b border-slate-200 align-middle bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">BUILDING</th>
                        <th rowSpan={2} className="px-3 py-3 border-r border-b border-slate-200 align-middle bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">DEPARTMENT / OFFICE</th>
                        <th rowSpan={2} className="px-3 py-3 border-r border-b border-slate-200 sticky left-0 z-40 text-slate-900 align-middle bg-blue-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] font-bold uppercase text-[10px] text-center">USER &quot;Full Name&quot;</th>
                        <th rowSpan={2} className="px-3 py-3 border-r border-b border-slate-200 align-middle bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">COMP. TYPE</th>
                        <th rowSpan={2} className="px-3 py-3 border-r border-b border-slate-200 align-middle bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">EMAIL</th>
                        <th rowSpan={2} className="px-3 py-3 border-r border-b border-slate-200 align-middle bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">DEVICE NAME</th>
                        <th colSpan={2} className="px-3 py-2 border-r border-b border-slate-200 text-center bg-blue-50 font-bold uppercase text-slate-600 text-[10px]">Windos SPICIFICATION</th>
                        <th rowSpan={2} className="px-3 py-3 border-r border-b border-slate-200 align-middle bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">STATUS</th>
                        <th colSpan={2} className="px-3 py-2 border-r border-b border-slate-200 text-center bg-blue-50 font-bold uppercase text-slate-600 text-[10px]">MS OFFICE</th>
                        <th colSpan={4} className="px-3 py-2 border-r border-b border-slate-200 text-center bg-blue-50 font-bold uppercase text-slate-600 text-[10px]">PROCESSOR</th>
                        <th rowSpan={2} className="px-3 py-3 border-r border-b border-slate-200 align-middle bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">RAM</th>
                        <th rowSpan={2} className="px-3 py-3 border-r border-b border-slate-200 align-middle bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">ROM / Capacity</th>
                        <th rowSpan={2} className="px-3 py-3 border-r border-b border-slate-200 align-middle bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">Storage drive</th>
                        <th rowSpan={2} className="px-3 py-3 border-r border-b border-slate-200 align-middle bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">EPS</th>
                        <th colSpan={3} className="px-3 py-2 border-r border-b border-slate-200 text-center bg-blue-50 font-bold uppercase text-slate-600 text-[10px]">PHONE</th>
                        <th colSpan={2} className="px-3 py-2 border-r border-b border-slate-200 text-center bg-blue-50 font-bold uppercase text-slate-600 text-[10px]">PRINTER</th>
                        <th colSpan={3} className="px-3 py-2 border-r border-b border-slate-200 text-center bg-blue-50 font-bold uppercase text-slate-600 text-[10px]">BACKUP</th>
                        <th rowSpan={2} className="px-4 py-3 border-b text-center sticky right-0 bg-blue-50 border-l border-slate-200 align-middle z-40 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] font-bold uppercase text-slate-600 text-[10px]">Actions</th>
                      </tr>
                      <tr>
                        {/* WINDOWS */}
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">EDITION</th>
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">VERSION</th>
                        {/* MS OFFICE */}
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">VERSION</th>
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">STATUS</th>
                        {/* PROCESSOR */}
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">BRAND</th>
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">generation</th>
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">CPU</th>
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">model number</th>
                        {/* PHONE */}
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">Conn. Type</th>
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">Type</th>
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">Number</th>
                        {/* PRINTER */}
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">Conn.</th>
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">Name</th>
                        {/* BACKUP */}
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">Config.</th>
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">Schedule</th>
                        <th className="px-3 py-2 border-r border-b border-slate-200 bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">Time</th>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <th className="px-4 py-4 border-r border-b border-slate-200 align-middle bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">Item Name</th>
                      <th className="px-4 py-4 border-r border-b border-slate-200 align-middle bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">Brand</th>
                      <th className="px-4 py-4 border-r border-b border-slate-200 sticky left-0 z-40 text-slate-900 text-left align-middle bg-blue-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] font-bold uppercase text-[10px]">User</th>
                      <th className="px-4 py-4 border-r border-b border-slate-200 align-middle bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">Qty</th>
                      <th className="px-4 py-4 border-r border-b border-slate-200 align-middle bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">Status</th>
                      <th className="px-4 py-4 border-r border-b border-slate-200 align-middle bg-blue-50 font-bold uppercase text-slate-600 text-[10px] text-center">Location</th>
                      <th className="px-4 py-4 border-b text-center sticky right-0 bg-blue-50 border-l border-slate-200 align-middle z-40 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] font-bold uppercase text-slate-600 text-[10px]">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody className="text-center relative z-0">
                  {loading ? (
                    <tr><td colSpan={28} className="p-20 text-center border-b border-slate-100"><Loader2 className="animate-spin inline text-red-900" size={32}/></td></tr>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group text-slate-700">
                        {activeCategory === 'Personal Computer' ? (
                          <>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.building}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.department}</td>
                            {/* Sticky Left Column */}
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 font-bold text-slate-900 sticky left-0 z-10 bg-white transition-colors group-hover:bg-slate-50 uppercase shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{item.user_full_name}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 font-semibold uppercase">{item.computer_type}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 text-blue-600 uppercase">{item.email}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 font-bold uppercase">{item.device_name}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.os_edition}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.os_version}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.status}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.ms_office_version}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">
                              <span className={`px-2 py-0.5 rounded-full font-bold border-slate-50 ${item.ms_office_status?.toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{item.ms_office_status}</span>
                            </td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.processor_brand}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.processor_gen}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.processor_cpu}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.processor_model}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 font-medium uppercase">{item.ram}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 font-medium text-blue-800 uppercase">{item.rom}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.storage_drive}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">
                              <span className={`px-2 py-0.5 rounded-full font-bold border-slate-50 ${item.kaspersky?.toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{item.kaspersky}</span>
                            </td>
                            
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.phone?.toLowerCase() === 'yes' ? item.phone_connection_type : '-'}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.phone?.toLowerCase() === 'yes' ? item.phone_type : '-'}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.phone?.toLowerCase() === 'yes' ? item.phone_number : '-'}</td>
                            
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.printer}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.printer?.toLowerCase() === 'yes' ? item.printer_name : '-'}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.backup}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.backup?.toLowerCase() === 'yes' ? item.backup_schedule : '-'}</td>
                            <td className="px-3 py-3.5 border-r border-b border-slate-100 uppercase">{item.backup?.toLowerCase() === 'yes' ? item.backup_time : '-'}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3.5 border-r border-b border-slate-50 font-bold text-slate-900 text-left uppercase">{item.item_name}</td>
                            <td className="px-4 py-3.5 border-r border-b border-slate-50 text-left uppercase">{item.brand_model}</td>
                            {/* Sticky Left Column */}
                            <td className="px-4 py-3.5 border-r border-b border-slate-50 bg-white sticky left-0 z-10 group-hover:bg-slate-50 text-left font-semibold uppercase shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{item.user_full_name || 'N/A'}</td>
                            <td className="px-4 py-3.5 border-r border-b border-slate-50 font-bold text-blue-600 uppercase">{item.quantity} {item.unit}</td>
                            <td className="px-4 py-3.5 border-r border-b border-slate-50 uppercase"><span className={`px-2 py-0.5 rounded-full text-[10px] border-slate-50 font-bold ${item.status === 'New' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>{item.status}</span></td>
                            <td className="px-4 py-3.5 border-r border-b border-slate-50 italic text-slate-500 uppercase">{item.location}</td>
                          </>
                        )}
                        
                        {/* Sticky Right Actions Column */}
                        <td className="px-4 py-3.5 text-center sticky right-0 bg-white group-hover:bg-slate-50 border-l border-b border-slate-100 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => handleEdit(item)} className="p-1 text-slate-400 hover:text-blue-600 transition-all"><Edit size={14} /></button>
                            <button onClick={() => handleDelete(item.id, item.user_full_name || item.item_name || "")} className="p-1 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={28} className="p-10 text-center border-b border-slate-100 italic text-slate-400 uppercase text-[10px]">No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- EXTRICATED FIXED FOOTER --- */}
        <footer className="py-3 shrink-0 text-center bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-200 z-10 w-full shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
          Developed by Christian B. Maglangit
        </footer>
      </main>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-all text-[11px]">
          <form onSubmit={handleSaveRecord} className="bg-white rounded-xl shadow-2xl w-full max-w-5xl border border-slate-200 overflow-hidden text-left flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center font-bold text-slate-800 uppercase tracking-widest shrink-0">
               <h2 className="text-xs sm:text-sm">{editingId ? 'Edit' : 'New'} Record ({activeCategory})</h2>
               <button type="button" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            {/* Scrollable Form Body */}
            <div className="p-4 sm:p-6 overflow-y-auto">
              {activeCategory === 'Personal Computer' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-full font-bold text-slate-800 border-b pb-1 mb-2">User & Device Info</div>
                  <InputGroup label="Building" value={formData.building} onChange={(v) => setFormData({...formData, building: v})} type="select" options={['Admin', 'Security', 'IEM 1', 'IEM 2', 'QC', 'LCP', '69 KB Sub Station', 'Boiler / Demi', 'Contractor',]} />
                  <InputGroup label="Department" value={formData.department} onChange={(v) => setFormData({...formData, department: v})} type="select" options={['President Office', 'VP - Office', 'MIS', 'HRD', 'TECHNICAL', 'EHS', 'ENGINEERING', 'MATERIALS', 'MARKETING & SALES', 'FINANCE & ACCOUNTING', 'SECURITY', 'IEM 1', 'IEM 2', 'QC', 'AVP', 'SHIFT MANAGERS', 'CONTRACTOR', ]} />
                  <InputGroup label="User Name" placeholder="Ex: Juan Dela Cruz" value={formData.user_full_name} onChange={(v) => setFormData({...formData, user_full_name: v})} required />
                  <InputGroup label="Computer Type" value={formData.computer_type || 'Desktop'} onChange={(v) => setFormData({...formData, computer_type: v})} type="select" options={['Desktop', 'NUC', 'NUC Dell', 'NUC HP', 'NUC Intel', 'Laptop']} />
                  <InputGroup label="Email" placeholder="user@domain.com" value={formData.email || ''} onChange={(v) => setFormData({...formData, email: v})} />
                  <InputGroup label="Device Name" placeholder="PC-01" value={formData.device_name || ''} onChange={(v) => setFormData({...formData, device_name: v})} />
                  <InputGroup label="Status" value={formData.status || ''} onChange={(v) => setFormData({...formData, status: v})} type="select" options={['Active', 'Inactive', 'Defective', 'Spare']} />

                  <div className="col-span-full font-bold text-slate-800 border-b pb-1 mb-2 mt-2">OS & Software</div>
                  <InputGroup label="OS Edition" value={formData.os_edition || ''} onChange={(v) => setFormData({...formData, os_edition: v})} type="select" options={['Windows 11 Pro', 'Windows 11 Home', 'Windows 10 Pro', 'Windows 10 Home', 'Windows 8.1', 'Windows 7', 'macOS', 'Linux']} />
                  <InputGroup label="OS Version" placeholder="Ex: 22H2" value={formData.os_version || ''} onChange={(v) => setFormData({...formData, os_version: v})} />
                  <InputGroup label="MS Office" value={formData.ms_office_version} onChange={(v) => setFormData({...formData, ms_office_version: v})} type="select" options={[
                    'Home & Business 2024', 'Home & Business 2021', 'Home & Business 2019', 'Home & Business 2016', 'Home & Business 2010', 
                    'Professional Plus 2024', 'Professional Plus 2021', 'Professional Plus 2019', 'Professional Plus 2016', 'Professional Plus 2010', 
                    'Office 365', 'None'
                  ]} />
                  <InputGroup label="MS Office Status" value={formData.ms_office_status || 'Active'} onChange={(v) => setFormData({...formData, ms_office_status: v})} type="select" options={['Active', 'Not Active']} />

                  <InputGroup label="Kaspersky" value={formData.kaspersky} onChange={(v) => setFormData({...formData, kaspersky: v})} type="select" options={['Active', 'Not Active']} />

                  <div className="col-span-full font-bold text-slate-800 border-b pb-1 mb-2 mt-2">Processor Details</div>
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
                  <InputGroup label="Model Number" placeholder="Ex: 12400F" value={formData.processor_model || ''} onChange={(v) => setFormData({...formData, processor_model: v})} />

                  <div className="col-span-full font-bold text-slate-800 border-b pb-1 mb-2 mt-2">Storage & Memory</div>
                  <InputGroup label="RAM" value={formData.ram} onChange={(v) => setFormData({...formData, ram: v})} type="select" options={['4GB', '8GB', '16GB', '32GB', '64GB']} />
                  
                  <InputGroup 
                    label="ROM / Capacity" 
                    value={['128GB', '240GB', '256GB', '480GB', '500GB', '512GB', '1TB', '2TB', '3TB'].includes(formData.rom || '') ? formData.rom || '256GB' : 'Others'} 
                    onChange={(v) => setFormData({...formData, rom: v === 'Others' ? '' : v})} 
                    type="select" 
                    options={['128GB', '240GB', '256GB', '480GB', '500GB', '512GB', '1TB', '2TB', '3TB', 'Others']} 
                  />
                  {(!['128GB', '240GB', '256GB', '480GB', '500GB', '512GB', '1TB', '2TB', '3TB'].includes(formData.rom || '') || formData.rom === '') && (
                    <InputGroup label="Specify Capacity" placeholder="Ex: 4TB" value={formData.rom || ''} onChange={(v) => setFormData({...formData, rom: v})} required />
                  )}

                  <InputGroup label="Storage Drive" value={formData.storage_drive || ''} onChange={(v) => setFormData({...formData, storage_drive: v})} type="select" options={['SSD', 'HDD', 'NVMe', 'M.2']} />
                  
                  <div className="col-span-full font-bold text-slate-800 border-b pb-1 mb-2 mt-2">Peripherals</div>
                  
                  {/* --- MULTI-PHONE LOGIC --- */}
                  <div className="col-span-full border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col gap-4">
                    <div className="w-full sm:w-1/3">
                      <InputGroup label="Phone Connected?" value={formData.phone || 'No'} onChange={(v) => {
                        setFormData({
                          ...formData, 
                          phone: v, 
                          phone_quantity: 1,
                          phone_conn_types: ['Local'],
                          phone_types: ['Landline'],
                          phone_numbers: ['']
                        })
                      }} type="select" options={['Yes', 'No']} />
                    </div>
                    
                    {formData.phone?.toLowerCase() === 'yes' && (
                      <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
                        <div className="w-full sm:w-1/3">
                          <InputGroup 
                            label="How many phones?" 
                            type="select" 
                            value={formData.phone_quantity || 1} 
                            options={['1', '2', '3', '4', '5']} 
                            onChange={(v) => {
                              const qty = parseInt(v as string) || 1;
                              const cTypes = [...(formData.phone_conn_types || [])];
                              const pTypes = [...(formData.phone_types || [])];
                              const pNums = [...(formData.phone_numbers || [])];
                              
                              while (cTypes.length < qty) cTypes.push('Local');
                              while (pTypes.length < qty) pTypes.push('Landline');
                              while (pNums.length < qty) pNums.push('');
                              
                              setFormData({ 
                                  ...formData, 
                                  phone_quantity: qty, 
                                  phone_conn_types: cTypes, 
                                  phone_types: pTypes, 
                                  phone_numbers: pNums 
                              });
                            }} 
                          />
                        </div>

                        {/* RENDER DYNAMIC PHONE ROWS */}
                        {Array.from({ length: formData.phone_quantity || 1 }).map((_, i) => (
                          <div key={i} className="flex flex-col sm:flex-row items-center gap-3 w-full bg-white p-3 rounded shadow-sm border border-slate-100">
                            <div className="w-full sm:w-[15%] text-xs font-black text-slate-400 uppercase flex items-center gap-2 mb-2 sm:mb-0">
                               <Phone size={14} className="text-red-900" /> Phone {i + 1}
                            </div>
                            
                            <div className="w-full sm:w-auto flex-1">
                              <InputGroup 
                                label="Conn. Type" 
                                value={formData.phone_conn_types?.[i] || 'Local'} 
                                onChange={(v) => {
                                  const newC = [...formData.phone_conn_types];
                                  newC[i] = v;
                                  const newT = [...formData.phone_types];
                                  newT[i] = v === 'Local' ? 'Landline' : 'Fanvil';
                                  setFormData({ ...formData, phone_conn_types: newC, phone_types: newT });
                                }} 
                                type="select" 
                                options={['Local', 'IP']} 
                              />
                            </div>
                            
                            <div className="w-full sm:w-auto flex-1">
                              <InputGroup 
                                label="Phone Type" 
                                value={formData.phone_types?.[i] || (formData.phone_conn_types?.[i] === 'Local' ? 'Landline' : 'Fanvil')} 
                                onChange={(v) => {
                                  const newT = [...formData.phone_types];
                                  newT[i] = v;
                                  setFormData({...formData, phone_types: newT});
                                }} 
                                type="select" 
                                options={formData.phone_conn_types?.[i] === 'Local' ? ['Landline', 'Local'] : ['Fanvil', 'Cisco']} 
                              />
                            </div>

                            <div className="w-full sm:w-auto flex-1">
                              <InputGroup 
                                label="Number" 
                                placeholder="Ex: 101" 
                                value={formData.phone_numbers?.[i] || ''} 
                                onChange={(v) => {
                                  const newN = [...formData.phone_numbers];
                                  newN[i] = v;
                                  setFormData({...formData, phone_numbers: newN});
                                }} 
                                required 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* ------------------- */}
                  
                  <InputGroup label="Printer Connected?" value={formData.printer || 'No'} onChange={(v) => setFormData({...formData, printer: v})} type="select" options={['Yes', 'No']} />
                  {formData.printer?.toLowerCase() === 'yes' && (
                    <>
                      <InputGroup 
                        label="Printer Name" 
                        value={printerList.some(o => o.toUpperCase() === (formData.printer_name || '').toUpperCase()) ? (printerList.find(o => o.toUpperCase() === (formData.printer_name || '').toUpperCase()) || 'Epson L3110') : 'Others'} 
                        onChange={(v) => setFormData({...formData, printer_name: v === 'Others' ? '' : v})} 
                        type="select" 
                        options={[...printerList, 'Others']} 
                      />
                      {/* CUSTOM PRINTER NAME FIELD IF 'OTHERS' IS SELECTED */}
                      {(!printerList.some(o => o.toUpperCase() === (formData.printer_name || '').toUpperCase()) || formData.printer_name === '') && (
                        <InputGroup label="Specify Printer" placeholder="Ex: HP DeskJet" value={formData.printer_name || ''} onChange={(v) => setFormData({...formData, printer_name: v})} required />
                      )}
                    </>
                  )}
                  
                  {/* --- ADDED BACKUP SETTINGS --- */}
                  <div className="col-span-full font-bold text-slate-800 border-b pb-1 mb-2 mt-2">Backup Settings</div>
                  <InputGroup label="Backup Configured?" value={formData.backup || 'No'} onChange={(v) => setFormData({...formData, backup: v})} type="select" options={['Yes', 'No']} />
                  {formData.backup?.toLowerCase() === 'yes' && (
                    <>
                      <InputGroup 
                        label="Backup Schedule" 
                        value={formData.backup_schedule || 'Select'} 
                        onChange={(v) => setFormData({...formData, backup_schedule: v})} 
                        type="select" 
                        options={['Select', 'Daily', 'Weekly', 'Monthly']} 
                      />
                      <InputGroup 
                        label="Backup Time" 
                        value={formData.backup_time || 'Select'} 
                        onChange={(v) => setFormData({...formData, backup_time: v})} 
                        type="select" 
                        options={['Select', '08:00', '12:00', '17:00']} 
                      />
                    </>
                  )}

                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                </div>
              )}
            </div>
            
            {/* MODAL FOOTER WITH CENTERED TEXT */}
            <div className="px-6 py-4 border-t bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 relative">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest sm:absolute sm:left-1/2 sm:-translate-x-1/2">
                Developed by Christian B. Maglangit
              </span>
              <div className="flex justify-end gap-3 w-full sm:w-auto sm:ml-auto">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-[10px] font-bold text-slate-500 uppercase px-4 hover:text-slate-800 transition-colors">Cancel</button>
                <button disabled={isSaving} type="submit" className={`px-10 py-2.5 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg ${editingId ? 'bg-blue-600 shadow-blue-900/20' : 'bg-red-900 shadow-red-900/20'}`}>
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : "Save Record"}
                </button>
              </div>
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
    <div className="flex flex-col gap-1.5 text-left w-full">
      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label} {required && '*'}</label>
      {type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} className="p-2.5 border border-slate-200 rounded-lg text-xs outline-none bg-white focus:ring-2 focus:ring-red-900/10 focus:border-red-900 transition-all shadow-sm max-h-60 overflow-y-auto uppercase w-full">
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
          className="p-2.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-red-900/10 focus:border-red-900 transition-all shadow-sm uppercase w-full" 
        />
      )}
    </div>
  );
}