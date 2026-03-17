import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/*
  =============================================================================
  SUPABASE SQL SCHEMA SETUP (JALANKAN INI DI SQL EDITOR SUPABASE LU)
  =============================================================================
  
  CREATE TABLE notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    topic TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  );

  CREATE TABLE generated_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    hook TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  );

  -- Opsional: Kalau lu mau pakai RLS (Row Level Security) buat public access sementara
  ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Public Access" ON notes FOR ALL USING (true);
  
  ALTER TABLE generated_cards ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Public Access" ON generated_cards FOR ALL USING (true);
*/
