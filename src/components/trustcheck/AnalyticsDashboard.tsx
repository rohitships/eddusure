
'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Sector } from 'recharts';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Activity } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, TrendingUp, ShieldCheck, ShieldAlert, Percent } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const statusConfig = {
  success: { color: 'hsl(var(--chart-2))', label: 'Verified' },
  fraud: { color: 'hsl(var(--chart-4))', label: 'Fraud Suspected' },
  failure: { color: 'hsl(var(--chart-5))', label: 'Failed' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Date
            </span>
            <span className="font-bold text-muted-foreground">
              {label}
            </span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Verifications
            </span>
            <span className="font-bold">
              {payload[0].value}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};


const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

  return (
    <g>
      <text x={cx} y={cy-10} dy={8} textAnchor="middle" fill={fill} className="text-lg font-bold">
        {payload.name}
      </text>
       <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-sm">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};


export default function AnalyticsDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [activeIndex, setActiveIndex] = React.useState(0);

  const verificationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `users/${user.uid}/verifications`), orderBy('createdAt', 'asc'));
  }, [firestore, user]);

  const { data: activities, isLoading } = useCollection<Activity>(verificationsQuery);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const analyticsData = useMemo(() => {
    if (!activities) return null;

    const statusCounts = activities.reduce((acc, activity) => {
      acc[activity.status] = (acc[activity.status] || 0) + 1;
      return acc;
    }, {} as Record<Activity['status'], number>);

    const pieData = Object.entries(statusCounts).map(([name, value]) => ({
      name: statusConfig[name as Activity['status']].label,
      value,
      color: statusConfig[name as Activity['status']].color,
    }));

    const successfulVerifications = activities.filter(a => a.status === 'success' || a.status === 'fraud');
    const totalScore = successfulVerifications.reduce((acc, a) => acc + a.trustScore, 0);
    const averageTrustScore = successfulVerifications.length > 0 ? totalScore / successfulVerifications.length : 0;
    const successRate = activities.length > 0 ? (activities.filter(a => a.status === 'success').length / activities.length) * 100 : 0;

    const verificationsByDay = activities.reduce((acc, activity) => {
        const date = format(parseISO(activity.createdAt), 'MMM d');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const lineChartData = Object.entries(verificationsByDay).map(([date, count]) => ({ date, count }));

    return { pieData, totalVerifications: activities.length, averageTrustScore, successRate, lineChartData };
  }, [activities]);

  if (!user) {
    return null; // Don't show analytics if not logged in
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
             <Card key={i}>
                <CardHeader>
                     <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="h-10 w-3/4 bg-muted rounded-md animate-pulse"></div>
                </CardContent>
            </Card>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return null; // Don't show if there's no data
  }
  

  return (
    <div className="grid gap-4 md:gap-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.totalVerifications}</div>
                <p className="text-xs text-muted-foreground">Total documents analyzed</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.successRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Ratio of fully verified documents</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fraud Detections</CardTitle>
                <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.pieData.find(d => d.name === 'Fraud Suspected')?.value || 0}</div>
                <p className="text-xs text-muted-foreground">Documents flagged for potential fraud</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average TrustScore</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold">{(analyticsData?.averageTrustScore * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">For all successful verifications</p>
                </CardContent>
            </Card>
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="xl:col-span-2">
                <CardHeader>
                    <CardTitle>Verification Trend</CardTitle>
                    <CardDescription>Number of verifications over the last days.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={analyticsData?.lineChartData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card className="lg:col-span-1 xl:col-span-1">
                <CardHeader>
                    <CardTitle>Verification Status</CardTitle>
                    <CardDescription>Breakdown of all verification results by status.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                        <Pie
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={analyticsData?.pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={100}
                            fill="hsl(var(--primary))"
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                        >
                            {analyticsData?.pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
