-- Drop unused portal tables (project manager was removed)
-- Must drop in order due to foreign key constraints

-- Drop RLS policies first
DROP POLICY IF EXISTS "Fluxers can view all task comments" ON public.portal_task_comments;
DROP POLICY IF EXISTS "Fluxers can insert task comments" ON public.portal_task_comments;
DROP POLICY IF EXISTS "Fluxers can update own task comments" ON public.portal_task_comments;
DROP POLICY IF EXISTS "Fluxers can delete own task comments" ON public.portal_task_comments;

DROP POLICY IF EXISTS "Fluxers can manage task dependencies" ON public.portal_task_dependencies;

DROP POLICY IF EXISTS "Fluxers can view all portal tasks" ON public.portal_tasks;
DROP POLICY IF EXISTS "Fluxers can insert portal tasks" ON public.portal_tasks;
DROP POLICY IF EXISTS "Fluxers can update portal tasks" ON public.portal_tasks;
DROP POLICY IF EXISTS "Fluxers can delete portal tasks" ON public.portal_tasks;

DROP POLICY IF EXISTS "Fluxers can view all portal projects" ON public.portal_projects;
DROP POLICY IF EXISTS "Fluxers can insert portal projects" ON public.portal_projects;
DROP POLICY IF EXISTS "Fluxers can update portal projects" ON public.portal_projects;
DROP POLICY IF EXISTS "Fluxers can delete portal projects" ON public.portal_projects;

DROP POLICY IF EXISTS "Fluxers can view all team members" ON public.team_members;
DROP POLICY IF EXISTS "Fluxers can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Fluxers can update team members" ON public.team_members;

DROP POLICY IF EXISTS "Fluxers can view allowlist" ON public.fluxer_allowlist;

-- Drop tables in dependency order
DROP TABLE IF EXISTS public.portal_task_comments;
DROP TABLE IF EXISTS public.portal_task_dependencies;
DROP TABLE IF EXISTS public.portal_tasks;
DROP TABLE IF EXISTS public.portal_projects;
DROP TABLE IF EXISTS public.team_members;
DROP TABLE IF EXISTS public.fluxer_allowlist;

-- Drop helper function
DROP FUNCTION IF EXISTS public.is_fluxer();
