import z from "zod/v3";

export const searchUrlSchema = z.object({
    params: z.object({
        shortId: z.string({ message: "Short ID is required" })
            .min(1, "Short ID must be at least 1 characters")
            .regex(/^[a-zA-Z0-9-]+$/, "Short ID must be alphanumeric")
            .refine(val => val !== ' ', "Short ID cannot be empty or just spaces")
    })
})

export type SearchUrlInput = z.infer<typeof searchUrlSchema>['params'];