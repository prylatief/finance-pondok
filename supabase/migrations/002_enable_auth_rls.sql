-- =====================================================
-- Finance Pondok - Enable Authentication & Update RLS
-- =====================================================
-- Created: 2025-11-29
-- Description: Updates RLS policies to require authentication
-- =====================================================

-- =====================================================
-- 1. DROP OLD POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Allow all operations on categories" ON public.categories;
DROP POLICY IF EXISTS "Allow all operations on transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow all operations on settings" ON public.settings;

-- =====================================================
-- 2. CATEGORIES - Authenticated Users Only
-- =====================================================
-- Allow authenticated users to read categories
CREATE POLICY "Authenticated users can view categories"
    ON public.categories
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert categories
CREATE POLICY "Authenticated users can insert categories"
    ON public.categories
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update categories
CREATE POLICY "Authenticated users can update categories"
    ON public.categories
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete categories
CREATE POLICY "Authenticated users can delete categories"
    ON public.categories
    FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 3. TRANSACTIONS - Authenticated Users Only
-- =====================================================
-- Allow authenticated users to read transactions
CREATE POLICY "Authenticated users can view transactions"
    ON public.transactions
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert transactions
CREATE POLICY "Authenticated users can insert transactions"
    ON public.transactions
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update transactions
CREATE POLICY "Authenticated users can update transactions"
    ON public.transactions
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete transactions
CREATE POLICY "Authenticated users can delete transactions"
    ON public.transactions
    FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 4. SETTINGS - Authenticated Users Only
-- =====================================================
-- Allow authenticated users to read settings
CREATE POLICY "Authenticated users can view settings"
    ON public.settings
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to update settings
CREATE POLICY "Authenticated users can update settings"
    ON public.settings
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- All tables now require authentication to access
-- Users must be logged in via Supabase Auth to:
-- 1. View, create, update, delete categories
-- 2. View, create, update, delete transactions
-- 3. View and update settings
-- =====================================================
