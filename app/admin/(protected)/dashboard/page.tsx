import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  ShoppingBag,
  CalendarDays,
  DollarSign,
  CreditCard,
  Banknote,
  Smartphone,
  CircleHelp,
  Clock,
  MapPin,
  ChefHat,
} from 'lucide-react';
import PeriodSelector from './PeriodSelector';
import SalesTrendChart, { type TrendDay } from './SalesTrendChart';

export const dynamic = 'force-dynamic';

// ─── Types ────────────────────────────────────────────────────────────────────

type Sale = {
  id: string;
  square_order_id: string;
  total_amount: string | number;
  payment_method: string | null;
  location_label: string | null;
  created_at: string;
};

type SaleItem = {
  item_name: string;
  quantity: number;
  total_price: string | number;
};

type Period = 'today' | 'week' | 'month';

// ─── Date helpers ─────────────────────────────────────────────────────────────

function getDateRanges() {
  const todayCT = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Chicago',
  });

  const startOfToday = new Date(`${todayCT}T00:00:00-05:00`).toISOString();

  const todayDate = new Date(`${todayCT}T00:00:00-05:00`);
  const dow = todayDate.getDay();
  const daysToMonday = dow === 0 ? 6 : dow - 1;
  const startOfWeek = new Date(
    todayDate.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
  ).toISOString();

  const monthStr = todayCT.slice(0, 7);
  const startOfMonth = new Date(`${monthStr}-01T00:00:00-05:00`).toISOString();

  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const periodStart: Record<Period, string> = {
    today: startOfToday,
    week: startOfWeek,
    month: startOfMonth,
  };

  return { startOfToday, startOfWeek, startOfMonth, thirtyDaysAgo, periodStart };
}

const toNum = (v: string | number | null | undefined) =>
  v == null ? 0 : typeof v === 'number' ? v : parseFloat(v) || 0;

// ─── Trend chart builder ───────────────────────────────────────────────────────

function buildTrendData(
  sales: { created_at: string; total_amount: string | number }[],
): TrendDay[] {
  const dayMap = new Map<string, { revenue: number; orders: number }>();

  sales.forEach((s) => {
    const key = new Date(s.created_at).toLocaleDateString('en-CA', {
      timeZone: 'America/Chicago',
    });
    const prev = dayMap.get(key) ?? { revenue: 0, orders: 0 };
    dayMap.set(key, {
      revenue: prev.revenue + toNum(s.total_amount),
      orders: prev.orders + 1,
    });
  });

  const result: TrendDay[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
    const label = d.toLocaleDateString('es-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Chicago',
    });
    const entry = dayMap.get(key) ?? { revenue: 0, orders: 0 };
    result.push({ date: label, ...entry });
  }

  return result;
}

// ─── Data fetch ───────────────────────────────────────────────────────────────

