import React, { createContext, useContext, useState, useEffect } from 'react';
import { CurrencyCode, CurrencyConfig } from '../types';

// Ei array-ti theke rate gulo remove korini, karon API fail korle egulo fallback hisabe kaj korbe
export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  // Popular / Major
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.6, flag: '🇮🇳', locale: 'en-IN', region: 'South Asia', popular: true },
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0, flag: '🇺🇸', locale: 'en-US', region: 'Americas', popular: true },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92, flag: '🇪🇺', locale: 'de-DE', region: 'Europe', popular: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.78, flag: '🇬🇧', locale: 'en-GB', region: 'Europe', popular: true },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED ', rate: 3.67, flag: '🇦🇪', locale: 'ar-AE', region: 'Middle East', popular: true },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rate: 1.36, flag: '🇨🇦', locale: 'en-CA', region: 'Americas', popular: true },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.51, flag: '🇦🇺', locale: 'en-AU', region: 'Asia & Pacific', popular: true },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.34, flag: '🇸🇬', locale: 'en-SG', region: 'Asia & Pacific', popular: true },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 155.2, flag: '🇯🇵', locale: 'ja-JP', region: 'Asia & Pacific', popular: true },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF ', rate: 0.89, flag: '🇨🇭', locale: 'de-CH', region: 'Europe', popular: true },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR ', rate: 3.75, flag: '🇸🇦', locale: 'ar-SA', region: 'Middle East', popular: true },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QAR ', rate: 3.64, flag: '🇶🇦', locale: 'ar-QA', region: 'Middle East' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KWD ', rate: 0.31, flag: '🇰🇼', locale: 'ar-KW', region: 'Middle East' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BHD ', rate: 0.38, flag: '🇧🇭', locale: 'ar-BH', region: 'Middle East' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'OMR ', rate: 0.38, flag: '🇴🇲', locale: 'ar-OM', region: 'Middle East' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', rate: 1.63, flag: '🇳🇿', locale: 'en-NZ', region: 'Asia & Pacific' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: 'CN¥', rate: 7.24, flag: '🇨🇳', locale: 'zh-CN', region: 'Asia & Pacific' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', rate: 7.82, flag: '🇭🇰', locale: 'zh-HK', region: 'Asia & Pacific' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', rate: 1370.0, flag: '🇰🇷', locale: 'ko-KR', region: 'Asia & Pacific' },
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', rate: 32.3, flag: '🇹🇼', locale: 'zh-TW', region: 'Asia & Pacific' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', rate: 36.6, flag: '🇹🇭', locale: 'th-TH', region: 'Asia & Pacific' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM ', rate: 4.71, flag: '🇲🇾', locale: 'ms-MY', region: 'Asia & Pacific' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp ', rate: 16250.0, flag: '🇮🇩', locale: 'id-ID', region: 'Asia & Pacific' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', rate: 58.2, flag: '🇵🇭', locale: 'en-PH', region: 'Asia & Pacific' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', rate: 25400.0, flag: '🇻🇳', locale: 'vi-VN', region: 'Asia & Pacific' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.25, flag: '🇧🇷', locale: 'pt-BR', region: 'Americas' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', rate: 17.8, flag: '🇲🇽', locale: 'es-MX', region: 'Americas' },
  { code: 'CLP', name: 'Chilean Peso', symbol: 'CLP$', rate: 920.0, flag: '🇨🇱', locale: 'es-CL', region: 'Americas' },
  { code: 'COP', name: 'Colombian Peso', symbol: 'COL$', rate: 3900.0, flag: '🇨🇴', locale: 'es-CO', region: 'Americas' },
  { code: 'ARS', name: 'Argentine Peso', symbol: 'ARS$', rate: 900.0, flag: '🇦🇷', locale: 'es-AR', region: 'Americas' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R ', rate: 18.2, flag: '🇿🇦', locale: 'en-ZA', region: 'Middle East & Africa' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', rate: 47.5, flag: '🇪🇬', locale: 'ar-EG', region: 'Middle East & Africa' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1450.0, flag: '🇳🇬', locale: 'en-NG', region: 'Middle East & Africa' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh ', rate: 130.0, flag: '🇰🇪', locale: 'en-KE', region: 'Middle East & Africa' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨ ', rate: 278.0, flag: '🇵🇰', locale: 'ur-PK', region: 'South Asia' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', rate: 117.0, flag: '🇧🇩', locale: 'bn-BD', region: 'South Asia' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs ', rate: 302.0, flag: '🇱🇰', locale: 'si-LK', region: 'South Asia' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', rate: 32.5, flag: '🇹🇷', locale: 'tr-TR', region: 'Europe' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr ', rate: 10.6, flag: '🇸🇪', locale: 'sv-SE', region: 'Europe' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr ', rate: 10.7, flag: '🇳🇴', locale: 'nb-NO', region: 'Europe' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr ', rate: 6.88, flag: '🇩🇰', locale: 'da-DK', region: 'Europe' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', rate: 3.95, flag: '🇵🇱', locale: 'pl-PL', region: 'Europe' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', rate: 23.0, flag: '🇨🇿', locale: 'cs-CZ', region: 'Europe' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft ', rate: 360.0, flag: '🇭🇺', locale: 'hu-HU', region: 'Europe' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', rate: 3.70, flag: '🇮🇱', locale: 'he-IL', region: 'Middle East' },
];

