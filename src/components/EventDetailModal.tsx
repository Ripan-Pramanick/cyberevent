import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit3, 
  Receipt, 
  Trello, 
  Layers, 
  Building2,
  Cpu,
  Coins
} from 'lucide-react';
import { EventItem, ServiceItem, ServiceType, SourcingType } from '../types';
import { useEventContext } from '../context/EventContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate, getCategoryBadgeStyle, getServiceCategoryBadgeStyle, getSourcingBadge } from '../utils/formatters';

interface EventDetailModalProps {
  eventId: string | null;
  onClose: () => void;
  onEditEvent: (event: EventItem) => void;
  onOpenClientInvoice: (invoiceId: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  eventId,
  onClose,
  onEditEvent,
  onOpenClientInvoice
}) => {
  const { 
    events, 
    vendors, 
    clientInvoices, 
    vendorBills, 
    kanbanTasks, 
    ganttTasks,
    addServiceToEvent,
    updateServiceInEvent,
    deleteServiceFromEvent,
    deleteEvent
  } = useEventContext();
  const { format, currencyConfig } = useCurrency();

  const [activeTab, setActiveTab] = useState<'sourcing' | 'financials' | 'billing' | 'tracking'>('sourcing');
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // New service form state
  const [newType, setNewType] = useState<ServiceType>('Audio, Visual & Lights');
  const [newName, setNewName] = useState('');
  const [newSourcing, setNewSourcing] = useState<SourcingType>('in_house');
  const [newVendorId, setNewVendorId] = useState('');
  const [newInHouseLead, setNewInHouseLead] = useState('');
  const [newEstCost, setNewEstCost] = useState(4000);
  const [newClientPrice, setNewClientPrice] = useState(7000);
  const [newNotes, setNewNotes] = useState('');

  // Editing service form state
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<ServiceType>('Audio, Visual & Lights');
  const [editSourcing, setEditSourcing] = useState<SourcingType>('in_house');
  const [editVendorId, setEditVendorId] = useState('');
  const [editInHouseLead, setEditInHouseLead] = useState('');
  const [editCost, setEditCost] = useState(0);
  const [editPrice, setEditPrice] = useState(0);
  const [editStatus, setEditStatus] = useState<'Pending' | 'Sourced' | 'Confirmed' | 'Delivered'>('Confirmed');

  const currentEvent = events.find(e => e.id === eventId);
  if (!currentEvent) return null;

  const eventInvoices = clientInvoices.filter(inv => inv.eventId === currentEvent.id);
  const eventBills = vendorBills.filter(b => b.eventId === currentEvent.id);
  const eventTasks = kanbanTasks.filter(t => t.eventId === currentEvent.id);

  let totalServiceClientPrice = 0;
  let totalServiceActualCost = 0;
  let inHouseServiceCost = 0;
  let vendorServiceCost = 0;

  currentEvent.services.forEach(s => {
    totalServiceClientPrice += s.clientPrice || 0;
    const cost = s.actualCost || s.estimatedCost || 0;
    totalServiceActualCost += cost;
    if (s.sourcing === 'in_house') {
      inHouseServiceCost += cost;
    } else {
      vendorServiceCost += cost;
    }
  });

  const grossProfit = currentEvent.budget - totalServiceActualCost;
  const marginPct = currentEvent.budget > 0 ? (grossProfit / currentEvent.budget) * 100 : 0;

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const vendor = vendors.find(v => v.id === newVendorId);
    addServiceToEvent(currentEvent.id, {
      serviceType: newType,
      name: newName,
      sourcing: newSourcing,
      vendorId: newSourcing === 'external_vendor' ? newVendorId : undefined,
      vendorName: newSourcing === 'external_vendor' && vendor ? vendor.name : undefined,
      inHouseLead: newSourcing === 'in_house' ? newInHouseLead || 'Operations Team' : undefined,
      estimatedCost: Number(newEstCost),
      actualCost: Number(newEstCost),
      clientPrice: Number(newClientPrice),
      status: 'Confirmed',
      notes: newNotes
    });

    setIsAddingService(false);
    setNewName('');
    setNewNotes('');
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setEditingService(service);
    setEditName(service.name);
    setEditType(service.serviceType);
    setEditSourcing(service.sourcing);
    setEditVendorId(service.vendorId || '');
    setEditInHouseLead(service.inHouseLead || '');
    setEditCost(service.actualCost || service.estimatedCost || 0);
    setEditPrice(service.clientPrice || 0);
    setEditStatus(service.status);
  };

  const handleSaveEditedService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editName.trim()) return;
    const vendor = vendors.find(v => v.id === editVendorId);

    updateServiceInEvent(currentEvent.id, editingService.id, {
      name: editName.trim(),
      serviceType: editType,
      sourcing: editSourcing,
      vendorId: editSourcing === 'external_vendor' ? editVendorId : undefined,
      vendorName: editSourcing === 'external_vendor' && vendor ? vendor.name : undefined,
      inHouseLead: editSourcing === 'in_house' ? editInHouseLead : undefined,
      actualCost: Number(editCost),
      estimatedCost: Number(editCost),
      clientPrice: Number(editPrice),
      status: editStatus
    });

    setEditingService(null);
  };

  const handleDeleteService = (serviceId: string, serviceName: string) => {
    if (window.confirm(`Are you sure you want to delete deliverable "${serviceName}"?`)) {
      deleteServiceFromEvent(currentEvent.id, serviceId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadgeStyle(currentEvent.category)}`}>
                {currentEvent.category}
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {currentEvent.status}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{currentEvent.title}</span>
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                {formatDate(currentEvent.date)}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {currentEvent.venue || 'Venue TBD'}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 font-mono">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {currentEvent.guestCount} Attendees
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditEvent(currentEvent)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Event</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex space-x-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sourcing')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'sourcing'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Deliverables & Sourcing ({currentEvent.services.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'financials'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Yield & Costs ({currencyConfig.code})</span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'billing'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Invoices & Bills ({eventInvoices.length + eventBills.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'tracking'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Sprints & Tasks ({eventTasks.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: SOURCING */}
          {activeTab === 'sourcing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    Event Deliverables & Partner Sourcing
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage equipment, badges, catering, and staging. Everything is editable and deletable.
                  </p>
                </div>
                {!isAddingService && (
                  <button
                    onClick={() => setIsAddingService(true)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Deliverable</span>
                  </button>
                )}
              </div>

              {/* Inline Add Form */}
              {isAddingService && (
                <form onSubmit={handleCreateService} className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 font-mono">
                      Add New Deliverable
                    </h4>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingService(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Service Type</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as ServiceType)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      >
                        <option value="Audio, Visual & Lights">Audio, Visual & Lights</option>
                        <option value="Cyber Security & Access">Cyber Security & Access</option>
                        <option value="Staging & Neon Decor">Staging & Neon Decor</option>
                        <option value="Catering & Molecular Bar">Catering & Molecular Bar</option>
                        <option value="Broadcasting & Livestream">Broadcasting & Livestream</option>
                        <option value="Hardware Badges & Swag">Hardware Badges & Swag</option>
                        <option value="Photography & Drone Media">Photography & Drone Media</option>
                        <option value="Keynote & DJ Entertainment">Keynote & DJ Entertainment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Item Name *</label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. 10Gbps Network Drop"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Sourcing Model</label>
                      <select
                        value={newSourcing}
                        onChange={(e) => setNewSourcing(e.target.value as SourcingType)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
                      >
                        <option value="in_house">In-House Crew</option>
                        <option value="external_vendor">External Partner Vendor</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {newSourcing === 'external_vendor' ? (
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Vendor Partner</label>
                        <select
                          value={newVendorId}
                          onChange={(e) => setNewVendorId(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                        >
                          <option value="">-- Select Partner --</option>
                          {vendors.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Staff Lead</label>
                        <input
                          type="text"
                          value={newInHouseLead}
                          onChange={(e) => setNewInHouseLead(e.target.value)}
                          placeholder="e.g. Lead Cyber Producer"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Cost ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={newEstCost}
                        onChange={(e) => setNewEstCost(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Client Quote ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={newClientPrice}
                        onChange={(e) => setNewClientPrice(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingService(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-xs cursor-pointer"
                    >
                      Add Deliverable
                    </button>
                  </div>
                </form>
              )}

              {/* Deliverables Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    <tr>
                      <th className="px-4 py-3 text-left">Deliverable & Scope</th>
                      <th className="px-4 py-3 text-left">Sourcing</th>
                      <th className="px-4 py-3 text-left">Lead / Partner</th>
                      <th className="px-4 py-3 text-right">Direct Cost</th>
                      <th className="px-4 py-3 text-right">Client Quote</th>
                      <th className="px-4 py-3 text-right">Margin ({currencyConfig.code})</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentEvent.services.map((svc) => {
                      const cost = svc.actualCost || svc.estimatedCost;
                      const margin = (svc.clientPrice || 0) - cost;
                      const sourcingBadge = getSourcingBadge(svc.sourcing);

                      return (
                        <tr key={svc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 dark:text-white">{svc.name}</div>
                            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border mt-0.5 ${getServiceCategoryBadgeStyle(svc.serviceType)}`}>
                              {svc.serviceType}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sourcingBadge.style}`}>
                              {sourcingBadge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                            {svc.sourcing === 'external_vendor' ? svc.vendorName : svc.inHouseLead}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                            {format(cost)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {format(svc.clientPrice)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {format(margin)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <select
                              value={svc.status}
                              onChange={(e) => updateServiceInEvent(currentEvent.id, svc.id, { status: e.target.value as any })}
                              className="px-2 py-1 text-[11px] font-mono font-semibold rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Sourced">Sourced</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditService(svc)}
                                className="text-slate-400 hover:text-cyan-600 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Edit deliverable"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteService(svc.id, svc.name)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                title="Delete deliverable"
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
            </div>
          )}

          {/* TAB 2: FINANCIALS & YIELD */}
          {activeTab === 'financials' && (
            <div className="space-y-6 font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-sans block">Contract Budget</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">
                    {format(currentEvent.budget)}
                  </span>
                  <span className="text-[10px] text-cyan-500 font-sans">in {currencyConfig.name}</span>
                </div>
                <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/30">
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-sans block">Direct Cost</span>
                  <span className="text-xl font-bold text-orange-950 dark:text-orange-300 mt-1 block">
                    {format(totalServiceActualCost)}
                  </span>
                  <span className="text-[10px] text-orange-600 font-sans">Vendor + Crew</span>
                </div>
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-sans block">Gross Profit</span>
                  <span className="text-xl font-bold text-emerald-950 dark:text-emerald-300 mt-1 block">
                    {format(grossProfit)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-sans">Revenue less direct costs</span>
                </div>
                <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/30">
                  <span className="text-xs text-cyan-600 dark:text-cyan-400 font-sans block">Margin Rate</span>
                  <span className="text-xl font-bold text-cyan-950 dark:text-cyan-300 mt-1 block">
                    {marginPct.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-cyan-600 font-sans">Gross Operating Yield</span>
                </div>
              </div>

              {/* Sourcing Cost Split */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 font-sans">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono">
                  Cost Allocation By Sourcing Model
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold block">In-House Cost</span>
                    <span className="text-base font-bold font-mono text-slate-900 dark:text-white block mt-1">
                      {format(inHouseServiceCost)}
                    </span>
                  </div>
                  <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                    <span className="text-cyan-600 dark:text-cyan-400 font-semibold block">Vendor Partner Cost</span>
                    <span className="text-base font-bold font-mono text-slate-900 dark:text-white block mt-1">
                      {format(vendorServiceCost)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INVOICES & BILLS */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* Invoices */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-cyan-500" />
                  <span>Client Invoices Issued</span>
                </h4>
                {eventInvoices.length === 0 ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center text-xs text-slate-500">
                    No client invoice issued yet.
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-semibold">Invoice #</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Due Date</th>
                          <th className="px-4 py-2.5 text-right font-semibold">Total Amount</th>
                          <th className="px-4 py-2.5 text-right font-semibold">Paid</th>
                          <th className="px-4 py-2.5 text-center font-semibold">Status</th>
                          <th className="px-4 py-2.5 text-right font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                        {eventInvoices.map(inv => (
                          <tr key={inv.id}>
                            <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                            <td className="px-4 py-2.5 text-slate-500 font-sans">{formatDate(inv.dueDate)}</td>
                            <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-white">{format(inv.totalAmount)}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">{format(inv.amountPaid)}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                                inv.status === 'Paid' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              <button
                                onClick={() => onOpenClientInvoice(inv.id)}
                                className="px-2.5 py-1 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 rounded font-sans text-xs font-semibold cursor-pointer"
                              >
                                View / Print
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Vendor Bills */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span>Vendor Bills & Purchase Orders</span>
                </h4>
                {eventBills.length === 0 ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-center text-xs text-slate-500">
                    No vendor bills recorded.
                  </div>
                ) : (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-xs font-mono">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-sans">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-semibold">Bill #</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Vendor</th>
                          <th className="px-4 py-2.5 text-left font-semibold">Deliverable</th>
                          <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
                          <th className="px-4 py-2.5 text-right font-semibold">Paid</th>
                          <th className="px-4 py-2.5 text-center font-semibold font-sans">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {eventBills.map(b => (
                          <tr key={b.id}>
                            <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">{b.billNumber}</td>
                            <td className="px-4 py-2.5 text-slate-800 dark:text-slate-200 font-sans">{b.vendorName}</td>
                            <td className="px-4 py-2.5 text-slate-500 font-sans">{b.serviceCategory}</td>
                            <td className="px-4 py-2.5 text-right font-bold text-slate-900 dark:text-white">{format(b.amount)}</td>
                            <td className="px-4 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">{format(b.amountPaid)}</td>
                            <td className="px-4 py-2.5 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TRACKING */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Trello className="w-4 h-4 text-cyan-500" />
                  <span>Linked Tasks & Sprints ({eventTasks.length})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {eventTasks.map(task => (
                    <div key={task.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{task.title}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2">{task.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700 font-mono">
                        <span>{task.assignedTo}</span>
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">{task.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/85 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${currentEvent.title}? This will also delete all associated tasks, invoices, and bills.`)) {
                deleteEvent(currentEvent.id);
                onClose();
              }
            }}
            className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Event</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>

        {/* EDIT DELIVERABLE MODAL */}
        {editingService && (
          <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-500" />
                  <span>Edit Deliverable</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditedService} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Service Type</label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as ServiceType)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Audio, Visual & Lights">Audio, Visual & Lights</option>
                      <option value="Cyber Security & Access">Cyber Security & Access</option>
                      <option value="Staging & Neon Decor">Staging & Neon Decor</option>
                      <option value="Catering & Molecular Bar">Catering & Molecular Bar</option>
                      <option value="Broadcasting & Livestream">Broadcasting & Livestream</option>
                      <option value="Hardware Badges & Swag">Hardware Badges & Swag</option>
                      <option value="Photography & Drone Media">Photography & Drone Media</option>
                      <option value="Keynote & DJ Entertainment">Keynote & DJ Entertainment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Sourcing Model</label>
                    <select
                      value={editSourcing}
                      onChange={(e) => setEditSourcing(e.target.value as SourcingType)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="in_house">In-House Crew</option>
                      <option value="external_vendor">Contracted Vendor</option>
                    </select>
                  </div>
                </div>

                {editSourcing === 'external_vendor' ? (
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor Partner</label>
                    <select
                      value={editVendorId}
                      onChange={(e) => setEditVendorId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Choose Partner Vendor --</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">In-House Staff Lead</label>
                    <input
                      type="text"
                      value={editInHouseLead}
                      onChange={(e) => setEditInHouseLead(e.target.value)}
                      placeholder="e.g. Lead Cyber Producer"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Direct Cost ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={editCost}
                      onChange={(e) => setEditCost(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Client Quote ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Sourced">Sourced</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingService(null)}
                    className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
