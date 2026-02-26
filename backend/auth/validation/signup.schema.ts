import z from "zod/v3";

export const SignupSchema = z.object({
    body : z.object({
        name : z.string().regex(/^[a-zA-Z]+ [a-zA-Z]+$/ , "Name Should Contain First Name and Last Name Seperated by Space"),
        email : z.string().email("Invalid Email Address"),
        password : z.string().min(8, "Password must be at least 8 characters long").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/ , "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character")
    })
})

export type SignUpInput = z.infer<typeof SignupSchema>['body'];