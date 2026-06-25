import { CalendarDays, Gamepad2, Star } from "lucide-react"
import Image from "next/image"
import { notFound } from "next/navigation"

import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

type ProfilePageProps = {
  params: Promise<{
    username: string
  }>
}

const statusLabels = {
  Playing: "Играю",
  Completed: "Пройдено",
  Dropped: "Заброшено",
  PlanToPlay: "В планах",
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function getInitials(username: string, name?: string | null) {
  const source = name?.trim() || username

  return source.slice(0, 2).toUpperCase()
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params
  const decodedUsername = decodeURIComponent(username)
  const user = await prisma.user.findUnique({
    where: { username: decodedUsername },
    select: { username: true, name: true },
  })

  if (!user) {
    return {
      title: "Профиль не найден | GameTracker",
    }
  }

  return {
    title: `${user.name || user.username} | GameTracker`,
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const decodedUsername = decodeURIComponent(username)
  const user = await prisma.user.findUnique({
    where: { username: decodedUsername },
    select: {
      id: true,
      username: true,
      name: true,
      avatar: true,
      image: true,
      createdAt: true,
      games: {
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          rating: true,
          completedDate: true,
          createdAt: true,
          game: {
            select: {
              title: true,
              coverUrl: true,
              platforms: true,
              genres: true,
              releaseDate: true,
            },
          },
        },
      },
      _count: {
        select: {
          games: true,
          reviews: true,
        },
      },
    },
  })

  if (!user?.username) {
    notFound()
  }

  const displayName = user.name || user.username
  const avatarUrl = user.avatar || user.image

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:py-12">
        <section className="flex flex-col gap-6 border-b border-zinc-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <Image
                alt=""
                className="size-20 rounded-full object-cover ring-1 ring-zinc-200"
                height={80}
                src={avatarUrl}
                unoptimized
                width={80}
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full bg-zinc-900 text-xl font-semibold text-white">
                {getInitials(user.username, user.name)}
              </div>
            )}
            <div>
              <p className="text-sm text-zinc-500">@{user.username}</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                {displayName}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                <CalendarDays className="size-4" aria-hidden="true" />
                На GameTracker с {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-64">
            <div className="rounded-md border border-zinc-200 bg-white p-4">
              <p className="text-2xl font-semibold">{user._count.games}</p>
              <p className="mt-1 text-sm text-zinc-500">игр</p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-white p-4">
              <p className="text-2xl font-semibold">{user._count.reviews}</p>
              <p className="mt-1 text-sm text-zinc-500">обзоров</p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Последние игры
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Недавно добавленное в библиотеку пользователя.
              </p>
            </div>
          </div>

          {user.games.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {user.games.map((entry) => (
                <article
                  className="overflow-hidden rounded-md border border-zinc-200 bg-white"
                  key={entry.id}
                >
                  <div className="flex gap-4 p-4">
                    {entry.game.coverUrl ? (
                      <Image
                        alt=""
                        className="h-28 w-20 rounded object-cover ring-1 ring-zinc-200"
                        height={112}
                        src={entry.game.coverUrl}
                        unoptimized
                        width={80}
                      />
                    ) : (
                      <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded bg-zinc-100 text-zinc-400 ring-1 ring-zinc-200">
                        <Gamepad2 className="size-7" aria-hidden="true" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 font-medium leading-6">
                        {entry.game.title}
                      </h3>
                      <p className="mt-1 text-sm text-zinc-500">
                        {statusLabels[entry.status]}
                      </p>
                      {entry.rating ? (
                        <p className="mt-3 flex items-center gap-1 text-sm font-medium">
                          <Star
                            className="size-4 fill-zinc-950"
                            aria-hidden="true"
                          />
                          {entry.rating}/10
                        </p>
                      ) : null}
                      <p className="mt-3 text-xs text-zinc-500">
                        Добавлено {formatDate(entry.createdAt)}
                      </p>
                    </div>
                  </div>
                  {entry.completedDate ? (
                    <div className="border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500">
                      Пройдено {formatDate(entry.completedDate)}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-zinc-300 bg-white px-5 py-10 text-center">
              <Gamepad2
                className="mx-auto size-8 text-zinc-400"
                aria-hidden="true"
              />
              <p className="mt-3 font-medium">В библиотеке пока пусто</p>
              <p className="mt-1 text-sm text-zinc-500">
                Когда пользователь добавит игры, они появятся здесь.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
