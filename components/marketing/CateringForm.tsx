'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

type EventType = 'birthday' | 'corporate' | 'wedding' | 'quinces' | 'graduation' | 'other';

interface FormStep1 {
  eventType: EventType | '';
  eventDate: string;
  guestCount: string;
}

interface FormStep2 {
  name: string;
  email: string;
  phone: string;
  budget: string;
  message: string;
  // Honeypot field — should remain empty
  website: string;
}

type FormState = 'step1' | 'step2' | 'submitting' | 'success' | 'error';

const EVENT_TYPES: { key: EventType; emoji: string; label_es: string; label_en: string }[] = [
  { key: 'birthday', emoji: '🎂', label_es: 'Cumpleaños', label_en: 'Birthday' },
  { key: 'corporate', emoji: '💼', label_es: 'Corporativo', label_en: 'Corporate' },
  { key: 'wedding', emoji: '💍', label_es: 'Boda', label_en: 'Wedding' },
  { key: 'quinces', emoji: '👑', label_es: 'XV Años', label_en: 'Quinceañera' },
  { key: 'graduation', emoji: '🎓', label_es: 'Graduación', label_en: 'Graduation' },
  { key: 'other', emoji: '🎉', label_es: 'Otro', label_en: 'Other' },
];

const BUDGET_OPTIONS = [
  { value: 'under_500', label_es: 'Menos de $500', label_en: 'Under $500' },
  { value: '500_1000', label_es: '$500 – $1,000', label_en: '$500 – $1,000' },
  { value: '1000_2500', label_es: '$1,000 – $2,500', label_en: '$1,000 – $2,500' },
  { value: '2500_5000', label_es: '$2,500 – $5,000', label_en: '$2,500 – $5,000' },
  { value: 'over_5000', label_es: 'Más de $5,000', label_en: 'Over $5,000' },
];

interface Props {
  locale: string;
}

