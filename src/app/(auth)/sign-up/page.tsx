'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounceValue } from 'usehooks-ts';
import * as z from 'zod';

import { ApiResponse } from '@/types/ApiResponse';
import { signUpSchema } from '@/schemas/signUpSchema';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export default function Page() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [debouncedUsername] = useDebounceValue(username, 500);

    //zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (!debouncedUsername) {
        setUsernameMessage('');
        return;
      }

      setIsCheckingUsername(true);

      try {
        const response = await axios.get<ApiResponse>(
          '/api/check-username-unique',
          {
            params: {
              username: debouncedUsername,
            },
          }
        );

        setUsernameMessage(response.data.message);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;

        setUsernameMessage(
          axiosError.response?.data.message ??
            'Error checking username'
        );
      } finally {
        setIsCheckingUsername(false);
      }
    };

    checkUsernameUnique();
  }, [debouncedUsername]);

  const onSubmit = async (
    data: z.infer<typeof signUpSchema>
  ) => {
    setIsSubmitting(true);

    try {
      const response = await axios.post<ApiResponse>(
        '/api/sign-up',
        data
      );

      toast.success(response.data.message);

      router.replace(`/verify/${data.username}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast.error(
        axiosError.response?.data.message ??
          'Unable to create account.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-800">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-4xl font-bold">
            Join Annonymous Connect
          </h1>

          <p className="text-gray-600">
            Sign up to start your anonymous adventure.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="Enter username"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setUsername(e.target.value);
                      }}
                    />
                  </FormControl>

                  {isCheckingUsername && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  )}

                  {!isCheckingUsername &&
                    usernameMessage && (
                      <p
                        className={`text-sm ${
                          usernameMessage ===
                          'Username is unique'
                            ? 'text-green-600'
                            : 'text-red-500'
                        }`}
                      >
                        {usernameMessage}
                      </p>
                    )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>

                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@gmail.com"
                      {...field}
                    />
                  </FormControl>

                  <p className="text-sm text-gray-500">
                    We'll send you a verification code.
                  </p>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>

                  <FormControl>
                    <Input
                      type="password"
                      placeholder="********"
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
                  Please wait...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm">
            Already a member?{' '}
            <Link
              href="/sign-in"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}