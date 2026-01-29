-- Make portal tables publicly accessible (no auth required)
-- Since we removed authentication, allow anyone to read/write portal data

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Fluxers can view all portal projects" ON public.portal_projects;
DROP POLICY IF EXISTS "Fluxers can insert portal projects" ON public.portal_projects;
DROP POLICY IF EXISTS "Fluxers can update portal projects" ON public.portal_projects;
DROP POLICY IF EXISTS "Fluxers can delete portal projects" ON public.portal_projects;

DROP POLICY IF EXISTS "Fluxers can view all portal tasks" ON public.portal_tasks;
DROP POLICY IF EXISTS "Fluxers can insert portal tasks" ON public.portal_tasks;
DROP POLICY IF EXISTS "Fluxers can update portal tasks" ON public.portal_tasks;
DROP POLICY IF EXISTS "Fluxers can delete portal tasks" ON public.portal_tasks;

DROP POLICY IF EXISTS "Fluxers can manage task dependencies" ON public.portal_task_dependencies;

DROP POLICY IF EXISTS "Fluxers can view all task comments" ON public.portal_task_comments;
DROP POLICY IF EXISTS "Fluxers can insert task comments" ON public.portal_task_comments;
DROP POLICY IF EXISTS "Fluxers can update own task comments" ON public.portal_task_comments;
DROP POLICY IF EXISTS "Fluxers can delete own task comments" ON public.portal_task_comments;

-- Create public access policies for portal_projects
CREATE POLICY "Public can view portal projects"
  ON public.portal_projects FOR SELECT
  USING (true);

CREATE POLICY "Public can insert portal projects"
  ON public.portal_projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update portal projects"
  ON public.portal_projects FOR UPDATE
  USING (true);

CREATE POLICY "Public can delete portal projects"
  ON public.portal_projects FOR DELETE
  USING (true);

-- Create public access policies for portal_tasks
CREATE POLICY "Public can view portal tasks"
  ON public.portal_tasks FOR SELECT
  USING (true);

CREATE POLICY "Public can insert portal tasks"
  ON public.portal_tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update portal tasks"
  ON public.portal_tasks FOR UPDATE
  USING (true);

CREATE POLICY "Public can delete portal tasks"
  ON public.portal_tasks FOR DELETE
  USING (true);

-- Create public access policies for portal_task_dependencies
CREATE POLICY "Public can manage task dependencies"
  ON public.portal_task_dependencies FOR ALL
  USING (true);

-- Create public access policies for portal_task_comments
CREATE POLICY "Public can view task comments"
  ON public.portal_task_comments FOR SELECT
  USING (true);

CREATE POLICY "Public can insert task comments"
  ON public.portal_task_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update task comments"
  ON public.portal_task_comments FOR UPDATE
  USING (true);

CREATE POLICY "Public can delete task comments"
  ON public.portal_task_comments FOR DELETE
  USING (true);

-- Ensure phases are seeded
INSERT INTO public.portal_projects (name, description, color, position) VALUES
  ('Phase 1 - Foundation', 'Company setup, legal, banking, initial hires', '#3b82f6', 1),
  ('Phase 2 - Product Development', 'Core product, manufacturing, inventory systems', '#10b981', 2),
  ('Phase 3 - Go to Market', 'Sales, marketing, customer acquisition', '#f59e0b', 3)
ON CONFLICT DO NOTHING;
