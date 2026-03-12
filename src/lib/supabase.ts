import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'sb-lqitleguuhsuvbsekimv-auth-token',
        // Disable Navigator Lock API to prevent timeouts in restrictive environments
        // @ts-ignore
        lock: async (name, acquireTimeout, fn) => {
            return await fn();
        }
    }
});

// ============ TYPES ============
export interface Profile {
    id: string;
    full_name: string;
    role: 'owner' | 'employee';
    phone?: string;
    active: boolean;
    created_at: string;
}

export interface Client {
    id: number;
    name: string;
    phone?: string;
    notes?: string;
    created_at: string;
    created_by?: string;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    wholesale_price?: number;
    cost?: number;
    stock: number;
    category: 'KIOSCO' | 'BOUTIQUE' | 'PELOTAS' | 'OTROS';
    low_stock_alert: number;
    active: boolean;
    created_at: string;
}

export interface BookingConsumable {
    id?: number;
    booking_id?: number;
    product_id?: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    payment_method?: 'EFECTIVO' | 'TRANSFERENCIA' | 'MIXTO' | 'NO_ABONO';
    created_at?: string;
}

export interface Booking {
    id: number;
    client_id?: number;
    customer_name: string;
    phone?: string;
    court: number;
    time_start: string;
    time_end: string;
    court_price: number;
    status: 'PENDIENTE' | 'SEÑADO' | 'PAGADO' | 'CANCELADO';
    payment_method?: 'EFECTIVO' | 'TRANSFERENCIA' | 'MIXTO';
    deposit_amount?: number;
    deposit_method?: 'EFECTIVO' | 'TRANSFERENCIA' | 'MIXTO' | 'NO ABONA';
    no_abona?: boolean;
    paid_at?: string;
    booking_date: string;
    notes?: string;
    created_by?: string;
    created_at: string;
    price_breakdown?: any[];
    // Joined data
    booking_consumables?: BookingConsumable[];
}

export interface Sale {
    id: number;
    description?: string;
    total: number;
    payment_method: 'EFECTIVO' | 'TRANSFERENCIA' | 'MIXTO';
    split_cash?: number;
    split_transfer?: number;
    is_wholesale: boolean;
    sale_type: 'income' | 'expense';
    category?: string;
    created_by?: string;
    created_at: string;
}

export interface SaleItem {
    id?: number;
    sale_id?: number;
    product_id?: number;
    product_name: string;
    quantity: number;
    unit_price: number;
}

export interface Expense {
    id: number;
    motive: string;
    amount: number;
    provider?: string;
    provider_type?: string;
    payment_method: 'EFECTIVO' | 'TRANSFERENCIA';
    category: string;
    created_by?: string;
    created_at: string;
}

export interface CashSession {
    id: number;
    opened_by?: string;
    closed_by?: string;
    initial_amount: number;
    final_amount?: number;
    total_cash: number;
    total_transfer: number;
    total_income: number;
    total_expenses: number;
    opened_at: string;
    closed_at?: string;
    status: 'open' | 'closed';
    notes?: string;
}

// ============ AUTH HELPERS ============
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) return null;
    return data as Profile;
}

// ============ CLIENTS ============
export async function fetchClients(): Promise<Client[]> {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
    if (error) { console.error('fetchClients error:', error); return []; }
    return data as Client[];
}

export async function createClient(client: Partial<Client>): Promise<Client | null> {
    const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();
    if (error) { console.error('createClient error:', error); return null; }
    return data as Client;
}

// ============ PRODUCTS ============
export async function fetchProducts(): Promise<Product[]> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('category', { ascending: true });
    if (error) { console.error('fetchProducts error:', error); return []; }
    return data as Product[];
}

export async function updateProductStock(productId: number, newStock: number) {
    const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', productId);
    return !error;
}

// ============ UTILS ============
function getBusinessDayStart(): Date {
    const now = new Date();
    // Get Argentine time (UTC-3) for comparison
    const arTime = new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: 'numeric',
        hour12: false
    }).format(now);
    
    const hour = parseInt(arTime);
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    // Business Logic: 
    // The day ends/starts at 6 AM.
    // If it's between 00:00 and 05:59, the business day began yesterday at 6 AM.
    if (hour < 6) {
        start.setDate(start.getDate() - 1);
        start.setHours(6, 0, 0, 0);
    } else {
        // Between 06:00 and 23:59, the business day began today at 6 AM.
        start.setHours(6, 0, 0, 0);
    }
    return start;
}

// ============ BOOKINGS ============
export async function fetchBookingsByDate(dateStr?: string): Promise<Booking[]> {
    const targetDate = dateStr || new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
    const { data, error } = await supabase
        .from('bookings')
        .select('*, booking_consumables(*)')
        .eq('booking_date', targetDate)
        .order('time_start');
    if (error) { console.error('fetchBookingsByDate error:', error); return []; }
    return data as Booking[];
}

export async function fetchBookingHistory(limit = 200): Promise<Booking[]> {
    const { data, error } = await supabase
        .from('bookings')
        .select('*, booking_consumables(*)')
        .eq('status', 'PAGADO')
        .order('paid_at', { ascending: false })
        .limit(limit);
    if (error) { console.error('fetchBookingHistory error:', error); return []; }
    return data as Booking[];
}

