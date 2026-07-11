import { Gamepad2 } from "lucide-react"

import { FriendsActivity } from "@/components/friends-activity"
import { GameDiscoveryNav } from "@/components/game-discovery-nav"
import { PopularCollections } from "@/components/popular-collections"
import { PopularGames } from "@/components/popular-games"
import { SiteHeader } from "@/components/site-header"

export const dynamic = "force-dynamic"

type HomeProps = {
  searchParams: Promise<{ period?: string; ordering?: string; genre?: string; platform?: string; month?: string; page?: string; view?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const filters = await searchParams

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 border-x border-border px-5 py-6 sm:px-8 lg:py-8">
        <section className="terminal-window mb-8">
          <div className="terminal-bar">journal@local:~$ gametracker overview</div>
          <div className="p-5">
            <p className="terminal-prompt text-xs uppercase tracking-[0.2em] text-muted-foreground">SESSION READY</p>
            <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
              <Gamepad2 aria-hidden="true" className="size-6 text-primary" />
              Ваш игровой дневник
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground"><span className="text-primary">&gt;</span> Отслеживайте пройденные игры, ставьте оценки и следите за активностью друзей.</p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
          {filters.view === "collections" ? <PopularCollections /> : <PopularGames {...filters} />}
          <aside className="space-y-8">
            <GameDiscoveryNav filters={filters} />
            <FriendsActivity />
          </aside>
        </div>
      </main>
      <footer className="border-t border-border bg-sidebar py-4">
        <div className="mx-auto w-full max-w-6xl px-5 text-xs text-muted-foreground sm:px-8">[OK] GameTracker // данные об играх предоставлены RAWG.</div>
      </footer>
    </div>
  )
}
