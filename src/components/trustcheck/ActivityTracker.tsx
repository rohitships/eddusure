'use client';

import { format } from 'date-fns';
import { ShieldAlert, ShieldCheck, ShieldX, Loader2, User, ChevronsRight } from 'lucide-react';
import type { Activity } from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

export default function ActivityTracker() {
  const { user } = useUser();
  const firestore = useFirestore();

  const verificationsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, `users/${user.uid}/verifications`),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [firestore, user]);

  const { data: activities, isLoading } = useCollection<Activity>(verificationsQuery);

  const renderContent = () => {
    if (!user) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center">
            Please log in to see your activity.
          </TableCell>
        </TableRow>
      );
    }

    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          </TableCell>
        </TableRow>
      );
    }
    
    if (!activities || activities.length === 0) {
       return (
        <TableRow>
          <TableCell colSpan={5} className="h-24 text-center">
            No activity yet. Upload a document to get started.
          </TableCell>
        </TableRow>
      );
    }

    return activities.map((activity) => {
        const config = statusConfig[activity.status];
        const Icon = config.icon;
        return (
          <TableRow key={activity.id}>
            <TableCell className="font-medium">{activity.fileName}</TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{activity.studentName || 'N/A'}</span>
                </div>
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <ChevronsRight className="h-4 w-4" />
                    <span className="text-xs">{activity.certificateId || 'N/A'}</span>
                </div>
            </TableCell>
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
              {activity.createdAt ? format(new Date(activity.createdAt), 'PPpp') : 'N/A'}
            </TableCell>
          </TableRow>
        );
      });
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>A log of your most recent certificate verifications.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Student / Certificate ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">TrustScore</TableHead>
              <TableHead className="text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderContent()}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
