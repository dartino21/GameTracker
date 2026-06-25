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
          <p className="mt-1 text-sm text-zinc-500">
            {filteredEntries.length} из {entries.length} игр
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-1 rounded-md border border-zinc-200 bg-white p-1">
            {statusOptions.map((option) => (
              <button
                className={cn(
                  "h-8 rounded px-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950",
                  statusFilter === option.value &&
                    "bg-zinc-900 text-white hover:bg-zinc-900 hover:text-white",
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
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
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
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredEntries.map((entry) => {
            const releaseYear = getReleaseYear(entry.game.releaseDate)
            const meta = [
              releaseYear,
              entry.game.platforms.slice(0, 3).join(", "),
            ].filter(Boolean)

            return (
              <article
                className="overflow-hidden rounded-md border border-zinc-200 bg-white"
                key={entry.id}
              >
                <div className="flex gap-4 p-4">
                  {entry.game.coverUrl ? (
                    <Image
                      alt=""
                      className="h-32 w-24 shrink-0 rounded object-cover ring-1 ring-zinc-200"
                      height={128}
                      src={entry.game.coverUrl}
                      unoptimized
                      width={96}
                    />
                  ) : (
                    <div className="flex h-32 w-24 shrink-0 items-center justify-center rounded bg-zinc-100 text-zinc-400 ring-1 ring-zinc-200">
                      <Gamepad2 className="size-7" aria-hidden="true" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 font-medium leading-6">
                          {entry.game.title}
                        </h3>
                        <p className="mt-1 truncate text-sm text-zinc-500">
                          {meta.join(" - ") || "GameTracker"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                        {statusLabels[entry.status]}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-600">
                      {entry.rating ? (
                        <span className="flex items-center gap-1 font-medium text-zinc-950">
                          <Star
                            className="size-4 fill-zinc-950"
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
                      <p className="mt-3 truncate text-xs text-zinc-500">
                        {entry.game.genres.slice(0, 4).join(", ")}
                      </p>
                    ) : null}
                  </div>
                </div>

                {entry.notes || entry.completedDate ? (
                  <div className="border-t border-zinc-100 px-4 py-3 text-sm text-zinc-600">
                    {entry.completedDate ? (
                      <p className="text-xs text-zinc-500">
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
        <div className="rounded-md border border-dashed border-zinc-300 bg-white px-5 py-10 text-center">
          <Gamepad2
            className="mx-auto size-8 text-zinc-400"
            aria-hidden="true"
          />
          <p className="mt-3 font-medium">В журнале пока пусто</p>
          <p className="mt-1 text-sm text-zinc-500">
            Записи появятся здесь после добавления игр.
          </p>
        </div>
      )}
    </section>
  )
}
