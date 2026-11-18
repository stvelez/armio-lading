import { Pool } from "pg";

declare global {
  var __armioLandingPgPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("Missing DATABASE_URL");
  }

  // La CA de Railway no está en el bundle de Node. Si se configura
  // `DATABASE_CA_CERT` (PEM, con \n escapados) se valida el certificado; si no,
  // se mantiene el modo compatible con su proxy público.
  const caCertificate = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n");

  return new Pool({
    connectionString,
    ssl:
      connectionString.includes("railway.app") || connectionString.includes("rlwy.net")
        ? caCertificate
          ? { ca: caCertificate, rejectUnauthorized: true }
          : { rejectUnauthorized: false }
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
