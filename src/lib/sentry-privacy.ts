import type { Breadcrumb, BrowserOptions, ErrorEvent } from "@sentry/nextjs";

/**
 * Política de privacidad de Sentry en la landing (Ley 1581 de Colombia: Sentry es un tercero
 * fuera del país). Solo captura de errores: sin Session Replay, sin tracing, sin PII.
 *
 * Nunca deben salir: nombre/email/teléfono de leads, email del newsletter, IP de visitantes,
 * cookies, cuerpos de request ni headers (pueden traer auth o x-portal-client-ip).
 *
 * Estrategia en dos barreras:
 *  1. `dataCollection`: el SDK ni siquiera recolecta datos personales.
 *  2. `beforeSend` / `beforeBreadcrumb`: ALLOWLIST de metadatos técnicos sobre el evento final.
 *     No se envía texto libre (message, exception.value, breadcrumb.message): puede traer lo que
 *     el visitante escribió en un formulario y ninguna regex lo cubre del todo.
 */

/**
 * OJO: pasar `dataCollection` hace que el SDK IGNORE `sendDefaultPii: false` y use sus defaults
 * permisivos como base. Todo campo que no se declare aquí vuelve a `true`, por eso se declara
 * CADA campo (mismo criterio que armio-api/src/config/sentry.ts). No quitar ninguno.
 * Tipado contra el SDK instalado: un nombre obsoleto rompe `tsc`.
 */
export const SENTRY_DATA_COLLECTION_OPTIONS: NonNullable<BrowserOptions["dataCollection"]> = {
  userInfo: false,
  cookies: false,
  httpHeaders: { request: false, response: false },
  httpBodies: [],
  urlQueryParams: false,
  graphQL: { document: false, variables: false },
  genAI: { inputs: false, outputs: false },
  mcp: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  stackFrameVariables: false,
  frameContextLines: 0,
};

const EMAIL_RE = /[A-Z0-9._%+-]+(?:@|%40)[A-Z0-9.-]+\.[A-Z]{2,}/gi;
// 7+ dígitos con separadores típicos: espacio, ( ) . - – — / y prefijo +.
const PHONE_RE = /\+?\d[\d\s().\-\u2010-\u2015/]{5,}\d/g;

/** Defensa adicional (no la barrera principal): enmascara emails y teléfonos en un texto. */
export function scrubText(value: string): string {
  return /^[0-9a-f]{16,32}$/i.test(value)
    ? value
    : value.replace(EMAIL_RE, "[email]").replace(PHONE_RE, "[phone]");
}

// Rutas conocidas de la app. Todo lo demás se reduce a "/[unknown]": un segmento libre
// (`/newsletter/ana%40example.com`) nunca viaja. `[x]` = patrón de Next, también casa.
const KNOWN_ROUTES: RegExp[] = [
  /^\/$/,
  /^\/cookies$/,
  /^\/api\/(?:portal\/(?:visits|leads|revalidate)|newsletter)$/,
  /^\/p\/[^/]+$/,
  /^\/p\/[^/]+\/(?:propiedades|privacidad|sitemap\.xml|robots\.txt)$/,
  /^\/p\/[^/]+\/propiedades\/[^/]+$/,
];

