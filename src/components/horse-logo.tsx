import Link from "next/link"

import { HalftoneHorse } from "@/app/welcome/halftone-horse"
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
        className="relative flex h-8 w-32 items-end justify-center overflow-hidden"
      >
        <HalftoneHorse
          variant="inline"
          gridSize={3}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />

        <span className="horse-track absolute inset-x-0 bottom-0 h-[3px] rounded-full opacity-80" />
      </span>
    </Link>
  )
}
