import { NextRequest, NextResponse } from 'next/server';
import { newsletterSchema } from '@/lib/validations';
import { sendWelcomeEmail } from '@/lib/resend';
/**
 * POST /api/newsletter
 * Handle newsletter signup
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    // Validate email
    const result = newsletterSchema.safeParse({ email, name });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Email inválido' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Add email to your database (PostgreSQL, MongoDB, etc.)
    // 2. Check if email already exists
    // 3. Store the signup with timestamp

    // For now, we'll just simulate adding to database
    // TODO: Add actual database integration

    // Send welcome email
    await sendWelcomeEmail(result.data.email);

    return NextResponse.json({
      success: true,
      message: '¡Te has unido a la lista de espera!',
    });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: 'Hubo un error al procesar tu solicitud' },
      { status: 500 }
    );
  }
}
