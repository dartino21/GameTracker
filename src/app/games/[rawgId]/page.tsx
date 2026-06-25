import { CalendarDays, Gamepad2 } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"

import { AddToJournalButton } from "@/components/add-to-journal-button"
import { getGameByRawgId, RawgGameNotFoundError } from "@/lib/games"

type GamePageProps = {
  params: Promise<{
    rawgId: string
  }>
}

function parseRawgId(value: string) {
  const rawgId = Number(value)

  if (!Number.isInteger(rawgId) || rawgId <= 0) {
    return null
  }

  return rawgId
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export async function generateMetadata({ params }: GamePageProps) {
  const { rawgId: rawgIdParam } = await params
  const rawgId = parseRawgId(rawgIdParam)

  if (!rawgId) {
    return {
      title: "Игра не найдена | GameTracker",
    }
  }

  try {
    const game = await getGameByRawgId(rawgId)

    return {
      title: `${game.title} | GameTracker`,
    }
  } catch {
    return {
      title: "Игра не найдена | GameTracker",
    }
  }
}

export default async function GamePage({ params }: GamePageProps) {
  const { rawgId: rawgIdParam } = await params
  const rawgId = parseRawgId(rawgIdParam)

  if (!rawgId) {
    notFound()
  }

  let game

  try {
    game = await getGameByRawgId(rawgId)
  } catch (error) {
    if (error instanceof RawgGameNotFoundError) {
      notFound()
    }

    throw error
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[18rem_1fr] lg:py-12">
        <div>
          {game.coverUrl ? (
            <Image
              alt=""
              className="aspect-[3/4] w-full rounded-md object-cover ring-1 ring-zinc-200"
              height={384}
              src={game.coverUrl}
              unoptimized
              width={288}
            />
          ) : (
            <div className="flex aspect-[3/4] w-full items-center justify-center rounded-md bg-zinc-100 text-zinc-400 ring-1 ring-zinc-200">
              <Gamepad2 className="size-12" aria-hidden="true" />
            </div>
          )}
        </div>

        <section className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-zinc-500">RAWG #{game.rawgId}</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {game.title}
            </h1>
            {game.releaseDate ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                <CalendarDays className="size-4" aria-hidden="true" />
                {formatDate(game.releaseDate)}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {game.platforms.map((platform) => (
              <span
                className="rounded bg-white px-2.5 py-1 text-sm text-zinc-600 ring-1 ring-zinc-200"
                key={platform}
              >
                {platform}
              </span>
            ))}
          </div>

          {game.genres.length > 0 ? (
            <p className="text-sm text-zinc-500">{game.genres.join(", ")}</p>
          ) : null}

          <div>
            <AddToJournalButton rawgId={game.rawgId} gameTitle={game.title} />
          </div>
        </section>
      </div>
    </main>
  )
}
