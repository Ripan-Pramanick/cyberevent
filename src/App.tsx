import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EventProvider, useEventContext } from './context/EventContext';
import { NavigationTab, EventItem } from './types';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { LoginPage } from './components/LoginPage';
import { DashboardView } from './components/DashboardView';
import { EventsView } from './components/EventsView';
import { LeadsView } from './components/LeadsView';
import { VendorsView } from './components/VendorsView';
import { BillingView } from './components/BillingView';
import { KanbanView } from './components/KanbanView';
import { CategoriesView } from './components/CategoriesView';
import { GanttView } from './components/GanttView';
import { SettingsView } from './components/SettingsView';
import { EventModal } from './components/EventModal';
import { EventDetailModal } from './components/EventDetailModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';

const CyberEventsApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { resetToDemoData, clientInvoices } = useEventContext();

  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal States
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);
  const [printInvoiceId, setPrintInvoiceId] = useState<string | null>(null);

  // Authentication Guard: if not authenticated, show the Login Page
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-400 font-mono text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <span>INITIALIZING CYBER CONSOLE...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleEditEvent = (event: EventItem) => {
    setSelectedEventId(null);
    setEventToEdit(event);
    setIsCreateEventOpen(true);
  };

  const handleOpenNewLead = () => {
    setCurrentTab('leads');
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all demo data (events, partners, invoices, tasks) to initial pristine state?')) {
      resetToDemoData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200 antialiased selection:bg-cyan-500 selection:text-white">
      {/* Desktop & Mobile Drawer Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setIsMobileMenuOpen(false);
        }}
        onOpenNewEvent={() => {
          setEventToEdit(null);
          setIsCreateEventOpen(true);
        }}
        onOpenNewLead={handleOpenNewLead}
        onResetDemo={handleResetDemoData}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Top Header */}
        <TopNav
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewEvent={() => {
            setEventToEdit(null);
            setIsCreateEventOpen(true);
          }}
          onOpenNewLead={handleOpenNewLead}
          onResetDemo={handleResetDemoData}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigate={setCurrentTab}
              onSelectEvent={handleSelectEvent}
            />
          )}

          {currentTab === 'events' && (
            <EventsView
              onSelectEvent={handleSelectEvent}
              onOpenCreateEvent={() => {
                setEventToEdit(null);
                setIsCreateEventOpen(true);
              }}
              onOpenEditEvent={handleEditEvent}
            />
          )}

          {currentTab === 'leads' && (
            <LeadsView
              onLeadConverted={(newEventId) => {
                setSelectedEventId(newEventId);
              }}
            />
          )}

          {currentTab === 'vendors' && (
            <VendorsView />
          )}

          {currentTab === 'billing' && (
            <BillingView
              onOpenPrintInvoice={(invoiceId) => {
                setPrintInvoiceId(invoiceId);
              }}
            />
          )}

          {currentTab === 'kanban' && (
            <KanbanView />
          )}

          {currentTab === 'categories' && (
            <CategoriesView />
          )}

          {currentTab === 'gantt' && (
            <GanttView />
          )}

          {currentTab === 'settings' && (
            <SettingsView 
              onPreviewSampleBill={() => {
                if (clientInvoices.length > 0) {
                  setPrintInvoiceId(clientInvoices[0].id);
                }
              }}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <EventModal
        isOpen={isCreateEventOpen}
        onClose={() => {
          setIsCreateEventOpen(false);
          setEventToEdit(null);
        }}
        eventToEdit={eventToEdit}
      />

      {selectedEventId && (
        <EventDetailModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
          onEditEvent={handleEditEvent}
          onOpenClientInvoice={(invId) => setPrintInvoiceId(invId)}
        />
      )}

      {printInvoiceId && (
        <InvoicePrintModal
          invoiceId={printInvoiceId}
          onClose={() => setPrintInvoiceId(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <EventProvider>
            <CyberEventsApp />
          </EventProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
