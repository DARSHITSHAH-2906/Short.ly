"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const getUrlSchema = (isEdit: boolean) => z.object({
  originalUrl: z.string().url({ message: 'Please enter a valid URL' }),

  customAlias: z.string()
    .min(3, "Alias must be at least 3 characters")
    .max(30, "Alias cannot exceed 30 characters")
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val.trim().toLowerCase().replace(/\s+/g, '-'))
    .optional(),

  expiresAt: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val) return true;
      if (isEdit) return true;
      return new Date(val) > new Date(Date.now() - 60000); // 1 min buffer
    }, { message: "Date must be in the future." }),

  activatesAt: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val) return true;
      if (isEdit) return true; // The Fix: Allow past dates (like createdAt) when editing
      return new Date(val) > new Date(Date.now() - 60000); // 1 min buffer
    }, { message: "Date must be in the future." }),

  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .optional()
    .or(z.literal('')),

  deviceUrls: z.object({
    ios: z.string().url({ message: 'Invalid iOS URL' }).optional().or(z.literal('')),
    android: z.string().url({ message: 'Invalid Android URL' }).optional().or(z.literal('')),
  }).optional(),

  createdAt: z.string().optional(),
});

export type UrlFormValues = z.infer<ReturnType<typeof getUrlSchema>>;

interface UrlFormProps {
  initialData?: UrlFormValues & { shortId?: string };
  onSuccess?: () => void;
}

export function UrlForm({ initialData, onSuccess }: UrlFormProps) {
  const { user } = useAuthStore();
  const isPremium = !(user?.subscriptionPlan === "FREE");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()
  const isEdit = Boolean(initialData?.shortId);

  const form = useForm<UrlFormValues>({
    resolver: zodResolver(getUrlSchema(isEdit)),
    defaultValues: {
      originalUrl: initialData?.originalUrl || '',
      customAlias: initialData?.customAlias || '',
      expiresAt: initialData?.expiresAt
        ? new Date(initialData.expiresAt).toISOString().slice(0, 16)
        : '',
      activatesAt: initialData?.activatesAt
        ? new Date(initialData.activatesAt).toISOString().slice(0, 16)
        : initialData?.createdAt
          ? new Date(initialData.createdAt).toISOString().slice(0, 16)
          : '',
      password: initialData?.password || '',
      deviceUrls: {
        ios: initialData?.deviceUrls?.ios || '',
        android: initialData?.deviceUrls?.android || '',
      }
    },
  });

  const onSubmit = async (data: UrlFormValues) => {
    setIsLoading(true);
    try {
      if (initialData?.shortId) {
        api.patch(`/url/update/${initialData.shortId}`, data)
          .then(() => {
            toast.success('URL updated successfully');
            router.push('/dashboard');
          })
          .catch((error: any) => {
            if (error.response?.code === 403) {
              toast.error(error.response?.data?.message || "Unable To Generate URL");
              router.push('/pricing');
            } else {
              const message = error.response?.data?.message || 'Something went wrong';
              toast.error(message);
            }
          });
      } else {
        api.post('/url/generate', data)
          .then(() => {
            toast.success('URL shortened successfully');
            form.reset();
          })
          .catch((error: any) => {
            const message = error.response?.data?.message || 'Something went wrong';
            toast.error(message);
          });
      }
      onSuccess?.();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const PremiumBadge = () =>
    !isPremium ? <Lock className="w-3.5 h-3.5 text-muted-foreground" /> : null;
  const premiumNote = !isPremium ? (
    <FormDescription>Upgrade to Pro to unlock.</FormDescription>
  ) : null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Edit URL' : 'Shorten a new URL'}</CardTitle>
        <CardDescription>Enter your long URL and configure optional settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <FormField
              control={form.control}
              name="originalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination URL <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/very-long-url" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customAlias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      Custom Alias <PremiumBadge />
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="my-brand"
                        {...field}
                        disabled={!isPremium}
                        title={!isPremium ? 'Upgrade to Pro to unlock' : undefined}
                      />
                    </FormControl>
                    {premiumNote}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      Expires At <PremiumBadge />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        disabled={!isPremium}
                        title={!isPremium ? 'Upgrade to Pro to unlock' : undefined}
                      />
                    </FormControl>
                    {premiumNote}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Activates At + Password ──────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="activatesAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      Activates At <PremiumBadge />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        disabled={!isPremium}
                        title={!isPremium ? 'Upgrade to Pro to unlock' : undefined}
                      />
                    </FormControl>
                    <FormDescription className={isPremium ? '' : 'hidden'}>
                      Link stays inactive until this date.
                    </FormDescription>
                    {premiumNote}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      Password Protection <PremiumBadge />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Secret password"
                        {...field}
                        disabled={!isPremium}
                        title={!isPremium ? 'Upgrade to Pro to unlock' : undefined}
                      />
                    </FormControl>
                    {premiumNote}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Device Targeting ─────────────────────────────── */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-medium text-sm flex items-center gap-1.5">
                Device Targeting <PremiumBadge />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deviceUrls.ios"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>iOS Redirect</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://apps.apple.com/..."
                          {...field}
                          disabled={!isPremium}
                          title={!isPremium ? 'Upgrade to Pro to unlock' : undefined}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deviceUrls.android"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Android Redirect</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://play.google.com/..."
                          {...field}
                          disabled={!isPremium}
                          title={!isPremium ? 'Upgrade to Pro to unlock' : undefined}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {premiumNote}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving…' : initialData ? 'Update Link' : 'Shorten URL'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}