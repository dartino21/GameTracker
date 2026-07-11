"use client"

import { useRouter, useSearchParams } from "next/navigation"

import type { PopularGameFilters } from "@/lib/games"

const orderingOptions = [["popularity", "Популярность"], ["rating", "Рейтинг"], ["release", "Новинки"]] as const
const genreOptions = [["", "Все жанры"], ["action", "Экшен"], ["adventure", "Приключения"], ["indie", "Инди"], ["platformer", "Платформеры"], ["rpg", "RPG"], ["shooter", "Шутеры"], ["strategy", "Стратегии"]] as const
const platformOptions = [["", "Все платформы"], ["pc", "PC"], ["playstation", "PlayStation"], ["xbox", "Xbox"]] as const

type PopularGamesFiltersProps = PopularGameFilters & {
  calendarMonth: string
  isReleaseCalendar: boolean
}

export function PopularGamesFilters({ ordering, genre, platform, calendarMonth, isReleaseCalendar }: PopularGamesFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const calendarYear = Number(calendarMonth.slice(0, 4))
  const calendarMonthNumber = calendarMonth.slice(5, 7)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 11 }, (_, index) => currentYear + 1 - index)

  function updateFilter(name: "ordering" | "genre" | "platform", value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(name, value)
    else params.delete(name)

    if (name === "ordering") {
      if (value === "release") {
        params.set("period", "month")
        if (!params.get("month")) params.set("month", new Date().toISOString().slice(0, 7))
      } else {
        params.delete("month")
      }
    }

    params.delete("page")
    router.replace(`/?${params.toString()}`, { scroll: false })
  }

  function updateCalendarYear(year: string) {
    const params = new URLSearchParams(searchParams)
    params.set("period", "month")
    params.set("ordering", "release")
    params.set("month", `${year}-${calendarMonthNumber}`)
    params.delete("page")
    router.replace(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <>
      <div className="mt-3 grid gap-2 border-l-2 border-primary pl-3 sm:grid-cols-3">
      <label>
        <span className="sr-only">Сортировка</span>
        <select className="h-9 w-full border border-input bg-background px-2 text-sm" onChange={(event) => updateFilter("ordering", event.target.value)} value={ordering}>
          {orderingOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label>
        <span className="sr-only">Жанр</span>
        <select className="h-9 w-full border border-input bg-background px-2 text-sm" onChange={(event) => updateFilter("genre", event.target.value)} value={genre ?? ""}>
          {genreOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label>
        <span className="sr-only">Платформа</span>
        <select className="h-9 w-full border border-input bg-background px-2 text-sm" onChange={(event) => updateFilter("platform", event.target.value)} value={platform ?? ""}>
          {platformOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      </div>
      {isReleaseCalendar ? (
        <label className="mt-3 flex w-fit items-center gap-2 text-sm text-muted-foreground">
          <span>Год:</span>
          <select
            aria-label="Год календаря релизов"
            className="h-8 border border-input bg-background px-2 text-sm text-foreground"
            onChange={(event) => updateCalendarYear(event.target.value)}
            value={calendarYear}
          >
            {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
      ) : null}
    </>
  )
}
