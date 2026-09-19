import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Calendar, 
  Trash2, 
  Edit3, 
  Printer, 
  TrendingUp, 
  X,
  Coins
} from 'lucide-react';
import { ClientInvoice, VendorBill, PaymentStatus, ServiceType } from '../types';
import { useEventContext } from '../context/EventContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate } from '../utils/formatters';

interface BillingViewProps {
  onOpenPrintInvoice: (invoiceId: string) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onOpenPrintInvoice }) => {
  const { 
    events, 
    vendors, 
    clientInvoices, 
    vendorBills, 
    financialSummary,
    addClientInvoice,
    updateClientInvoice,
    deleteClientInvoice,
    addVendorBill,
    updateVendorBill,
    deleteVendorBill
  } = useEventContext();
  const { format, currencyConfig } = useCurrency();

  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'bills'>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Client Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<ClientInvoice | null>(null);
  const [invEventId, setInvEventId] = useState(events[0]?.id || '');
  const [invNumber, setInvNumber] = useState('');
  const [invAmount, setInvAmount] = useState(30000);
  const [invAmountPaid, setInvAmountPaid] = useState(15000);
  const [invDueDate, setInvDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [invStatus, setInvStatus] = useState<PaymentStatus>('Partially Paid');
  const [invNotes, setInvNotes] = useState('');

  // Vendor Bill Modal State
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<VendorBill | null>(null);
  const [billEventId, setBillEventId] = useState(events[0]?.id || '');
  const [billVendorId, setBillVendorId] = useState(vendors[0]?.id || '');
  const [billNumber, setBillNumber] = useState('');
  const [billAmount, setBillAmount] = useState(12000);
  const [billAmountPaid, setBillAmountPaid] = useState(6000);
  const [billDueDate, setBillDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [billStatus, setBillStatus] = useState<PaymentStatus>('Partially Paid');
  const [billCategory, setBillCategory] = useState<ServiceType>('Audio, Visual & Lights');

  // Filtered Invoices
  const filteredInvoices = clientInvoices.filter(inv => {
    const matchesStatus = selectedStatus === 'All' || inv.status === selectedStatus;
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.eventTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered Bills
  const filteredBills = vendorBills.filter(b => {
    const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;
    const matchesSearch = 
      b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.eventTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Invoice Handlers
  const handleOpenAddInvoice = () => {
    setEditingInvoice(null);
    const selectedEvt = events[0];
    setInvEventId(selectedEvt?.id || '');
    setInvNumber(`INV-${Date.now().toString().slice(-4)}`);
    setInvAmount(selectedEvt ? selectedEvt.budget : 40000);
    setInvAmountPaid(0);
    setInvDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setInvStatus('Unpaid');
    setInvNotes('');
    setIsInvoiceModalOpen(true);
  };

  const handleOpenEditInvoice = (inv: ClientInvoice) => {
    setEditingInvoice(inv);
    setInvEventId(inv.eventId);
    setInvNumber(inv.invoiceNumber);
    setInvAmount(inv.totalAmount);
    setInvAmountPaid(inv.amountPaid);
    setInvDueDate(inv.dueDate);
    setInvStatus((inv.status as PaymentStatus) || 'Partially Paid');
    setInvNotes(inv.notes || '');
    setIsInvoiceModalOpen(true);
  };

  const handleDeleteInvoice = (inv: ClientInvoice) => {
    if (window.confirm(`Delete client invoice "${inv.invoiceNumber}"?`)) {
      deleteClientInvoice(inv.id);
    }
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const evt = events.find(e => e.id === invEventId);
    if (!evt) return;

    if (editingInvoice) {
      updateClientInvoice(editingInvoice.id, {
        eventId: invEventId,
        eventTitle: evt.title,
        clientName: evt.clientName,
        invoiceNumber: invNumber,
        totalAmount: Number(invAmount),
        amountPaid: Number(invAmountPaid),
        dueDate: invDueDate,
        status: invStatus,
        notes: invNotes
      });
    } else {
      const generatedItems = evt.services.map(s => ({
        id: `item-${Date.now()}-${s.id}`,
        description: `${s.name} (${s.serviceType})`,
        category: s.serviceType,
        quantity: 1,
        unitPrice: s.clientPrice,
        total: s.clientPrice
      }));
      addClientInvoice({
        eventId: invEventId,
        eventTitle: evt.title,
        clientName: evt.clientName,
        clientEmail: evt.clientEmail,
        invoiceNumber: invNumber,
        totalAmount: Number(invAmount),
        amountPaid: Number(invAmountPaid),
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: invDueDate,
        status: invStatus,
        notes: invNotes,
        items: generatedItems,
        lineItems: generatedItems
      });
    }
    setIsInvoiceModalOpen(false);
  };

  // Bill Handlers
  const handleOpenAddBill = () => {
    setEditingBill(null);
    setBillEventId(events[0]?.id || '');
    setBillVendorId(vendors[0]?.id || '');
    setBillNumber(`BILL-${Date.now().toString().slice(-4)}`);
    setBillAmount(8000);
    setBillAmountPaid(0);
    setBillDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setBillStatus('Unpaid');
    setBillCategory(vendors[0]?.category || 'Audio, Visual & Lights');
    setIsBillModalOpen(true);
  };

  const handleOpenEditBill = (b: VendorBill) => {
    setEditingBill(b);
    setBillEventId(b.eventId);
    setBillVendorId(b.vendorId);
    setBillNumber(b.billNumber);
    setBillAmount(b.amount);
    setBillAmountPaid(b.amountPaid);
    setBillDueDate(b.dueDate);
    setBillStatus((b.status as PaymentStatus) || 'Partially Paid');
    setBillCategory(b.serviceCategory);
    setIsBillModalOpen(true);
  };

  const handleDeleteBill = (b: VendorBill) => {
    if (window.confirm(`Delete vendor bill "${b.billNumber}"?`)) {
      deleteVendorBill(b.id);
    }
  };

  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    const evt = events.find(e => e.id === billEventId);
    const v = vendors.find(v => v.id === billVendorId);
    if (!evt || !v) return;

    if (editingBill) {
      updateVendorBill(editingBill.id, {
        eventId: billEventId,
        eventTitle: evt.title,
        vendorId: billVendorId,
        vendorName: v.name,
        billNumber,
        amount: Number(billAmount),
        amountPaid: Number(billAmountPaid),
        dueDate: billDueDate,
        status: billStatus,
        serviceCategory: billCategory
      });
    } else {
      addVendorBill({
        eventId: billEventId,
        eventTitle: evt.title,
        vendorId: billVendorId,
        vendorName: v.name,
        billNumber,
        amount: Number(billAmount),
        amountPaid: Number(billAmountPaid),
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: billDueDate,
        status: billStatus,
        serviceCategory: billCategory
      });
    }
    setIsBillModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Multi-Currency Billing & Ledger</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              {currencyConfig.code} &bull; {currencyConfig.name}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time multi-currency calculations across client invoices, vendor purchase orders, and profit yields.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeSubTab === 'invoices' ? (
            <button
              onClick={handleOpenAddInvoice}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 via-indigo-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Client Invoice</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddBill}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Vendor Bill</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards in Selected Currency */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-sans block">Client Invoiced Total</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 block">
            {format(financialSummary.totalRevenue)}
          </span>
          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-sans block mt-1">
            Across {clientInvoices.length} invoices
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-sans block">Client Collected</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-950 dark:text-emerald-300 mt-1 block">
            {format(financialSummary.totalClientPaid)}
          </span>
          <span className="text-[10px] text-emerald-600 font-sans block mt-1">
            {format(financialSummary.totalClientOutstanding)} Pending Collection
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-orange-500/10 border border-orange-500/30">
          <span className="text-xs text-orange-700 dark:text-orange-400 font-sans block">Vendor Payables</span>
          <span className="text-xl sm:text-2xl font-bold text-orange-950 dark:text-orange-300 mt-1 block">
            {format(financialSummary.totalVendorPaid + financialSummary.totalVendorOutstanding)}
          </span>
          <span className="text-[10px] text-orange-600 font-sans block mt-1">
            {format(financialSummary.totalVendorOutstanding)} Unpaid to Partners
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
          <span className="text-xs text-cyan-700 dark:text-cyan-400 font-sans block">Net Operating Yield</span>
          <span className="text-xl sm:text-2xl font-bold text-cyan-950 dark:text-cyan-300 mt-1 block">
            {format(financialSummary.totalGrossMargin)}
          </span>
          <span className="text-[10px] text-emerald-600 font-sans font-bold block mt-1">
            {financialSummary.grossMarginPercentage.toFixed(1)}% Gross Yield
          </span>
        </div>
      </div>

      {/* Subtab Toggle & Search */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-1 text-xs">
            <button
              onClick={() => setActiveSubTab('invoices')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSubTab === 'invoices'
                  ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Client Invoices ({clientInvoices.length})
            </button>
            <button
              onClick={() => setActiveSubTab('bills')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeSubTab === 'bills'
                  ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Vendor Bills & POs ({vendorBills.length})
            </button>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeSubTab}...`}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      {activeSubTab === 'invoices' ? (
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold font-sans">
              <tr>
                <th className="px-4 py-3 text-left">Invoice #</th>
                <th className="px-4 py-3 text-left">Event & Client</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-right">Total ({currencyConfig.code})</th>
                <th className="px-4 py-3 text-right">Amount Paid</th>
                <th className="px-4 py-3 text-right">Balance Due</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right font-sans">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map(inv => {
                const balance = inv.totalAmount - inv.amountPaid;
                return (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-cyan-600 dark:text-cyan-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <div className="font-bold text-slate-900 dark:text-white">{inv.eventTitle}</div>
                      <div className="text-[11px] text-slate-500">{inv.clientName}</div>
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-600 dark:text-slate-400">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                      {format(inv.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {format(inv.amountPaid)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-amber-600 dark:text-amber-400">
                      {format(balance)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={inv.status}
                        onChange={(e) => updateClientInvoice(inv.id, { status: e.target.value as PaymentStatus })}
                        className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenPrintInvoice(inv.id)}
                          className="px-2 py-1 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-cyan-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="View, Print & Download Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Print</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditInvoice(inv)}
                          className="p-1.5 text-slate-400 hover:text-cyan-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Vendor Bills Table */
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold font-sans">
              <tr>
                <th className="px-4 py-3 text-left">Bill / PO #</th>
                <th className="px-4 py-3 text-left">Vendor Partner</th>
                <th className="px-4 py-3 text-left">Event & Category</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-right">Amount ({currencyConfig.code})</th>
                <th className="px-4 py-3 text-right">Amount Paid</th>
                <th className="px-4 py-3 text-center font-sans">Status</th>
                <th className="px-4 py-3 text-right font-sans">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBills.map(bill => {
                return (
                  <tr key={bill.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {bill.billNumber}
                    </td>
                    <td className="px-4 py-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                      {bill.vendorName}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-600 dark:text-slate-400">
                      <div>{bill.eventTitle}</div>
                      <div className="text-[11px] text-cyan-600">{bill.serviceCategory}</div>
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-600 dark:text-slate-400">
                      {formatDate(bill.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                      {format(bill.amount)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {format(bill.amountPaid)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={bill.status}
                        onChange={(e) => updateVendorBill(bill.id, { status: e.target.value as PaymentStatus })}
                        className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditBill(bill)}
                          className="p-1.5 text-slate-400 hover:text-cyan-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Bill"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBill(bill)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete Bill"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CLIENT INVOICE MODAL */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-cyan-500" />
                <span>{editingInvoice ? 'Edit Client Invoice' : 'Issue Client Invoice'}</span>
              </h2>
              <button onClick={() => setIsInvoiceModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Event *</label>
                <select
                  value={invEventId}
                  onChange={(e) => {
                    setInvEventId(e.target.value);
                    const selected = events.find(ev => ev.id === e.target.value);
                    if (selected && !editingInvoice) {
                      setInvAmount(selected.budget);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    required
                    value={invNumber}
                    onChange={(e) => setInvNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Total ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={invAmount}
                    onChange={(e) => setInvAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Paid ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    value={invAmountPaid}
                    onChange={(e) => setInvAmountPaid(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={invStatus}
                    onChange={(e) => setInvStatus(e.target.value as PaymentStatus)}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Instructions & Notes</label>
                <textarea
                  rows={2}
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  placeholder="Wire remittance or corporate ACH reference..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  {editingInvoice ? 'Save Invoice' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VENDOR BILL MODAL */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-500" />
                <span>{editingBill ? 'Edit Vendor Bill' : 'Record Vendor Bill'}</span>
              </h2>
              <button onClick={() => setIsBillModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBill} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor Partner *</label>
                  <select
                    value={billVendorId}
                    onChange={(e) => {
                      setBillVendorId(e.target.value);
                      const selected = vendors.find(v => v.id === e.target.value);
                      if (selected) setBillCategory(selected.category);
                    }}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Target Event *</label>
                  <select
                    value={billEventId}
                    onChange={(e) => setBillEventId(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Bill / PO Number *</label>
                  <input
                    type="text"
                    required
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={billAmount}
                    onChange={(e) => setBillAmount(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Paid ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    value={billAmountPaid}
                    onChange={(e) => setBillAmountPaid(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={billStatus}
                    onChange={(e) => setBillStatus(e.target.value as PaymentStatus)}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBillModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  {editingBill ? 'Save Bill' : 'Record Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
