import { z } from 'zod/v3';

export const createUrlSchema = z.object({
    body: z.object({
        originalUrl: z.string({ message: "Original URL is required" }).url("Must be a valid URL format"),

        customAlias: z.string()
            .min(3, "Alias must be at least 3 characters")
            .max(30, "Alias cannot exceed 30 characters")
            .or(z.literal(''))
            .transform(val => val === '' ? undefined : val.trim().toLowerCase().replace(/\s+/g, '-'))
            .optional(),

        expiresAt: z.coerce.date()
            .refine(date => date > new Date(), { message: "Expiration date must be in the future" })
            .or(z.literal(''))
            .transform(val => val === '' ? undefined : val)
            .optional(),

        activatesAt: z.coerce.date()
            .refine(date => date > new Date(), { message: "Activation date must be in the future" })
            .or(z.literal(''))
            .transform(val => val === '' ? undefined : val)
            .optional(),

        password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')).transform(val => val === '' ? undefined : val),

        deviceUrls: z.object({
            ios: z.string().url("Must be a valid iOS URL").optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
            android: z.string().url("Must be a valid Android URL").optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
        }).optional(),
    })
});

// Zod can automatically generate the TypeScript interface from the schema!
export type CreateUrlInput = z.infer<typeof createUrlSchema>['body'];