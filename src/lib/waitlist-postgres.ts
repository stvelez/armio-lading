import { getPostgresPool } from "@/lib/postgres";
import type { NewsletterSignupSource } from "@/lib/validations";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

let tableReadyPromise: Promise<void> | null = null;

async function ensureWaitlistTable() {
  if (!tableReadyPromise) {
    tableReadyPromise = (async () => {
      await getPostgresPool().query(`
        CREATE TABLE IF NOT EXISTS waitlist_signups (
          id BIGSERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          source TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          welcome_email_sent_at TIMESTAMPTZ,
          metadata_json JSONB
        )
      `);
      // Prueba de la autorización de tratamiento de datos (Ley 1581 de 2012)
      await getPostgresPool().query(`
        ALTER TABLE waitlist_signups
          ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ,
          ADD COLUMN IF NOT EXISTS consent_policy_version TEXT
      `);
    })();
  }

  await tableReadyPromise;
}

export async function createWaitlistSignup(input: {
  email: string;
  source: NewsletterSignupSource;
  policyVersion: string;
}) {
  await ensureWaitlistTable();

  const normalizedEmail = normalizeEmail(input.email);
  const result = await getPostgresPool().query<{
    email: string;
    source: string;
    created_at: string;
  }>(
    `
      INSERT INTO waitlist_signups (email, source, consent_at, consent_policy_version)
      VALUES ($1, $2, NOW(), $3)
      ON CONFLICT (email) DO NOTHING
      RETURNING email, source, created_at
    `,
    [normalizedEmail, input.source, input.policyVersion]
  );

  return {
    created: (result.rowCount ?? 0) > 0,
    signup: result.rows[0] ?? null,
  };
}

export async function markWelcomeEmailSent(email: string) {
  await ensureWaitlistTable();

  await getPostgresPool().query(
    `
      UPDATE waitlist_signups
      SET welcome_email_sent_at = NOW()
      WHERE email = $1
    `,
    [normalizeEmail(email)]
  );
}

export async function getLatestWaitlistSignups(limit = 10) {
  await ensureWaitlistTable();

  const result = await getPostgresPool().query(
    `
      SELECT email, source, created_at, welcome_email_sent_at
      FROM waitlist_signups
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [limit]
  );

  return result.rows;
}
