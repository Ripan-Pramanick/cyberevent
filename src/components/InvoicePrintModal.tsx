import React from 'react';
import { 
  X, 
  Printer, 
  ArrowLeft, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe
} from 'lucide-react';
import { useEventContext } from '../context/EventContext';
import { useCurrency } from '../context/CurrencyContext';
import { formatDate } from '../utils/formatters';

interface InvoicePrintModalProps {
  invoiceId: string | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoiceId,
  onClose
}) => {
  const { clientInvoices, events, companyProfile } = useEventContext();
  const { format, currencyConfig } = useCurrency();

  const invoice = clientInvoices.find(inv => inv.id === invoiceId);
  if (!invoice) return null;

  const event = events.find(e => e.id === invoice.eventId);

  const handlePrint = () => {
    window.print();
  };

  const balanceDue = Math.max(0, invoice.totalAmount - invoice.amountPaid);

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static print:overflow-visible"
      role="dialog"
      aria-modal="true"
      aria-label="Invoice Document Viewer"
    >
      {/* Background click overlay */}
      <div 
        className="fixed inset-0 print:hidden -z-10" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="bg-white text-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col print:border-none print:shadow-none print:rounded-none print:max-w-none my-auto">
        {/* Top Navigation & Action Header (Explicit Back Button and Print Options) */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 border-b border-slate-800 print:hidden sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700/80 active:scale-95"
              title="Return to billing ledger"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Billing</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 pl-2 border-l border-slate-800">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-slate-300 font-bold">{invoice.invoiceNumber}</span>
              <span>&bull;</span>
              <span className="truncate max-w-[200px]">{invoice.clientName}</span>
            </div>
          </div>

          {/* Action Buttons: Print / PDF & Close X */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              title="Print Document or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close viewer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 sm:p-10 md:p-12 space-y-8 print:p-6 print:space-y-6 text-slate-900">
          {/* Header Row: User's Configured Company Profile & Invoice Meta */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-slate-200 pb-6">
            {/* Left: Dynamic Company Details from Settings */}
            <div className="space-y-1.5 max-w-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-950 text-cyan-400 flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-black text-xl sm:text-2xl tracking-tight text-slate-950 leading-none">
                    {companyProfile.companyName || 'Apex Event Management & Production'}
                  </h2>
                  {companyProfile.tagline && (
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {companyProfile.tagline}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-600 font-mono space-y-0.5 pt-2">
                <div>
                  {companyProfile.address}
                  {(companyProfile.city || companyProfile.state || companyProfile.zipCode) && (
                    <span>, {companyProfile.city} {companyProfile.state} {companyProfile.zipCode}</span>
                  )}
                  {companyProfile.country && <span> &bull; {companyProfile.country}</span>}
                </div>
                <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-500">
                  {companyProfile.email && <span>Email: {companyProfile.email}</span>}
                  {companyProfile.phone && <span>Tel: {companyProfile.phone}</span>}
                  {companyProfile.website && <span>Web: {companyProfile.website}</span>}
                </div>
                {companyProfile.taxId && (
                  <div className="text-[11px] text-slate-500">Tax ID / EIN: {companyProfile.taxId}</div>
                )}
              </div>
            </div>

            {/* Right: Commercial Invoice Metadata */}
            <div className="text-left sm:text-right space-y-1 font-mono shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200/80 inline-block mb-1">
                Commercial Invoice
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {invoice.invoiceNumber}
              </h1>
              <div className="text-xs text-slate-500 space-y-0.5 pt-1">
                <div>Issue Date: <strong className="text-slate-900">{formatDate(invoice.issueDate)}</strong></div>
                <div>Payment Due: <strong className="text-slate-900">{formatDate(invoice.dueDate)}</strong></div>
                <div>Billing Currency: <strong className="text-cyan-800">{currencyConfig.code} ({currencyConfig.symbol})</strong></div>
              </div>
            </div>
          </div>

          {/* Client & Event Billets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] font-mono">
                Billed To Client:
              </span>
              <h3 className="text-base font-bold text-slate-900">{invoice.clientName}</h3>
              {event?.clientEmail && (
                <div className="text-slate-600 font-mono">{event.clientEmail}</div>
              )}
              {event?.clientPhone && (
                <div className="text-slate-600 font-mono">{event.clientPhone}</div>
              )}
              <div className="text-[11px] text-slate-500 font-mono pt-1">
                Payment Status: <strong className="text-slate-900">{invoice.status}</strong>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px] font-mono">
                Event Production Engagement:
              </span>
              <h3 className="text-base font-bold text-slate-900">{invoice.eventTitle}</h3>
              {event && (
                <div className="text-slate-600 space-y-0.5">
                  <div>Event Date: <strong>{formatDate(event.date)}</strong></div>
                  <div>Venue: <strong>{event.venue || 'Venue Specified in Contract'}</strong></div>
                  <div>Expected Guests: <strong>{event.guestCount} attendees</strong></div>
                </div>
              )}
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 font-mono mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Event Production Scope</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 font-semibold text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">Item / Deliverable Description</th>
                  <th className="px-4 py-3 text-center font-mono w-20">Qty</th>
                  <th className="px-4 py-3 text-right font-mono w-32">Unit Price</th>
                  <th className="px-4 py-3 text-right font-mono w-36">Amount ({currencyConfig.code})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {(invoice.lineItems || invoice.items || []).length > 0 ? (
                  (invoice.lineItems || invoice.items || []).map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-sans">
                        <span className="font-bold text-slate-900 block">{item.description}</span>
                        {item.category && (
                          <span className="text-[11px] text-slate-500">{item.category}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{format(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">{format(item.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-3 font-sans">
                      <span className="font-bold text-slate-900 block">{invoice.eventTitle} - Event Production Services</span>
                      <span className="text-[11px] text-slate-500">Comprehensive planning, technical staffing & vendor management</span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">1</td>
                    <td className="px-4 py-3 text-right text-slate-600">{format(invoice.totalAmount)}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{format(invoice.totalAmount)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total Calculation Strip & Remittance Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-600 max-w-md space-y-2">
              <p className="font-bold text-slate-800">Remittance & Payment Instructions:</p>
              <p className="leading-relaxed">
                {companyProfile.paymentInstructions || 'Please remit payment via wire transfer or corporate ACH within the specified terms.'}
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-[11px] space-y-0.5">
                <div>Reference Code: <strong className="text-slate-900">{invoice.invoiceNumber}</strong></div>
                <div>Account Name: <strong className="text-slate-900">{companyProfile.companyName}</strong></div>
                {companyProfile.email && <div>Remittance Advice: {companyProfile.email}</div>}
              </div>
              {invoice.notes && (
                <p className="italic text-slate-600 text-[11px] pt-1">
                  Note: "{invoice.notes}"
                </p>
              )}
            </div>

            <div className="w-full sm:w-80 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Subtotal</span>
                <span className="font-bold text-slate-900">{format(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-sans">Tax (0% Standard Event Services)</span>
                <span className="font-bold text-slate-900">{format(0)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200 text-sm">
                <span className="font-bold text-slate-900 font-sans">Total Invoice Amount</span>
                <span className="font-black text-slate-950">{format(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-1.5 text-emerald-600 font-bold">
                <span className="font-sans font-semibold">Amount Paid to Date</span>
                <span>-{format(invoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between py-2.5 bg-cyan-50 px-3.5 rounded-xl text-cyan-950 font-bold text-sm border border-cyan-200/80">
                <span className="font-sans">Balance Due</span>
                <span className="font-black text-base text-cyan-900">{format(balanceDue)}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms & Legal Information */}
          <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
            <p className="font-medium text-slate-600">
              {companyProfile.footerNote || 'Thank you for your partnership. Standard payment terms apply.'}
            </p>
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
              <span>Official Commercial Billing Ledger &bull; {companyProfile.companyName}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar for convenience */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Billing</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice / Save PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
