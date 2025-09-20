import { format } from 'date-fns';
import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';
import type { Activity } from '@/lib/types';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type ActivityTrackerProps = {
  activities: Activity[];
};

const statusConfig = {
  success: {
    icon: ShieldCheck,
    color: 'bg-green-500/20 text-green-500 border-green-500/30',
    label: 'Verified',
  },
  fraud: {
    icon: ShieldAlert,
    color: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    label: 'Fraud Suspected',
  },
  failure: {
    icon: ShieldX,
    color: 'bg-red-500/20 text-red-500 border-red-500/30',
    label: 'Failed',
  },
};

export default function ActivityTracker({ activities }: ActivityTrackerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Tracking</CardTitle>
        <CardDescription>Recent validation activity for this session.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">TrustScore</TableHead>
              <TableHead className="text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length > 0 ? (
              activities.map((activity) => {
                const config = statusConfig[activity.status];
                const Icon = config.icon;
                return (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.fileName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`gap-1.5 ${config.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {activity.status !== 'failure' ? `${(activity.trustScore * 100).toFixed(1)}%` : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {format(activity.timestamp, 'PPpp')}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No activity yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
