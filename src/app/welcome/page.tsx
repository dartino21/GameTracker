import { AuthTabs } from "@/components/auth-tabs"

import { HalftoneHorse } from "./halftone-horse"

export const metadata = { title: "Вход и регистрация | GameTracker" }

export default function WelcomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-5 text-foreground sm:p-8">
      <div className="terminal-window w-full max-w-4xl overflow-hidden">
        <div className="terminal-bar">access@gametracker:~$ connect</div>
        <div className="relative h-[26rem] overflow-hidden sm:h-[30rem]">
          <HalftoneHorse
            className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-75"
            gridSize={4}
            variant="inline"
          />
          <div className="relative z-10 p-6 sm:p-10">
            <header className="max-w-2xl space-y-4">
              <p className="terminal-prompt text-xs uppercase tracking-[0.2em] text-muted-foreground">
                AUTHORIZATION REQUIRED
              </p>
            </header>
          </div>
        </div>
        <AuthTabs />
      </div>
    </main>
  )
}
