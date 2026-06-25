"use client"

import { Loader2, UserPlus } from "lucide-react"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"

import { registerUser, type RegisterState } from "../actions"

const initialState: RegisterState = {}

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState,
  )

  return (
    <form action={formAction} className="space-y-4" noValidate>
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
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="password">
          Пароль
        </label>
        <input
          autoComplete="new-password"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
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
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="confirmPassword">
          Повтор пароля
        </label>
        <input
          autoComplete="new-password"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
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
      {state.formError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.formError}
        </p>
      ) : null}
      <Button className="h-10 w-full" disabled={isPending} type="submit">
        {isPending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <UserPlus aria-hidden="true" />
        )}
        Создать аккаунт
      </Button>
    </form>
  )
}
