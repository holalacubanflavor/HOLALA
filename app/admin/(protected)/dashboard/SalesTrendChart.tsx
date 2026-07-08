'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export type TrendDay = {
  date: string;
  revenue: number;
  orders: number;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const revenue = payload[0]?.value ?? 0;
  const orders = payload[1]?.value ?? 0;
  return (
    <div className="bg-espresso text-cream rounded-xl px-3.5 py-2.5 shadow-xl text-sm pointer-events-none">
      <p className="text-cream/50 text-[11px] mb-1 uppercase tracking-wide">{label}</p>
      <p className="font-display font-bold text-orange text-xl leading-none">
        ${revenue.toFixed(2)}
      </p>
      <p className="text-cream/60 text-xs mt-1.5">
        {orders} orden{orders !== 1 ? 'es' : ''}
      </p>
    </div>
  );
}

export default function SalesTrendChart({ data }: { data: TrendDay[] }) {
  const hasData = data.some((d) => d.revenue > 0);
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 0);
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <TrendingUp size={16} className="text-teal" />
            <h2 className="font-display font-semibold text-espresso text-base">
              Tendencia de Ventas
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">Últimos 30 días</p>
        </div>
        {hasData ? (
          <div className="text-right">
            <p className="font-display font-bold text-espresso text-xl">
              ${totalRevenue.toFixed(2)}
            </p>
            <p className="text-[11px] text-muted-foreground">total período</p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground bg-cream px-2.5 py-1 rounded-full border border-border">
            Sin datos aún
          </span>
        )}
      </div>

      {/* Chart */}
      <div className="h-52 px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0E7C86" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0E7C86" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0ece6"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              interval={6}
            />

            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v}`}
              domain={[0, maxRevenue > 0 ? Math.ceil(maxRevenue * 1.2) : 10]}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: '#0E7C86',
                strokeWidth: 1.5,
                strokeDasharray: '4 4',
              }}
            />

            {/* Hidden area for orders (used in tooltip only) */}
            <Area
              type="monotone"
              dataKey="orders"
              stroke="transparent"
              fill="transparent"
              legendType="none"
            />

            {/* Revenue area */}
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0E7C86"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: '#0E7C86',
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
