"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

import { GameSearch, type GameSearchResult } from "@/components/game-search"
import { cn } from "@/lib/utils"

type HeaderSearchProps = {
  className?: string
}

export function HeaderSearch({ className }: HeaderSearchProps) {
  const router = useRouter()

  const onSelect = useCallback(
    (game: GameSearchResult) => {
      router.push(`/games/${game.id}`)
    },
    [router],
  )

  return (
    <GameSearch
      className={cn("max-w-md", className)}
      onSelect={onSelect}
      placeholder="$ найти игру…"
    />
  )
}
