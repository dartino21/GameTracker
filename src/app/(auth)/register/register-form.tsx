"use client"

import { Loader2, UserPlus } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { registerUser, type RegisterState } from "../actions"

const initialState: RegisterState = {}

type RegisterFormProps = {
  horizontal?: boolean
}

export function RegisterForm({ horizontal = false }: RegisterFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<RegisterState>(initialState)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")

    startTransition(async () => {
      const result = await registerUser(initialState, formData)

      if (!result.ok) {
        setState(result)
        return
      }

      setState(initialState)

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        setState({
          formError:
            "Аккаунт создан, но не удалось войти автоматически. Попробуйте войти вручную.",
        })
        return
      }

      router.push("/")
      router.refresh()
    })
  }

  const fieldClass = horizontal ? "min-w-[10rem] flex-1 space-y-1.5" : "space-y-2"
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
          <label className="text-sm font-medium" htmlFor="username">
            Ник
          </label>
          <input
            autoComplete="username"
            className={inputClass}
            id="username"
            name="username"
            placeholder="cool_gamer"
            type="text"
            aria-invalid={Boolean(state.fieldErrors?.username)}
            aria-describedby={
              state.fieldErrors?.username ? "username-error" : undefined
            }
          />
          {state.fieldErrors?.username ? (
            <p className="text-sm text-destructive" id="username-error">
              {state.fieldErrors.username[0]}
            </p>
          ) : null}
        </div>
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
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={
              state.fieldErrors?.email ? "email-error" : undefined
            }
          />
          {state.fieldErrors?.email ? (
            <p className="text-sm text-destructive" id="email-error">
              {state.fieldErrors.email[0]}
            </p>
          ) : null}
        </div>
        <div className={fieldClass}>
          <label className="text-sm font-medium" htmlFor="password">
            Пароль
          </label>
          <input
            autoComplete="new-password"
            className={inputClass}
            id="password"
            name="password"
            placeholder="Минимум 8 символов"
            type="password"
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={
              state.fieldErrors?.password ? "password-error" : undefined
            }
          />
          {state.fieldErrors?.password ? (
            <p className="text-sm text-destructive" id="password-error">
              {state.fieldErrors.password[0]}
            </p>
          ) : null}
        </div>
        <div className={fieldClass}>
          <label className="text-sm font-medium" htmlFor="confirmPassword">
            Повтор пароля
          </label>
          <input
            autoComplete="new-password"
            className={inputClass}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Повторите пароль"
            type="password"
            aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
            aria-describedby={
              state.fieldErrors?.confirmPassword
                ? "confirm-password-error"
                : undefined
            }
          />
          {state.fieldErrors?.confirmPassword ? (
            <p className="text-sm text-destructive" id="confirm-password-error">
              {state.fieldErrors.confirmPassword[0]}
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
                <UserPlus aria-hidden="true" />
              )}
              Создать аккаунт
            </Button>
          </div>
        ) : (
          <Button className="h-10 w-full" disabled={isPending} type="submit">
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <UserPlus aria-hidden="true" />
            )}
            Создать аккаунт
          </Button>
        )}
      </div>
      {state.formError ? (
        <p className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.formError}
        </p>
      ) : null}
    </form>
  )
}