/** Reduce una ruta a una forma conocida y parametrizada: sin query, hash ni valores libres. */
export function sanitizePath(path: string): string {
  const pathname = path.split(/[?#]/)[0] || "/";
  if (!KNOWN_ROUTES.some((r) => r.test(pathname))) return "/[unknown]";
  const segments = pathname.split("/");
  // /p/<tenant>/propiedades/<property>: tenant y propiedad se parametrizan.
  if (segments[1] === "p") {
    segments[2] = ":tenant";
    if (segments[3] === "propiedades" && segments[4]) segments[4] = ":property";
  }
  return segments.join("/");
}

/** Solo pathname parametrizado: nunca se envía el origen. */
export function stripUrl(url: string): string {
  try {
    return sanitizePath(new URL(url, "http://placeholder.invalid").pathname);
  } catch {
    return sanitizePath(url);
  }
}

const REDACTED = "[redacted]";

const TOP_LEVEL_ALLOWLIST = new Set([
  "event_id",
  "timestamp",
  "platform",
  "level",
  "exception",
  "breadcrumbs",
  "contexts",
  "request",
  "transaction",
]);

/** Solo valores técnicos de vocabulario cerrado o formatos estrictos. */
function sanitizeContexts(contexts: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!contexts || typeof contexts !== "object") return out;
  const c = contexts as Record<string, Record<string, unknown>>;
  const names: Record<string, readonly string[]> = {
    runtime: ["node", "Node", "node.js", "Node.js", "browser", "deno", "bun", "edge"],
    os: ["macOS", "Windows", "Linux", "Android", "iOS"],
    browser: ["Chrome", "Firefox", "Safari", "Edge", "Opera", "Mobile Safari"],
    app: [],
  };
  const version = /^\d{1,3}(?:\.\d{1,3}){0,3}$/;
  for (const key of Object.keys(names)) {
    const source = c[key];
    if (!source || typeof source !== "object") continue;
    const clean: Record<string, unknown> = {};
    if (typeof source.name === "string" && names[key].includes(source.name))
      clean.name = source.name;
    for (const field of ["version", "app_version", "kernel_version"]) {
      if (typeof source[field] === "string" && version.test(source[field]))
        clean[field] = source[field];
    }
    if (Object.keys(clean).length) out[key] = clean;
  }
  const trace = c.trace;
  if (trace && typeof trace === "object") {
    const clean: Record<string, unknown> = {};
    for (const [field, re] of Object.entries({
      trace_id: /^[0-9a-f]{32}$/i,
      span_id: /^[0-9a-f]{16}$/i,
      parent_span_id: /^[0-9a-f]{16}$/i,
    })) {
      if (typeof trace[field] === "string" && re.test(trace[field])) clean[field] = trace[field];
    }
    if (
      typeof trace.status === "string" &&
      [
        "ok",
        "cancelled",
        "unknown_error",
        "internal_error",
        "unavailable",
        "deadline_exceeded",
        "not_found",
        "permission_denied",
        "unauthenticated",
        "resource_exhausted",
        "invalid_argument",
        "already_exists",
        "failed_precondition",
        "aborted",
        "out_of_range",
        "unimplemented",
        "data_loss",
      ].includes(trace.status)
    )
      clean.status = trace.status;
    if (Object.keys(clean).length) out.trace = clean;
  }
  const next = c.nextjs;
  if (next && typeof next === "object") {
    const clean: Record<string, unknown> = {};
    if (
      typeof next.router_kind === "string" &&
      ["App Router", "Pages Router"].includes(next.router_kind)
    )
      clean.router_kind = next.router_kind;
    if (
      typeof next.route_type === "string" &&
      ["render", "route", "action", "middleware"].includes(next.route_type)
    )
      clean.route_type = next.route_type;
    if (typeof next.router_path === "string") clean.router_path = sanitizePath(next.router_path);
    if (typeof next.request_path === "string") clean.request_path = sanitizePath(next.request_path);
    if (Object.keys(clean).length) out.nextjs = clean;
  }
  return out;
}

// Solo assets de compilación con nombre hash y rutas internas conocidas. Una ruta genérica
// puede contener un nombre aunque no tenga query; no se puede reconocer PII con una regex.
function safeFrameFilename(filename: string): string {
  let path: string;
  try {
    path = new URL(filename, "https://placeholder.invalid").pathname;
  } catch {
    return REDACTED;
  }
  if (/^\/_next\/static\/chunks\/(?:[a-f0-9]{16,64}\/)*[a-f0-9]{16,64}\.js$/i.test(path))
    return path;
  if (/^\/(?:node:)?internal\/[a-z_/-]+(?:\.js)?$/.test(path)) return path;
  return REDACTED;
}

const ERROR_TYPES = new Set([
  "Error",
  "TypeError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "URIError",
  "EvalError",
  "AggregateError",
]);
function sanitizeException(event: ErrorEvent): void {
  if (!event.exception?.values) {
    delete event.exception;
    return;
  }
  event.exception = {
    values: event.exception.values.map((ex) => ({
      type: typeof ex.type === "string" && ERROR_TYPES.has(ex.type) ? ex.type : "Error",
      value: REDACTED,
      ...(ex.stacktrace?.frames
        ? {
            stacktrace: {
              frames: ex.stacktrace.frames.map((frame) => ({
                ...(typeof frame.filename === "string"
                  ? { filename: safeFrameFilename(frame.filename) }
                  : {}),
                ...(typeof frame.lineno === "number" && Number.isSafeInteger(frame.lineno)
                  ? { lineno: frame.lineno }
                  : {}),
                ...(typeof frame.colno === "number" && Number.isSafeInteger(frame.colno)
                  ? { colno: frame.colno }
                  : {}),
                ...(typeof frame.in_app === "boolean" ? { in_app: frame.in_app } : {}),
              })),
            },
          }
        : {}),
    })),
  };
}

export function beforeSend(event: ErrorEvent): ErrorEvent | null {
  try {
    const e = event as unknown as Record<string, unknown>;
    for (const key of Object.keys(e)) {
      // user, extra, tags, message, logentry, server_name, request.*...
      if (!TOP_LEVEL_ALLOWLIST.has(key)) delete e[key];
    }

    if (typeof event.event_id !== "string" || !/^[0-9a-f]{32}$/i.test(event.event_id))
      delete event.event_id;
    if (typeof event.timestamp !== "number" || !Number.isFinite(event.timestamp))
      delete event.timestamp;
    if (!["debug", "info", "warning", "error", "fatal", "log"].includes(event.level ?? ""))
      delete event.level;
    if (!["javascript", "node"].includes(event.platform ?? "")) delete event.platform;

    // Request: solo método y URL saneada (sin query, headers, cookies ni body).
    const req = event.request;
    if (req) {
      const clean: { method?: string; url?: string } = {};
      if (
        typeof req.method === "string" &&
        ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].includes(req.method)
      )
        clean.method = req.method;
      if (typeof req.url === "string") clean.url = stripUrl(req.url);
      event.request = clean;
    }

    event.contexts = sanitizeContexts(event.contexts) as ErrorEvent["contexts"];
    sanitizeException(event);

    if (typeof event.transaction === "string") {
      const m = /^([A-Z]+) (\/.*)$/.exec(event.transaction); // `${METHOD} ${routePath}`
      event.transaction =
        m && ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].includes(m[1])
          ? `${m[1]} ${sanitizePath(m[2])}`
          : sanitizePath(event.transaction);
    }

    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs
        .map((b) => sanitizeBreadcrumb(b))
        .filter((b): b is Breadcrumb => b !== null);
    }
    return event;
  } catch {
    // Si no se puede garantizar el saneado, es preferible perder el evento que filtrar PII.
    return null;
  }
}

