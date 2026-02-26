import z from "zod/v3";

export const LoginSchema = z.object({
    body : z.object({
        email : z.string().email("Invalid Email Address"),
        password : z.string().min(8, "Password must be at least 8 characters long").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/ , "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character")
    })
})

export type LoginInput = z.infer<typeof LoginSchema>['body'];