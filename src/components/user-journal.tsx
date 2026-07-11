"use client"

import { ArrowDownUp, CalendarDays, Gamepad2, Star } from "lucide-react"
import Image from "next/image"
import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"

type GameStatus = "Playing" | "Completed" | "Dropped" | "PlanToPlay"
type StatusFilter = "All" | GameStatus
type SortMode =
  | "createdAt-desc"
  | "createdAt-asc"
  | "rating-desc"
  | "rating-asc"

export type UserJournalEntry = {
  id: string
  status: GameStatus
  rating: number | null
  completedDate: string | null
  createdAt: string
  notes: string | null
  game: {
    title: string
    coverUrl: string | null
    platforms: string[]
    genres: string[]
    releaseDate: string | null
  }
}

type UserJournalProps = {
  entries: UserJournalEntry[]
}

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "All", label: "Все" },
  { value: "Playing", label: "Играю" },
  { value: "Completed", label: "Пройдено" },
  { value: "Dropped", label: "Заброшено" },
  { value: "PlanToPlay", label: "В планах" },
]

const statusLabels: Record<GameStatus, string> = {
  Playing: "Играю",
  Completed: "Пройдено",
  Dropped: "Заброшено",
  PlanToPlay: "В планах",
}

const sortOptions: Array<{ value: SortMode; label: string }> = [
  { value: "createdAt-desc", label: "Сначала новые" },
  { value: "createdAt-asc", label: "Сначала старые" },
  { value: "rating-desc", label: "Оценка выше" },
  { value: "rating-asc", label: "Оценка ниже" },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value))
}

function getReleaseYear(value: string | null) {
  return value ? new Date(value).getFullYear() : null
}

function compareNullableRating(
  first: number | null,
  second: number | null,
  direction: "asc" | "desc",
) {
  const emptyValue = direction === "desc" ? -1 : 11
  const firstRating = first ?? emptyValue
  const secondRating = second ?? emptyValue

  return direction === "desc"
    ? secondRating - firstRating
    : firstRating - secondRating
}

export function UserJournal({ entries }: UserJournalProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [sortMode, setSortMode] = useState<SortMode>("createdAt-desc")

  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        return statusFilter === "All" || entry.status === statusFilter
      })
      .sort((first, second) => {
        if (sortMode === "rating-desc") {
          return compareNullableRating(first.rating, second.rating, "desc")
        }

        if (sortMode === "rating-asc") {
          return compareNullableRating(first.rating, second.rating, "asc")
        }

        const firstTime = new Date(first.createdAt).getTime()
        const secondTime = new Date(second.createdAt).getTime()

        return sortMode === "createdAt-desc"
          ? secondTime - firstTime
          : firstTime - secondTime
      })
  }, [entries, sortMode, statusFilter])

  return (
    <section>
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Мой журнал</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredEntries.length} из {entries.length} игр
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-1 border border-border bg-card p-1">
            {statusOptions.map((option) => (
              <button
                className={cn(
                  "h-8 rounded px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  statusFilter === option.value &&
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="relative block sm:w-48">
            <span className="sr-only">Сортировка</span>
            <ArrowDownUp
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <select
              className="h-10 w-full appearance-none rounded-md border border-input bg-background px-9 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20"
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              value={sortMode}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {filteredEntries.length > 0 ? (
        <div className="grid gap-px border border-border bg-border lg:grid-cols-2">
          {filteredEntries.map((entry) => {
            const releaseYear = getReleaseYear(entry.game.releaseDate)
            const meta = [
              releaseYear,
              entry.game.platforms.slice(0, 3).join(", "),
            ].filter(Boolean)

            return (
              <article
                className="overflow-hidden bg-card"
                key={entry.id}
              >
                <div className="flex gap-4 p-4">
                  {entry.game.coverUrl ? (
                    <Image
                      alt=""
                      className="h-32 w-24 shrink-0 rounded object-cover ring-1 ring-border"
                      height={128}
                      src={entry.game.coverUrl}
                      unoptimized
                      width={96}
                    />
                  ) : (
                    <div className="flex h-32 w-24 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground ring-1 ring-border">
                      <Gamepad2 className="size-7" aria-hidden="true" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 font-medium leading-6">
                          {entry.game.title}
                        </h3>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {meta.join(" - ") || "GameTracker"}
                        </p>
                      </div>
                      <span className="shrink-0 border border-border bg-secondary px-2 py-1 text-xs font-medium text-primary">
                        {statusLabels[entry.status]}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {entry.rating ? (
                        <span className="flex items-center gap-1 font-medium text-primary">
                          <Star
                            className="size-4 fill-primary"
                            aria-hidden="true"
                          />
                          {entry.rating}/10
                        </span>
                      ) : null}
                      <span className="flex items-center gap-1">
                        <CalendarDays className="size-4" aria-hidden="true" />
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>

                    {entry.game.genres.length > 0 ? (
                      <p className="mt-3 truncate text-xs text-muted-foreground">
                        {entry.game.genres.slice(0, 4).join(", ")}
                      </p>
                    ) : null}
                  </div>
                </div>

                {entry.notes || entry.completedDate ? (
                  <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                    {entry.completedDate ? (
                      <p className="text-xs text-muted-foreground">
                        Пройдено {formatDate(entry.completedDate)}
                      </p>
                    ) : null}
                    {entry.notes ? (
                      <p className="mt-2 line-clamp-2">{entry.notes}</p>
                    ) : null}
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="border border-dashed border-border bg-card px-5 py-10 text-center">
          <Gamepad2
            className="mx-auto size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="mt-3 font-medium">В журнале пока пусто</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Записи появятся здесь после добавления игр.
          </p>
        </div>
      )}
    </section>
  )
}