const BREADCRUMB_CATEGORIES = new Set(["fetch", "xhr", "navigation"]);

/** Solo red/navegación, sin `message` y con `data` reducido a una allowlist mínima. */
function sanitizeBreadcrumb(b: Breadcrumb): Breadcrumb | null {
  if (!b.category || !BREADCRUMB_CATEGORIES.has(b.category)) return null;
  const out: Breadcrumb = {
    category: b.category,
    ...(b.level && ["debug", "info", "warning", "error", "fatal", "log"].includes(b.level)
      ? { level: b.level }
      : {}),
    ...(typeof b.timestamp === "number" && Number.isFinite(b.timestamp)
      ? { timestamp: b.timestamp }
      : {}),
  };
  const d = b.data as Record<string, unknown> | undefined;
  if (d) {
    const data: Record<string, unknown> = {};
    if (
      typeof d.method === "string" &&
      ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].includes(d.method)
    )
      data.method = d.method;
    if (typeof d.status_code === "number") data.status_code = d.status_code;
    for (const key of ["url", "from", "to"]) {
      if (typeof d[key] === "string") data[key] = stripUrl(d[key] as string);
    }
    out.data = data;
  }
  return out;
}

export function beforeBreadcrumb(b: Breadcrumb): Breadcrumb | null {
  try {
    return sanitizeBreadcrumb(b);
  } catch {
    return null;
  }
}

/**
 * Opciones comunes. Sin DSN devuelve null y Sentry NO se inicializa.
 * Sin replays, sin tracing (`tracesSampleRate: 0`), sin PII.
 */
export function sentryOptions(dsn: string | undefined) {
  if (!dsn) return null;
  return {
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    sendDefaultPii: false,
    dataCollection: SENTRY_DATA_COLLECTION_OPTIONS,
    tracesSampleRate: 0,
    beforeSend,
    beforeBreadcrumb,
  };
}
