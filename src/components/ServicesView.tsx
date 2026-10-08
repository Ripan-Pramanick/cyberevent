import React, { useState } from 'react';
import { Briefcase, Plus, Search, Building2, Users, CheckCircle2, XCircle, TrendingUp, DollarSign, Trash2, Power, Edit2 } from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { useCurrency } from '../context/CurrencyContext';
import { MasterService } from '../types';
import { ServiceModal } from './ServiceModal';

export const ServicesView: React.FC = () => {
  const { masterServices, deleteMasterService, updateMasterService } = useEventContext();
  const { format } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'IN_HOUSE' | 'VENDOR'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // MODAL STATE
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<MasterService | null>(null);

  // KPIs
  const totalServices = masterServices.length;
  const inHouseCount = masterServices.filter(s => s.serviceType === 'IN_HOUSE').length;
  const vendorCount = masterServices.filter(s => s.serviceType === 'VENDOR').length;
  const activeCount = masterServices.filter(s => s.status === 'ACTIVE').length;
  
  const totalInternalCost = masterServices.reduce((sum, s) => sum + (s.totalInternalCost || 0), 0);
  const totalExpectedRevenue = masterServices.reduce((sum, s) => sum + (s.defaultClientPrice || 0), 0);
  const totalExpectedMargin = totalExpectedRevenue > 0 
    ? ((totalExpectedRevenue - totalInternalCost) / totalExpectedRevenue) * 100 
    : 0;

  const filteredServices = masterServices.filter(s => {
    const matchesSearch = s.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.serviceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.category && s.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'ALL' || s.serviceType === filterType;
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleEditClick = (service: MasterService) => {
    setServiceToEdit(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await deleteMasterService(id);
      } catch (error: any) {
        alert(`Error deleting service: ${error.message}`);
      }
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent, service: MasterService) => {
    e.stopPropagation();
    const newStatus = service.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (window.confirm(`Are you sure you want to mark this service as ${newStatus}?`)) {
      try {
        await updateMasterService(service.id, { status: newStatus });
      } catch (error: any) {
        alert(`Error updating status: ${error.message}`);
      }
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-cyan-500" />
            Services Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage all event services, in-house capabilities, pricing, and vendor assignments.
          </p>
        </div>
        <button 
          onClick={() => {
            setServiceToEdit(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KPICard title="Total Services" value={totalServices} icon={<Briefcase />} />
        <KPICard title="In-House" value={inHouseCount} icon={<Users />} />
        <KPICard title="Vendor" value={vendorCount} icon={<Building2 />} />
        <KPICard title="Active" value={activeCount} icon={<CheckCircle2 className="text-emerald-500" />} />
        <KPICard title="Internal Cost" value={format(totalInternalCost)} icon={<DollarSign className="text-rose-500" />} />
        <KPICard title="Exp. Revenue" value={format(totalExpectedRevenue)} icon={<DollarSign className="text-emerald-500" />} />
        <KPICard title="Gross Margin" value={`${totalExpectedMargin.toFixed(1)}%`} icon={<TrendingUp className="text-cyan-500" />} />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search code, name, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Types</option>
          <option value="IN_HOUSE">In-House</option>
          <option value="VENDOR">Vendor</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Services Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold text-right">Int. Cost</th>
                <th className="px-4 py-3 font-semibold text-right">Client Price</th>
                <th className="px-4 py-3 font-semibold text-right">Margin</th>
                <th className="px-4 py-3 font-semibold text-center">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No services found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => {
                  const margin = service.defaultClientPrice > 0 
                    ? ((service.defaultClientPrice - service.totalInternalCost) / service.defaultClientPrice) * 100 
                    : 0;
                    
                  return (
                    <tr 
                      key={service.id} 
                      onClick={() => handleEditClick(service)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${service.serviceType === 'IN_HOUSE' ? 'bg-cyan-500/10 text-cyan-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                            {service.serviceType === 'IN_HOUSE' ? <Users className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{service.serviceName}</p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                              <span>{service.serviceCode}</span>
                              {service.category && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                  <span>{service.category}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                          service.serviceType === 'IN_HOUSE' 
                            ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20' 
                            : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {service.serviceType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-rose-600 dark:text-rose-400">
                        {format(service.totalInternalCost)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        {format(service.defaultClientPrice)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono text-xs font-bold ${margin >= 40 ? 'text-emerald-500' : margin >= 20 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {margin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {service.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleToggleStatus(e, service)}
                            title={service.status === 'ACTIVE' ? "Deactivate" : "Activate"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              service.status === 'ACTIVE' 
                                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/20' 
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/20'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(service);
                            }}
                            title="Edit"
                            className="p-1.5 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-500/20 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={(e) => handleDelete(e, service.id, service.serviceName)}
                            title="Delete"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD SERVICE MODAL */}
      <ServiceModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setServiceToEdit(null);
        }}
        serviceToEdit={serviceToEdit}
      />
    </div>
  );
};

// Internal Sub-component for KPIs
const KPICard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col justify-between shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono line-clamp-1">{title}</span>
      <div className="text-slate-400 [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</div>
    </div>
    <span className="text-lg font-bold text-slate-900 dark:text-white truncate">{value}</span>
  </div>
); 