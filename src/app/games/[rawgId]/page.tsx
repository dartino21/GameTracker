import {
  CalendarDays,
  ExternalLink,
  Gamepad2,
  ShoppingBag,
  Star,
  Users,
} from "lucide-react"
import { getServerSession } from "next-auth"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { authOptions } from "@/auth"
import { AddToJournalButton } from "@/components/add-to-journal-button"
import { GameScreenshots } from "@/components/game-screenshots"
import { SiteHeader } from "@/components/site-header"
import {
  getGameByRawgId,
  getGamePageDetails,
  RawgGameNotFoundError,
} from "@/lib/games"
import { prisma } from "@/lib/prisma"

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

function formatRating(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Нет оценок"
  }

  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value)
}

function getInitials(username: string | null, name: string | null) {
  const source = name?.trim() || username?.trim() || "??"

  return source.slice(0, 2).toUpperCase()
}

async function getGameStats(gameId: string) {
  const stats = await prisma.userGame.aggregate({
    _avg: { rating: true },
    _count: { rating: true },
    where: {
      gameId,
      rating: {
        not: null,
      },
    },
  })

  return {
    averageRating: stats._avg.rating,
    ratingsCount: stats._count.rating,
  }
}

async function getFriendsPlaying(gameId: string, userId: string | undefined) {
  if (!userId) {
    return []
  }

  const friendships = await prisma.friendship.findMany({
    where: {
      status: "Accepted",
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    select: {
      user1Id: true,
      user2Id: true,
    },
  })

  const friendIds = friendships.map((friendship) =>
    friendship.user1Id === userId ? friendship.user2Id : friendship.user1Id,
  )

  if (friendIds.length === 0) {
    return []
  }

  return prisma.userGame.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    where: {
      gameId,
      status: "Playing",
      userId: {
        in: friendIds,
      },
    },
    select: {
      id: true,
      rating: true,
      user: {
        select: {
          username: true,
          name: true,
          avatar: true,
          image: true,
        },
      },
    },
  })
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

  const session = await getServerSession(authOptions)
  let game

  try {
    game = await getGamePageDetails(rawgId)
  } catch (error) {
    if (error instanceof RawgGameNotFoundError) {
      notFound()
    }

    throw error
  }

  const [{ averageRating, ratingsCount }, friendsPlaying] = await Promise.all([
    getGameStats(game.id),
    getFriendsPlaying(game.id, session?.user?.id),
  ])

  const releaseYear = game.releaseDate?.getFullYear()
  const coverAlt = `Обложка ${game.title}`

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-5 py-8 sm:px-8 lg:py-12">
        <section className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[18rem_1fr]">
          <div className="space-y-4">
            {game.coverUrl ? (
              <Image
                alt={coverAlt}
                className="aspect-[3/4] w-full border border-border object-cover shadow-[0_0_24px_rgba(255,171,46,0.18)]"
                height={384}
                priority
                src={game.coverUrl}
                unoptimized
                width={288}
              />
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center bg-muted text-muted-foreground ring-1 ring-border">
                <Gamepad2 className="size-12" aria-hidden="true" />
              </div>
            )}

            <AddToJournalButton rawgId={game.rawgId} gameTitle={game.title} />
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                RAWG #{game.rawgId}
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                {game.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {game.releaseDate ? (
                  <span className="flex items-center gap-2">
                    <CalendarDays className="size-4" aria-hidden="true" />
                    {formatDate(game.releaseDate)}
                  </span>
                ) : null}
                {releaseYear ? <span>{releaseYear}</span> : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border border-border bg-card p-4">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="size-4 text-primary" aria-hidden="true" />
                  GameTracker
                </p>
                <p className="mt-2 text-3xl font-semibold text-primary">
                  {formatRating(averageRating)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ratingsCount} оценок
                </p>
              </div>
              <div className="border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">RAWG</p>
                <p className="mt-2 text-3xl font-semibold text-primary">
                  {formatRating(game.rawgRating)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {game.rawgRatingsCount ?? 0} оценок
                </p>
              </div>
              <div className="border border-border bg-card p-4">
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4 text-primary" aria-hidden="true" />
                  Друзья играют
                </p>
                <p className="mt-2 text-3xl font-semibold text-primary">
                  {friendsPlaying.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  сейчас в журнале
                </p>
              </div>
            </div>

            {game.description ? (
              <section aria-labelledby="description-heading">
                <h2
                  className="border-b border-border pb-2 text-xl font-semibold tracking-tight"
                  id="description-heading"
                >
                  Описание
                </h2>
                <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {game.description}
                </p>
              </section>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-2">
              {game.genres.length > 0 ? (
                <section aria-labelledby="genres-heading">
                  <h2
                    className="mb-3 text-sm font-semibold uppercase tracking-[0.2em]"
                    id="genres-heading"
                  >
                    Жанры
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {game.genres.map((genre) => (
                      <span
                        className="border border-border bg-secondary px-2.5 py-1 text-sm text-muted-foreground"
                        key={genre}
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              {game.platforms.length > 0 ? (
                <section aria-labelledby="platforms-heading">
                  <h2
                    className="mb-3 text-sm font-semibold uppercase tracking-[0.2em]"
                    id="platforms-heading"
                  >
                    Платформы
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {game.platforms.map((platform) => (
                      <span
                        className="border border-border bg-secondary px-2.5 py-1 text-sm text-muted-foreground"
                        key={platform}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
          <GameScreenshots
            gameTitle={game.title}
            screenshots={game.screenshots}
          />

          <aside className="space-y-8">
            <section aria-labelledby="friends-heading">
              <h2
                className="mb-4 flex items-center gap-2 border-b border-border pb-2 text-xl font-semibold tracking-tight"
                id="friends-heading"
              >
                <Users className="size-5 text-primary" aria-hidden="true" />
                Друзья в игре
              </h2>
              <div className="border border-border bg-card">
                {friendsPlaying.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {friendsPlaying.map((entry) => {
                      const avatarUrl = entry.user.avatar || entry.user.image
                      const username = entry.user.username
                      const displayName =
                        entry.user.name || entry.user.username || "Игрок"

                      return (
                        <li className="flex items-center gap-3 p-3" key={entry.id}>
                          {avatarUrl ? (
                            <Image
                              alt=""
                              className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
                              height={40}
                              src={avatarUrl}
                              unoptimized
                              width={40}
                            />
                          ) : (
                            <span className="flex size-10 shrink-0 items-center justify-center border border-primary/50 bg-secondary text-xs font-semibold text-primary">
                              {getInitials(entry.user.username, entry.user.name)}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            {username ? (
                              <Link
                                className="truncate text-sm font-medium text-primary hover:underline"
                                href={`/profile/${username}`}
                              >
                                @{username}
                              </Link>
                            ) : (
                              <p className="truncate text-sm font-medium text-primary">
                                {displayName}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                              Играет сейчас
                              {entry.rating ? ` - оценка ${entry.rating}/10` : ""}
                            </p>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <p className="p-4 text-sm text-muted-foreground">
                    {session?.user?.id
                      ? "Никто из друзей пока не играет в эту игру."
                      : "Войдите, чтобы увидеть друзей, играющих в эту игру."}
                  </p>
                )}
              </div>
            </section>

            <section aria-labelledby="stores-heading">
              <h2
                className="mb-4 flex items-center gap-2 border-b border-border pb-2 text-xl font-semibold tracking-tight"
                id="stores-heading"
              >
                <ShoppingBag className="size-5 text-primary" aria-hidden="true" />
                Где купить
              </h2>
              <div className="border border-border bg-card">
                {game.stores.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {game.stores.map((store) => (
                      <li key={store.id}>
                        <a
                          className="flex items-center justify-between gap-3 p-3 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                          href={store.url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-foreground">
                              {store.name}
                            </span>
                            {store.domain ? (
                              <span className="mt-0.5 block truncate text-xs">
                                {store.domain}
                              </span>
                            ) : null}
                          </span>
                          <ExternalLink
                            className="size-4 shrink-0"
                            aria-hidden="true"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-4 text-sm text-muted-foreground">
                    Ссылки на магазины пока недоступны.
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}
