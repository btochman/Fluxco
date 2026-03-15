-- Add batch_id and email_html to freddy_outreach for approval flow
ALTER TABLE freddy_outreach ADD COLUMN IF NOT EXISTS batch_id UUID;
ALTER TABLE freddy_outreach ADD COLUMN IF NOT EXISTS email_subject TEXT;
ALTER TABLE freddy_outreach ADD COLUMN IF NOT EXISTS email_html TEXT;

-- Update status check to include 'pending'
ALTER TABLE freddy_outreach DROP CONSTRAINT IF EXISTS freddy_outreach_status_check;
ALTER TABLE freddy_outreach ADD CONSTRAINT freddy_outreach_status_check
  CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'replied', 'bounced', 'failed'));

CREATE INDEX IF NOT EXISTS idx_freddy_outreach_batch ON freddy_outreach(batch_id);
