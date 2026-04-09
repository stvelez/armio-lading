declare global {
  interface CloudflareEnv {
    DB: D1Database;
    RESEND_API_KEY?: string;
    RESEND_FROM?: string;
  }
}

export {};
