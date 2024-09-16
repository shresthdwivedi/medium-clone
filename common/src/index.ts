import z from 'zod';

export const signupInputs = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
})


export const signinInputs = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const createBlog = z.object({
    title: z.string(),
    content: z.string(),
})

export const updateBlog = z.object({
    title: z.string(),
    content: z.string(),
    id: z.number(),
})

export type SignupParams = z.infer<typeof signupInputs>;
export type SigninParams = z.infer<typeof signinInputs>;
export type CreateBlog = z.infer<typeof createBlog>;
export type UpdateBlog = z.infer<typeof updateBlog>;