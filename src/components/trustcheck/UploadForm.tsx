'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, UploadCloud, File as FileIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'Please upload a file.')
    .refine(
      (file) => ['application/pdf', 'image/png', 'image/jpeg'].includes(file.type),
      'Only PDF, PNG, and JPEG files are allowed.'
    )
    .refine((file) => file.size < 10 * 1024 * 1024, 'File size must be less than 10MB.'),
});

type UploadFormProps = {
  onAnalyze: (data: { file: File }) => void;
  isLoading: boolean;
};

export default function UploadForm({ onAnalyze, isLoading }: UploadFormProps) {
  const [fileName, setFileName] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (values.file) {
      onAnalyze({ file: values.file });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validate a Certificate</CardTitle>
        <CardDescription>Upload the certificate document for an automated forensic analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate Document</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <input
                        type="file"
                        id="file-upload"
                        className="absolute w-0 h-0 opacity-0"
                        accept=".pdf,.png,.jpeg,.jpg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                            setFileName(file.name);
                          }
                        }}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="file-upload"
                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors ${
                          isLoading ? 'cursor-not-allowed opacity-50' : ''
                        } ${form.formState.errors.file ? 'border-destructive' : ''}`}
                      >
                        {fileName ? (
                          <div className="text-center">
                            <FileIcon className="mx-auto h-12 w-12 text-primary" />
                            <p className="mt-2 text-sm font-medium text-foreground">{fileName}</p>
                            <p className="mt-1 text-xs text-muted-foreground">Click to change file</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-sm text-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">PDF, PNG, JPEG (max 10MB)</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Certificate'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
