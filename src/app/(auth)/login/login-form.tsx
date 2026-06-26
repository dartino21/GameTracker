"use client"

import { Loader2, LogIn } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { loginSchema } from "@/lib/auth-validation"
import { cn } from "@/lib/utils"

type FieldErrors = Partial<Record<"email" | "password", string[]>>

type LoginFormProps = {
  horizontal?: boolean
}

export function LoginForm({ horizontal = false }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const callbackUrl = searchParams.get("callbackUrl")
  const redirectTo =
    callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/"

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
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      })

      if (result?.error) {
        setFormError("Неверный email или пароль")
        return
      }

      router.push(redirectTo)
      router.refresh()
    })
  }

  const fieldClass = horizontal ? "min-w-[12rem] flex-1 space-y-1.5" : "space-y-2"
  const inputClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"

  return (
    <form noValidate onSubmit={onSubmit}>
      <div
        className={cn(
          horizontal ? "flex flex-wrap items-start gap-3" : "space-y-4",
        )}
      >
        <div className={fieldClass}>
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            autoComplete="email"
            className={inputClass}
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
        <div className={fieldClass}>
          <label className="text-sm font-medium" htmlFor="password">
            Пароль
          </label>
          <input
            autoComplete="current-password"
            className={inputClass}
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
        {horizontal ? (
          <div className="flex flex-col gap-1.5">
            <span aria-hidden="true" className="text-sm font-medium opacity-0">
              .
            </span>
            <Button className="h-10 px-6" disabled={isPending} type="submit">
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <LogIn aria-hidden="true" />
              )}
              Войти
            </Button>
          </div>
        ) : (
          <Button className="h-10 w-full" disabled={isPending} type="submit">
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogIn aria-hidden="true" />
            )}
            Войти
          </Button>
        )}
      </div>
      {formError ? (
        <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      ) : null}
    </form>
  )
}
