'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import type { AnalysisResult } from '@/lib/types';
import { BookUser, Calendar, GraduationCap, Hash, Building, Award, Star } from 'lucide-react';

type ExtractedDataProps = {
  result: AnalysisResult;
};

const DataRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | undefined }) => (
  <TableRow>
    <TableCell className="font-semibold w-1/3">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <span>{label}</span>
      </div>
    </TableCell>
    <TableCell className="text-foreground">{value || 'Not found'}</TableCell>
  </TableRow>
);

export default function ExtractedData({ result }: ExtractedDataProps) {
  return (
    <div>
        <h3 className="text-lg font-semibold mb-4">Extracted Information</h3>
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableBody>
                        <DataRow icon={BookUser} label="Student Name" value={result.studentName} />
                        <DataRow icon={Hash} label="Certificate ID" value={result.certificateId} />
                        <DataRow icon={Building} label="Institution" value={result.institutionName} />
                        <DataRow icon={Award} label="Grades / Marks" value={result.grades} />
                        <DataRow icon={Calendar} label="Date of Birth" value={result.dateOfBirth} />
                        <DataRow icon={GraduationCap} label="Graduation Date" value={result.graduationDate} />
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
