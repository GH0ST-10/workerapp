-- =========================================================
-- WorkTrack • Supabase Database Schema & Row Level Security
-- =========================================================
-- Run this script in the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New query -> Paste & Run

-- 1. Create table for attendance records
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('FULL', 'HALF', 'ABSENT')),
    note TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- Index for fast lookup by user and date
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON public.attendance_records(user_id, date);

-- 2. Create table for user settings & wage rates
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    worker_name TEXT DEFAULT '',
    company_name TEXT DEFAULT '',
    rate_full INTEGER DEFAULT 500,
    rate_half INTEGER DEFAULT 300,
    monthly_target INTEGER DEFAULT 15000,
    sound_enabled BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'dark',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can view their own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can insert their own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can update their own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can delete their own attendance" ON public.attendance_records;

DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;

-- 5. RLS Policies for attendance_records (Strict Per-Account Isolation)
CREATE POLICY "Users can view their own attendance"
    ON public.attendance_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attendance"
    ON public.attendance_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance"
    ON public.attendance_records FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own attendance"
    ON public.attendance_records FOR DELETE
    USING (auth.uid() = user_id);

-- 6. RLS Policies for user_settings
CREATE POLICY "Users can view their own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. Trigger to auto-update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_attendance_updated_at ON public.attendance_records;
CREATE TRIGGER trigger_attendance_updated_at
    BEFORE UPDATE ON public.attendance_records
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_settings_updated_at ON public.user_settings;
CREATE TRIGGER trigger_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
