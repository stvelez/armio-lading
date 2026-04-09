import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { newsletterSchema } from "@/lib/validations";
import { sendWelcomeEmail } from "@/lib/resend";

const DATA_FILE = path.join(process.cwd(), "data", "waitlist.json");

async function readWaitlist(): Promise<{ email: string; signedAt: string }[]> {
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function saveToWaitlist(email: string): Promise<boolean> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  const list = await readWaitlist();
  if (list.some((entry) => entry.email === email)) return false;
  list.push({ email, signedAt: new Date().toISOString() });
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2));
  return true;
}

/**
 * POST /api/newsletter
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = newsletterSchema.safeParse({ email: body.email });

    if (!result.success) {
      console.warn("Newsletter signup validation failed", {
        issues: result.error.issues.map((issue) => issue.message),
      });
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Email inválido" },
        { status: 400 }
      );
    }

    const { email } = result.data;
    const added = await saveToWaitlist(email);

    if (!added) {
      console.info("Newsletter signup duplicate", { email });
      return NextResponse.json(
        { error: "Este email ya está en la lista de espera" },
        { status: 409 }
      );
    }

    try {
      await sendWelcomeEmail(email);
    } catch (error) {
      console.error("Newsletter welcome email failed", { email, error });
    }

    return NextResponse.json({
      success: true,
      message: "¡Te has unido a la lista de espera!",
    });
  } catch (error) {
    console.error("Newsletter signup persistence error", error);
    return NextResponse.json({ error: "Hubo un error al procesar tu solicitud" }, { status: 500 });
  }
}
