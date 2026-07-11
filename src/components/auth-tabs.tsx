"use client"

import { X } from "lucide-react"
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
      <button
        aria-label="Открыть форму входа и регистрации"
        className="group flex min-h-14 w-full items-center gap-2 border-t border-border bg-background px-4 text-left text-sm transition-colors hover:bg-primary/10 focus-visible:bg-primary/10 sm:px-6"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="hidden text-muted-foreground sm:inline">
          guest@gametracker:~$
        </span>
        <span className="text-primary">./auth --open</span>
        <span aria-hidden="true" className="h-4 w-2 bg-primary motion-safe:animate-pulse" />
        <span className="ml-auto text-xs uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-primary">
          [enter]
        </span>
      </button>
    )
  }

  return (
    <div className="w-full border-t border-border bg-background p-4 text-left sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-1 border border-border bg-card p-1">
          {tabs.map((tab) => (
            <button
              aria-current={mode === tab.value ? "page" : undefined}
              className={cn(
                "retro-tab h-8 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-primary",
                mode === tab.value && "text-primary",
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
