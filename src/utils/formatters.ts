import { EventCategory, ServiceType, SourcingType, CurrencyCode } from '../types';

export const formatCurrency = (amount: number, currencyCode: CurrencyCode = 'USD'): string => {
  if (isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'TBD';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const getColorBadgeClasses = (colorName?: string): string => {
  switch (colorName?.toLowerCase()) {
    case 'rose':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    case 'amber':
    case 'yellow':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'blue':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    case 'purple':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
    case 'emerald':
    case 'green':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'sky':
    case 'cyan':
      return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
    case 'indigo':
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
    case 'violet':
      return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30';
    case 'teal':
      return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30';
    case 'pink':
      return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30';
    case 'orange':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30';
    case 'slate':
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
    default:
      return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
  }
};

export const getCategoryBadgeStyle = (category: EventCategory, customColor?: string): string => {
  if (customColor) {
    return getColorBadgeClasses(customColor);
  }
  switch (category) {
    case 'Cybersecurity Summit':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    case 'AI & Neural Hackathon':
      return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
    case 'Cloud & Infrastructure Expo':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
    case 'Tech Founders Gala':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
    case 'Cryptographic Architecture Forum':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'Developer Unconference':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    default: {
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
    }
  }
};

export const getServiceCategoryBadgeStyle = (service: ServiceType): string => {
  switch (service) {
    case 'Cyber Security & Access':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
    case 'Audio, Visual & Lights':
      return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
    case 'Staging & Neon Decor':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
    case 'Catering & Molecular Bar':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
    case 'Broadcasting & Livestream':
      return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
    case 'Hardware Badges & Swag':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    case 'Photography & Drone Media':
      return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30';
    case 'Keynote & DJ Entertainment':
      return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30';
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30';
  }
};

export const getSourcingBadge = (sourcing: SourcingType): { label: string; style: string } => {
  if (sourcing === 'in_house') {
    return {
      label: 'In-House Crew',
      style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/20',
    };
  }
  return {
    label: 'Contracted Vendor',
    style: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 ring-1 ring-cyan-500/20',
  };
};
