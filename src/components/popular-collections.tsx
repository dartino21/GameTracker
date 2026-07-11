import { Folder, Gamepad2, Users } from "lucide-react"
import Image from "next/image"

import { prisma } from "@/lib/prisma"

export async function PopularCollections() {
  const collections = await prisma.collection.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      title: true,
      description: true,
      user: {
        select: { username: true, name: true },
      },
      games: {
        take: 3,
        select: {
          game: {
            select: { coverUrl: true, title: true },
          },
        },
      },
      _count: { select: { games: true } },
    },
  })

  return (
    <section aria-labelledby="collections-heading">
      <div className="mb-4 border-b border-border pb-3">
        <h2
          className="flex items-center gap-2 text-xl font-semibold tracking-tight"
          id="collections-heading"
        >
          <span className="text-primary">$</span> Коллекции пользователей
        </h2>
      </div>

      {collections.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {collections.map((collection) => (
            <li className="min-h-64 overflow-hidden border border-border bg-card" key={collection.id}>
              <div className="relative flex h-full min-h-64 flex-col justify-between p-5">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/80 to-background" />
                <div className="relative">
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                    {collection.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    от {collection.user.name || `@${collection.user.username}`}
                  </p>
                  {collection.description ? (
                    <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                      {collection.description}
                    </p>
                  ) : null}
                </div>

                <div className="relative">
                  <div className="mb-5 grid grid-cols-3 gap-2">
                    {collection.games.map(({ game }) =>
                      game.coverUrl ? (
                        <Image
                          alt=""
                          className="aspect-[4/3] w-full border border-border bg-muted object-contain"
                          height={84}
                          key={game.title}
                          src={game.coverUrl}
                          unoptimized
                          width={112}
                        />
                      ) : (
                        <span className="flex aspect-[4/3] items-center justify-center border border-border bg-muted" key={game.title}>
                          <Gamepad2 className="size-5 text-muted-foreground" aria-hidden="true" />
                        </span>
                      ),
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Folder className="size-4 text-primary" aria-hidden="true" />
                      {collection._count.games} игр
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="size-4 text-primary" aria-hidden="true" />
                      публичная
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border border-border bg-card p-6 text-sm text-muted-foreground">
          Коллекций пока нет. Создайте первую в своём профиле.
        </div>
      )}

      <p className="mt-4 text-sm text-muted-foreground">
        Создать коллекцию можно в своём профиле.
      </p>
    </section>
  )
}
