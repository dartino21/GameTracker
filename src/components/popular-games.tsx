import { Gamepad2, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { getPopularGames } from "@/lib/games"

function getReleaseYear(released: string | null) {
  return released ? new Date(released).getFullYear() : null
}

export async function PopularGames() {
  let games

  try {
    games = await getPopularGames(8)
  } catch {
    return (
      <section aria-labelledby="popular-heading">
        <h2
          className="mb-4 text-xl font-semibold tracking-tight"
          id="popular-heading"
        >
          Популярные игры
        </h2>
        <p className="border border-border bg-card p-6 text-sm text-muted-foreground">
          <span className="text-destructive">! ERROR:</span> Не удалось
          загрузить популярные игры. Попробуйте обновить страницу.
        </p>
      </section>
    )
  }

  return (
    <section aria-labelledby="popular-heading">
      <div className="mb-4 flex items-baseline justify-between border-b border-border pb-2">
        <h2
          className="text-xl font-semibold tracking-tight"
          id="popular-heading"
        >
          <span className="text-primary">$</span> Популярные игры
        </h2>
        <span className="text-sm text-muted-foreground">за последний год</span>
      </div>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {games.map((game) => {
          const year = getReleaseYear(game.released)

          return (
            <li key={game.id}>
              <Link
                className="group block overflow-hidden border border-border bg-card transition-all hover:border-primary hover:shadow-[0_0_12px_rgba(255,171,46,0.35)]"
                href={`/games/${game.id}`}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                  {game.background_image ? (
                    <Image
                      alt=""
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      src={game.background_image}
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Gamepad2 className="size-10" aria-hidden="true" />
                    </span>
                  )}
                  {game.rating > 0 ? (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 border border-primary/60 bg-background/85 px-2 py-0.5 text-xs font-medium text-primary">
                      <Star
                        aria-hidden="true"
                        className="size-3 fill-primary text-primary"
                      />
                      {game.rating.toFixed(1)}
                    </span>
                  ) : null}
                </div>
                <div className="border-t border-border p-3">
                  <p className="truncate text-sm font-medium text-foreground">
                    {game.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {[year, game.genres.slice(0, 2).join(", ")]
                      .filter(Boolean)
                      .join(" · ") || "RAWG"}
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
