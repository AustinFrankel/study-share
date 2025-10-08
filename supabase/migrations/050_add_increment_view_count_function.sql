-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(resource_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE resources
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = resource_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO authenticated;
