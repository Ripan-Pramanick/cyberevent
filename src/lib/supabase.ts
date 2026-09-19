import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ⚠️ FIXED: Vite replaces env variables statically during build. 
// Dynamic access like import.meta.env[key] fails in production (npm run build).
// We must use explicit property access.
const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '') || 
  (typeof process !== 'undefined' && process.env ? (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL) : '') || 
  '';

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '') || 
  (typeof process !== 'undefined' && process.env ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY) : '') || 
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('...')
);

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured) return null;
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return clientInstance;
};

// Default export for standard Supabase usage in components
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Supabase PostgreSQL Sync Engine
 * Allows real-time syncing of local events and ledger to Supabase Postgres
 */
export const SupabaseSyncEngine = {
  isConfigured: isSupabaseConfigured,
  
  async testConnection(): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { 
        success: false, 
        message: 'Supabase credentials not detected in environment variables. Running in high-performance local ledger mode.' 
      };
    }
    try {
      const { error } = await client.from('events').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Connected to Supabase PostgreSQL database successfully.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Connection failed' };
    }
  },

  // ================= EVENTS SYNC =================
  async syncEvent(event: any): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('events').upsert({
        id: event.id,
        title: event.title,
        category: event.category,
        client_name: event.clientName,
        client_email: event.clientEmail,
        client_phone: event.clientPhone,
        date: event.date,
        end_date: event.endDate,
        venue: event.venue,
        guest_count: event.guestCount,
        status: event.status,
        budget: event.budget,
        currency: event.currency || 'USD',
        notes: event.notes,
        services: event.services,
        updated_at: new Date().toISOString()
      });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteEvent(eventId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from('events').delete().eq('id', eventId);
      return !error;
    } catch {
      return false;
    }
  },

  // ================= GENERIC SYNC FOR OTHER TABLES =================
  // Nicher function dutor maddhome apni je kono table e (vendors, leads, client_invoices) data save ba delete korte parben
  
  async syncRecord(tableName: 'vendors' | 'leads' | 'client_invoices' | 'vendor_bills' | 'kanban_tasks' | 'gantt_tasks', recordData: any): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from(tableName).upsert(recordData);
      if (error) console.error(`Sync error in ${tableName}:`, error);
      return !error;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  async deleteRecord(tableName: 'vendors' | 'leads' | 'client_invoices' | 'vendor_bills' | 'kanban_tasks' | 'gantt_tasks', recordId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    try {
      const { error } = await client.from(tableName).delete().eq('id', recordId);
      return !error;
    } catch {
      return false;
    }
  }
};