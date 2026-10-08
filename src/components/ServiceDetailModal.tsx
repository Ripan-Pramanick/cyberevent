import React, { useState, useEffect } from 'react';
import { X, Briefcase, Users, Building2, Settings2, DollarSign, Percent } from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { useCurrency } from '../context/CurrencyContext';
import { MasterService } from '../types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: MasterService | null;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, serviceToEdit }) => {
  const { addMasterService, updateMasterService, categories, vendors } = useEventContext();
  const { format } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultState = {
    serviceCode: '',
    serviceName: '',
    description: '',
    category: '',
    serviceType: 'IN_HOUSE' as 'IN_HOUSE' | 'VENDOR',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    responsibleTeam: '',
    teamLead: '',
    availableCapacity: 1,
    workingHours: '09:00 - 18:00',
    requiredStaff: 1,
    requiredEquipment: '',
    serviceLocation: '',
    vendorId: '',
    labourCost: 0,
    equipmentCost: 0,
    otherCost: 0,
    defaultClientPrice: 0,
  };

  const [formData, setFormData] = useState(defaultState);

  useEffect(() => {
    if (isOpen) {
      if (serviceToEdit) {
        setFormData({
          serviceCode: serviceToEdit.serviceCode,
          serviceName: serviceToEdit.serviceName,
          description: serviceToEdit.description || '',
          category: serviceToEdit.category || (categories[0]?.name || ''),
          serviceType: serviceToEdit.serviceType,
          status: serviceToEdit.status,
          responsibleTeam: serviceToEdit.responsibleTeam || '',
          teamLead: serviceToEdit.teamLead || '',
          availableCapacity: serviceToEdit.availableCapacity || 1,
          workingHours: serviceToEdit.workingHours || '09:00 - 18:00',
          requiredStaff: serviceToEdit.requiredStaff || 1,
          requiredEquipment: serviceToEdit.requiredEquipment || '',
          serviceLocation: serviceToEdit.serviceLocation || '',
          vendorId: serviceToEdit.vendorId || '',
          labourCost: serviceToEdit.labourCost || 0,
          equipmentCost: serviceToEdit.equipmentCost || 0,
          otherCost: serviceToEdit.otherCost || 0,
          defaultClientPrice: serviceToEdit.defaultClientPrice || 0,
        });
      } else {
        setFormData({
          ...defaultState,
          serviceCode: `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
          category: categories[0]?.name || ''
        });
      }
    }
  }, [isOpen, serviceToEdit, categories]);

  if (!isOpen) return null;

  const totalInternalCost = 
    (Number(formData.labourCost) || 0) + 
    (Number(formData.equipmentCost) || 0) + 
    (Number(formData.otherCost) || 0);
    
  const clientPrice = Number(formData.defaultClientPrice) || 0;
  const expectedProfit = clientPrice - totalInternalCost;
  const expectedMargin = clientPrice > 0 ? (expectedProfit / clientPrice) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceName.trim() || !formData.serviceCode.trim()) {
      alert("Service Name and Service Code are required.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      if (serviceToEdit) {
        await updateMasterService(serviceToEdit.id, formData);
      } else {
        await addMasterService(formData);
      }
      onClose();
    } catch (error: any) {
      console.error("Save error:", error);
      alert(`Save error: ${error.message || 'Check database connection'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0 border border-cyan-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {serviceToEdit ? 'Edit Service Capability' : 'Add New Service Capability'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {serviceToEdit ? `Updating ${serviceToEdit.serviceCode}` : 'Configure capability, in-house team capacity & pricing structure'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form id="service-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section A: Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-mono flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <Settings2 className="w-4 h-4" />
                A. Basic Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Service Code *</label>
                  <input required name="serviceCode" value={formData.serviceCode} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-mono focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-900 dark:text-white" placeholder="e.g. SRV-1001" />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Service Name *</label>
                  <input required name="serviceName" value={formData.serviceName} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-900 dark:text-white" placeholder="e.g. 4K LED Screen Wall & Illumination" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-900 dark:text-white">
                    <option value="">Select Category...</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Service Type *</label>
                  <select required name="serviceType" value={formData.serviceType} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-900 dark:text-white">
                    <option value="IN_HOUSE">In-House Crew</option>
                    <option value="VENDOR">Vendor Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Status</label>
                  <select required name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-900 dark:text-white">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none resize-none text-slate-900 dark:text-white" placeholder="Service deliverables, specifications, and scope..." />
                </div>
              </div>
            </div>

            {/* Section B: In-House Operations vs Vendor */}
            {formData.serviceType === 'IN_HOUSE' ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Users className="w-4 h-4" />
                  B. In-House Operations & Crew Capacity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Responsible Team</label>
                    <input name="responsibleTeam" value={formData.responsibleTeam} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-900 dark:text-white" placeholder="e.g. NetOps / Rigging Crew" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Team Lead</label>
                    <input name="teamLead" value={formData.teamLead} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-900 dark:text-white" placeholder="e.g. Alex Vance" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Concurrent Event Capacity</label>
                    <input type="number" min="1" name="availableCapacity" value={formData.availableCapacity} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none font-mono text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Required Staff Headcount</label>
                    <input type="number" min="1" name="requiredStaff" value={formData.requiredStaff} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none font-mono text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Working Hours</label>
                    <input name="workingHours" value={formData.workingHours} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-900 dark:text-white" placeholder="e.g. 08:00 - 20:00" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Service Location</label>
                    <input name="serviceLocation" value={formData.serviceLocation} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-900 dark:text-white" placeholder="e.g. On-Site Mainstage / Server Rack" />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Required Hardware / Equipment</label>
                    <input name="requiredEquipment" value={formData.requiredEquipment} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-900 dark:text-white" placeholder="e.g. 4K Video Switchers, Line Array Rigging, RF Shielding" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Building2 className="w-4 h-4" />
                  B. Contracted Vendor Partner Integration
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Assigned Vendor Partner</label>
                  <select name="vendorId" value={formData.vendorId} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-900 dark:text-white">
                    <option value="">-- Choose Vendor from Vendors Module --</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Section C: Pricing & Profitability */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <DollarSign className="w-4 h-4" />
                C. Direct Costs & Agreed Client Pricing (USD Base)
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Labour Cost ($)</label>
                    <input type="number" min="0" name="labourCost" value={formData.labourCost} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-mono focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Equipment Cost ($)</label>
                    <input type="number" min="0" name="equipmentCost" value={formData.equipmentCost} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-mono focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Other Cost ($)</label>
                    <input type="number" min="0" name="otherCost" value={formData.otherCost} onChange={handleChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-mono focus:ring-2 focus:ring-cyan-500/50 outline-none text-slate-900 dark:text-white" />
                  </div>

                  <div className="sm:col-span-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1.5 uppercase tracking-wider">Default Client Price ($) *</label>
                    <input required type="number" min="0" name="defaultClientPrice" value={formData.defaultClientPrice} onChange={handleChange} className="w-full px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-lg font-bold text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500/50 outline-none font-mono" />
                  </div>
                </div>

                {/* Live Preview Metric Box */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block text-center">Profitability Matrix</span>
                    
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Internal Cost</span>
                      <span className="font-mono font-bold text-rose-500">{format(totalInternalCost)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Client Price</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{format(clientPrice)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500">Expected Profit</span>
                      <span className="font-mono font-bold text-emerald-500">{format(expectedProfit)}</span>
                    </div>
                  </div>

                  <div className="pt-3 text-center border-t border-slate-200 dark:border-slate-800 mt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gross Margin</span>
                    <span className={`text-2xl font-bold font-mono flex items-center justify-center gap-1 ${
                      expectedMargin >= 40 ? 'text-emerald-500' : expectedMargin >= 20 ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {expectedMargin.toFixed(1)} <Percent className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="service-form"
            disabled={isSubmitting}
            className="px-6 py-2 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-cyan-600 via-indigo-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 shadow-md shadow-cyan-500/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Saving Service...' : 'Save Service Matrix'}
          </button>
        </div>

      </div>
    </div>
  );
};