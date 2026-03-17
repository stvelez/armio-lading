'use client';

import { useState, useEffect } from 'react';
import { Mail, Check, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsletterSchema, type NewsletterFormData, getErrorMessage } from '@/lib/validations';
import { trackNewsletterSignup } from '@/lib/analytics';
import toast, { Toaster } from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface NewsletterFormProps {
  location?: 'hero' | 'footer' | 'popup';
  showEmailField?: boolean;
  className?: string;
  placeholder?: string;
  buttonText?: string;
  onSuccess?: () => void;
}

export default function NewsletterForm({
  location = 'hero',
  showEmailField = true,
  className = '',
  placeholder = 'tu@email.com',
  buttonText = 'Únete a la lista de espera',
  onSuccess,
}: NewsletterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar tu solicitud');
      }

      setIsSuccess(true);
      trackNewsletterSignup(location);
      toast.success('¡Estás en la lista! Te avisaremos pronto.');

      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#1D9E75', '#0F6E56', '#ffffff'],
      });

      if (onSuccess) {
        onSuccess();
      }

      // Reset success state after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
        reset();
      }, 5000);
    } catch (error) {
      console.error('Newsletter form error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al procesar tu solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 text-[#1D9E75] animate-in slide-in-from-bottom-2">
          <Check size={20} strokeWidth={2.5} />
          <div>
            <p className="font-medium text-sm">¡Estás en la lista!</p>
            <p className="text-xs text-[#B4B2A9]">Te avisaremos cuando estemos listos.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className={className}>
        <div className="flex gap-2">
          {showEmailField && (
            <div className="flex-1 relative">
              <input
                type="email"
                placeholder={placeholder}
                {...register('email')}
                className={`w-full px-4 py-3 rounded-md bg-[#2C2C2A] border text-white placeholder:text-[#888780] focus:outline-none focus:ring-2 focus:ring-[#1D9E75] text-sm ${
                  errors.email ? 'border-red-500' : 'border-[#3C3C3A]'
                }`}
                disabled={isSubmitting}
              />
              {errors.email && (
                <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={12} />
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !isDirty || !isValid}
            className="bg-[#1D9E75] hover:bg-[#0F6E56] disabled:bg-[#3C3C3A] disabled:cursor-not-allowed text-white px-5 py-3 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-150 whitespace-nowrap"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Mail size={16} />
                <span>{buttonText}</span>
              </>
            )}
          </button>
        </div>
      </form>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1D1D1B',
            color: '#ffffff',
            border: '1px solid #3C3C3A',
          },
        }}
      />
    </>
  );
}
