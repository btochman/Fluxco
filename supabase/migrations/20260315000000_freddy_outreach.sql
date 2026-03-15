-- Freddy Wilson: Automated sales outreach tracking
-- Tracks emails sent to OEMs and their replies

CREATE TABLE freddy_outreach (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notion_project_id TEXT NOT NULL,
  notion_oem_id TEXT NOT NULL,
  oem_name TEXT NOT NULL,
  contact_name TEXT,
  email_to TEXT NOT NULL,
  project_summary JSONB,
  resend_message_id TEXT,
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'replied', 'bounced', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(notion_project_id, notion_oem_id, email_to)
);

CREATE INDEX idx_freddy_outreach_project ON freddy_outreach(notion_project_id);
CREATE INDEX idx_freddy_outreach_status ON freddy_outreach(status);

CREATE TABLE freddy_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outreach_id UUID REFERENCES freddy_outreach(id) ON DELETE SET NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  needs_review BOOLEAN DEFAULT true,
  auto_responded BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_freddy_replies_outreach ON freddy_replies(outreach_id);
CREATE INDEX idx_freddy_replies_needs_review ON freddy_replies(needs_review);
