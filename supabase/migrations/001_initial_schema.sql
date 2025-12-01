-- =====================================================
-- Finance Pondok - Initial Database Schema
-- =====================================================
-- Created: 2025-11-28
-- Description: Creates tables for categories, transactions, and settings
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CATEGORIES TABLE
-- =====================================================
-- Stores income and expense categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('pemasukan', 'pengeluaran')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster filtering by type
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);

-- Add comment to table
COMMENT ON TABLE public.categories IS 'Kategori untuk pemasukan dan pengeluaran';

-- =====================================================
-- 2. TRANSACTIONS TABLE
-- =====================================================
-- Stores all financial transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('pemasukan', 'pengeluaran')),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- Composite index for common queries (date + type)
CREATE INDEX IF NOT EXISTS idx_transactions_date_type ON public.transactions(date DESC, type);

-- Add comment to table
COMMENT ON TABLE public.transactions IS 'Semua transaksi keuangan pondok';

-- =====================================================
-- 3. SETTINGS TABLE
-- =====================================================
-- Stores pondok configuration (single row table)
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'Pondok Pesantren',
    address TEXT,
    treasurer_name TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure only one settings row exists
CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_singleton ON public.settings((id IS NOT NULL));

-- Insert default settings (only if table is empty)
INSERT INTO public.settings (name, address, treasurer_name)
SELECT
    'Pondok Pesantren Al-Hidayah',
    'Jl. Kebenaran No. 1, Kota Berkah',
    'Ahmad Syafi''i'
WHERE NOT EXISTS (SELECT 1 FROM public.settings);

-- Add comment to table
COMMENT ON TABLE public.settings IS 'Konfigurasi pondok pesantren (hanya 1 baris)';

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. RLS POLICIES (Public Access for Now)
-- =====================================================
-- NOTE: For now, we allow all operations without authentication
-- Later, you can restrict this to authenticated users only

-- Categories: Allow all operations
DROP POLICY IF EXISTS "Allow all operations on categories" ON public.categories;
CREATE POLICY "Allow all operations on categories"
    ON public.categories
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Transactions: Allow all operations
DROP POLICY IF EXISTS "Allow all operations on transactions" ON public.transactions;
CREATE POLICY "Allow all operations on transactions"
    ON public.transactions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Settings: Allow all operations
DROP POLICY IF EXISTS "Allow all operations on settings" ON public.settings;
CREATE POLICY "Allow all operations on settings"
    ON public.settings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 6. UPDATED_AT TRIGGER FUNCTION
-- =====================================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
DROP TRIGGER IF EXISTS set_updated_at ON public.categories;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.transactions;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.settings;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 7. HELPER VIEWS (Optional)
-- =====================================================
-- View to get transactions with category names
CREATE OR REPLACE VIEW public.transactions_with_categories AS
SELECT
    t.id,
    t.date,
    t.type,
    t.category_id,
    c.name AS category_name,
    t.amount,
    t.description,
    t.created_at,
    t.updated_at
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
ORDER BY t.date DESC, t.created_at DESC;

-- Add comment to view
COMMENT ON VIEW public.transactions_with_categories IS 'Transaksi dengan nama kategori (untuk query lebih mudah)';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- You can now:
-- 1. Insert categories
-- 2. Insert transactions
-- 3. Update settings
-- 4. Query data with proper indexes
-- =====================================================
