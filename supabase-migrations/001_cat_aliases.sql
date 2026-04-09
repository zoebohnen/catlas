-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- This creates the cat_aliases table for the aliases feature

CREATE TABLE cat_aliases (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cat_id BIGINT REFERENCES cats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alias_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE cat_aliases ENABLE ROW LEVEL SECURITY;

-- Anyone can view aliases (even non-logged-in users browsing)
CREATE POLICY "Anyone can view aliases" ON cat_aliases
  FOR SELECT USING (true);

-- Logged-in users can add aliases (only for themselves)
CREATE POLICY "Users can add aliases" ON cat_aliases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own aliases
CREATE POLICY "Users can delete own aliases" ON cat_aliases
  FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookups by cat
CREATE INDEX idx_cat_aliases_cat_id ON cat_aliases(cat_id);
