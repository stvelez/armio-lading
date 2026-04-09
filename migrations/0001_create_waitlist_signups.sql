CREATE TABLE IF NOT EXISTS waitlist_signups (
  id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
  email TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  welcome_email_status TEXT NOT NULL DEFAULT 'pending' CHECK (welcome_email_status IN ('pending', 'sent', 'failed')),
  welcome_email_sent_at TEXT,
  last_error TEXT,
  metadata_json TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_signups_email
  ON waitlist_signups(email);

CREATE INDEX IF NOT EXISTS idx_waitlist_signups_created_at
  ON waitlist_signups(created_at);
