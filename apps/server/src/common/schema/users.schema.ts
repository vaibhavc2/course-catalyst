import { zodErrors } from '#/utils/zod-errors.util';
import * as z from 'zod';

export const RegisterSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: zodErrors.required('Name') })
      .min(3, { message: zodErrors.minString('Name', 3) })
      .max(30, { message: zodErrors.largeString('Name', 30) })
      .regex(/^[a-zA-Z\s]*$/, {
        message: 'Name can only contain: letters and spaces.',
      }),
    email: z
      .string({ required_error: zodErrors.required('Email') })
      .max(255, { message: zodErrors.largeString('Email', 255) })
      .email({ message: 'Enter a valid email.' }),
    password: z
      .string({ required_error: zodErrors.required('Password') })
      .min(6, { message: zodErrors.minString('Password', 6) })
      .max(255, { message: zodErrors.largeString('Password', 255) })
      .regex(/^(?=.*\d)(?=.*\W).*$/, {
        message: 'Password must contain at least a digit, and a symbol.',
      }),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: RegisterSchema.shape.body.shape.email,
    password: RegisterSchema.shape.body.shape.password,
  }),
});
