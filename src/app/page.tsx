import { Gamepad2 } from "lucide-react"

import { FriendsActivity } from "@/components/friends-activity"
import { PopularGames } from "@/components/popular-games"
import { SiteHeader } from "@/components/site-header"

export const dynamic = "force-dynamic"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8 lg:py-12">
        <section className="mb-10 border border-border bg-card p-5">
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            ┌─ GAMETRACKER ─ TERMINAL v1.0 ──────────────
          </p>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight sm:text-4xl">
            <Gamepad2 aria-hidden="true" className="size-8 text-primary" />
            Ваш игровой дневник
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            <span className="text-primary">&gt;</span> Отслеживайте пройденные
            игры, ставьте оценки и следите за тем, во что играют друзья.
            <span className="ml-1 inline-block w-2 animate-pulse bg-primary align-middle">
              &nbsp;
            </span>
          </p>
        </section>

        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <PopularGames />
          <FriendsActivity />
        </div>
      </main>

      <footer className="border-t border-border bg-sidebar py-6">
        <div className="mx-auto w-full max-w-6xl px-5 text-center text-sm text-muted-foreground sm:px-8">
          GameTracker — данные об играх предоставлены RAWG.
        </div>
      </footer>
    </div>
  )
}
