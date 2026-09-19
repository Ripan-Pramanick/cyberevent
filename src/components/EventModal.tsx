import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Cpu } from 'lucide-react';
import { EventItem, EventCategory, EventStatus, ServiceType, SourcingType, ServiceItem } from '../types';
import { useEventContext } from '../context/EventContext';
import { useCurrency } from '../context/CurrencyContext';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: EventItem | null;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  eventToEdit
}) => {
  const { addEvent, updateEvent, vendors, categories } = useEventContext();
  const { currencyConfig } = useCurrency();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Cybersecurity Summit');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [venue, setVenue] = useState('');
  const [guestCount, setGuestCount] = useState(350);
  const [status, setStatus] = useState<EventStatus>('Planning');
  const [budget, setBudget] = useState(50000);
  const [notes, setNotes] = useState('');
  const [services, setServices] = useState<Omit<ServiceItem, 'id'>[]>([]);

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setCategory(eventToEdit.category);
      setClientName(eventToEdit.clientName);
      setClientEmail(eventToEdit.clientEmail);
      setClientPhone(eventToEdit.clientPhone);
      setDate(eventToEdit.date);
      setEndDate(eventToEdit.endDate || '');
      setVenue(eventToEdit.venue);
      setGuestCount(eventToEdit.guestCount);
      setStatus(eventToEdit.status);
      setBudget(eventToEdit.budget);
      setNotes(eventToEdit.notes || '');
      setServices(eventToEdit.services || []);
    } else {
      setTitle('');
      setCategory(categories[0]?.name || 'Cybersecurity Summit');
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setVenue('');
      setGuestCount(350);
      setStatus('Planning');
      setBudget(50000);
      setNotes('');
      setServices([
        {
          serviceType: 'Audio, Visual & Lights',
          name: '4K Curved LED Wall & Stage Illumination',
          sourcing: 'external_vendor',
          vendorId: vendors[1]?.id || '',
          vendorName: vendors[1]?.name || 'Lumina Hologram & LED Stage Rigs',
          estimatedCost: 15000,
          actualCost: 15000,
          clientPrice: 24000,
          status: 'Confirmed',
          notes: 'Mainstage display and laser lighting'
        },
        {
          serviceType: 'Cyber Security & Access',
          name: 'Biometric RFID Gate Turnstiles',
          sourcing: 'external_vendor',
          vendorId: vendors[0]?.id || '',
          vendorName: vendors[0]?.name || 'Nexus Cyber Sec & RFID Access',
          estimatedCost: 8000,
          actualCost: 8000,
          clientPrice: 13500,
          status: 'Confirmed',
          notes: 'Attendee verification and access logging'
        },
        {
          serviceType: 'Catering & Molecular Bar',
          name: 'In-House All-Day Fuel & Nitrogen Station',
          sourcing: 'in_house',
          inHouseLead: 'Chef Carlos Mendez (Cyber Hospitality)',
          estimatedCost: 6000,
          actualCost: 6000,
          clientPrice: 11000,
          status: 'Confirmed',
          notes: 'Cold brew nitro and high-protein catering'
        }
      ]);
    }
  }, [eventToEdit, isOpen, categories, vendors]);

  if (!isOpen) return null;

  const handleAddServiceRow = () => {
    setServices(prev => [
      ...prev,
      {
        serviceType: 'Broadcasting & Livestream',
        name: 'Stream & Recording Package',
        sourcing: 'in_house',
        inHouseLead: 'Operations Crew',
        estimatedCost: 3500,
        actualCost: 3500,
        clientPrice: 6500,
        status: 'Pending',
        notes: ''
      }
    ]);
  };

  const handleRemoveServiceRow = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    setServices(prev => {
      const updated = [...prev];
      const row = { ...updated[index], [field]: value };
      if (field === 'vendorId') {
        const found = vendors.find(v => v.id === value);
        row.vendorName = found ? found.name : '';
      }
      updated[index] = row;
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim()) return;

    if (eventToEdit) {
      updateEvent(eventToEdit.id, {
        title,
        category,
        clientName,
        clientEmail,
        clientPhone,
        date,
        endDate: endDate || date,
        venue,
        guestCount: Number(guestCount),
        status,
        budget: Number(budget),
        notes,
        services: services.map((s, idx) => ({
          ...s,
          id: (s as ServiceItem).id || `srv-${Date.now()}-${idx}`
        }))
      });
    } else {
      addEvent({
        title,
        category,
        clientName,
        clientEmail,
        clientPhone,
        date,
        endDate: endDate || date,
        venue,
        guestCount: Number(guestCount),
        status,
        budget: Number(budget),
        notes,
        services: services.map((s, idx) => ({
          ...s,
          id: `srv-${Date.now()}-${idx}`
        }))
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 rounded-t-3xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {eventToEdit ? 'Edit Cyber Event' : 'Create New Cyber Event'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Parameters, client budget (USD Base), and in-house vs partner deliverables.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* General Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-mono">
              1. Event Architecture
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Zero-Day Defense Summit 2026 / Neural Hackathon"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventStatus)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Inquiry">Inquiry</option>
                  <option value="Planning">Planning</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Event Start Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Venue Location</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Grand Cyber Arena, Hall A"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Attendee Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Client & Contract Budget */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-mono">
              2. Host Organization & Contract Budget (USD)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Client Organization *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Nexus Security Labs"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Primary Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="organizer@nexus.io"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Direct Phone</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Agreed Total Contract Value (USD Base) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sourcing Services List */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-mono">
                  3. Production Deliverables & Sourcing
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  LED arrays, badge fabrication, catering & security turnstiles.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddServiceRow}
                className="px-3 py-1.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Deliverable
              </button>
            </div>

            <div className="space-y-3">
              {services.map((svc, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                      <select
                        value={svc.serviceType}
                        onChange={(e) => handleServiceChange(idx, 'serviceType', e.target.value as ServiceType)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white"
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
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Item Title</label>
                      <input
                        type="text"
                        value={svc.name}
                        onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                        placeholder="e.g. 4K LED Screen Wall"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Sourcing Model</label>
                      <select
                        value={svc.sourcing}
                        onChange={(e) => handleServiceChange(idx, 'sourcing', e.target.value as SourcingType)}
                        className={`w-full px-2.5 py-1.5 border rounded-lg text-xs font-semibold ${
                          svc.sourcing === 'in_house'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
                        }`}
                      >
                        <option value="in_house">In-House Production Crew</option>
                        <option value="external_vendor">Contracted Vendor Partner</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {svc.sourcing === 'external_vendor' ? (
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Assigned Vendor</label>
                        <select
                          value={svc.vendorId || ''}
                          onChange={(e) => handleServiceChange(idx, 'vendorId', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white"
                        >
                          <option value="">-- Choose Partner Vendor --</option>
                          {vendors.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.name} ({v.category})
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">In-House Staff Lead</label>
                        <input
                          type="text"
                          value={svc.inHouseLead || ''}
                          onChange={(e) => handleServiceChange(idx, 'inHouseLead', e.target.value)}
                          placeholder="e.g. Thomas Kelly (NetOps)"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Direct Cost ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={svc.estimatedCost}
                        onChange={(e) => handleServiceChange(idx, 'estimatedCost', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Client Quote ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={svc.clientPrice}
                        onChange={(e) => handleServiceChange(idx, 'clientPrice', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-500 font-mono">
                      Estimated Margin: ${(svc.clientPrice || 0) - (svc.estimatedCost || 0)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveServiceRow(idx)}
                      className="text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Technical Notes & Security Specs</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dedicated 10Gbps fiber drop, biometric badging requirements, live score server ports..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-hidden bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-xl font-bold shadow-md transition-all cursor-pointer"
            >
              {eventToEdit ? 'Save Changes' : 'Create an Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
