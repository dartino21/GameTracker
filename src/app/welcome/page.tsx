import { AuthTabs } from "@/components/auth-tabs"

import { HalftoneHorse } from "./halftone-horse"

export const metadata = {
  title: "Вход и регистрация | GameTracker",
}

export default function WelcomePage() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <HalftoneHorse />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-between px-5 py-10 text-center sm:py-16">
        <header className="space-y-3">
          <p className="text-[0.7rem] uppercase tracking-[0.35em] text-muted-foreground sm:text-xs">
            ┌─ GAMETRACKER ─ ACCESS TERMINAL ─────────────
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            <span className="text-primary">&gt;</span> Войти или
            зарегистрироваться
          </h1>
          <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            Добро пожаловать в игровой дневник. Создайте аккаунт или войдите —
            конь уже мчит по треку.
            <span className="ml-1 inline-block w-2 animate-pulse bg-primary align-middle">
              &nbsp;
            </span>
          </p>
        </header>

        <AuthTabs />
      </div>
    </main>
  )
}
