"use client"

import { useRouter, useSearchParams } from "next/navigation"

import type { PopularGameFilters } from "@/lib/games"

const periodOptions = [["week", "Неделя"], ["month", "Месяц"], ["year", "Год"], ["next-week", "Следующая неделя"], ["all", "Все время"]] as const
const orderingOptions = [["popularity", "Популярность"], ["rating", "Рейтинг"], ["release", "Новинки"]] as const
const genreOptions = [["", "Все жанры"], ["action", "Экшен"], ["adventure", "Приключения"], ["indie", "Инди"], ["platformer", "Платформеры"], ["rpg", "RPG"], ["shooter", "Шутеры"], ["strategy", "Стратегии"]] as const
const platformOptions = [["", "Все платформы"], ["pc", "PC"], ["playstation", "PlayStation"], ["xbox", "Xbox"]] as const

export function PopularGamesFilters({ period, ordering, genre, platform }: PopularGameFilters) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateFilter(name: "period" | "ordering" | "genre" | "platform", value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(name, value)
    else params.delete(name)
    params.delete("page")
    params.delete("month")
    router.replace(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="mt-3 grid gap-2 border-l-2 border-primary pl-3 sm:grid-cols-2 xl:grid-cols-4">
      <label>
        <span className="sr-only">Период</span>
        <select className="h-9 w-full border border-input bg-background px-2 text-sm" onChange={(event) => updateFilter("period", event.target.value)} value={period}>
          {periodOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
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
  )
}
