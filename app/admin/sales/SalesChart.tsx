'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type ChartDataPoint = {
  month: string;
  monthLabel: string;
  sales: number;
  orders: number;
};

function linearRegression(data: ChartDataPoint[]): number[] {
  const n = data.length;
  if (n === 0) return [];
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  for (let i = 0; i < n; i++) {
    const pt = data[i];
    if (!pt) continue;
    sumX += i;
    sumY += pt.sales;
    sumXY += i * pt.sales;
    sumX2 += i * i;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return data.map(() => sumY / n);
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return data.map((_, i) => Math.max(0, slope * i + intercept));
}

type SalesChartProps = {
  data: ChartDataPoint[];
};

export function SalesChart({ data }: SalesChartProps) {
  const trendValues = linearRegression(data);
  const chartData = data.map((d, i) => ({
    ...d,
    trend: Math.round((trendValues[i] ?? 0) * 100) / 100,
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
        No sales data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="monthLabel"
          tick={{ fontSize: 11 }}
          stroke="hsl(var(--muted-foreground))"
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#16a34a' }}
          stroke="#16a34a"
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
          formatter={(value: unknown) =>
            typeof value === 'number' ? [`$${value.toFixed(2)}`, 'Value'] : ['$0.00', 'Value']
          }
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Bar
          dataKey="sales"
          name="Sales"
          fill="#16a34a"
          radius={[4, 4, 0, 0]}
        />
        <Line
          type="monotone"
          dataKey="trend"
          name="Trend"
          stroke="#0c4a6e"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
