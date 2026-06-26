"use server"

import { hash } from "bcryptjs"

import { registerSchema } from "@/lib/auth-validation"
import { prisma } from "@/lib/prisma"

export type RegisterState = {
  ok?: boolean
  fieldErrors?: Partial<
    Record<"username" | "email" | "password" | "confirmPassword", string[]>
  >
  formError?: string
}

export async function registerUser(
  _previousState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { username, email, password } = parsed.data

  const [existingEmail, existingUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.user.findUnique({ where: { username }, select: { id: true } }),
  ])

  if (existingEmail) {
    return {
      fieldErrors: {
        email: ["Пользователь с таким email уже существует"],
      },
    }
  }

  if (existingUsername) {
    return {
      fieldErrors: {
        username: ["Этот ник уже занят"],
      },
    }
  }

  const passwordHash = await hash(password, 12)

  await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
    },
  })

  return { ok: true }
}
