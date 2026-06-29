'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import axios, { AxiosError } from 'axios';
import * as z from 'zod';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { verifySchema } from '@/schemas/verifySchema';
import { ApiResponse } from '@/types/ApiResponse';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export default function VerifyPage() {
  const router = useRouter();
  const params = useParams<{ username: string }>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (
    data: z.infer<typeof verifySchema>
  ) => {
    setIsSubmitting(true);

    try {
      const response = await axios.post<ApiResponse>(
        '/api/verify-code',
        {
          username: params.username,
          code: data.code,
        }
      );

      toast.success(response.data.message);

      router.replace('/sign-in');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error(
        axiosError.response?.data.message ??
          'Verification failed.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Verify Your Account
          </h1>

          <p className="mt-2 text-gray-500">
            Enter the verification code sent to your email.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Verification Code
                  </FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Enter 6-digit code"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Account'
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}