"use client"

import { Loader2, LogIn } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { loginSchema } from "@/lib/auth-validation"

type FieldErrors = Partial<Record<"email" | "password", string[]>>

export function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    setFormError(null)

    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors)
      return
    }

    setFieldErrors({})

    startTransition(async () => {
      const result = await signIn("credentials", {
        identifier: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      })

      if (result?.error) {
        setFormError("Неверный email или пароль")
        return
      }

      router.push("/")
      router.refresh()
    })
  }

  return (
    <form className="space-y-4" noValidate onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          autoComplete="email"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
          id="email"
          name="email"
          placeholder="you@example.com"
          type="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
        />
        {fieldErrors.email ? (
          <p className="text-sm text-destructive" id="email-error">
            {fieldErrors.email[0]}
          </p>
        ) : null}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Пароль
        </label>
        <input
          autoComplete="current-password"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
          id="password"
          name="password"
          placeholder="Введите пароль"
          type="password"
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={
            fieldErrors.password ? "password-error" : undefined
          }
        />
        {fieldErrors.password ? (
          <p className="text-sm text-destructive" id="password-error">
            {fieldErrors.password[0]}
          </p>
        ) : null}
      </div>
      {formError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      ) : null}
      <Button className="h-10 w-full" disabled={isPending} type="submit">
        {isPending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <LogIn aria-hidden="true" />
        )}
        Войти
      </Button>
    </form>
  )
}
