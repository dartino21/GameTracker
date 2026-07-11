import { FolderPlus } from "lucide-react"

import { createCollection } from "@/app/profile/[username]/actions"

type CollectionItem = {
  id: string
  title: string
  description: string | null
  _count: { games: number }
}

type UserCollectionsProps = {
  collections: CollectionItem[]
  canCreate: boolean
}

export function UserCollections({ collections, canCreate }: UserCollectionsProps) {
  return (
    <section aria-labelledby="collections-heading" className="space-y-4">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
        <h2
          className="flex items-center gap-2 text-xl font-semibold tracking-tight"
          id="collections-heading"
        >
          <FolderPlus className="size-5 text-primary" aria-hidden="true" />
          Коллекции
        </h2>
      </div>

      {canCreate ? (
        <form action={createCollection} className="terminal-window grid gap-3 p-4 sm:grid-cols-[1fr_auto]">
          <label className="grid gap-2">
            <span className="text-sm text-muted-foreground">Новая коллекция</span>
            <input
              className="h-10 border border-input bg-background px-3 text-sm"
              maxLength={80}
              minLength={2}
              name="title"
              placeholder="Например: Лучшие хорроры"
              required
            />
          </label>
          <label className="grid gap-2 sm:col-span-2">
            <span className="text-sm text-muted-foreground">Описание</span>
            <textarea
              className="min-h-20 resize-y border border-input bg-background px-3 py-2 text-sm"
              maxLength={240}
              name="description"
              placeholder="Коротко о подборке"
            />
          </label>
          <button
            className="h-10 border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:col-start-2"
            type="submit"
          >
            Создать
          </button>
        </form>
      ) : null}

      {collections.length > 0 ? (
        <ul className="grid gap-px border border-border bg-border sm:grid-cols-2">
          {collections.map((collection) => (
            <li className="bg-card p-4" key={collection.id}>
              <h3 className="text-base font-semibold text-primary">{collection.title}</h3>
              {collection.description ? (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {collection.description}
                </p>
              ) : null}
              <p className="mt-3 text-xs text-muted-foreground">
                {collection._count.games} игр
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border border-border bg-card p-4 text-sm text-muted-foreground">
          Коллекций пока нет.
        </p>
      )}
    </section>
  )
}
