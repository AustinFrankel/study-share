-- Create brain_dumps table
CREATE TABLE IF NOT EXISTS brain_dumps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  contributor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT brain_dumps_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT brain_dumps_contributor_id_fkey FOREIGN KEY (contributor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create master_notes table
CREATE TABLE IF NOT EXISTS master_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contributor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT master_notes_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT master_notes_last_contributor_id_fkey FOREIGN KEY (last_contributor_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT master_notes_class_id_unique UNIQUE (class_id)
);

-- Add RLS policies for brain_dumps
ALTER TABLE brain_dumps ENABLE ROW LEVEL SECURITY;

-- Allow users to view all brain dumps
CREATE POLICY brain_dumps_select_policy ON brain_dumps
  FOR SELECT USING (true);

-- Allow users to insert their own brain dumps
CREATE POLICY brain_dumps_insert_policy ON brain_dumps
  FOR INSERT WITH CHECK (auth.uid() = contributor_id);

-- Allow users to update only their own brain dumps
CREATE POLICY brain_dumps_update_policy ON brain_dumps
  FOR UPDATE USING (auth.uid() = contributor_id);

-- Add RLS policies for master_notes
ALTER TABLE master_notes ENABLE ROW LEVEL SECURITY;

-- Allow users to view all master notes
CREATE POLICY master_notes_select_policy ON master_notes
  FOR SELECT USING (true);

-- Only allow service role to insert/update master notes (will be handled by Edge Functions later)
CREATE POLICY master_notes_insert_policy ON master_notes
  FOR INSERT USING (auth.uid() IS NOT NULL);

CREATE POLICY master_notes_update_policy ON master_notes
  FOR UPDATE USING (auth.uid() IS NOT NULL);