'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const periods = [
  { key: 'today', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
] as const;

type Period = (typeof periods)[number]['key'];

export default function PeriodSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (searchParams.get('period') ?? 'today') as Period;

  const setPeriod = (p: Period) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', p);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1 bg-cream-dark border border-border rounded-xl p-1">
      {periods.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => setPeriod(key)}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-semibold transition-all',
            current === key
              ? 'bg-espresso text-cream shadow-sm'
              : 'text-espresso/50 hover:text-espresso hover:bg-cream',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
