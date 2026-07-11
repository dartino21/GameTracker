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
        "group inline-flex min-h-10 select-none items-center border border-border px-3 leading-none hover:border-primary",
        className,
      )}
      href="/"
    >
      <span className="text-sm font-bold tracking-[0.18em] text-primary">GT</span>
      <span className="ml-2 text-xs tracking-wider text-foreground">GAMETRACKER</span>
    </Link>
  )
}
