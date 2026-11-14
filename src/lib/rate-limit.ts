import { createHash } from "crypto";
import { getPostgresPool } from "@/lib/postgres";

/**
 * Límite de peticiones respaldado en Postgres (ventanas fijas de 1 h). Un contador en memoria no sirve
 * en Vercel: cada instancia serverless tendría el suyo. La tabla se crea al vuelo, igual que `waitlist_signups`.
 * Las IP se guardan como hash, nunca en claro (Ley 1581 de 2012).
 */

const WINDOW_MS = 60 * 60 * 1000;

export const NEWSLETTER_LIMIT_PER_IP = 5;
/** Tope global de altas por hora: frena el abuso repartido entre muchas IP (cada alta envía un correo). */
export const NEWSLETTER_LIMIT_GLOBAL = 200;

export interface RateLimitResult {
  allowed: boolean;
  /** Segundos hasta que se abre la siguiente ventana (para `Retry-After`). */
  retryAfter: number;
}

let tableReady: Promise<void> | null = null;

async function ensureTable() {
  if (!tableReady) {
    tableReady = getPostgresPool()
      .query(
        `
        CREATE TABLE IF NOT EXISTS rate_limit_hits (
          bucket TEXT NOT NULL,
          window_start TIMESTAMPTZ NOT NULL,
          hits INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (bucket, window_start)
        )
      `
      )
      .then(() => undefined)
      .catch((error) => {
        // No dejar cacheada una promesa rechazada: la siguiente petición reintenta
        tableReady = null;
        throw error;
      });
  }
  await tableReady;
}

/** Cuenta un intento en `bucket` y dice si sigue dentro de `limit` en la ventana actual. */
export async function hitRateLimit(
  bucket: string,
  limit: number,
  now: number = Date.now()
): Promise<RateLimitResult> {
  await ensureTable();

  const windowStart = Math.floor(now / WINDOW_MS) * WINDOW_MS;
  const retryAfter = Math.max(1, Math.ceil((windowStart + WINDOW_MS - now) / 1000));
  const pool = getPostgresPool();

  const result = await pool.query<{ hits: number }>(
    `
      INSERT INTO rate_limit_hits (bucket, window_start, hits)
      VALUES ($1, $2, 1)
      ON CONFLICT (bucket, window_start) DO UPDATE SET hits = rate_limit_hits.hits + 1
      RETURNING hits
    `,
    [bucket, new Date(windowStart)]
  );
  const hits = result.rows[0]?.hits ?? 1;

  // Primera marca de la ventana: aprovechar para purgar ventanas viejas (la tabla no crece sin límite)
  if (hits === 1) {
    await pool
      .query(`DELETE FROM rate_limit_hits WHERE window_start < $1`, [
        new Date(windowStart - 2 * WINDOW_MS),
      ])
      .catch(() => undefined);
  }

  return { allowed: hits <= limit, retryAfter };
}

function ipBucket(ip: string | null) {
  const digest = createHash("sha256")
    .update(ip ?? "no-ip")
    .digest("hex")
    .slice(0, 32);
  return `newsletter:ip:${digest}`;
}

/** Límite del newsletter: primero por IP; solo si pasa, cuenta contra el tope global. */
export async function checkNewsletterRateLimit(ip: string | null): Promise<RateLimitResult> {
  const perIp = await hitRateLimit(ipBucket(ip), NEWSLETTER_LIMIT_PER_IP);
  if (!perIp.allowed) return perIp;
  return hitRateLimit("newsletter:global", NEWSLETTER_LIMIT_GLOBAL);
}
