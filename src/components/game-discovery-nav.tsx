import {
  CalendarDays,
  Flame,
  Folder,
  Gamepad2,
  Monitor,
  Play,
  Star,
  Trophy,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Link from "next/link"

type DiscoveryItem = {
  href: string
  icon: LucideIcon
  label: string
}

type GameDiscoveryNavProps = {
  filters: Record<string, string | undefined>
}

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.toISOString().slice(0, 7)

const sections: { title: string; items: DiscoveryItem[] }[] = [
  {
    title: "Новые релизы",
    items: [
      { href: "/?period=month&ordering=release", icon: Star, label: "За 30 дней" },
      { href: "/?period=week&ordering=release", icon: Flame, label: "На этой неделе" },
      { href: "/?period=next-week&ordering=release", icon: Play, label: "Следующая неделя" },
      { href: `/?period=month&ordering=release&month=${currentMonth}`, icon: CalendarDays, label: "Календарь релизов" },
    ],
  },
  {
    title: "Топ",
    items: [
      { href: "/?period=year&ordering=rating", icon: Trophy, label: "Лучшее за год" },
      { href: "/?period=year&ordering=popularity", icon: Flame, label: `Популярное в ${currentYear}` },
      { href: "/?period=all&ordering=rating", icon: Star, label: "Топ за все время" },
    ],
  },
  {
    title: "Все игры",
    items: [
      { href: "/?period=all&ordering=popularity", icon: Gamepad2, label: "Вся библиотека" },
      { href: "/?view=collections", icon: Folder, label: "Коллекции" },
    ],
  },
  {
    title: "Платформы",
    items: [
      { href: "/?period=all&ordering=popularity&platform=pc", icon: Monitor, label: "PC" },
      { href: "/?period=all&ordering=popularity&platform=playstation", icon: Gamepad2, label: "PlayStation" },
      { href: "/?period=all&ordering=popularity&platform=xbox", icon: Gamepad2, label: "Xbox" },
    ],
  },
]

function isActive(href: string, filters: Record<string, string | undefined>) {
  const params = new URLSearchParams(href.split("?")[1] ?? "")

  for (const key of ["view", "period", "ordering", "genre", "platform", "month"]) {
    if (params.get(key) !== (filters[key] ?? null)) return false
  }

  return Array.from(params.keys()).length > 0
}

export function GameDiscoveryNav({ filters }: GameDiscoveryNavProps) {
  return (
    <nav aria-label="Фильтры каталога" className="terminal-window space-y-5 p-4">
      {sections.map((section, index) => (
        <section aria-labelledby={`discovery-${index}`} key={section.title}>
          <h2
            className="mb-3 text-xl font-semibold tracking-tight text-foreground"
            id={`discovery-${index}`}
          >
            {section.title}
          </h2>
          <ul className="space-y-2">
            {section.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href, filters)

              return (
                <li key={item.href}>
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={`retro-tab group flex min-h-11 items-center gap-3 px-1 ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent text-foreground hover:border-border hover:bg-card hover:text-primary"
                    }`}
                    href={item.href}
                    scroll={false}
                  >
                    <span className={`flex size-8 shrink-0 items-center justify-center border bg-secondary transition-colors ${
                      active
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground group-hover:border-primary group-hover:text-primary"
                    }`}>
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </nav>
  )
}
