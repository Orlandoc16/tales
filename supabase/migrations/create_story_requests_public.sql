-- Create story_requests table in public schema for health check compatibility
CREATE TABLE IF NOT EXISTS public.story_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  age_range TEXT,
  genre TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_story_requests_user_id ON public.story_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_story_requests_status ON public.story_requests(status);
CREATE INDEX IF NOT EXISTS idx_story_requests_created_at ON public.story_requests(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.story_requests ENABLE ROW LEVEL SECURITY;

-- Create a basic policy for authenticated users
CREATE POLICY "Users can view their own story requests" ON public.story_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own story requests" ON public.story_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own story requests" ON public.story_requests
  FOR UPDATE USING (auth.uid() = user_id);