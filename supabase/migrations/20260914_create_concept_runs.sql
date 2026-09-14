-- Supabase Migration: Create concept_runs table for crowdsourced concept telemetry
-- Author: NerdVerse
-- Description: Stores simulation runs, player choices, game payouts, and statistical trials.

CREATE TABLE IF NOT EXISTS public.concept_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_slug TEXT NOT NULL,
    run_type TEXT NOT NULL DEFAULT 'single', -- 'single', 'batch', 'decision'
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for lightning-fast queries per concept and chronological ordering
CREATE INDEX IF NOT EXISTS idx_concept_runs_slug_created 
ON public.concept_runs (concept_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_concept_runs_created 
ON public.concept_runs (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.concept_runs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access (anyone can view telemetry charts)
CREATE POLICY "Allow public read access on concept_runs"
ON public.concept_runs
FOR SELECT
TO anon, authenticated
USING (true);

-- Policy 2: Allow public anonymous and authenticated insert (crowdsourced concept trials)
CREATE POLICY "Allow public insert on concept_runs"
ON public.concept_runs
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
