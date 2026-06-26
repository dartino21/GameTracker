"use client"

import { LogIn, X } from "lucide-react"
import { Suspense, useState } from "react"

import { LoginForm } from "@/app/(auth)/login/login-form"
import { RegisterForm } from "@/app/(auth)/register/register-form"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AuthMode = "register" | "login"

const tabs: Array<{ value: AuthMode; label: string }> = [
  { value: "register", label: "Регистрация" },
  { value: "login", label: "Войти" },
]

export function AuthTabs() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<AuthMode>("register")

  if (!open) {
    return (
      <Button
        className="h-10 px-6"
        onClick={() => setOpen(true)}
        size="lg"
        type="button"
      >
        <LogIn aria-hidden="true" />
        Войти / Регистрация
      </Button>
    )
  }

  return (
    <div className="w-full max-w-4xl border border-border bg-card/90 p-4 text-left shadow-[0_0_28px_rgba(255,171,46,0.18)] backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-1 border border-border bg-background/60 p-1">
          {tabs.map((tab) => (
            <button
              className={cn(
                "h-8 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary",
                mode === tab.value &&
                  "bg-primary/15 text-primary shadow-[0_0_10px_rgba(255,171,46,0.25)]",
              )}
              key={tab.value}
              onClick={() => setMode(tab.value)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Button
          aria-label="Свернуть"
          onClick={() => setOpen(false)}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <X aria-hidden="true" />
        </Button>
      </div>

      {mode === "register" ? (
        <RegisterForm horizontal />
      ) : (
        <Suspense fallback={null}>
          <LoginForm horizontal />
        </Suspense>
      )}
    </div>
  )
}
