-- Update portal_projects with FluxCo phase names
-- Phase 1: Build the Marketplace
-- Phase 2: Manufacturing Capacity
-- Phase 3: Vertical Integration

-- Update Phase 1
UPDATE portal_projects
SET name = 'Phase 1: Build the Marketplace',
    description = 'Find customers and suppliers for the transformer marketplace',
    color = '#3B82F6'
WHERE position = 0;

-- Update Phase 2
UPDATE portal_projects
SET name = 'Phase 2: Manufacturing Capacity',
    description = 'Build out production capabilities and partnerships',
    color = '#8B5CF6'
WHERE position = 1;

-- Update Phase 3
UPDATE portal_projects
SET name = 'Phase 3: Vertical Integration',
    description = 'Full end-to-end control of transformer production',
    color = '#10B981'
WHERE position = 2;

-- If phases don't exist yet, insert them
INSERT INTO portal_projects (name, description, color, status, position)
SELECT 'Phase 1: Build the Marketplace',
       'Find customers and suppliers for the transformer marketplace',
       '#3B82F6',
       'active',
       0
WHERE NOT EXISTS (SELECT 1 FROM portal_projects WHERE position = 0);

INSERT INTO portal_projects (name, description, color, status, position)
SELECT 'Phase 2: Manufacturing Capacity',
       'Build out production capabilities and partnerships',
       '#8B5CF6',
       'active',
       1
WHERE NOT EXISTS (SELECT 1 FROM portal_projects WHERE position = 1);

INSERT INTO portal_projects (name, description, color, status, position)
SELECT 'Phase 3: Vertical Integration',
       'Full end-to-end control of transformer production',
       '#10B981',
       'active',
       2
WHERE NOT EXISTS (SELECT 1 FROM portal_projects WHERE position = 2);
