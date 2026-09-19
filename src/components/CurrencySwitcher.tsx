import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Coins, ArrowRightLeft, Search, X } from 'lucide-react';
import { useCurrency, SUPPORTED_CURRENCIES } from '../context/CurrencyContext';
import { CurrencyCode } from '../types';

interface CurrencySwitcherProps {
  compact?: boolean;
  className?: string;
  id?: string;
}

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({
  compact = false,
  className = '',
  id = 'currency-switcher',
}) => {
  const { currency, setCurrency, currencyConfig } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
  };

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return SUPPORTED_CURRENCIES;
    const q = searchQuery.toLowerCase().trim();
    return SUPPORTED_CURRENCIES.filter(
      c =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        (c.region && c.region.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={`Change display currency (Currently: ${currencyConfig.name})`}
        className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border transition-all text-xs font-semibold select-none cursor-pointer ${
          isOpen
            ? 'bg-white dark:bg-slate-800 border-cyan-400 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-500/20 shadow-xs'
            : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 shadow-2xs hover:border-slate-300'
        }`}
      >
        <span className="text-sm leading-none">{currencyConfig.flag}</span>
        <span className="font-mono font-bold tracking-tight">{currencyConfig.code}</span>
        <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px] hidden sm:inline">({currencyConfig.symbol.trim()})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-1.5 w-72 max-h-96 flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-cyan-950/20 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
        >
          <div className="px-1.5 pb-2 border-b border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">
              <span className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-cyan-500" />
                <span>Select Currency ({SUPPORTED_CURRENCIES.length} Available)</span>
              </span>
              <span>1 USD =</span>
            </div>

            {/* Search Bar inside dropdown */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search INR, EUR, AED, Rupee..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="py-1 space-y-0.5 overflow-y-auto flex-1 max-h-64 pr-1">
            {filteredCurrencies.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No currency found for "{searchQuery}"
              </div>
            ) : (
              filteredCurrencies.map((curr) => {
                const isSelected = curr.code === currency;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => handleSelect(curr.code)}
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-50/90 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 font-bold'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{curr.flag}</span>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold">{curr.code}</span>
                          <span className="text-slate-400 dark:text-slate-500 text-[11px]">({curr.symbol.trim()})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-normal">
                          {curr.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                      <span>{curr.rate === 1 ? '1.00' : curr.rate > 100 ? Math.round(curr.rate).toLocaleString() : curr.rate.toFixed(2)}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800 px-2 text-[10px] text-slate-400 flex items-center gap-1 justify-center">
            <ArrowRightLeft className="w-2.5 h-2.5" />
            <span>Real-time conversion applied to all financial cards</span>
          </div>
        </div>
      )}
    </div>
  );
};
