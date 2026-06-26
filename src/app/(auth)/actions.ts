"use server"

import { hash } from "bcryptjs"
import { redirect } from "next/navigation"

import { registerSchema } from "@/lib/auth-validation"
import { prisma } from "@/lib/prisma"

export type RegisterState = {
  fieldErrors?: Partial<Record<"email" | "password" | "confirmPassword", string[]>>
  formError?: string
}

export async function registerUser(
  _previousState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { email, password } = parsed.data
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    return {
      fieldErrors: {
        email: ["Пользователь с таким email уже существует"],
      },
    }
  }

  const passwordHash = await hash(password, 12)

  await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
  })

  redirect("/welcome")
}