export default function CateringForm({ locale }: Props) {
  const isEs = locale === 'es';

  const [formState, setFormState] = useState<FormState>('step1');
  const [step1, setStep1] = useState<FormStep1>({
    eventType: '',
    eventDate: '',
    guestCount: '',
  });
  const [step2, setStep2] = useState<FormStep2>({
    name: '',
    email: '',
    phone: '',
    budget: '',
    message: '',
    website: '', // honeypot
  });

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!step1.eventType || !step1.eventDate || !step1.guestCount) return;
    setFormState('step2');
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check — if filled, silently succeed (bot)
    if (step2.website) {
      setFormState('success');
      return;
    }

    if (!step2.name || !step2.email || !step2.phone || !step2.budget) return;

    setFormState('submitting');

    try {
      const res = await fetch('/api/catering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...step1,
          ...step2,
          website: undefined, // don't send honeypot to server
          locale,
        }),
      });

      if (res.ok) {
        setFormState('success');
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (formState === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-border p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-teal" />
        </div>
        <h2 className="font-display text-2xl font-bold text-espresso mb-3">
          {isEs ? '¡Solicitud enviada! 🎉' : 'Request sent! 🎉'}
        </h2>
        <p className="text-muted-foreground mb-2">
          {isEs
            ? 'Gracias por contactarnos. Nos comunicaremos contigo en las próximas 24 horas para coordinar los detalles.'
            : "Thank you for reaching out. We'll get back to you within 24 hours to work out the details."}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {isEs ? 'O llámanos al ' : 'Or call us at '}
          <a href="tel:2109750176" className="text-teal font-semibold hover:underline">
            210 975 0176
          </a>
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-espresso text-cream font-semibold px-6 py-2.5 rounded-full hover:bg-espresso-light transition-colors text-sm"
        >
          {isEs ? 'Volver al inicio' : 'Back to Home'}
        </Link>
      </div>
    );
  }

  // ── Step 1 ─────────────────────────────────────────────────────────────────
  if (formState === 'step1') {
    return (
      <form
        onSubmit={handleStep1Submit}
        className="bg-white rounded-2xl border border-border p-6 sm:p-8 space-y-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-teal text-cream text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span className="text-xs text-muted-foreground">
              {isEs ? 'Paso 1 de 2' : 'Step 1 of 2'}
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-espresso">
            {isEs ? '¿Qué tipo de evento es?' : 'What type of event is it?'}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isEs
              ? 'Selecciona el tipo de evento y dinos cuándo'
              : 'Select the event type and tell us when'}
          </p>
        </div>

        {/* Event type cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EVENT_TYPES.map((et) => (
            <button
              key={et.key}
              type="button"
              onClick={() => setStep1((s) => ({ ...s, eventType: et.key }))}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer',
                step1.eventType === et.key
                  ? 'border-teal bg-teal/5 text-teal'
                  : 'border-border hover:border-teal/50 text-espresso'
              )}
            >
              <span className="text-2xl">{et.emoji}</span>
              <span>{isEs ? et.label_es : et.label_en}</span>
            </button>
          ))}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-espresso mb-1.5">
            {isEs ? 'Fecha del evento' : 'Event date'}
            <span className="text-red ml-0.5">*</span>
          </label>
          <input
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={step1.eventDate}
            onChange={(e) => setStep1((s) => ({ ...s, eventDate: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-border text-espresso bg-white focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors text-sm"
          />
        </div>

        {/* Guest count */}
        <div>
          <label className="block text-sm font-medium text-espresso mb-1.5">
            {isEs ? 'Número de invitados (aprox.)' : 'Number of guests (approx.)'}
            <span className="text-red ml-0.5">*</span>
          </label>
          <input
            type="number"
            required
            min="10"
            max="2000"
            placeholder={isEs ? 'Ej: 50' : 'E.g.: 50'}
            value={step1.guestCount}
            onChange={(e) => setStep1((s) => ({ ...s, guestCount: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-border text-espresso bg-white focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={!step1.eventType || !step1.eventDate || !step1.guestCount}
          className="w-full flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark disabled:opacity-40 disabled:cursor-not-allowed text-cream font-semibold py-3 rounded-xl transition-colors"
        >
          {isEs ? 'Siguiente' : 'Next'}
          <ArrowRight size={18} />
        </button>
      </form>
    );
  }

  // ── Step 2 ─────────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleStep2Submit}
      className="bg-white rounded-2xl border border-border p-6 sm:p-8 space-y-5"
    >
      {/* Honeypot — hidden from real users, visible to bots */}
      <div className="hidden" aria-hidden="true">
        <label>Website (leave empty)</label>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={step2.website}
          onChange={(e) => setStep2((s) => ({ ...s, website: e.target.value }))}
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-full bg-teal text-cream text-xs font-bold flex items-center justify-center">
            2
          </span>
          <span className="text-xs text-muted-foreground">
            {isEs ? 'Paso 2 de 2' : 'Step 2 of 2'}
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold text-espresso">
          {isEs ? 'Cuéntanos más' : 'Tell us more'}
        </h2>
      </div>

      {/* Summary of step 1 */}
      <div className="bg-teal/5 border border-teal/20 rounded-xl px-4 py-3 text-sm text-teal font-medium flex items-center justify-between">
        <span>
          {EVENT_TYPES.find((e) => e.key === step1.eventType)?.[isEs ? 'label_es' : 'label_en']} ·{' '}
          {step1.eventDate} · {step1.guestCount} {isEs ? 'personas' : 'guests'}
        </span>
        <button
          type="button"
          onClick={() => setFormState('step1')}
          className="text-teal hover:underline text-xs ml-2 shrink-0"
        >
          {isEs ? 'Editar' : 'Edit'}
        </button>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-espresso mb-1.5">
          {isEs ? 'Nombre completo' : 'Full name'}
          <span className="text-red ml-0.5">*</span>
        </label>
        <input
          type="text"
          required
          placeholder={isEs ? 'Tu nombre' : 'Your name'}
          value={step2.name}
          onChange={(e) => setStep2((s) => ({ ...s, name: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-border text-espresso bg-white focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors text-sm"
        />
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-espresso mb-1.5">
            {isEs ? 'Correo electrónico' : 'Email address'}
            <span className="text-red ml-0.5">*</span>
          </label>
          <input
            type="email"
            required
            placeholder={isEs ? 'tu@correo.com' : 'you@email.com'}
            value={step2.email}
            onChange={(e) => setStep2((s) => ({ ...s, email: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-border text-espresso bg-white focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-espresso mb-1.5">
            {isEs ? 'Teléfono' : 'Phone'}
            <span className="text-red ml-0.5">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="(210) 000-0000"
            value={step2.phone}
            onChange={(e) => setStep2((s) => ({ ...s, phone: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-border text-espresso bg-white focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors text-sm"
          />
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-espresso mb-1.5">
          {isEs ? 'Presupuesto aproximado' : 'Approximate budget'}
          <span className="text-red ml-0.5">*</span>
        </label>
        <select
          required
          value={step2.budget}
          onChange={(e) => setStep2((s) => ({ ...s, budget: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-border text-espresso bg-white focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors text-sm appearance-none"
        >
          <option value="">
            {isEs ? 'Seleccionar...' : 'Select...'}
          </option>
          {BUDGET_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {isEs ? opt.label_es : opt.label_en}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-espresso mb-1.5">
          {isEs ? 'Cuéntanos sobre tu evento (opcional)' : 'Tell us about your event (optional)'}
        </label>
        <textarea
          rows={3}
          placeholder={
            isEs
              ? 'Lugar, menú específico, necesidades especiales...'
              : 'Venue, specific menu, special needs...'
          }
          value={step2.message}
          onChange={(e) => setStep2((s) => ({ ...s, message: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-border text-espresso bg-white focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition-colors text-sm resize-none"
        />
      </div>

      {/* Error */}
      {formState === 'error' && (
        <p className="text-red text-sm text-center">
          {isEs ? 'Algo salió mal. Inténtalo de nuevo o llámanos.' : 'Something went wrong. Please try again or call us.'}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setFormState('step1')}
          className="flex items-center gap-1.5 border border-border text-espresso font-medium px-5 py-3 rounded-xl hover:bg-muted transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          {isEs ? 'Atrás' : 'Back'}
        </button>
        <button
          type="submit"
          disabled={formState === 'submitting'}
          className="flex-1 flex items-center justify-center gap-2 bg-orange hover:bg-orange-dark disabled:opacity-60 text-espresso font-semibold py-3 rounded-xl transition-colors"
        >
          {formState === 'submitting' ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {isEs ? 'Enviando...' : 'Sending...'}
            </>
          ) : (
            <>{isEs ? 'Enviar Solicitud' : 'Submit Request'}</>
          )}
        </button>
      </div>
    </form>
  );
}
