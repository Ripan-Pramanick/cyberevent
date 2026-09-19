import React, { useState } from 'react';
import { 
  Store, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Star, 
  Edit3, 
  Trash2, 
  X, 
  ShieldCheck, 
  ExternalLink,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { VendorItem, ServiceType } from '../types';
import { useEventContext } from '../context/EventContext';
import { useCurrency } from '../context/CurrencyContext';
import { getServiceCategoryBadgeStyle } from '../utils/formatters';

export const VendorsView: React.FC = () => {
  const { vendors, events, addVendor, updateVendor, deleteVendor } = useEventContext();
  const { format, currencyConfig } = useCurrency();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceType>('Audio, Visual & Lights');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState(4.8);
  const [status, setStatus] = useState<'Active' | 'Preferred' | 'Under Review' | 'Blacklisted'>('Active');
  const [servicesOffered, setServicesOffered] = useState('');
  const [notes, setNotes] = useState('');

  const serviceCategories: (ServiceType | 'All')[] = [
    'All',
    'Audio, Visual & Lights',
    'Cyber Security & Access',
    'Staging & Neon Decor',
    'Catering & Molecular Bar',
    'Broadcasting & Livestream',
    'Hardware Badges & Swag',
    'Photography & Drone Media',
    'Keynote & DJ Entertainment'
  ];

  const filteredVendors = vendors.filter(v => {
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
    const matchesSearch = 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setName('');
    setCategory('Audio, Visual & Lights');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setRating(4.8);
    setStatus('Active');
    setServicesOffered('Mainstage AV, laser arrays, 4K LED walls');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: VendorItem) => {
    setEditingVendor(v);
    setName(v.name);
    setCategory(v.category);
    setContactPerson(v.contactPerson);
    setEmail(v.email);
    setPhone(v.phone);
    setRating(v.rating);
    setStatus((v.status as any) || 'Active');
    setServicesOffered(v.servicesOffered?.join(', ') || '');
    setNotes(v.notes || '');
    setIsModalOpen(true);
  };

  const handleDelete = (v: VendorItem) => {
    if (window.confirm(`Are you sure you want to delete vendor "${v.name}"? This action cannot be undone.`)) {
      deleteVendor(v.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedServices = servicesOffered.split(',').map(s => s.trim()).filter(Boolean);

    if (editingVendor) {
      updateVendor(editingVendor.id, {
        name,
        category,
        contactPerson,
        email,
        phone,
        rating: Number(rating),
        status,
        servicesOffered: parsedServices,
        notes
      });
    } else {
      addVendor({
        name,
        category,
        contactPerson,
        email,
        phone,
        rating: Number(rating),
        status,
        servicesOffered: parsedServices,
        paymentTerms: 'Net-30',
        notes
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Vendors & Suppliers</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              {vendors.length} Approved Vendors
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Audio visual, staging, catering, decor, photography and event production partners.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 via-indigo-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-cyan-500/20 flex items-center gap-1.5 self-start sm:self-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendors by name, category, lead..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-hidden text-slate-900 dark:text-white"
            />
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Showing {filteredVendors.length} of {vendors.length} vendors
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">Discipline:</span>
          {serviceCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map(vendor => {
          // Find events using this vendor
          const contractedEvents = events.filter(e => 
            e.services.some(s => s.vendorId === vendor.id)
          );

          return (
            <div 
              key={vendor.id}
              className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${getServiceCategoryBadgeStyle(vendor.category)}`}>
                      {vendor.category}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1.5">
                      {vendor.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-500/30">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{vendor.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Status & Contact */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Rep:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{vendor.contactPerson}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto ${
                      vendor.status === 'Preferred' ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30' :
                      vendor.status === 'Active' ? 'bg-cyan-500/15 text-cyan-600 border border-cyan-500/30' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {vendor.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-700 dark:text-slate-300 truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-700 dark:text-slate-300">{vendor.phone}</span>
                  </div>
                </div>

                {/* Services List */}
                {vendor.servicesOffered && vendor.servicesOffered.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1 font-mono">
                      Specialties
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {vendor.servicesOffered.map((svc, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contracted Events */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1 font-mono">
                    Active Contracts
                  </span>
                  {contractedEvents.length === 0 ? (
                    <span className="text-slate-400 italic text-[11px]">No events assigned</span>
                  ) : (
                    <div className="space-y-1">
                      {contractedEvents.map(evt => (
                        <div key={evt.id} className="flex items-center justify-between text-[11px]">
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{evt.title}</span>
                          <span className="text-cyan-600 dark:text-cyan-400 font-mono font-semibold">Active</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Edit and Delete */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(vendor)}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => handleOpenEdit(vendor)}
                  className="px-3 py-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Vendor</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT VENDOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-cyan-500" />
                <span>{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</span>
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Lumina Stage Rigs & Lasers"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Service Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceType)}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Preferred">Preferred Partner</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Rep *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Contact Name"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@company.io"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Rating (0-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Specialties (Comma Separated)
                </label>
                <input
                  type="text"
                  value={servicesOffered}
                  onChange={(e) => setServicesOffered(e.target.value)}
                  placeholder="e.g. 4K LED Screen, Truss Rigs, Laser Show"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  {editingVendor ? 'Save Changes' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
