import Link from "next/link"

import { cn } from "@/lib/utils"

type HorseLogoProps = {
  className?: string
}

export function HorseLogo({ className }: HorseLogoProps) {
  return (
    <Link
      aria-label="GameTracker — на главную"
      className={cn(
        "group inline-flex select-none flex-col items-center gap-1 leading-none",
        className,
      )}
      href="/"
    >
      <span className="text-xl font-extrabold tracking-tight text-primary">
        Game
        <span className="text-accent-foreground">Tracker</span>
      </span>

      <span
        aria-hidden="true"
        className="relative flex h-7 w-28 items-end justify-center overflow-hidden"
      >
        <span className="horse-dust absolute bottom-1 left-6 size-1.5 rounded-full bg-muted-foreground" />
        <span className="horse-dust absolute bottom-2 left-7 size-1 rounded-full bg-muted-foreground" />
        <span className="horse-dust absolute bottom-0.5 left-8 size-1 rounded-full bg-muted-foreground" />

        <span className="horse-runner relative z-10 text-2xl">🐎</span>

        <span className="horse-track absolute inset-x-0 bottom-0 h-[3px] rounded-full opacity-80" />
      </span>
    </Link>
  )
}
