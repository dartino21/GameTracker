import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
})

export const registerSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Введите корректный email"),
    password: z
      .string()
      .min(8, "Пароль должен быть не короче 8 символов")
      .max(72, "Пароль должен быть не длиннее 72 символов"),
    confirmPassword: z.string().min(1, "Повторите пароль"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