async function getDashboardData(period: Period) {
  const supabase = await createClient();
  const { startOfToday, startOfWeek, startOfMonth, thirtyDaysAgo, periodStart } =
    getDateRanges();

  const [
    { data: todaySales },
    { data: weekSales },
    { data: monthSales },
    { data: recentSales },
    { data: trendSales },
    { data: saleItems },
  ] = await Promise.all([
    supabase.from('sales').select('total_amount').gte('created_at', startOfToday),
    supabase.from('sales').select('total_amount').gte('created_at', startOfWeek),
    supabase.from('sales').select('total_amount').gte('created_at', startOfMonth),
    supabase
      .from('sales')
      .select(
        'id, square_order_id, total_amount, payment_method, location_label, created_at',
      )
      .gte('created_at', periodStart[period])
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('sales')
      .select('total_amount, created_at')
      .gte('created_at', thirtyDaysAgo),
    supabase.from('sale_items').select('item_name, quantity, total_price'),
  ]);

  const todayTotal = (todaySales ?? []).reduce(
    (s, r) => s + toNum(r.total_amount),
    0,
  );
  const weekTotal = (weekSales ?? []).reduce(
    (s, r) => s + toNum(r.total_amount),
    0,
  );
  const monthTotal = (monthSales ?? []).reduce(
    (s, r) => s + toNum(r.total_amount),
    0,
  );
  const monthCount = monthSales?.length ?? 0;
  const avgTicket = monthCount > 0 ? monthTotal / monthCount : 0;

  // Top items by quantity (all-time)
  const itemMap = new Map<string, { qty: number; revenue: number }>();
  (saleItems ?? []).forEach((item: SaleItem) => {
    const prev = itemMap.get(item.item_name) ?? { qty: 0, revenue: 0 };
    itemMap.set(item.item_name, {
      qty: prev.qty + item.quantity,
      revenue: prev.revenue + toNum(item.total_price),
    });
  });
  const topItems = Array.from(itemMap.entries())
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Payment method breakdown (30 days)
  const pmMap = new Map<string, { count: number; total: number }>();
  (trendSales ?? []).forEach((s) => {
    const m = 'unknown';
    const prev = pmMap.get(m) ?? { count: 0, total: 0 };
    pmMap.set(m, { count: prev.count + 1, total: prev.total + toNum(s.total_amount) });
  });

  // Get payment methods from recent sales
  const pmMap2 = new Map<string, { count: number; total: number }>();
  (recentSales ?? []).forEach((s: Sale) => {
    const m = s.payment_method ?? 'unknown';
    const prev = pmMap2.get(m) ?? { count: 0, total: 0 };
    pmMap2.set(m, {
      count: prev.count + 1,
      total: prev.total + toNum(s.total_amount),
    });
  });

  // Rebuild payment methods from all 30d sales - fetch separately
  const paymentMethods = Array.from(pmMap2.entries())
    .map(([method, d]) => ({ method, ...d }))
    .sort((a, b) => b.total - a.total);

  const trendData = buildTrendData(trendSales ?? []);

  return {
    today: { total: todayTotal, count: todaySales?.length ?? 0 },
    week: { total: weekTotal, count: weekSales?.length ?? 0 },
    month: { total: monthTotal, count: monthCount },
    avgTicket,
    recentSales: (recentSales ?? []) as Sale[],
    topItems,
    paymentMethods,
    trendData,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return new Date(iso).toLocaleDateString('es-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Chicago',
  });
}

function shortOrder(id: string) {
  return id.length > 6 ? `#${id.slice(-6).toUpperCase()}` : `#${id.toUpperCase()}`;
}

const periodLabel: Record<Period, string> = {
  today: 'Hoy',
  week: 'Esta Semana',
  month: 'Este Mes',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <div className="flex items-center gap-2 bg-teal/10 border border-teal/25 rounded-full px-3.5 py-1.5">
      <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
      <span className="text-teal text-xs font-semibold tracking-wide">En vivo</span>
    </div>
  );
}

type KPIProps = {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  variant?: 'hero' | 'default';
};

function KPICard({ label, value, sub, icon: Icon, variant = 'default' }: KPIProps) {
  const hero = variant === 'hero';
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 flex flex-col gap-4 transition-shadow hover:shadow-md',
        hero ? 'bg-espresso border-espresso/80' : 'bg-white border-border',
      )}
    >
      {hero && (
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, #F97316 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
      )}

      <div className="relative flex items-center justify-between">
        <span
          className={cn(
            'text-xs font-semibold uppercase tracking-widest',
            hero ? 'text-cream/60' : 'text-muted-foreground',
          )}
        >
          {label}
        </span>
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            hero ? 'bg-orange/20' : 'bg-teal/10',
          )}
        >
          <Icon size={16} className={hero ? 'text-orange' : 'text-teal'} />
        </div>
      </div>

      <div className="relative">
        <p
          className={cn(
            'font-display font-bold leading-none',
            hero ? 'text-orange text-4xl' : 'text-espresso text-2xl sm:text-3xl',
          )}
        >
          {value}
        </p>
        <p className={cn('text-xs mt-2', hero ? 'text-cream/50' : 'text-muted-foreground')}>
          {sub}
        </p>
      </div>
    </div>
  );
}

