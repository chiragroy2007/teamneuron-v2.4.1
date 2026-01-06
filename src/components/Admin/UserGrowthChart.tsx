import React, { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';

const UserGrowthChart = () => {
    const [data, setData] = useState<{ date: string; formattedDate: string; total: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.stats.getUserGrowth();
                // Ensure response structure matches what we expect from backend update
                // response = { baseline: number, history: { date: string, count: number }[] }

                // Handle potential different response structures (backward compatibility)
                let baseline = 0;
                let history = [];

                if (Array.isArray(response)) {
                    history = response;
                } else {
                    baseline = response.baseline || 0;
                    history = response.history || [];
                }

                // Generate last 30 days array to ensure continuous line
                const days = [];
                const today = new Date();
                for (let i = 29; i >= 0; i--) { // 0 to 29 = 30 days
                    const d = new Date();
                    d.setDate(today.getDate() - i);
                    days.push(d.toISOString().split('T')[0]);
                }

                let runningTotal = Number(baseline);

                // Sort history just in case
                const sortedHistory = [...history].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

                const chartData = days.map(dayStr => {
                    // Find any registrations for this specific day
                    const dayRecord = sortedHistory.find((h: any) => h.date === dayStr);
                    if (dayRecord) {
                        runningTotal += Number(dayRecord.count);
                    }

                    const dateObj = new Date(dayStr);
                    return {
                        date: dayStr,
                        formattedDate: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
                        total: runningTotal
                    };
                });

                setData(chartData);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <Card className="col-span-1 shadow-sm border-neutral-200">
            <CardHeader>
                <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-sm text-neutral-400">
                Loading data...
            </CardContent>
        </Card>
    );

    return (
        <Card className="col-span-1 shadow-sm border-neutral-200">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">User Growth</CardTitle>
                <CardDescription>Total registered users over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] pl-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="formattedDate"
                            axisLine={false}
                            tickLine={false}
                            fontSize={12}
                            tick={{ fill: '#6b7280' }}
                            dy={10}
                            minTickGap={30}
                        />
                        <YAxis
                            dataKey="total"
                            axisLine={false}
                            tickLine={false}
                            fontSize={12}
                            tick={{ fill: '#6b7280' }}
                            allowDecimals={false}
                            domain={[0, 'auto']}
                            dx={-10}
                        />
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                            itemStyle={{ color: '#1f2937', fontWeight: 600 }}
                            labelStyle={{ color: '#6b7280', marginBottom: '0.25rem' }}
                            formatter={(value: number) => [`${value} Users`, 'Total']}
                        />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#2563eb"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorTotal)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

export default UserGrowthChart;
