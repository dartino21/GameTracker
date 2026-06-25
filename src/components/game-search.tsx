"use client"

import { Gamepad2, Loader2, Search, X } from "lucide-react"
import Image from "next/image"
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type RawgPlatform = {
  platform: {
    id: number
    name: string
    slug: string
  }
}

type RawgGenre = {
  id: number
  name: string
  slug: string
}

export type GameSearchResult = {
  id: number
  slug: string
  name: string
  released: string | null
  background_image: string | null
  rating: number
  metacritic: number | null
  platforms?: RawgPlatform[]
  genres?: RawgGenre[]
}

type SearchResponse = {
  results: GameSearchResult[]
}

type GameSearchProps = {
  className?: string
  onSelect?: (game: GameSearchResult) => void
  placeholder?: string
}

const DEBOUNCE_MS = 350
const MIN_QUERY_LENGTH = 2

function getReleaseYear(released: string | null) {
  return released ? new Date(released).getFullYear() : null
}

function getPlatformSummary(game: GameSearchResult) {
  return game.platforms
    ?.slice(0, 3)
    .map((item) => item.platform.name)
    .join(", ")
}

export function GameSearch({
  className,
  onSelect,
  placeholder = "Search games",
}: GameSearchProps) {
  const inputId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<GameSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const normalizedQuery = query.trim()
  const canSearch = normalizedQuery.length >= MIN_QUERY_LENGTH
  const listboxId = `${inputId}-results`

  const visibleResults = useMemo(() => results.slice(0, 8), [results])

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }

    document.addEventListener("pointerdown", onPointerDown)

    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [])

  useEffect(() => {
    if (!canSearch) {
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(normalizedQuery)}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error("Search request failed.")
        }

        const data = (await response.json()) as SearchResponse
        setResults(data.results ?? [])
        setIsOpen(true)
        setActiveIndex(-1)
      } catch (searchError) {
        if (searchError instanceof DOMException && searchError.name === "AbortError") {
          return
        }

        setResults([])
        setError("Could not load games.")
        setIsOpen(true)
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, DEBOUNCE_MS)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [canSearch, normalizedQuery])

  const selectGame = useCallback(
    (game: GameSearchResult) => {
      setQuery(game.name)
      setIsOpen(false)
      setActiveIndex(-1)
      onSelect?.(game)
    },
    [onSelect],
  )

  function onQueryChange(value: string) {
    setQuery(value)
    setIsOpen(true)

    if (value.trim().length < MIN_QUERY_LENGTH) {
      setResults([])
      setError(null)
      setIsLoading(false)
      setActiveIndex(-1)
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setIsOpen(true)
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) =>
        Math.min(index + 1, visibleResults.length - 1),
      )
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault()
      selectGame(visibleResults[activeIndex])
    }

    if (event.key === "Escape") {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  function clearSearch() {
    setQuery("")
    setResults([])
    setError(null)
    setIsOpen(false)
    setActiveIndex(-1)
  }

  return (
    <div className={cn("relative w-full", className)} ref={rootRef}>
      <label className="sr-only" htmlFor={inputId}>
        Search games
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
        />
        <input
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          className="h-10 w-full rounded-md border border-input bg-background px-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
          id={inputId}
          onChange={(event) => {
            onQueryChange(event.target.value)
          }}
          onFocus={() => {
            if (canSearch) {
              setIsOpen(true)
            }
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          role="combobox"
          type="search"
          value={query}
        />
        {query ? (
          <Button
            aria-label="Clear search"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={clearSearch}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      {isOpen && canSearch ? (
        <div
          className="absolute z-20 mt-2 max-h-96 w-full overflow-y-auto rounded-md border border-zinc-200 bg-white py-1 shadow-lg"
          id={listboxId}
          role="listbox"
        >
          {isLoading ? (
            <div className="flex h-16 items-center gap-2 px-3 text-sm text-zinc-500">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Loading games
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="px-3 py-4 text-sm text-destructive">{error}</div>
          ) : null}

          {!isLoading && !error && visibleResults.length === 0 ? (
            <div className="px-3 py-4 text-sm text-zinc-500">
              No games found
            </div>
          ) : null}

          {!isLoading && !error
            ? visibleResults.map((game, index) => {
                const releaseYear = getReleaseYear(game.released)
                const platformSummary = getPlatformSummary(game)

                return (
                  <button
                    aria-selected={activeIndex === index}
                    className={cn(
                      "flex min-h-20 w-full gap-3 px-3 py-2 text-left transition-colors hover:bg-zinc-100",
                      activeIndex === index && "bg-zinc-100",
                    )}
                    id={`${listboxId}-${index}`}
                    key={game.id}
                    onClick={() => selectGame(game)}
                    role="option"
                    type="button"
                  >
                    {game.background_image ? (
                      <Image
                        alt=""
                        className="h-16 w-12 shrink-0 rounded object-cover ring-1 ring-zinc-200"
                        height={64}
                        src={game.background_image}
                        unoptimized
                        width={48}
                      />
                    ) : (
                      <span className="flex h-16 w-12 shrink-0 items-center justify-center rounded bg-zinc-100 text-zinc-400 ring-1 ring-zinc-200">
                        <Gamepad2 className="size-5" aria-hidden="true" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-zinc-950">
                        {game.name}
                      </span>
                      <span className="mt-1 block truncate text-xs text-zinc-500">
                        {[releaseYear, platformSummary]
                          .filter(Boolean)
                          .join(" - ") || "RAWG"}
                      </span>
                      {game.genres?.length ? (
                        <span className="mt-2 block truncate text-xs text-zinc-500">
                          {game.genres
                            .slice(0, 3)
                            .map((genre) => genre.name)
                            .join(", ")}
                        </span>
                      ) : null}
                    </span>
                  </button>
                )
              })
            : null}
        </div>
      ) : null}
    </div>
  )
}
