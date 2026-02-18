'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CrimeTypePieChartProps {
    data: { type: string; count: number }[];
}

export default function CrimeTypePieChart({ data }: CrimeTypePieChartProps) {
    const colors = [
        '#0c2340', '#1e3a5f', '#2d4a6f', '#3c5a7f', '#4b6a8f',
        '#5a7a9f', '#698aaf', '#789abf', '#87aacf', '#96badf',
        '#a5caef', '#99af1b'
    ];

    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-slate-500">
                <p>No data available</p>
            </div>
        );
    }

    // PostgreSQL returns count as string - convert to number
    const chartData = data.map(item => ({
        type: item.type,
        count: typeof item.count === 'string' ? parseInt(item.count, 10) : Number(item.count)
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    label={({ percent }: any) => percent ? `${(percent * 100).toFixed(0)}%` : ''}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                </Pie>
                <Tooltip 
                    formatter={(value: any) => [`${value} cases`, 'Count']}
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '8px 12px'
                    }}
                />
                <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value: string) => {
                        return value.length > 20 ? value.substring(0, 20) + '...' : value;
                    }}
                    wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '12px'
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}
