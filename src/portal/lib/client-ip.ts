import type { NextRequest } from "next/server";

const IP = /^[0-9a-fA-F:.]{3,45}$/;

/** IP del visitante según los encabezados del proxy de Vercel (primer valor de x-forwarded-for) o `null` si no es una IP bien formada. */
export function clientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const candidate = forwarded || req.headers.get("x-real-ip")?.trim();
  return candidate && IP.test(candidate) ? candidate : null;
}