export async function createBooking(booking: Partial<Booking>): Promise<Booking | null> {
    const { data, error } = await supabase
        .from('bookings')
        .insert({
            client_id: booking.client_id,
            customer_name: booking.customer_name,
            phone: booking.phone,
            court: booking.court,
            booking_date: booking.booking_date,
            time_start: booking.time_start,
            time_end: booking.time_end,
            court_price: booking.court_price,
            status: booking.status || 'PENDIENTE',
            deposit_amount: booking.deposit_amount || 0,
            deposit_method: booking.deposit_method || null,
            no_abona: booking.no_abona || false,
            price_breakdown: booking.price_breakdown,
            created_by: booking.created_by
        })
        .select()
        .single();
    if (error) { console.error('createBooking error:', error); return null; }
    return data as Booking;
}

export async function completeBooking(bookingId: number, paymentMethod: string) {
    const isNoAbona = paymentMethod === 'NO_ABONA';
    const { error } = await supabase
        .from('bookings')
        .update({
            status: 'PAGADO',
            payment_method: isNoAbona ? 'EFECTIVO' : paymentMethod,
            no_abona: isNoAbona,
            paid_at: new Date().toISOString()
        })
        .eq('id', bookingId);
    return !error;
}

export async function addDeposit(bookingId: number, depositAmount: number, depositMethod: string) {
    const { error } = await supabase
        .from('bookings')
        .update({
            status: 'SEÑADO',
            deposit_amount: depositAmount,
            deposit_method: depositMethod
        })
        .eq('id', bookingId);
    return !error;
}

export async function cancelBooking(bookingId: number) {
    const { error } = await supabase
        .from('bookings')
        .update({ status: 'CANCELADO' })
        .eq('id', bookingId);
    return !error;
}

export async function addConsumableToBooking(consumable: Partial<BookingConsumable>) {
    const { data, error } = await supabase
        .from('booking_consumables')
        .insert(consumable)
        .select()
        .single();
    if (error) { console.error('addConsumable error:', error); return null; }
    return data;
}

export async function removeConsumableFromBooking(consumableId: number) {
    const { error } = await supabase
        .from('booking_consumables')
        .delete()
        .eq('id', consumableId);
    return !error;
}

// ============ SALES ============
export async function fetchTodaySales(): Promise<Sale[]> {
    const start = getBusinessDayStart();
    const { data, error } = await supabase
        .from('sales')
        .select('*')
        .gte('created_at', start.toISOString())
        .order('created_at', { ascending: false });
    if (error) { console.error('fetchTodaySales error:', error); return []; }
    return data as Sale[];
}

export async function createSale(sale: Partial<Sale>, items: Partial<SaleItem>[]) {
    const { data, error } = await supabase
        .from('sales')
        .insert(sale)
        .select()
        .single();
    if (error) { console.error('createSale error:', error); return null; }

    if (items.length > 0) {
        const saleItems = items.map(item => ({ ...item, sale_id: data.id }));
        await supabase.from('sale_items').insert(saleItems);
    }

    return data;
}

// ============ EXPENSES ============
export async function fetchTodayExpenses(): Promise<Expense[]> {
    const start = getBusinessDayStart();
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('created_at', start.toISOString())
        .order('created_at', { ascending: false });
    if (error) { console.error('fetchTodayExpenses error:', error); return []; }
    return data as Expense[];
}

export async function createExpense(expense: Partial<Expense>) {
    const { data, error } = await supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single();
    if (error) { console.error('createExpense error:', error); return null; }
    return data;
}

// ============ CASH SESSIONS ============
export async function fetchActiveCashSession(): Promise<CashSession | null> {
    const { data, error } = await supabase
        .from('cash_sessions')
        .select('*')
        .eq('status', 'open')
        .order('opened_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('fetchActiveCashSession error:', error);
        return null;
    }

    if (!data) return null;

    // Business Logic: Shift is 8 AM to 6 AM (next day)
    const now = new Date();
    const openedAt = new Date(data.opened_at);
    const businessDayStart = getBusinessDayStart();

    // If session was opened before the start of the current business shift, it's expired
    if (openedAt < businessDayStart) {
        console.log("CASH SESSION EXPIRED:", { openedAt, businessDayStart, now });
        await supabase.from('cash_sessions')
            .update({ status: 'closed', closed_at: now.toISOString(), notes: `Cierre automático (Abrió: ${openedAt.toLocaleString()}, Límite: ${businessDayStart.toLocaleString()})` })
            .eq('id', data.id);
        return null;
    }

    return data as CashSession;
}

export async function openCashSession(initialAmount: number, userId: string) {
    const { data, error } = await supabase
        .from('cash_sessions')
        .insert({
            initial_amount: initialAmount,
            opened_by: userId,
            status: 'open'
        })
        .select()
        .single();
    if (error) { console.error('openCashSession error:', error); return null; }
    return data;
}

export async function closeCashSession(sessionId: number, finalData: Partial<CashSession>) {
    const { error } = await supabase
        .from('cash_sessions')
        .update({
            ...finalData,
            status: 'closed',
            closed_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    return !error;
}
