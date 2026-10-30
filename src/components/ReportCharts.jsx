import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDay } from '../utils/format.js';

export const SERIES = [
  { key: 'completed', label: 'Completed', color: '#1baf7a' },
  { key: 'inProgress', label: 'In Progress', color: '#1d5a9a' },
  { key: 'inReview', label: 'In Review', color: '#eda100' },
  { key: 'pending', label: 'Pending', color: '#2aa5cf' },
];

const AXIS = { fontSize: 12, fill: '#64748b' };
const shortDay = (day) => formatDay(day, { weekday: 'short', day: 'numeric' });

function ChartTooltip({ active, payload, label, labelFormat }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-slate-900">{labelFormat ? labelFormat(label) : label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-2 text-slate-700">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          {entry.name}: <span className="font-medium tabular-nums">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export function CompletedChart({ series, title }) {
  return (
    <figure className="card min-w-0 p-4">
      <figcaption className="section-title mb-3">{title}</figcaption>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="day" tickFormatter={shortDay} tick={AXIS} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} interval="preserveStartEnd" minTickGap={8} />
            <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: '#f1f5f9' }} content={<ChartTooltip labelFormat={shortDay} />} />
            <Bar dataKey="completed" name="Completed" fill="#1baf7a" radius={[4, 4, 0, 0]} maxBarSize={32} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

export function MembersChart({ members }) {
  return (
    <figure className="card min-w-0 p-4">
      <figcaption className="section-title mb-3">Tasks by team member</figcaption>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={members} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={AXIS} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
            <YAxis allowDecimals={false} tick={AXIS} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: '#f1f5f9' }} content={<ChartTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) => <span className="text-slate-600">{value}</span>}
            />
            {SERIES.map((series) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                name={series.label}
                stackId="status"
                fill={series.color}
                stroke="#ffffff"
                strokeWidth={2}
                maxBarSize={40}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
