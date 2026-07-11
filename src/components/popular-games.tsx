import { Gamepad2, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { PopularGamesFilters } from "@/components/popular-games-filters"
import { getPopularGameFilters, getPopularGames } from "@/lib/games"

const monthLabels = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"] as const
const monthFullLabels = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"] as const

function getReleaseYear(released: string | null) {
  return released ? new Date(released).getFullYear() : null
}

function getPeriodLabel(period: string) {
  if (period === "week") return "за неделю"
  if (period === "month") return "за месяц"
  if (period === "next-week") return "на следующей неделе"
  if (period === "all") return "за все время"
  return "за год"
}

function getSelectedMonth(value?: string) {
  const month = Number(value?.slice(5, 7))
  return value?.match(/^\d{4}-\d{2}$/) && month >= 1 && month <= 12
    ? value
    : new Date().toISOString().slice(0, 7)
}

type PopularGamesProps = {
  period?: string
  ordering?: string
  genre?: string
  platform?: string
  month?: string
  page?: string
}

function getSectionTitle(filters: PopularGamesProps, selectedMonth: string) {
  if (filters.ordering !== "release" || filters.period !== "month") return "Популярные игры"

  const month = Number(selectedMonth.slice(5, 7)) - 1
  return `Календарь релизов — ${monthFullLabels[month]} ${selectedMonth.slice(0, 4)}`
}

function getPageHref(filters: PopularGamesProps, page: number) {
  const params = new URLSearchParams()

  for (const key of ["period", "ordering", "genre", "platform", "month"] as const) {
    if (filters[key]) params.set(key, filters[key])
  }

  if (page > 1) params.set("page", String(page))

  return `/?${params.toString()}`
}

export async function PopularGames(filters: PopularGamesProps) {
  const selectedFilters = getPopularGameFilters(filters)
  const selectedMonth = getSelectedMonth(filters.month)
  const selectedYear = Number(selectedMonth.slice(0, 4))
  let result

  try {
    result = await getPopularGames(24, filters)
  } catch {
    return (
      <section aria-labelledby="popular-heading">
        <h2
          className="mb-4 text-xl font-semibold tracking-tight"
          id="popular-heading"
        >
          Популярные игры
        </h2>
        <p className="border border-border bg-card p-6 text-sm text-muted-foreground">
          <span className="text-destructive">! ERROR:</span> Не удалось загрузить
          популярные игры. Попробуйте обновить страницу.
        </p>
      </section>
    )
  }

  return (
    <section aria-labelledby="popular-heading">
      <div className="mb-4 border-b border-border pb-3">
        <div className="flex items-baseline justify-between gap-4">
          <h2
            className="text-xl font-semibold tracking-tight"
            id="popular-heading"
          >
            <span className="text-primary">$</span> {getSectionTitle(filters, selectedMonth)}
          </h2>
          <span className="text-sm text-muted-foreground">
            {getPeriodLabel(selectedFilters.period)}
          </span>
        </div>
        <PopularGamesFilters
          {...selectedFilters}
          calendarMonth={selectedMonth}
          isReleaseCalendar={filters.ordering === "release" && filters.period === "month"}
        />
        {filters.ordering === "release" && filters.period === "month" ? (
          <nav
            aria-label="Месяц календаря релизов"
            className="mt-3 flex gap-3 overflow-x-auto text-sm"
          >
            {monthLabels.map((label, index) => {
              const month = `${selectedYear}-${String(index + 1).padStart(2, "0")}`

              return (
                <Link
                  aria-current={month === selectedMonth ? "date" : undefined}
                  className={`retro-tab px-2 py-1 ${
                    month === selectedMonth
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                  href={`/?period=month&ordering=release&month=${month}`}
                  key={month}
                  scroll={false}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        ) : null}
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {result.games.map((game) => {
          const year = getReleaseYear(game.released)

          return (
            <li key={game.id}>
              <Link
                className="group flex h-full flex-col overflow-hidden border border-border bg-card transition-[border-color,background-color,box-shadow] duration-200 hover:border-primary hover:bg-primary/5 hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_22%,transparent)] focus-visible:border-primary"
                href={`/games/${game.id}`}
              >
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {game.background_image ? (
                    <Image
                      alt=""
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 360px"
                      src={game.background_image}
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Gamepad2 className="size-10" aria-hidden="true" />
                    </span>
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/65 to-transparent" />
                  {game.rating > 0 ? (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 border border-primary/60 bg-background/90 px-2 py-0.5 text-xs font-medium text-primary">
                      <Star
                        aria-hidden="true"
                        className="size-3 fill-primary text-primary"
                      />
                      {game.rating.toFixed(1)}
                    </span>
                  ) : null}
                </div>
                <div className="flex min-h-24 flex-1 flex-col p-3">
                  <p className="line-clamp-2 text-pretty text-sm font-medium leading-5 text-foreground">
                    {game.name}
                  </p>
                  <p className="mt-auto pt-2 text-xs leading-4 text-muted-foreground">
                    {[year, game.genres.slice(0, 2).join(", ")]
                      .filter(Boolean)
                      .join(" · ") || "RAWG"}
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <nav
        aria-label="Страницы библиотеки"
        className="mt-6 flex flex-wrap items-center justify-center gap-2"
      >
        {result.page > 1 ? (
          <Link
            className="retro-tab border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary"
            href={getPageHref(filters, result.page - 1)}
            scroll={false}
          >
            ← Назад
          </Link>
        ) : null}

        {Array.from({ length: Math.min(7, result.pageCount) }, (_, index) => {
          const page = Math.max(1, Math.min(result.page - 3, result.pageCount - 6)) + index

          return (
            <Link
              aria-current={page === result.page ? "page" : undefined}
              className={`retro-tab px-3 py-2 text-sm ${
                page === result.page
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
              }`}
              href={getPageHref(filters, page)}
              key={page}
              scroll={false}
            >
              {page}
            </Link>
          )
        })}

        {result.page < result.pageCount ? (
          <Link
            className="retro-tab border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:border-primary hover:text-primary"
            href={getPageHref(filters, result.page + 1)}
            scroll={false}
          >
            Вперёд →
          </Link>
        ) : null}
      </nav>
    </section>
  )
}