interface CurrencyContextType {
  currency: CurrencyCode;
  currencyConfig: CurrencyConfig;
  currencies: CurrencyConfig[];
  setCurrency: (code: CurrencyCode) => void;
  convert: (amountInUsd: number) => number;
  format: (amountInUsd: number, options?: { maximumFractionDigits?: number; showCode?: boolean }) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
const STORAGE_KEY = 'cyberevents_currency';

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for selected currency code
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_CURRENCIES.some(c => c.code === saved)) {
        return saved as CurrencyCode;
      }
    } catch {
      // Fallback
    }
    return 'USD';
  });

  // State for dynamic currency list (updated with live rates)
  const [dynamicCurrencies, setDynamicCurrencies] = useState<CurrencyConfig[]>(SUPPORTED_CURRENCIES);

  // Fetch live exchange rates from Free API
  useEffect(() => {
    const fetchLiveRates = async () => {
      try {
        // Free API, no key required, base is USD
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        
        if (data && data.rates) {
          setDynamicCurrencies(prevCurrencies => 
            prevCurrencies.map(curr => ({
              ...curr,
              // Update with live rate if available, otherwise keep original fallback rate
              rate: data.rates[curr.code] || curr.rate 
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch live currency rates, using fallback rates:", error);
      }
    };

    fetchLiveRates();
  }, []);

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (e) {
      console.warn('Could not save currency preference', e);
    }
  };

  // Get current active config from the dynamic list
  const currencyConfig = dynamicCurrencies.find(c => c.code === currency) || dynamicCurrencies[0];

  const convert = (amountInUsd: number): number => {
    if (isNaN(amountInUsd)) return 0;
    return amountInUsd * currencyConfig.rate;
  };

  const format = (
    amountInUsd: number, 
    options?: { maximumFractionDigits?: number; showCode?: boolean }
  ): string => {
    if (isNaN(amountInUsd)) return `${currencyConfig.symbol}0`;
    
    const converted = amountInUsd * currencyConfig.rate;
    const maxDigits = options?.maximumFractionDigits !== undefined 
      ? options.maximumFractionDigits 
      : (currencyConfig.code === 'JPY' ? 0 : 0);
      
    const formattedNum = new Intl.NumberFormat(currencyConfig.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDigits,
    }).format(Math.round(converted));

    if (options?.showCode) {
      return `${currencyConfig.symbol}${formattedNum} ${currencyConfig.code}`;
    }
    return `${currencyConfig.symbol}${formattedNum}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyConfig,
        currencies: dynamicCurrencies, // Passing dynamic list to UI
        setCurrency,
        convert,
        format,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};