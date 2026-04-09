import { Pool } from "pg";

declare global {
  var __armioLandingPgPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("Missing DATABASE_URL");
  }

  return new Pool({
    connectionString,
    ssl:
      connectionString.includes("railway.app") || connectionString.includes("rlwy.net")
        ? { rejectUnauthorized: false }
        : undefined,
    max: 5,
  });
}

export function getPostgresPool() {
  if (!global.__armioLandingPgPool) {
    global.__armioLandingPgPool = createPool();
  }

  return global.__armioLandingPgPool;
}
