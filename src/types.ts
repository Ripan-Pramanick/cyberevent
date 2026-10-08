export type EventCategory = string;

export interface EventCategoryItem {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  iconName?: string;
  isDefault?: boolean;
  createdAt: string;
}

export type CategoryItem = EventCategoryItem;

export type EventStatus = 'Inquiry' | 'Planning' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';

export type ServiceType = 
  | 'Audio, Visual & Lights'
  | 'Cyber Security & Access'
  | 'Staging & Neon Decor'
  | 'Catering & Molecular Bar'
  | 'Broadcasting & Livestream'
  | 'Hardware Badges & Swag'
  | 'Photography & Drone Media'
  | 'Keynote & DJ Entertainment';

export type SourcingType = 'in_house' | 'external_vendor';

export interface ServiceItem {
  id: string;
  serviceType: ServiceType;
  name: string;
  sourcing: SourcingType;
  vendorId?: string;
  vendorName?: string;
  inHouseLead?: string;
  estimatedCost: number; // Stored in USD base
  actualCost: number; // Stored in USD base
  clientPrice: number; // Stored in USD base
  status: 'Pending' | 'Sourced' | 'Confirmed' | 'Delivered';
  notes?: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: EventCategory;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  endDate?: string;
  venue: string;
  guestCount: number;
  status: EventStatus;
  budget: number; // Stored in USD base
  currency?: string;
  services: ServiceItem[];
  notes?: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: ServiceType;
  contactPerson: string;
  email: string;
  phone: string;
  address?: string;
  rating: number;
  paymentTerms: string;
  activeContractsCount: number;
  totalPaid: number;
  outstandingBalance: number;
  status?: string;
  servicesOffered?: string[];
  notes?: string;
}

export type VendorItem = Vendor;

export type LeadStatus = 'New' | 'Contacted' | 'Proposal Sent' | 'Qualified' | 'Negotiation' | 'Won' | 'Lost';

export interface Lead {
  id: string;
  clientName: string;
  company?: string;
  email: string;
  phone: string;
  category: EventCategory;
  guestCount?: number;
  estimatedBudget: number; // Stored in USD base
  targetDate: string;
  status: LeadStatus;
  source?: 'Website' | 'Referral' | 'Social Media' | 'Direct Call' | 'Cyber Hackathon' | 'Discord';
  notes?: string;
  createdAt?: string;
  convertedEventId?: string;
}

export type LeadItem = Lead;

export interface InvoiceLineItem {
  id: string;
  description: string;
  category?: ServiceType | 'Management Fee' | 'Venue' | 'Other';
  quantity: number;
  unitPrice: number;
  total: number;
}

export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue';
export type InvoiceStatus = 'Draft' | 'Sent' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Unpaid';

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  eventId: string;
  eventTitle: string;
  clientName: string;
  clientEmail?: string;
  issueDate: string;
  dueDate: string;
  items?: InvoiceLineItem[];
  lineItems?: InvoiceLineItem[];
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discount?: number;
  totalAmount: number;
  amountPaid: number;
  status: InvoiceStatus | PaymentStatus;
  notes?: string;
  paymentMethod?: string;
  paidAt?: string;
}

export type BillStatus = 'Pending Approval' | 'Approved' | 'Paid' | 'Overdue' | 'Unpaid' | 'Partially Paid';

export interface VendorBill {
  id: string;
  billNumber: string;
  vendorId: string;
  vendorName: string;
  eventId: string;
  eventTitle: string;
  serviceCategory: ServiceType;
  issueDate: string;
  dueDate: string;
  amount: number;
  amountPaid: number;
  status: BillStatus | PaymentStatus;
  notes?: string;
  paymentMethod?: string;
  paidDate?: string;
}

export type TaskStatus = 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Technical Review' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface KanbanTask {
  id: string;
  eventId: string;
  eventTitle: string;
  title: string;
  description?: string;
  serviceCategory?: ServiceType | 'General Operations';
  assignedTo?: string;
  sourcing?: SourcingType;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  linkedGanttId?: string;
  linkedServiceId?: string;
}

