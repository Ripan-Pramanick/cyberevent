import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  EventItem, 
  Vendor, 
  Lead, 
  ClientInvoice, 
  VendorBill, 
  KanbanTask, 
  GanttTask, 
  ServiceItem, 
  TaskStatus,
  EventCategoryItem,
  CompanyProfile,
  defaultCompanyProfile,
  MasterService,
  EventServiceRelation
} from '../types';
import { SupabaseSyncEngine, supabase } from '../lib/supabase'; 

interface FinancialSummary {
  totalRevenue: number;
  totalClientPaid: number;
  totalClientOutstanding: number;
  totalEstimatedCost: number;
  totalActualCost: number;
  totalVendorPaid: number;
  totalVendorOutstanding: number;
  totalGrossMargin: number;
  grossMarginPercentage: number;
}

interface EventContextType {
  events: EventItem[];
  vendors: Vendor[];
  leads: Lead[];
  clientInvoices: ClientInvoice[];
  vendorBills: VendorBill[];
  kanbanTasks: KanbanTask[];
  ganttTasks: GanttTask[];
  categories: EventCategoryItem[];
  masterServices: MasterService[];
  eventServiceRelations: EventServiceRelation[];
  isLoading: boolean;
  
  addEvent: (event: Omit<EventItem, 'id' | 'createdAt'>) => Promise<EventItem | null>;
  updateEvent: (id: string, updates: Partial<EventItem>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  addServiceToEvent: (eventId: string, service: Omit<ServiceItem, 'id'>) => Promise<void>;
  updateServiceInEvent: (eventId: string, serviceId: string, updates: Partial<ServiceItem>) => Promise<void>;
  deleteServiceFromEvent: (eventId: string, serviceId: string) => Promise<void>;
  
  addVendor: (vendor: Omit<Vendor, 'id' | 'activeContractsCount' | 'totalPaid' | 'outstandingBalance'>) => Promise<Vendor | null>;
  updateVendor: (id: string, updates: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;

  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Promise<Lead | null>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  convertLeadToEvent: (leadId: string) => Promise<EventItem | null>;

  addCategory: (category: Omit<EventCategoryItem, 'id' | 'createdAt'>) => Promise<EventCategoryItem | null>;
  updateCategory: (id: string, updates: Partial<EventCategoryItem>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addClientInvoice: (invoice: Omit<ClientInvoice, 'id'>) => Promise<ClientInvoice | null>;
  updateClientInvoice: (id: string, updates: Partial<ClientInvoice>) => Promise<void>;
  deleteClientInvoice: (id: string) => Promise<void>;
  recordClientPayment: (invoiceId: string, amount: number, method: string) => Promise<void>;

  addVendorBill: (bill: Omit<VendorBill, 'id'>) => Promise<VendorBill | null>;
  updateVendorBill: (id: string, updates: Partial<VendorBill>) => Promise<void>;
  deleteVendorBill: (id: string) => Promise<void>;
  recordVendorPayment: (billId: string, amount: number, method: string) => Promise<void>;

  addKanbanTask: (task: Omit<KanbanTask, 'id'>) => Promise<KanbanTask | null>;
  updateKanbanTask: (id: string, updates: Partial<KanbanTask>) => Promise<void>;
  deleteKanbanTask: (id: string) => Promise<void>;
  moveKanbanTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;

  addGanttTask: (task: Omit<GanttTask, 'id'>) => Promise<GanttTask | null>;
  updateGanttTask: (id: string, updates: Partial<GanttTask>) => Promise<void>;
  deleteGanttTask: (id: string) => Promise<void>;

  // SERVICES MANAGEMENT
  addMasterService: (service: Omit<MasterService, 'id' | 'createdAt' | 'updatedAt' | 'totalInternalCost' | 'expectedMargin'>) => Promise<MasterService | null>;
  updateMasterService: (id: string, updates: Partial<MasterService>) => Promise<void>;
  deleteMasterService: (id: string) => Promise<void>;
  toggleServiceStatus: (id: string) => Promise<void>;
  duplicateMasterService: (id: string) => Promise<MasterService | null>;
  assignServiceToEvent: (relation: Omit<EventServiceRelation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<EventServiceRelation | null>;
  removeServiceFromEvent: (relationId: string) => Promise<void>;
  checkCapacityConflict: (serviceId: string, startDate: string, endDate: string, excludeEventId?: string) => { hasConflict: boolean; currentUsage: number; maxCapacity: number };

  companyProfile: CompanyProfile;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  financialSummary: FinancialSummary;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<EventCategoryItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clientInvoices, setClientInvoices] = useState<ClientInvoice[]>([]);
  const [vendorBills, setVendorBills] = useState<VendorBill[]>([]);
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>([]);
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  
  // Services Module State
  const [masterServices, setMasterServices] = useState<MasterService[]>([]);
  const [eventServiceRelations, setEventServiceRelations] = useState<EventServiceRelation[]>([]);
  
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(defaultCompanyProfile);
  const [isLoading, setIsLoading] = useState(true);

  // FETCH ALL DATA FROM SUPABASE
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const [
          { data: dbEvents },
          { data: dbCategories },
          { data: dbVendors },
          { data: dbLeads },
          { data: dbInvoices },
          { data: dbVendorBills },
          { data: dbKanban },
          { data: dbGantt },
          { data: dbServices },
          { data: dbEventServices }
        ] = await Promise.all([
          supabase.from('events').select('*').order('created_at', { ascending: false }),
          supabase.from('categories').select('*'),
          supabase.from('vendors').select('*'),
          supabase.from('leads').select('*'),
          supabase.from('client_invoices').select('*'),
          supabase.from('vendor_bills').select('*'),
          supabase.from('kanban_tasks').select('*'),
          supabase.from('gantt_tasks').select('*'),
          supabase.from('services').select('*').order('created_at', { ascending: false }),
          supabase.from('event_services').select('*')
        ]);

        if (dbEvents) {
          setEvents(dbEvents.map(e => ({
            ...e, clientName: e.client_name, clientEmail: e.client_email,
            clientPhone: e.client_phone, endDate: e.end_date, guestCount: e.guest_count, createdAt: e.created_at
          })));
        }
        if (dbCategories) setCategories(dbCategories);
        if (dbVendors) {
          setVendors(dbVendors.map(v => ({
            ...v, contactPerson: v.contact_person, paymentTerms: v.payment_terms,
            activeContractsCount: v.active_contracts_count, totalPaid: v.total_paid,
            outstandingBalance: v.outstanding_balance, servicesOffered: v.services_offered
          })));
        }
        if (dbLeads) {
          setLeads(dbLeads.map(l => ({
            ...l, clientName: l.client_name, guestCount: l.guest_count,
            estimatedBudget: l.estimated_budget, targetDate: l.target_date,
            convertedEventId: l.converted_event_id, createdAt: l.created_at
          })));
        }
        if (dbInvoices) {
          setClientInvoices(dbInvoices.map(i => ({
            ...i, invoiceNumber: i.invoice_number, eventId: i.event_id, eventTitle: i.event_title,
            clientName: i.client_name, clientEmail: i.client_email, issueDate: i.issue_date,
            dueDate: i.due_date, taxRate: i.tax_rate, taxAmount: i.tax_amount, totalAmount: i.total_amount,
            amountPaid: i.amount_paid, paymentMethod: i.payment_method, paidAt: i.paid_at
          })));
        }
        if (dbVendorBills) {
          setVendorBills(dbVendorBills.map(b => ({
            ...b, billNumber: b.bill_number, vendorId: b.vendor_id, vendorName: b.vendor_name,
            eventId: b.event_id, eventTitle: b.event_title, serviceCategory: b.service_category,
            issueDate: b.issue_date, dueDate: b.due_date, amountPaid: b.amount_paid,
            paymentMethod: b.payment_method, paidDate: b.paid_date
          })));
        }
        if (dbKanban) {
          setKanbanTasks(dbKanban.map(t => ({
            ...t, eventId: t.event_id, eventTitle: t.event_title, serviceCategory: t.service_category,
            assignedTo: t.assigned_to, dueDate: t.due_date
          })));
        }
        if (dbGantt) {
          setGanttTasks(dbGantt.map(g => ({
            ...g, eventId: g.event_id, eventTitle: g.event_title, startDate: g.start_date, endDate: g.end_date
          })));
        }
        if (dbServices) {
          setMasterServices(dbServices.map(s => {
            const intCost = Number(s.labour_cost || 0) + Number(s.equipment_cost || 0) + Number(s.other_cost || 0);
            const clientPrice = Number(s.default_client_price || 0);
            const margin = clientPrice > 0 ? ((clientPrice - intCost) / clientPrice) * 100 : 0;
            return {
              id: s.id,
              serviceCode: s.service_code,
              serviceName: s.service_name,
              description: s.description || '',
              category: s.category || '',
              serviceType: s.service_type,
              status: s.status,
              responsibleTeam: s.responsible_team || '',
              teamLead: s.team_lead || '',
              teamMembers: s.team_members || [],
              availableCapacity: Number(s.available_capacity || 1),
              workingHours: s.working_hours || '',
              requiredStaff: Number(s.required_staff || 1),
              requiredEquipment: s.required_equipment || '',
              serviceLocation: s.service_location || '',
              vendorId: s.vendor_id || '',
              labourCost: Number(s.labour_cost || 0),
              equipmentCost: Number(s.equipment_cost || 0),
              otherCost: Number(s.other_cost || 0),
              totalInternalCost: s.total_internal_cost !== undefined ? Number(s.total_internal_cost) : intCost,
              defaultClientPrice: clientPrice,
              expectedMargin: margin,
              createdAt: s.created_at,
              updatedAt: s.updated_at
            };
          }));
        }
        if (dbEventServices) {
          setEventServiceRelations(dbEventServices.map(es => ({
            id: es.id,
            eventId: es.event_id,
            serviceId: es.service_id,
            serviceName: es.service_name || '',
            serviceType: es.service_type || 'IN_HOUSE',
            quantity: Number(es.quantity || 1),
            assignedTeam: es.assigned_team,
            startDate: es.start_date,
            endDate: es.end_date,
            internalCost: Number(es.internal_cost || 0),
            clientPrice: Number(es.client_price || 0),
            actualCost: Number(es.actual_cost || 0),
            actualRevenue: Number(es.actual_revenue || 0),
            notes: es.notes,
            status: es.status || 'PLANNED',
            createdAt: es.created_at,
            updatedAt: es.updated_at
          })));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // ================= MASTER SERVICES (SAFE OPTIMISTIC + DB SYNC) =================
  const addMasterService = async (data: Omit<MasterService, 'id' | 'createdAt' | 'updatedAt' | 'totalInternalCost' | 'expectedMargin'>) => {
    const newId = `srv-${Date.now()}`;
    const totalInternalCost = Number(data.labourCost || 0) + Number(data.equipmentCost || 0) + Number(data.otherCost || 0);
    const clientPrice = Number(data.defaultClientPrice || 0);
    const expectedMargin = clientPrice > 0 ? ((clientPrice - totalInternalCost) / clientPrice) * 100 : 0;
    const now = new Date().toISOString();

    const newService: MasterService = {
      ...data,
      id: newId,
      totalInternalCost,
      expectedMargin,
      createdAt: now,
      updatedAt: now
    };

    // 1. Optimistic Update (Immediate UI response)
    setMasterServices(prev => [newService, ...prev]);

    // 2. Database Sync
    const mappedForDb = {
      id: newId,
      service_code: data.serviceCode,
      service_name: data.serviceName,
      description: data.description,
      category: data.category,
      service_type: data.serviceType,
      status: data.status,
      responsible_team: data.responsibleTeam,
      team_lead: data.teamLead,
      available_capacity: data.availableCapacity,
      working_hours: data.workingHours,
      required_staff: data.requiredStaff,
      required_equipment: data.requiredEquipment,
      service_location: data.serviceLocation,
      vendor_id: data.vendorId || null,
      labour_cost: data.labourCost,
      equipment_cost: data.equipmentCost,
      other_cost: data.otherCost,
      default_client_price: data.defaultClientPrice,
      created_at: now,
      updated_at: now
    };

    await SupabaseSyncEngine.syncRecord('services', mappedForDb);
    return newService;
  };

  const updateMasterService = async (id: string, updates: Partial<MasterService>) => {
    const existing = masterServices.find(s => s.id === id);
    if (!existing) return;

    const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    const totalInternalCost = Number(merged.labourCost || 0) + Number(merged.equipmentCost || 0) + Number(merged.otherCost || 0);
    const clientPrice = Number(merged.defaultClientPrice || 0);
    const expectedMargin = clientPrice > 0 ? ((clientPrice - totalInternalCost) / clientPrice) * 100 : 0;

    const updatedService: MasterService = {
      ...merged,
      totalInternalCost,
      expectedMargin
    };

    // 1. Optimistic Local State Update
    setMasterServices(prev => prev.map(s => s.id === id ? updatedService : s));

    // 2. Database Sync
    const mappedForDb: any = { id };
    if (updates.serviceCode !== undefined) mappedForDb.service_code = updates.serviceCode;
    if (updates.serviceName !== undefined) mappedForDb.service_name = updates.serviceName;
    if (updates.description !== undefined) mappedForDb.description = updates.description;
    if (updates.category !== undefined) mappedForDb.category = updates.category;
    if (updates.serviceType !== undefined) mappedForDb.service_type = updates.serviceType;
    if (updates.status !== undefined) mappedForDb.status = updates.status;
    if (updates.responsibleTeam !== undefined) mappedForDb.responsible_team = updates.responsibleTeam;
    if (updates.teamLead !== undefined) mappedForDb.team_lead = updates.teamLead;
    if (updates.availableCapacity !== undefined) mappedForDb.available_capacity = updates.availableCapacity;
    if (updates.workingHours !== undefined) mappedForDb.working_hours = updates.workingHours;
    if (updates.requiredStaff !== undefined) mappedForDb.required_staff = updates.requiredStaff;
    if (updates.requiredEquipment !== undefined) mappedForDb.required_equipment = updates.requiredEquipment;
    if (updates.serviceLocation !== undefined) mappedForDb.service_location = updates.serviceLocation;
    if (updates.vendorId !== undefined) mappedForDb.vendor_id = updates.vendorId || null;
    if (updates.labourCost !== undefined) mappedForDb.labour_cost = updates.labourCost;
    if (updates.equipmentCost !== undefined) mappedForDb.equipment_cost = updates.equipmentCost;
    if (updates.otherCost !== undefined) mappedForDb.other_cost = updates.otherCost;
    if (updates.defaultClientPrice !== undefined) mappedForDb.default_client_price = updates.defaultClientPrice;
    mappedForDb.updated_at = updatedService.updatedAt;

    await SupabaseSyncEngine.syncRecord('services', mappedForDb);
  };

  const deleteMasterService = async (id: string) => {
    // Soft delete prefered: set status to INACTIVE if referenced, else remove
    const hasAssignments = eventServiceRelations.some(r => r.serviceId === id);
    if (hasAssignments) {
      await updateMasterService(id, { status: 'INACTIVE' });
      return;
    }
    setMasterServices(prev => prev.filter(s => s.id !== id));
    await SupabaseSyncEngine.deleteRecord('services', id);
  };

  const toggleServiceStatus = async (id: string) => {
    const s = masterServices.find(item => item.id === id);
    if (!s) return;
    const newStatus = s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await updateMasterService(id, { status: newStatus });
  };

  const duplicateMasterService = async (id: string) => {
    const original = masterServices.find(s => s.id === id);
    if (!original) return null;
    const duplicateData: Omit<MasterService, 'id' | 'createdAt' | 'updatedAt' | 'totalInternalCost' | 'expectedMargin'> = {
      ...original,
      serviceCode: `${original.serviceCode}-COPY`,
      serviceName: `${original.serviceName} (Copy)`,
      status: 'ACTIVE'
    };
    return await addMasterService(duplicateData);
  };

  // ================= CAPACITY MANAGEMENT & EVENT SERVICES =================
  const checkCapacityConflict = (serviceId: string, startDate: string, endDate: string, excludeEventId?: string) => {
    const service = masterServices.find(s => s.id === serviceId);
    if (!service || service.serviceType !== 'IN_HOUSE') {
      return { hasConflict: false, currentUsage: 0, maxCapacity: 999 };
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const overlappingRelations = eventServiceRelations.filter(rel => {
      if (rel.serviceId !== serviceId) return false;
      if (excludeEventId && rel.eventId === excludeEventId) return false;
      if (rel.status === 'CANCELLED') return false;

      const relStart = rel.startDate ? new Date(rel.startDate).getTime() : 0;
      const relEnd = rel.endDate ? new Date(rel.endDate).getTime() : relStart;
      return (start <= relEnd && end >= relStart);
    });

    const currentUsage = overlappingRelations.reduce((sum, r) => sum + (r.quantity || 1), 0);
    const maxCapacity = service.availableCapacity || 1;
    return {
      hasConflict: currentUsage >= maxCapacity,
      currentUsage,
      maxCapacity
    };
  };

  const assignServiceToEvent = async (relation: Omit<EventServiceRelation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `es-${Date.now()}`;
    const now = new Date().toISOString();
    const fullRelation: EventServiceRelation = {
      ...relation,
      id: newId,
      createdAt: now,
      updatedAt: now
    };

    setEventServiceRelations(prev => [fullRelation, ...prev]);

    const mappedForDb = {
      id: newId,
      event_id: fullRelation.eventId,
      service_id: fullRelation.serviceId,
      quantity: fullRelation.quantity,
      assigned_team: fullRelation.assignedTeam,
      start_date: fullRelation.startDate,
      end_date: fullRelation.endDate,
      internal_cost: fullRelation.internalCost,
      client_price: fullRelation.clientPrice,
      actual_cost: fullRelation.actualCost,
      actual_revenue: fullRelation.actualRevenue,
      notes: fullRelation.notes,
      status: fullRelation.status,
      created_at: now,
      updated_at: now
    };

    await SupabaseSyncEngine.syncRecord('event_services', mappedForDb);
    return fullRelation;
  };

  const removeServiceFromEvent = async (relationId: string) => {
    setEventServiceRelations(prev => prev.filter(r => r.id !== relationId));
    await SupabaseSyncEngine.deleteRecord('event_services', relationId);
  };

  // ================= EVENTS & SERVICES (LEGACY ARRAY SYNC) =================
  const addEvent = async (data: Omit<EventItem, 'id' | 'createdAt'>) => {
    const newEvent: EventItem = { ...data, id: `evt-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], services: data.services || [] };
    const success = await SupabaseSyncEngine.syncEvent(newEvent);
    if (success) setEvents(prev => [newEvent, ...prev]);
    return success ? newEvent : null;
  };

  const updateEvent = async (id: string, updates: Partial<EventItem>) => {
    const eventToUpdate = events.find(e => e.id === id);
    if (!eventToUpdate) return;
    const updatedObj = { ...eventToUpdate, ...updates };
    const success = await SupabaseSyncEngine.syncEvent(updatedObj);
    if (success) setEvents(prev => prev.map(evt => evt.id === id ? updatedObj : evt));
  };

  const deleteEvent = async (id: string) => {
    const success = await SupabaseSyncEngine.deleteEvent(id);
    if (success) setEvents(prev => prev.filter(evt => evt.id !== id));
  };

  const addServiceToEvent = async (eventId: string, service: Omit<ServiceItem, 'id'>) => {
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return;
    const updatedServices = [...targetEvent.services, { ...service, id: `srv-${Date.now()}` }];
    await updateEvent(eventId, { services: updatedServices });
  };

  const updateServiceInEvent = async (eventId: string, serviceId: string, updates: Partial<ServiceItem>) => {
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return;
    const updatedServices = targetEvent.services.map(s => s.id === serviceId ? { ...s, ...updates } : s);
    await updateEvent(eventId, { services: updatedServices });
  };

  const deleteServiceFromEvent = async (eventId: string, serviceId: string) => {
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return;
    const updatedServices = targetEvent.services.filter(s => s.id !== serviceId);
    await updateEvent(eventId, { services: updatedServices });
  };

  // ================= VENDORS =================
  const addVendor = async (data: Omit<Vendor, 'id' | 'activeContractsCount' | 'totalPaid' | 'outstandingBalance'>) => {
    const newVendor = { ...data, id: `ven-${Date.now()}`, activeContractsCount: 0, totalPaid: 0, outstandingBalance: 0 };
    const mappedForDb = {
      id: newVendor.id, name: newVendor.name, category: newVendor.category,
      contact_person: newVendor.contactPerson, email: newVendor.email, phone: newVendor.phone,
      address: newVendor.address, payment_terms: newVendor.paymentTerms
    };
    const success = await SupabaseSyncEngine.syncRecord('vendors', mappedForDb);
    if (success) setVendors(prev => [newVendor as Vendor, ...prev]);
    return success ? newVendor as Vendor : null;
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    const target = vendors.find(v => v.id === id);
    if (!target) return;
    const updated = { ...target, ...updates };
    const mappedForDb = {
      id: updated.id, name: updated.name, category: updated.category, contact_person: updated.contactPerson,
      email: updated.email, phone: updated.phone, address: updated.address, rating: updated.rating,
      payment_terms: updated.paymentTerms, active_contracts_count: updated.activeContractsCount,
      total_paid: updated.totalPaid, outstanding_balance: updated.outstandingBalance,
      status: updated.status, services_offered: updated.servicesOffered, notes: updated.notes
    };
    const success = await SupabaseSyncEngine.syncRecord('vendors', mappedForDb);
    if (success) setVendors(prev => prev.map(v => v.id === id ? updated : v));
  };

  const deleteVendor = async (id: string) => {
    const success = await SupabaseSyncEngine.deleteRecord('vendors', id);
    if (success) setVendors(prev => prev.filter(v => v.id !== id));
  };

  // ================= LEADS =================
  const addLead = async (data: any) => {
    const newLead = { ...data, id: `lead-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] };
    const mappedForDb = {
      id: newLead.id, client_name: newLead.clientName, company: newLead.company,
      email: newLead.email, phone: newLead.phone, category: newLead.category,
      estimated_budget: newLead.estimatedBudget, target_date: newLead.targetDate,
      status: newLead.status, notes: newLead.notes, created_at: newLead.createdAt
    };
    const success = await SupabaseSyncEngine.syncRecord('leads', mappedForDb);
    if (success) setLeads(prev => [newLead, ...prev]);
    return success ? newLead : null;
  };

  const updateLead = async (id: string, updates: any) => {
    const targetLead = leads.find(l => l.id === id);
    if (!targetLead) return;
    const updatedLead = { ...targetLead, ...updates };
    const mappedForDb = {
      id: updatedLead.id, client_name: updatedLead.clientName, company: updatedLead.company,
      email: updatedLead.email, phone: updatedLead.phone, category: updatedLead.category,
      estimated_budget: updatedLead.estimatedBudget, target_date: updatedLead.targetDate,
      status: updatedLead.status, notes: updatedLead.notes, converted_event_id: updatedLead.convertedEventId
    };
    const success = await SupabaseSyncEngine.syncRecord('leads', mappedForDb);
    if (success) setLeads(prev => prev.map(l => l.id === id ? updatedLead : l));
  };

  const deleteLead = async (id: string) => {
    const success = await SupabaseSyncEngine.deleteRecord('leads', id);
    if (success) setLeads(prev => prev.filter(l => l.id !== id));
  };

  const convertLeadToEvent = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return null;
    const newEventData = {
      title: `${lead.clientName}'s ${lead.category}`, category: lead.category, clientName: lead.clientName,
      clientEmail: lead.email, clientPhone: lead.phone, date: lead.targetDate, venue: 'TBD',
      guestCount: lead.guestCount || 100, status: 'Confirmed' as const, budget: lead.estimatedBudget,
      currency: 'USD', notes: `Converted from lead. ${lead.notes || ''}`, services: []
    };
    const createdEvent = await addEvent(newEventData);
    if (createdEvent) await updateLead(leadId, { status: 'Won', convertedEventId: createdEvent.id });
    return createdEvent;
  };

  // ================= CATEGORIES =================
  const addCategory = async (data: Omit<EventCategoryItem, 'id' | 'createdAt'>) => {
    const newCat = { ...data, id: `cat-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0] };
    const mappedForDb = {
      id: newCat.id, name: newCat.name, description: newCat.description, color: newCat.color,
      icon: newCat.icon, created_at: newCat.createdAt
    };
    const success = await SupabaseSyncEngine.syncRecord('categories', mappedForDb);
    if (success) setCategories(prev => [...prev, newCat as EventCategoryItem]);
    return success ? newCat as EventCategoryItem : null;
  };

  const updateCategory = async (id: string, updates: Partial<EventCategoryItem>) => {
    const target = categories.find(c => c.id === id);
    if (!target) return;
    const updated = { ...target, ...updates };
    const mappedForDb = {
      id: updated.id, name: updated.name, description: updated.description, color: updated.color,
      icon: updated.icon, created_at: updated.createdAt
    };
    const success = await SupabaseSyncEngine.syncRecord('categories', mappedForDb);
    if (success) setCategories(prev => prev.map(c => c.id === id ? updated : c));
  };

  const deleteCategory = async (id: string) => {
    const success = await SupabaseSyncEngine.deleteRecord('categories', id);
    if (success) setCategories(prev => prev.filter(c => c.id !== id));
  };

  // ================= INVOICES =================
  const addClientInvoice = async (invoice: Omit<ClientInvoice, 'id'>) => {
    const newInvoice = { ...invoice, id: `inv-${Date.now()}` };
    const mapped = {
      id: newInvoice.id, invoice_number: newInvoice.invoiceNumber, event_id: newInvoice.eventId,
      event_title: newInvoice.eventTitle, client_name: newInvoice.clientName, client_email: newInvoice.clientEmail,
      issue_date: newInvoice.issueDate, due_date: newInvoice.dueDate, items: newInvoice.items,
      subtotal: newInvoice.subtotal, tax_rate: newInvoice.taxRate, tax_amount: newInvoice.taxAmount,
      discount: newInvoice.discount, total_amount: newInvoice.totalAmount, amount_paid: newInvoice.amountPaid,
      status: newInvoice.status, notes: newInvoice.notes, payment_method: newInvoice.paymentMethod, paid_at: newInvoice.paidAt
    };
    const success = await SupabaseSyncEngine.syncRecord('client_invoices', mapped);
    if (success) setClientInvoices(prev => [newInvoice as ClientInvoice, ...prev]);
    return success ? newInvoice as ClientInvoice : null;
  };

  const updateClientInvoice = async (id: string, updates: Partial<ClientInvoice>) => {
    const target = clientInvoices.find(i => i.id === id);
    if (!target) return;
    const updated = { ...target, ...updates };
    const mapped = {
      id: updated.id, invoice_number: updated.invoiceNumber, event_id: updated.eventId,
      event_title: updated.eventTitle, client_name: updated.clientName, client_email: updated.clientEmail,
      issue_date: updated.issueDate, due_date: updated.dueDate, items: updated.items,
      subtotal: updated.subtotal, tax_rate: updated.taxRate, tax_amount: updated.taxAmount,
      discount: updated.discount, total_amount: updated.totalAmount, amount_paid: updated.amountPaid,
      status: updated.status, notes: updated.notes, payment_method: updated.paymentMethod, paid_at: updated.paidAt
    };
    const success = await SupabaseSyncEngine.syncRecord('client_invoices', mapped);
    if (success) setClientInvoices(prev => prev.map(i => i.id === id ? updated : i));
  };

  const deleteClientInvoice = async (id: string) => {
    const success = await SupabaseSyncEngine.deleteRecord('client_invoices', id);
    if (success) setClientInvoices(prev => prev.filter(i => i.id !== id));
  };

  const recordClientPayment = async (invoiceId: string, amount: number, method: string) => {
    const invoice = clientInvoices.find(i => i.id === invoiceId);
    if (!invoice) return;
    const newAmountPaid = (invoice.amountPaid || 0) + amount;
    const newStatus = newAmountPaid >= invoice.totalAmount ? 'Paid' : 'Partially Paid';
    await updateClientInvoice(invoiceId, {
      amountPaid: newAmountPaid, status: newStatus, paymentMethod: method,
      paidAt: newStatus === 'Paid' ? new Date().toISOString().split('T')[0] : invoice.paidAt
    });
  };

  // ================= VENDOR BILLS =================
  const addVendorBill = async (bill: Omit<VendorBill, 'id'>) => {
    const newBill = { ...bill, id: `bill-${Date.now()}` };
    const mapped = {
      id: newBill.id, bill_number: newBill.billNumber, vendor_id: newBill.vendorId,
      vendor_name: newBill.vendorName, event_id: newBill.eventId, event_title: newBill.eventTitle,
      service_category: newBill.serviceCategory, issue_date: newBill.issueDate, due_date: newBill.dueDate,
      amount: newBill.amount, amount_paid: newBill.amountPaid, status: newBill.status, notes: newBill.notes,
      payment_method: newBill.paymentMethod, paid_date: newBill.paidDate
    };
    const success = await SupabaseSyncEngine.syncRecord('vendor_bills', mapped);
    if (success) setVendorBills(prev => [newBill as VendorBill, ...prev]);
    return success ? newBill as VendorBill : null;
  };

  const updateVendorBill = async (id: string, updates: Partial<VendorBill>) => {
    const target = vendorBills.find(b => b.id === id);
    if (!target) return;
    const updated = { ...target, ...updates };
    const mapped = {
      id: updated.id, bill_number: updated.billNumber, vendor_id: updated.vendorId,
      vendor_name: updated.vendorName, event_id: updated.eventId, event_title: updated.eventTitle,
      service_category: updated.serviceCategory, issue_date: updated.issueDate, due_date: updated.dueDate,
      amount: updated.amount, amount_paid: updated.amountPaid, status: updated.status, notes: updated.notes,
      payment_method: updated.paymentMethod, paid_date: updated.paidDate
    };
    const success = await SupabaseSyncEngine.syncRecord('vendor_bills', mapped);
    if (success) setVendorBills(prev => prev.map(b => b.id === id ? updated : b));
  };

  const deleteVendorBill = async (id: string) => {
    const success = await SupabaseSyncEngine.deleteRecord('vendor_bills', id);
    if (success) setVendorBills(prev => prev.filter(b => b.id !== id));
  };

  const recordVendorPayment = async (billId: string, amount: number, method: string) => {
    const bill = vendorBills.find(b => b.id === billId);
    if (!bill) return;
    const newAmountPaid = (bill.amountPaid || 0) + amount;
    const newStatus = newAmountPaid >= bill.amount ? 'Paid' : 'Approved';
    await updateVendorBill(billId, {
      amountPaid: newAmountPaid, status: newStatus, paymentMethod: method,
      paidDate: newStatus === 'Paid' ? new Date().toISOString().split('T')[0] : bill.paidDate
    });
  };

  // ================= TASKS =================
  const addKanbanTask = async (task: Omit<KanbanTask, 'id'>) => {
    const newTask = { ...task, id: `task-${Date.now()}` };
    const mapped = {
      id: newTask.id, event_id: newTask.eventId, event_title: newTask.eventTitle, title: newTask.title,
      description: newTask.description, service_category: newTask.serviceCategory, assigned_to: newTask.assignedTo,
      sourcing: newTask.sourcing, status: newTask.status, priority: newTask.priority, due_date: newTask.dueDate
    };
    const success = await SupabaseSyncEngine.syncRecord('kanban_tasks', mapped);
    if (success) setKanbanTasks(prev => [newTask as KanbanTask, ...prev]);
    return success ? newTask as KanbanTask : null;
  };

  const updateKanbanTask = async (id: string, updates: Partial<KanbanTask>) => {
    const target = kanbanTasks.find(t => t.id === id);
    if (!target) return;
    const updated = { ...target, ...updates };
    const mapped = {
      id: updated.id, event_id: updated.eventId, event_title: updated.eventTitle, title: updated.title,
      description: updated.description, service_category: updated.serviceCategory, assigned_to: updated.assignedTo,
      sourcing: updated.sourcing, status: updated.status, priority: updated.priority, due_date: updated.dueDate
    };
    const success = await SupabaseSyncEngine.syncRecord('kanban_tasks', mapped);
    if (success) setKanbanTasks(prev => prev.map(t => t.id === id ? updated : t));
  };

  const deleteKanbanTask = async (id: string) => {
    const success = await SupabaseSyncEngine.deleteRecord('kanban_tasks', id);
    if (success) setKanbanTasks(prev => prev.filter(t => t.id !== id));
  };

  const moveKanbanTask = async (taskId: string, newStatus: TaskStatus) => {
    await updateKanbanTask(taskId, { status: newStatus });
  };

  const addGanttTask = async (task: Omit<GanttTask, 'id'>) => {
    const newTask = { ...task, id: `gt-${Date.now()}` };
    const mapped = {
      id: newTask.id, event_id: newTask.eventId, event_title: newTask.eventTitle, title: newTask.title,
      category: newTask.category, start_date: newTask.startDate, end_date: newTask.endDate,
      progress: newTask.progress, color: newTask.color, owner: newTask.owner, status: newTask.status
    };
    const success = await SupabaseSyncEngine.syncRecord('gantt_tasks', mapped);
    if (success) setGanttTasks(prev => [newTask as GanttTask, ...prev]);
    return success ? newTask as GanttTask : null;
  };

  const updateGanttTask = async (id: string, updates: Partial<GanttTask>) => {
    const target = ganttTasks.find(t => t.id === id);
    if (!target) return;
    const updated = { ...target, ...updates };
    const mapped = {
      id: updated.id, event_id: updated.eventId, event_title: updated.eventTitle, title: updated.title,
      category: updated.category, start_date: updated.startDate, end_date: updated.endDate,
      progress: updated.progress, color: updated.color, owner: updated.owner, status: updated.status
    };
    const success = await SupabaseSyncEngine.syncRecord('gantt_tasks', mapped);
    if (success) setGanttTasks(prev => prev.map(t => t.id === id ? updated : t));
  };

  const deleteGanttTask = async (id: string) => {
    const success = await SupabaseSyncEngine.deleteRecord('gantt_tasks', id);
    if (success) setGanttTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateCompanyProfile = (updates: Partial<CompanyProfile>) => {
    setCompanyProfile(prev => ({ ...prev, ...updates }));
  };

  // Financial calculations
  const totalRevenue = clientInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalClientPaid = clientInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const totalClientOutstanding = Math.max(0, totalRevenue - totalClientPaid);

  let totalEstimatedCost = 0;
  let totalActualCost = 0;

  // Combine legacy event services
  events.forEach(evt => {
    (evt.services || []).forEach(srv => {
      totalEstimatedCost += srv.estimatedCost || 0;
      totalActualCost += srv.actualCost || srv.estimatedCost || 0;
    });
  });

  // Factor in new event service relations (avoiding double counting)
  eventServiceRelations.forEach(rel => {
    const cost = (rel.actualCost || rel.internalCost || 0) * (rel.quantity || 1);
    totalActualCost += cost;
    totalEstimatedCost += (rel.internalCost || 0) * (rel.quantity || 1);
  });

  const totalVendorPaid = vendorBills.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const totalVendorBilled = vendorBills.reduce((sum, b) => sum + b.amount, 0);
  const totalVendorOutstanding = Math.max(0, totalVendorBilled - totalVendorPaid);

  const totalGrossMargin = totalRevenue - totalActualCost;
  const grossMarginPercentage = totalRevenue > 0 ? (totalGrossMargin / totalRevenue) * 100 : 0;

  const financialSummary: FinancialSummary = {
    totalRevenue, totalClientPaid, totalClientOutstanding, totalEstimatedCost,
    totalActualCost, totalVendorPaid, totalVendorOutstanding, totalGrossMargin, grossMarginPercentage
  };

  return (
    <EventContext.Provider value={{
      events, categories, vendors, leads, clientInvoices, vendorBills, kanbanTasks, ganttTasks,
      masterServices, eventServiceRelations,
      companyProfile, isLoading, updateCompanyProfile, addEvent, updateEvent, deleteEvent,
      addServiceToEvent, updateServiceInEvent, deleteServiceFromEvent, addCategory, updateCategory,
      deleteCategory, addVendor, updateVendor, deleteVendor, addLead, updateLead, deleteLead,
      convertLeadToEvent, addClientInvoice, updateClientInvoice, deleteClientInvoice, recordClientPayment,
      addVendorBill, updateVendorBill, deleteVendorBill, recordVendorPayment, addKanbanTask,
      updateKanbanTask, deleteKanbanTask, moveKanbanTask, addGanttTask, updateGanttTask,
      deleteGanttTask, addMasterService, updateMasterService, deleteMasterService,
      toggleServiceStatus, duplicateMasterService, assignServiceToEvent, removeServiceFromEvent, checkCapacityConflict,
      financialSummary
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEventContext must be used within an EventProvider');
  return context;
};