
-- Enable RLS on astro_locations table (if not already enabled)
ALTER TABLE public.astro_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for astro_locations
-- Allow public read access for all users
CREATE POLICY "Anyone can view astro locations" 
  ON public.astro_locations 
  FOR SELECT 
  USING (true);

-- Restrict write access to authenticated users only (for future admin functionality)
CREATE POLICY "Authenticated users can insert astro locations" 
  ON public.astro_locations 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update astro locations" 
  ON public.astro_locations 
  FOR UPDATE 
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete astro locations" 
  ON public.astro_locations 
  FOR DELETE 
  TO authenticated
  USING (true);

-- Enable RLS on visitor_analytics table (if not already enabled)  
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for visitor_analytics
-- Restrict all access to service role only for analytics tracking
CREATE POLICY "Service role can manage visitor analytics" 
  ON public.visitor_analytics 
  FOR ALL 
  TO service_role
  USING (true);

-- Add validation trigger for astro_locations to ensure data integrity
CREATE OR REPLACE FUNCTION validate_astro_location()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate dark_sky_rating is between 1 and 10
  IF NEW.dark_sky_rating < 1 OR NEW.dark_sky_rating > 10 THEN
    RAISE EXCEPTION 'Dark sky rating must be between 1 and 10';
  END IF;
  
  -- Validate coordinates structure
  IF NEW.coordinates IS NULL OR 
     NOT (NEW.coordinates ? 'lat') OR 
     NOT (NEW.coordinates ? 'lon') THEN
    RAISE EXCEPTION 'Coordinates must contain lat and lon properties';
  END IF;
  
  -- Validate name is not empty
  IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
    RAISE EXCEPTION 'Name cannot be empty';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
DROP TRIGGER IF EXISTS validate_astro_location_trigger ON public.astro_locations;
CREATE TRIGGER validate_astro_location_trigger
  BEFORE INSERT OR UPDATE ON public.astro_locations
  FOR EACH ROW EXECUTE FUNCTION validate_astro_location();
