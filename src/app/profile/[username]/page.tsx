import { CalendarDays } from "lucide-react"
import { getServerSession } from "next-auth"
import Image from "next/image"
import { notFound } from "next/navigation"

import { authOptions } from "@/auth"
import { UserCollections } from "@/components/user-collections"
import { UserJournal } from "@/components/user-journal"
import { SiteHeader } from "@/components/site-header"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

type ProfilePageProps = {
  params: Promise<{
    username: string
  }>
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
  const session = await getServerSession(authOptions)
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
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          rating: true,
          completedDate: true,
          createdAt: true,
          notes: true,
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
      collections: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          _count: { select: { games: true } },
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
  const journalEntries = user.games.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    completedDate: entry.completedDate?.toISOString() ?? null,
    game: {
      ...entry.game,
      releaseDate: entry.game.releaseDate?.toISOString() ?? null,
    },
  }))

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 border-x border-border px-5 py-6 sm:px-8 lg:py-8">
        <section className="terminal-window flex flex-col gap-6 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <Image
                alt=""
                className="size-20 rounded-full object-cover ring-1 ring-border"
                height={80}
                src={avatarUrl}
                unoptimized
                width={80}
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full border border-primary/50 bg-secondary text-xl font-semibold text-primary">
                {getInitials(user.username, user.name)}
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                {displayName}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4" aria-hidden="true" />
                На GameTracker с {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-64">
            <div className="border border-border bg-card p-4">
              <p className="text-2xl font-semibold text-primary">{user._count.games}</p>
              <p className="mt-1 text-sm text-muted-foreground">игр</p>
            </div>
            <div className="border border-border bg-card p-4">
              <p className="text-2xl font-semibold text-primary">{user._count.reviews}</p>
              <p className="mt-1 text-sm text-muted-foreground">обзоров</p>
            </div>
          </div>
        </section>

        <UserCollections
          canCreate={session?.user?.id === user.id}
          collections={user.collections}
        />

        <UserJournal entries={journalEntries} />
      </div>
    </main>
  )
}
