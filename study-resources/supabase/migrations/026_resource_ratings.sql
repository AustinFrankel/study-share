-- Create resource_ratings table for star ratings
CREATE TABLE IF NOT EXISTS public.resource_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_resource_ratings_resource_id ON public.resource_ratings(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_ratings_user_id ON public.resource_ratings(user_id);

-- Enable RLS
ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view ratings"
  ON public.resource_ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can rate"
  ON public.resource_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON public.resource_ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON public.resource_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resource_ratings_updated_at
  BEFORE UPDATE ON public.resource_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