function PaymentBadge({ method }: { method: string | null }) {
  const map: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    card: { label: 'Tarjeta', icon: CreditCard, cls: 'bg-teal/10 text-teal-dark' },
    cash: { label: 'Efectivo', icon: Banknote, cls: 'bg-green-100 text-green-800' },
    digital_wallet: {
      label: 'Digital',
      icon: Smartphone,
      cls: 'bg-purple-100 text-purple-700',
    },
  };
  const m = map[method ?? ''] ?? {
    label: method ?? 'N/A',
    icon: CircleHelp,
    cls: 'bg-muted text-muted-foreground',
  };
  const IconComp = m.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap',
        m.cls,
      )}
    >
      <IconComp size={11} />
      {m.label}
    </span>
  );
}

function RecentSalesTable({ sales, period }: { sales: Sale[]; period: Period }) {
  const title = `Ventas — ${periodLabel[period]}`;

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="font-display font-semibold text-espresso text-base">{title}</h2>
        <span className="text-xs text-muted-foreground">{sales.length} orden{sales.length !== 1 ? 'es' : ''}</span>
      </div>

      {sales.length === 0 ? (
        <div className="py-16 text-center">
          <ShoppingBag className="mx-auto mb-3 text-muted-foreground/40" size={32} />
          <p className="text-sm text-muted-foreground">Sin ventas en este período</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream/50 border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-2.5">
                  Orden
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5">
                  Total
                </th>
                <th className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5 hidden sm:table-cell">
                  Método
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 py-2.5 hidden md:table-cell">
                  Hora
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {sales.map((sale, i) => (
                <tr
                  key={sale.id}
                  className={cn(
                    'transition-colors hover:bg-cream/30',
                    i === 0 && 'bg-teal/[0.03]',
                  )}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0',
                          i === 0 ? 'bg-orange text-espresso' : 'bg-espresso/10 text-espresso/50',
                        )}
                      >
                        {i + 1}
                      </div>
                      <span className="font-mono text-xs text-espresso font-medium">
                        {shortOrder(sale.square_order_id)}
                      </span>
                      {sale.location_label && (
                        <span className="hidden lg:flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin size={10} />
                          {sale.location_label}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-display font-bold text-espresso">
                      {fmt(toNum(sale.total_amount))}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">
                    <PaymentBadge method={sale.payment_method} />
                  </td>
                  <td className="px-5 py-3 text-right hidden md:table-cell">
                    <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                      <Clock size={11} />
                      {timeAgo(sale.created_at)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const rankColors = [
  'bg-orange text-espresso',
  'bg-espresso/80 text-cream',
  'bg-espresso/60 text-cream',
  'bg-espresso/40 text-cream/80',
  'bg-espresso/20 text-espresso/60',
];

function TopItemsCard({
  items,
}: {
  items: { name: string; qty: number; revenue: number }[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
        <ChefHat size={16} className="text-teal" />
        <h2 className="font-display font-semibold text-espresso text-base">Top Platos</h2>
      </div>

      {items.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-muted-foreground">Sin datos aún</p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {items.map((item, i) => (
            <div key={item.name} className="flex items-center gap-3 px-5 py-3">
              <span
                className={cn(
                  'w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold flex-shrink-0',
                  rankColors[i] ?? rankColors[rankColors.length - 1],
                )}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-espresso truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.qty} unid. · {fmt(item.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentMethodsCard({
  methods,
  periodTotal,
}: {
  methods: { method: string; count: number; total: number }[];
  periodTotal: number;
}) {
  const pmLabels: Record<string, string> = {
    card: 'Tarjeta',
    cash: 'Efectivo',
    digital_wallet: 'Billetera Digital',
    unknown: 'Otro',
  };
  const pmColors: Record<string, string> = {
    card: 'bg-teal',
    cash: 'bg-green-500',
    digital_wallet: 'bg-purple-500',
    unknown: 'bg-muted-foreground/40',
  };

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border">
        <CreditCard size={16} className="text-teal" />
        <h2 className="font-display font-semibold text-espresso text-base">
          Métodos de Pago
        </h2>
      </div>

      {methods.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-muted-foreground">Sin datos aún</p>
        </div>
      ) : (
        <div className="px-5 py-4 space-y-4">
          {periodTotal > 0 && (
            <div className="flex h-2.5 rounded-full overflow-hidden gap-px">
              {methods.map((m) => (
                <div
                  key={m.method}
                  className={cn(
                    'h-full transition-all',
                    pmColors[m.method] ?? 'bg-muted-foreground/40',
                  )}
                  style={{ width: `${(m.total / periodTotal) * 100}%` }}
                />
              ))}
            </div>
          )}
          <div className="space-y-2.5">
            {methods.map((m) => (
              <div key={m.method} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-2.5 h-2.5 rounded-full flex-shrink-0',
                      pmColors[m.method] ?? 'bg-muted-foreground/40',
                    )}
                  />
                  <span className="text-sm text-espresso">
                    {pmLabels[m.method] ?? m.method}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-espresso">{fmt(m.total)}</span>
                  <span className="text-xs text-muted-foreground ml-1.5">({m.count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const period = (['today', 'week', 'month'].includes(searchParams.period ?? '')
    ? searchParams.period
    : 'today') as Period;

  const data = await getDashboardData(period);

  const todayLabel = new Date().toLocaleDateString('es-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Chicago',
  });

  // Which KPI card is the "hero" based on the active period
  const heroIndex: Record<Period, number> = { today: 0, week: 1, month: 2 };
  const activeHero = heroIndex[period];

  const kpis: KPIProps[] = [
    {
      label: 'Ventas Hoy',
      value: fmt(data.today.total),
      sub: `${data.today.count} orden${data.today.count !== 1 ? 'es' : ''}`,
      icon: DollarSign,
      variant: activeHero === 0 ? 'hero' : 'default',
    },
    {
      label: 'Esta Semana',
      value: fmt(data.week.total),
      sub: `${data.week.count} órdenes`,
      icon: TrendingUp,
      variant: activeHero === 1 ? 'hero' : 'default',
    },
    {
      label: 'Este Mes',
      value: fmt(data.month.total),
      sub: `${data.month.count} órdenes`,
      icon: CalendarDays,
      variant: activeHero === 2 ? 'hero' : 'default',
    },
    {
      label: 'Ticket Prom.',
      value: fmt(data.avgTicket),
      sub: 'últimos 30 días',
      icon: ShoppingBag,
    },
  ];

  const periodTotal =
    period === 'today'
      ? data.today.total
      : period === 'week'
        ? data.week.total
        : data.month.total;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">{todayLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense fallback={<div className="h-9 w-48 bg-cream-dark rounded-xl animate-pulse" />}>
            <PeriodSelector />
          </Suspense>
          <LiveBadge />
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Trend chart — full width */}
      <SalesTrendChart data={data.trendData} />

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentSalesTable sales={data.recentSales} period={period} />
        </div>
        <div className="space-y-6">
          <TopItemsCard items={data.topItems} />
          <PaymentMethodsCard methods={data.paymentMethods} periodTotal={periodTotal} />
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 pb-4 text-center border-t border-border/60">
        <p className="text-[11px] text-muted-foreground/50 tracking-wide uppercase">
          HOLALA Intelligence · Square POS + Supabase + Next.js
        </p>
      </div>

    </div>
  );
}
