import z from 'zod';

export interface customJwtSessionClaims {
  metadata?: {
    role?: 'user' | 'admin';
  };
}

export const UserFormSchema = z.object({
  firstName: z
    .string({ message: 'First name is Required!' })
    .min(2, { message: 'First name must be at least 2 characters!' })
    .max(50),
  lastName: z
    .string({ message: 'Last name is Required!' })
    .min(2, { message: 'Last name must be at least 2 characters!' })
    .max(50),
  username: z
    .string({ message: 'User name is Required!' })
    .min(2, { message: 'User name must be at least 2 characters!' })
    .max(50),
  emailAddress: z.array(z.string({ message: 'Email address is required!' })),
  password: z
    .string({ message: 'Password is Required!' })
    .min(8, { message: 'Password must be at least 8 characters!' })
    .max(50),
});