export interface GanttTask {
  id: string;
  eventId: string;
  eventTitle: string;
  title: string;
  category?: ServiceType | 'Milestone' | 'Logistics';
  startDate: string;
  endDate: string;
  progress: number;
  color?: string;
  assignee?: string;
  owner?: string;
  sourcing?: SourcingType;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Pending';
  linkedKanbanId?: string;
  linkedServiceId?: string;
}

// NAVIGATION MATRIX (With 'services')
export type NavigationTab = 
  | 'dashboard' 
  | 'events' 
  | 'leads' 
  | 'categories'
  | 'vendors' 
  | 'services'
  | 'billing' 
  | 'kanban' 
  | 'gantt'
  | 'settings';

// ================= NEW SERVICES MODULE TYPES =================
export type MasterServiceType = 'IN_HOUSE' | 'VENDOR';
export type MasterServiceStatus = 'ACTIVE' | 'INACTIVE';

export interface MasterService {
  id: string;
  serviceCode: string;
  serviceName: string;
  description?: string;
  category?: string;
  serviceType: MasterServiceType;
  status: MasterServiceStatus;
  
  // In-House Operational Fields
  responsibleTeam?: string;
  teamLead?: string;
  teamMembers?: string[];
  availableCapacity: number;
  workingHours?: string;
  requiredStaff: number;
  requiredEquipment?: string;
  serviceLocation?: string;
  
  // Vendor Partner Link
  vendorId?: string;
  vendorName?: string;

  // Financial & Cost Structure
  labourCost: number;
  equipmentCost: number;
  otherCost: number;
  totalInternalCost: number;
  defaultClientPrice: number;
  expectedMargin: number;

  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface EventServiceRelation {
  id: string;
  eventId: string;
  eventTitle?: string;
  serviceId: string;
  serviceName: string;
  serviceType: MasterServiceType;
  quantity: number;
  assignedTeam?: string;
  startDate?: string;
  endDate?: string;
  internalCost: number; // Snapshotted internal cost
  clientPrice: number;  // Snapshotted agreed client price
  actualCost: number;
  actualRevenue: number;
  notes?: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyProfile {
  companyName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId: string;
  website: string;
  paymentInstructions: string;
  footerNote: string;
}

export const defaultCompanyProfile: CompanyProfile = {
  companyName: 'Apex Event Production Co.',
  tagline: 'Premier Full-Service Event Management & Production',
  email: 'billing@apexevents.com',
  phone: '+1 (555) 248-9000',
  address: '500 Grand Avenue, Suite 800',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94105',
  country: 'United States',
  taxId: 'US-EIN-94-3829104',
  website: 'www.apexevents.com',
  paymentInstructions: 'Please remit payment via corporate wire transfer or ACH within the specified terms.',
  footerNote: 'Thank you for choosing Apex Event Production Co. Standard Net-30 payment terms apply.'
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'Event Director' | 'Cyber Producer' | 'Vendor Coordinator' | 'Staff Member';
  roleTitle: string;
  initials: string;
  avatarBg: string;
  department: string;
}

export interface DemoCredential {
  name: string;
  email: string;
  password: string;
  role: 'Event Director' | 'Cyber Producer' | 'Vendor Coordinator';
  roleTitle: string;
  department: string;
  initials: string;
  avatarBg: string;
  description: string;
}

// Multi-Currency Types
export type CurrencyCode = 
  | 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD' | 'AUD' | 'SGD' | 'AED' | 'CHF'
  | 'SAR' | 'QAR' | 'KWD' | 'BHD' | 'OMR' | 'NZD' | 'CNY' | 'HKD' | 'KRW' | 'TWD'
  | 'THB' | 'MYR' | 'IDR' | 'PHP' | 'VND' | 'BRL' | 'MXN' | 'CLP' | 'COP' | 'ARS'
  | 'ZAR' | 'EGP' | 'NGN' | 'KES' | 'PKR' | 'BDT' | 'LKR' | 'TRY' | 'SEK' | 'NOK'
  | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'ILS';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  rate: number;
  flag: string;
  locale: string;
  region?: string;
  popular?: boolean;
}