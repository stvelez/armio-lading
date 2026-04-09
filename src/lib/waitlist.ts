import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { NewsletterSignupSource } from "@/lib/validations";

export type WelcomeEmailStatus = "pending" | "sent" | "failed";

export interface WaitlistSignupRow {
  id: string;
  email: string;
  source: NewsletterSignupSource;
  created_at: string;
  welcome_email_status: WelcomeEmailStatus;
  welcome_email_sent_at: string | null;
  last_error: string | null;
  metadata_json: string | null;
}

function getDb() {
  const { env } = getCloudflareContext();
  return env.DB;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function findSignupByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);

  const result = await getDb()
    .prepare(
      `SELECT id, email, source, created_at, welcome_email_status, welcome_email_sent_at, last_error, metadata_json
       FROM waitlist_signups
       WHERE email = ?1
       LIMIT 1`
    )
    .bind(normalizedEmail)
    .first<WaitlistSignupRow>();

  return result ?? null;
}

export async function createSignup(input: {
  email: string;
  source: NewsletterSignupSource;
  metadata?: Record<string, unknown>;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  const metadataJson = input.metadata ? JSON.stringify(input.metadata) : null;

  const result = await getDb()
    .prepare(
      `INSERT INTO waitlist_signups (email, source, metadata_json)
       VALUES (?1, ?2, ?3)
       ON CONFLICT(email) DO NOTHING`
    )
    .bind(normalizedEmail, input.source, metadataJson)
    .run();

  return {
    created: Boolean(result.meta.changes && result.meta.changes > 0),
    signup: await findSignupByEmail(normalizedEmail),
  };
}

export async function countSignups() {
  const result = await getDb()
    .prepare("SELECT COUNT(*) as total FROM waitlist_signups")
    .first<{ total: number | string }>();

  return Number(result?.total ?? 0);
}

export async function markWelcomeEmailSent(email: string) {
  const normalizedEmail = normalizeEmail(email);

  await getDb()
    .prepare(
      `UPDATE waitlist_signups
       SET welcome_email_status = 'sent',
           welcome_email_sent_at = CURRENT_TIMESTAMP,
           last_error = NULL
       WHERE email = ?1`
    )
    .bind(normalizedEmail)
    .run();
}

export async function markWelcomeEmailFailed(email: string, error: string) {
  const normalizedEmail = normalizeEmail(email);

  await getDb()
    .prepare(
      `UPDATE waitlist_signups
       SET welcome_email_status = 'failed',
           last_error = ?2
       WHERE email = ?1`
    )
    .bind(normalizedEmail, error.slice(0, 1000))
    .run();
}
