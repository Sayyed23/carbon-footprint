"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface ChartDataPoint {
  date: string;
  Transport: number;
  Electricity: number;
  Cooking: number;
  Diet: number;
  Consumption: number;
  Total: number;
}

interface DashboardChartsProps {
  data: ChartDataPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-4 rounded-xl shadow-lg text-sm">
        <p className="font-bold border-b border-border pb-1 mb-2">{label}</p>
        {payload.map((item) => (
          <div key={item.name} className="flex justify-between gap-6 py-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </span>
            <span className="font-bold">{item.value.toFixed(1)} kg CO2e</span>
          </div>
        ))}
        <div className="border-t border-border pt-1 mt-2 flex justify-between font-extrabold text-primary">
          <span>Total</span>
          <span>{payload.reduce((sum: number, item) => sum + item.value, 0).toFixed(1)} kg</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardCharts({ data }: DashboardChartsProps) {
  // Sort data chronologically for charts
  const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

  if (sortedData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-muted/20 border border-border border-dashed rounded-xl">
        <p className="text-sm text-muted-foreground">
          Log activities to display your carbon breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      {/* Stacked Bar Chart for Category Splits */}
      <div className="glass p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-lg font-bold mb-4">Carbon Split by Category</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis dataKey="date" stroke="currentColor" className="text-xs opacity-65" />
              <YAxis stroke="currentColor" className="text-xs opacity-65" />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} className="text-xs" />
              <Bar
                dataKey="Transport"
                stackId="a"
                fill="#3b82f6"
                name="Transport"
                radius={[0, 0, 0, 0]}
              />
              <Bar dataKey="Electricity" stackId="a" fill="#eab308" name="Electricity" />
              <Bar dataKey="Diet" stackId="a" fill="#10b981" name="Diet" />
              <Bar dataKey="Cooking" stackId="a" fill="#ef4444" name="Cooking" />
              <Bar
                dataKey="Consumption"
                stackId="a"
                fill="#a855f7"
                name="Consumption"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart for Trends */}
      <div className="glass p-6 rounded-2xl border border-border shadow-sm">
        <h3 className="text-lg font-bold mb-4">Daily Emissions Trend</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={sortedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis dataKey="date" stroke="currentColor" className="text-xs opacity-65" />
              <YAxis stroke="currentColor" className="text-xs opacity-65" />
              <Tooltip />
              <Legend verticalAlign="top" height={36} className="text-xs" />
              <Line
                type="monotone"
                dataKey="Total"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                name="Total kg CO2e"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
