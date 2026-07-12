'use client';

import { useState, useTransition } from 'react';
import { RefreshCw, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { syncMenuFromSquare } from '@/app/admin/actions';

export default function MenuSyncButton() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ synced?: number; error?: string } | null>(null);

  const handleSync = () => {
    setResult(null);
    startTransition(async () => {
      const res = await syncMenuFromSquare();
      setResult(res);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
        <ChefHat size={16} className="text-teal" />
        <h2 className="font-display font-semibold text-espresso text-base">
          Menú &amp; Productos
        </h2>
      </div>

      <div className="px-5 py-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          Trae el catálogo actual de Square (nombres, precios, categorías) y lo guarda en
          la tabla de productos. No toca food cost ni datos que hayas editado a mano.
        </p>

        <button
          onClick={handleSync}
          disabled={isPending}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
            isPending
              ? 'bg-cream-dark text-muted-foreground cursor-not-allowed'
              : 'bg-espresso text-cream hover:opacity-90',
          )}
        >
          <RefreshCw size={14} className={isPending ? 'animate-spin' : ''} />
          {isPending ? 'Sincronizando...' : 'Sincronizar desde Square'}
        </button>

        {result?.synced !== undefined && (
          <p className="text-xs text-teal-dark font-medium">
            {result.synced} producto{result.synced !== 1 ? 's' : ''} sincronizado{result.synced !== 1 ? 's' : ''}.
          </p>
        )}
        {result?.error && (
          <p className="text-xs text-red-600 font-medium">{result.error}</p>
        )}
      </div>
    </div>
  );
}
