import React, { useState, useMemo } from 'react';
import { 
  Settings as SettingsIcon, 
  Building, 
  Coins, 
  Save, 
  Check, 
  RotateCcw, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  ShieldAlert,
  HelpCircle,
  Eye,
  Search,
  X,
  ArrowRightLeft,
  Sparkles,
  Calculator,
  CheckCircle2,
  TrendingUp,
  Percent,
  Database,
  Server,
  Copy,
  ExternalLink,
  KeyRound,
  Terminal,
  Cloud
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { useCurrency } from '../context/CurrencyContext';
import { defaultCompanyProfile, CurrencyCode } from '../types';
import { isSupabaseConfigured, SupabaseSyncEngine } from '../lib/supabase';

interface SettingsViewProps {
  onPreviewSampleBill?: () => void;
}

type SettingsTab = 'currency' | 'company' | 'vercel';

export const SettingsView: React.FC<SettingsViewProps> = ({ onPreviewSampleBill }) => {
  const { companyProfile, updateCompanyProfile, clientInvoices } = useEventContext();
  const { currency, setCurrency, currencies, currencyConfig, format, convert } = useCurrency();

  const [activeTab, setActiveTab] = useState<SettingsTab>('currency');

  // Currency search and region filter
  const [currencySearch, setCurrencySearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  
  // Interactive test converter
  const [calcAmount, setCalcAmount] = useState<string>('5000');

  // Local form state for company details
  const [formData, setFormData] = useState({ ...companyProfile });
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [currencyToast, setCurrencyToast] = useState<string | null>(null);

  // Supabase test connection state
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    setSupabaseTestResult(null);
    try {
      const res = await SupabaseSyncEngine.testConnection();
      setSupabaseTestResult(res);
    } catch (e: any) {
      setSupabaseTestResult({ success: false, message: e.message || 'Connection test failed' });
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile(formData);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset company details back to initial default configuration?')) {
      setFormData(defaultCompanyProfile);
      updateCompanyProfile(defaultCompanyProfile);
      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 3000);
    }
  };

  const handleSelectCurrency = (code: CurrencyCode, name: string) => {
    setCurrency(code);
    setCurrencyToast(`${name} (${code}) activated across all budgets and invoices!`);
    setTimeout(() => setCurrencyToast(null), 3000);
  };

  // Regions list
  const regions = ['All', 'Popular', 'South Asia', 'Middle East', 'Asia & Pacific', 'Europe', 'Americas', 'Africa'];

  // Filtered currencies
  const filteredCurrencies = useMemo(() => {
    return currencies.filter(c => {
      // Region filter
      if (selectedRegion === 'Popular') {
        if (!c.popular) return false;
      } else if (selectedRegion !== 'All') {
        if (selectedRegion === 'Middle East') {
          if (c.region !== 'Middle East' && c.region !== 'Middle East & Africa') return false;
        } else if (selectedRegion === 'Africa') {
          if (c.region !== 'Middle East & Africa' && c.region !== 'Africa') return false;
        } else if (c.region !== selectedRegion) {
          return false;
        }
      }

      // Search filter
      if (currencySearch.trim()) {
        const q = currencySearch.toLowerCase().trim();
        const matchesCode = c.code.toLowerCase().includes(q);
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesSymbol = c.symbol.toLowerCase().includes(q);
        const matchesRegion = c.region?.toLowerCase().includes(q);
        return matchesCode || matchesName || matchesSymbol || matchesRegion;
      }

      return true;
    });
  }, [currencies, currencySearch, selectedRegion]);

  const testUsdNum = parseFloat(calcAmount) || 0;
  const convertedTestAmount = convert(testUsdNum);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>Settings & Preferences</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Configure system currency (INR, USD, EUR, AED, GBP & 40+ others), company details, and billing headers.
          </p>
        </div>

        {/* Save indicator toast */}
        {(isSavedToast || currencyToast) && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold shadow-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{currencyToast || 'Settings saved successfully!'}</span>
          </div>
        )}
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 max-w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('currency')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'currency'
              ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4 text-amber-500" />
          <span>Operating Currency</span>
          <span className="px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono text-[11px] font-bold">
            {currencyConfig.flag} {currencyConfig.code}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'company'
              ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building className="w-4 h-4 text-cyan-500" />
          <span>Company & Billing Profile</span>
        </button>
      </div>

      {/* TAB 1: CURRENCY CONFIGURATION */}
      {activeTab === 'currency' && (
        <div className="space-y-6 animate-fade-in">
          {/* Hero Active Currency Showcase */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 text-white p-6 sm:p-8 border border-cyan-500/30 shadow-xl shadow-cyan-950/20">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Left 2 Cols: Active Currency Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Primary Operating Currency Active</span>
                </div>

                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl">{currencyConfig.flag}</span>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                      <span>{currencyConfig.name}</span>
                      <span className="text-cyan-400 font-mono">({currencyConfig.code})</span>
                    </h2>
                    <p className="text-xs text-slate-300">
                      Region: <span className="text-white font-medium">{currencyConfig.region || 'Global'}</span> &bull; Symbol: <span className="font-mono text-cyan-300 text-sm font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">{currencyConfig.symbol.trim()}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Exchange Rate</span>
                    <span className="text-sm sm:text-base font-bold text-white font-mono">
                      1 USD = {currencyConfig.rate === 1 ? '1.00' : currencyConfig.rate.toLocaleString()} {currencyConfig.symbol.trim()}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">$25,000 Event Budget</span>
                    <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
                      {format(25000)}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">$1,200 Vendor Rate</span>
                    <span className="text-sm sm:text-base font-bold text-cyan-300 font-mono">
                      {format(1200)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right 1 Col: Live Conversion Tester */}
              <div className="bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl backdrop-blur-md space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Calculator className="w-4 h-4 text-cyan-400" />
                  <span>Instant Rate Calculator</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 block">Enter Base USD Amount:</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">$</span>
                    <input
                      type="number"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-center">
                  <div className="text-[10px] uppercase font-mono text-cyan-300 font-bold">
                    Converts to {currencyConfig.code}
                  </div>
                  <div className="text-lg sm:text-xl font-mono font-black text-white mt-0.5">
                    {format(testUsdNum)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    ({new Intl.NumberFormat(currencyConfig.locale, { minimumFractionDigits: 0 }).format(Math.round(convertedTestAmount))} {currencyConfig.code})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick-Picks for Most Popular Currencies */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Popular & Global Major Currencies</span>
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">Click any currency to activate instantly</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {currencies.filter(c => c.popular).map(c => {
                const isSelected = c.code === currency;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelectCurrency(c.code as CurrencyCode, c.name)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/25 font-bold scale-[1.02]'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="font-mono font-bold">{c.code}</span>
                    <span className={isSelected ? 'text-cyan-100' : 'text-slate-400 dark:text-slate-400'}>
                      ({c.symbol.trim()})
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* All Currencies Search & Directory */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-500" />
                  <span>Full Currency Catalog ({currencies.length} Available)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select your country or client transaction currency. All ledger entries, invoices, and budgets synchronize automatically.
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={currencySearch}
                  onChange={(e) => setCurrencySearch(e.target.value)}
                  placeholder="Search INR, Rupee, EUR, Dirham, Yen, Peso..."
                  className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                />
                {currencySearch && (
                  <button
                    type="button"
                    onClick={() => setCurrencySearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Region Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">Region:</span>
              {regions.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRegion(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedRegion === r
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
              <span className="text-[11px] text-slate-400 ml-auto font-mono">
                Showing {filteredCurrencies.length} currencies
              </span>
            </div>

            {/* Currencies Grid */}
            {filteredCurrencies.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Coins className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm font-semibold">No currencies matching "{currencySearch}"</div>
                <p className="text-xs">Try searching by 3-letter code (e.g. INR, USD, AED), country name, or symbol.</p>
                <button
                  type="button"
                  onClick={() => { setCurrencySearch(''); setSelectedRegion('All'); }}
                  className="text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:underline mt-2 cursor-pointer"
                >
                  Reset search & filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredCurrencies.map(c => {
                  const isSelected = c.code === currency;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelectCurrency(c.code as CurrencyCode, c.name)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-3 relative group ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-950/50 shadow-md shadow-cyan-500/10 ring-2 ring-cyan-500/30'
                          : 'border-slate-200 dark:border-slate-700/80 bg-white/60 dark:bg-slate-800/60 hover:border-cyan-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs'
                      }`}
                    >
                      {/* Top row: Flag + Code + Active Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-2xl leading-none shrink-0">{c.flag}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-black font-mono tracking-tight text-slate-900 dark:text-white">
                                {c.code}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 font-mono text-[11px] font-bold">
                                {c.symbol.trim()}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate max-w-[130px]" title={c.name}>
                              {c.name}
                            </div>
                          </div>
                        </div>

                        {isSelected ? (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                            {c.region || ''}
                          </span>
                        )}
                      </div>

                      {/* Bottom row: Rate & Sample calculation */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono">
                          1 USD = {c.rate === 1 ? '1.00' : c.rate > 100 ? Math.round(c.rate).toLocaleString() : c.rate.toFixed(2)}
                        </span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                          {c.symbol.trim()}{Math.round(100 * c.rate).toLocaleString()} / $100
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY PROFILE & BILLING HEADER */}
      {activeTab === 'company' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left 2 Cols: Company Profile Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-7 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Company Information & Billing Profile
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      This company name, address, and remittance info appear on all client invoices and printable receipts.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
                  title="Reset to default details"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset Defaults</span>
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Company / Organization Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={e => handleInputChange('companyName', e.target.value)}
                    placeholder="e.g. Apex Event Production Co."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={e => handleInputChange('tagline', e.target.value)}
                    placeholder="e.g. Premier Full-Service Event Management & Production"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Billing Email</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder="billing@apexevents.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 248-9000"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Office Street Address</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => handleInputChange('address', e.target.value)}
                    placeholder="500 Grand Avenue, Suite 800"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => handleInputChange('city', e.target.value)}
                      placeholder="San Francisco"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">State / Region</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={e => handleInputChange('state', e.target.value)}
                      placeholder="CA"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Zip / Postal Code</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={e => handleInputChange('zipCode', e.target.value)}
                      placeholder="94105"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={e => handleInputChange('country', e.target.value)}
                    placeholder="United States / India / UAE"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Website / Domain</span>
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={e => handleInputChange('website', e.target.value)}
                    placeholder="www.apexevents.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tax Registration / Business ID (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={e => handleInputChange('taxId', e.target.value)}
                    placeholder="e.g. GSTIN: 27AAAAA0000A1Z5, US-EIN-94-3829104, VAT # GB12345678"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 font-mono text-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Invoice Payment Instructions & Wire Remittance Details
                  </label>
                  <textarea
                    rows={2}
                    value={formData.paymentInstructions}
                    onChange={e => handleInputChange('paymentInstructions', e.target.value)}
                    placeholder="Remittance details shown on client bills (Bank Name, IFSC / IBAN / SWIFT, Account #)..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 resize-y"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Bill Footer Note / Standard Terms
                  </label>
                  <input
                    type="text"
                    value={formData.footerNote}
                    onChange={e => handleInputChange('footerNote', e.target.value)}
                    placeholder="e.g. Thank you for your business. Standard Net-30 payment terms apply."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 text-xs"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md shadow-cyan-600/20 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Company Details</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right 1 Col: Bill Header Live Preview Card & Currency Summary */}
          <div className="space-y-6">
            {/* Active Currency Quick Widget */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>Current Operating Currency</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('currency')}
                  className="text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer"
                >
                  Change Currency &rarr;
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-3xl">{currencyConfig.flag}</span>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {currencyConfig.name} ({currencyConfig.code})
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    1 USD = {currencyConfig.rate} {currencyConfig.symbol.trim()}
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Header Live Preview Card */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <FileText className="w-4 h-4 text-cyan-500" />
                  <span>Bill Header Preview</span>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Live Preview
                </span>
              </div>

              {/* Mock Invoice Top Strip */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                      {formData.companyName || 'Company Name'}
                    </h3>
                    <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
                      {formData.tagline || 'Tagline'}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {formData.address || 'Address Line'}<br />
                      {[formData.city, formData.state, formData.zipCode].filter(Boolean).join(', ')}<br />
                      {formData.country || 'Country'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300 dark:text-slate-700 block">
                      INVOICE
                    </span>
                    <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 block">
                      #INV-2026-001
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-1">
                      Currency: {currencyConfig.code} ({currencyConfig.symbol.trim()})
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap justify-between gap-2">
                  <span>{formData.email}</span>
                  <span className="font-mono">{formData.phone}</span>
                </div>

                {formData.taxId && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    Tax ID: {formData.taxId}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onPreviewSampleBill}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Inspect Sample Invoice Printout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
