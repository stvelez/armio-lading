import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import "@/lib/cloudflare-env";
import { newsletterRequestSchema } from "@/lib/validations";
import { sendWelcomeEmail } from "@/lib/resend";
import {
  createSignup,
  markWelcomeEmailFailed,
  markWelcomeEmailSent,
  normalizeEmail,
} from "@/lib/waitlist";

/**
 * POST /api/newsletter
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = newsletterRequestSchema.safeParse(body);

    if (!result.success) {
      console.warn("Newsletter signup validation failed", {
        issues: result.error.issues.map((issue) => issue.message),
      });
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Email inválido" },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const email = normalizeEmail(result.data.email);
    const source = result.data.source;
    const { created } = await createSignup({ email, source });

    try {
      if (created) {
        await sendWelcomeEmail(email, {
          apiKey: env.RESEND_API_KEY,
          from: env.RESEND_FROM,
        });
        await markWelcomeEmailSent(email);
      }
    } catch (error) {
      console.error("Newsletter welcome email failed", { email, error });
      await markWelcomeEmailFailed(
        email,
        error instanceof Error ? error.message : "Unknown welcome email error"
      );
    }

    if (!created) {
      console.info("Newsletter signup duplicate", { email, source });
      return NextResponse.json({
        success: true,
        status: "duplicate",
        message: "Este correo ya está reservado en early access.",
      });
    }

    console.info("Newsletter signup created", { email, source });

    return NextResponse.json(
      {
        success: true,
        status: "created",
        message: "Reservaste tu acceso a Armio.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Newsletter signup persistence error", error);
    return NextResponse.json({ error: "Hubo un error al procesar tu solicitud" }, { status: 500 });
  }
}
