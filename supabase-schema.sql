-- =============================================================================
-- CYBEREVENTS POSTGRESQL SCHEMA FOR SUPABASE
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. EVENT CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT 'cyan',
    icon TEXT DEFAULT 'Shield',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    date DATE NOT NULL,
    end_date DATE,
    venue TEXT,
    guest_count INTEGER DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'Planning',
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    services JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. VENDORS & PARTNERS
CREATE TABLE IF NOT EXISTS public.vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    rating NUMERIC(3, 2) DEFAULT 4.8,
    payment_terms TEXT DEFAULT 'Net-30',
    active_contracts_count INTEGER DEFAULT 0,
    total_paid NUMERIC(12, 2) DEFAULT 0.00,
    outstanding_balance NUMERIC(12, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'Active',
    services_offered TEXT[] DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRM LEADS
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    category TEXT NOT NULL,
    guest_count INTEGER,
    estimated_budget NUMERIC(12, 2) DEFAULT 0.00,
    target_date DATE,
    status TEXT DEFAULT 'New',
    source TEXT DEFAULT 'Website',
    notes TEXT,
    converted_event_id TEXT REFERENCES public.events(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CLIENT INVOICES
CREATE TABLE IF NOT EXISTS public.client_invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    event_title TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC(12, 2) DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Unpaid',
    notes TEXT,
    payment_method TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. VENDOR BILLS
CREATE TABLE IF NOT EXISTS public.vendor_bills (
    id TEXT PRIMARY KEY,
    bill_number TEXT NOT NULL UNIQUE,
    vendor_id TEXT REFERENCES public.vendors(id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    event_title TEXT NOT NULL,
    service_category TEXT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Unpaid',
    notes TEXT,
    payment_method TEXT,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. KANBAN SPRINTS & RUN-SHEET TASKS
CREATE TABLE IF NOT EXISTS public.kanban_tasks (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    event_title TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    service_category TEXT DEFAULT 'General Operations',
    assigned_to TEXT,
    sourcing TEXT DEFAULT 'in_house',
    status TEXT NOT NULL DEFAULT 'Backlog',
    priority TEXT NOT NULL DEFAULT 'Medium',
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. GANTT TIMELINE & STAGE RIGGING MILESTONES
CREATE TABLE IF NOT EXISTS public.gantt_tasks (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
    event_title TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Milestone',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    progress INTEGER DEFAULT 0,
    color TEXT DEFAULT '#06b6d4',
    owner TEXT,
    status TEXT DEFAULT 'Not Started',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gantt_tasks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated and anon read/write (for single-tenant or demo dashboard usage)
CREATE POLICY "Allow public read access on categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public write access on categories" ON public.categories FOR ALL USING (true);

CREATE POLICY "Allow public read access on events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Allow public write access on events" ON public.events FOR ALL USING (true);

CREATE POLICY "Allow public read access on vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Allow public write access on vendors" ON public.vendors FOR ALL USING (true);

CREATE POLICY "Allow public read access on leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Allow public write access on leads" ON public.leads FOR ALL USING (true);

CREATE POLICY "Allow public read access on client_invoices" ON public.client_invoices FOR SELECT USING (true);
CREATE POLICY "Allow public write access on client_invoices" ON public.client_invoices FOR ALL USING (true);

CREATE POLICY "Allow public read access on vendor_bills" ON public.vendor_bills FOR SELECT USING (true);
CREATE POLICY "Allow public write access on vendor_bills" ON public.vendor_bills FOR ALL USING (true);

CREATE POLICY "Allow public read access on kanban_tasks" ON public.kanban_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public write access on kanban_tasks" ON public.kanban_tasks FOR ALL USING (true);

CREATE POLICY "Allow public read access on gantt_tasks" ON public.gantt_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public write access on gantt_tasks" ON public.gantt_tasks FOR ALL USING (true);
