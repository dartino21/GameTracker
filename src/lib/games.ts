import { prisma } from "@/lib/prisma"

const RAWG_GAMES_API_URL = "https://api.rawg.io/api/games"

type RawgPlatform = {
  platform?: {
    name?: string | null
  } | null
}

type RawgGenre = {
  name?: string | null
}

type RawgGameDetails = {
  id: number
  name: string
  released: string | null
  background_image: string | null
  description_raw?: string | null
  rating?: number | null
  ratings_count?: number | null
  platforms?: RawgPlatform[] | null
  genres?: RawgGenre[] | null
}

type RawgScreenshot = {
  id: number
  image: string
}

type RawgScreenshotsResponse = {
  results?: RawgScreenshot[] | null
}

type RawgStoreLink = {
  id: number
  url?: string | null
  store?: {
    name?: string | null
    domain?: string | null
  } | null
}

type RawgStoresResponse = {
  results?: RawgStoreLink[] | null
}

type StoreLink = {
  id: string
  name: string
  domain: string | null
  url: string
}

export class RawgGameNotFoundError extends Error {
  constructor(rawgId: number) {
    super(`RAWG game with id ${rawgId} was not found.`)
    this.name = "RawgGameNotFoundError"
  }
}

function getRawgApiKey() {
  const apiKey = process.env.RAWG_API_KEY

  if (!apiKey) {
    throw new Error("RAWG_API_KEY is not configured.")
  }

  return apiKey
}

function parseReleaseDate(released: string | null) {
  if (!released) {
    return null
  }

  const releaseDate = new Date(`${released}T00:00:00.000Z`)

  if (Number.isNaN(releaseDate.getTime())) {
    return null
  }

  return releaseDate
}

function getPlatformNames(platforms: RawgPlatform[] | null | undefined) {
  return (
    platforms
      ?.map((item) => item.platform?.name)
      .filter((name): name is string => Boolean(name)) ?? []
  )
}

function getGenreNames(genres: RawgGenre[] | null | undefined) {
  return genres?.map((genre) => genre.name).filter((name): name is string => Boolean(name)) ?? []
}

async function fetchRawgGameById(rawgId: number) {
  const rawgUrl = new URL(`${RAWG_GAMES_API_URL}/${rawgId}`)
  rawgUrl.search = new URLSearchParams({ key: getRawgApiKey() }).toString()

  const response = await fetch(rawgUrl, { cache: "no-store" })

  if (response.status === 404) {
    throw new RawgGameNotFoundError(rawgId)
  }

  if (!response.ok) {
    throw new Error("Failed to fetch game from RAWG.")
  }

  return (await response.json()) as RawgGameDetails
}

async function fetchRawgScreenshots(rawgId: number) {
  const rawgUrl = new URL(`${RAWG_GAMES_API_URL}/${rawgId}/screenshots`)
  rawgUrl.search = new URLSearchParams({ key: getRawgApiKey() }).toString()

  const response = await fetch(rawgUrl, {
    next: { revalidate: 60 * 60 * 24 },
  })

  if (!response.ok) {
    return []
  }

  const data = (await response.json()) as RawgScreenshotsResponse

  return (data.results ?? [])
    .filter((screenshot) => Boolean(screenshot.image))
    .slice(0, 6)
}

async function fetchRawgStores(rawgId: number) {
  const rawgUrl = new URL(`${RAWG_GAMES_API_URL}/${rawgId}/stores`)
  rawgUrl.search = new URLSearchParams({ key: getRawgApiKey() }).toString()

  const response = await fetch(rawgUrl, {
    next: { revalidate: 60 * 60 * 24 },
  })

  if (!response.ok) {
    return []
  }

  const data = (await response.json()) as RawgStoresResponse

  return (data.results ?? [])
    .filter((store) => Boolean(store.url && store.store?.name))
    .map((store) => ({
      id: `rawg-${store.id}`,
      name: store.store?.name ?? "Магазин",
      domain: store.store?.domain ?? null,
      url: store.url as string,
    }))
    .slice(0, 5)
}

function getFallbackStoreLinks(gameTitle: string): StoreLink[] {
  const searchTerm = encodeURIComponent(gameTitle)

  return [
    {
      id: "steam-search",
      name: "Steam",
      domain: "store.steampowered.com",
      url: `https://store.steampowered.com/search/?term=${searchTerm}`,
    },
    {
      id: "gog-search",
      name: "GOG",
      domain: "gog.com",
      url: `https://www.gog.com/en/games?query=${searchTerm}`,
    },
    {
      id: "epic-search",
      name: "Epic Games Store",
      domain: "store.epicgames.com",
      url: `https://store.epicgames.com/en-US/browse?q=${searchTerm}&sortBy=relevancy&sortDir=DESC&count=40`,
    },
  ]
}

function mergeStoreLinks(rawgStores: StoreLink[], gameTitle: string) {
  const storesByName = new Map<string, StoreLink>()

  for (const store of rawgStores) {
    storesByName.set(store.name.toLowerCase(), store)
  }

  for (const store of getFallbackStoreLinks(gameTitle)) {
    if (!storesByName.has(store.name.toLowerCase())) {
      storesByName.set(store.name.toLowerCase(), store)
    }
  }

  return Array.from(storesByName.values()).slice(0, 6)
}

export type PopularGame = {
  id: number
  name: string
  released: string | null
  background_image: string | null
  rating: number
  genres: string[]
}

const popularPeriods = ["week", "month", "year", "next-week", "all"] as const
const popularOrderings = ["popularity", "rating", "release"] as const
const popularGenres = ["action", "adventure", "indie", "platformer", "rpg", "shooter", "strategy"] as const
const popularPlatforms = ["pc", "playstation", "xbox"] as const

export type PopularGameFilters = {
  period: (typeof popularPeriods)[number]
  ordering: (typeof popularOrderings)[number]
  genre?: (typeof popularGenres)[number]
  platform?: (typeof popularPlatforms)[number]
}

export type PopularGamesResult = {
  games: PopularGame[]
  page: number
  pageCount: number
}

export function getPopularGameFilters(
  filters: { period?: string; ordering?: string; genre?: string; platform?: string } = {},
): PopularGameFilters {
  return {
    period: (popularPeriods.includes(filters.period as PopularGameFilters["period"])
      ? filters.period
      : "year") as PopularGameFilters["period"],
    ordering: (popularOrderings.includes(filters.ordering as PopularGameFilters["ordering"])
      ? filters.ordering
      : "popularity") as PopularGameFilters["ordering"],
    genre: (popularGenres.includes(filters.genre as NonNullable<PopularGameFilters["genre"]>)
      ? filters.genre
      : undefined) as PopularGameFilters["genre"],
    platform: (popularPlatforms.includes(filters.platform as NonNullable<PopularGameFilters["platform"]>)
      ? filters.platform
      : undefined) as PopularGameFilters["platform"],
  }
}

type RawgPopularGame = {
  id: number
  name: string
  released: string | null
  background_image: string | null
  rating: number
  genres?: RawgGenre[] | null
}

type RawgPopularResponse = {
  count?: number | null
  results?: RawgPopularGame[] | null
}

export async function getPopularGames(
  limit = 24,
  filters: { period?: string; ordering?: string; genre?: string; platform?: string; page?: string; month?: string } = {},
): Promise<PopularGamesResult> {
  const { period, ordering, genre, platform } = getPopularGameFilters(filters)
  const page = Math.max(1, Number.parseInt(filters.page ?? "1", 10) || 1)
  const now = new Date()
  const fromDate = new Date(now)
  const toDate = new Date(now)
  if (period === "week") fromDate.setDate(now.getDate() - 7)
  if (period === "month") fromDate.setMonth(now.getMonth() - 1)
  if (period === "year") fromDate.setFullYear(now.getFullYear() - 1)
  if (period === "next-week") {
    fromDate.setDate(now.getDate() + 1)
    toDate.setDate(now.getDate() + 7)
  }
  const selectedMonth = Number(filters.month?.slice(5, 7))
  if (period === "month" && filters.month?.match(/^\d{4}-\d{2}$/) && selectedMonth >= 1 && selectedMonth <= 12) {
    const [year, month] = filters.month.split("-").map(Number)
    fromDate.setFullYear(year, month - 1, 1)
    toDate.setFullYear(year, month, 0)
  }

  const toIso = (date: Date) => date.toISOString().slice(0, 10)

  const rawgUrl = new URL(RAWG_GAMES_API_URL)
  rawgUrl.search = new URLSearchParams({
    key: getRawgApiKey(),
    ordering: {
      popularity: "-added",
      rating: "-rating",
      release: "-released",
    }[ordering],
    page: String(page),
    page_size: String(limit),
    ...(period === "all" ? {} : { dates: `${toIso(fromDate)},${toIso(toDate)}` }),
    ...(genre ? { genres: genre } : {}),
    ...(platform ? { platforms: { pc: "4", playstation: "18", xbox: "1" }[platform] } : {}),
  }).toString()

  const response = await fetch(rawgUrl, {
    next: { revalidate: 60 * 60 },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch popular games from RAWG.")
  }

  const data = (await response.json()) as RawgPopularResponse

  return {
    games: (data.results ?? []).map((game) => ({
      id: game.id,
      name: game.name,
      released: game.released,
      background_image: game.background_image,
      rating: game.rating,
      genres: getGenreNames(game.genres),
    })),
    page,
    pageCount: Math.max(1, Math.ceil((data.count ?? 0) / limit)),
  }
}

export async function getGameByRawgId(rawgId: number) {
  if (!Number.isInteger(rawgId) || rawgId <= 0) {
    throw new RangeError("rawgId must be a positive integer.")
  }

  const existingGame = await prisma.game.findUnique({
    where: { rawgId },
  })

  if (existingGame) {
    return existingGame
  }

  const rawgGame = await fetchRawgGameById(rawgId)
  const gameData = {
    rawgId: rawgGame.id,
    title: rawgGame.name,
    coverUrl: rawgGame.background_image,
    platforms: getPlatformNames(rawgGame.platforms),
    genres: getGenreNames(rawgGame.genres),
    releaseDate: parseReleaseDate(rawgGame.released),
  }

  return prisma.game.upsert({
    where: { rawgId: rawgGame.id },
    create: gameData,
    update: gameData,
  })
}

export async function getGamePageDetails(rawgId: number) {
  if (!Number.isInteger(rawgId) || rawgId <= 0) {
    throw new RangeError("rawgId must be a positive integer.")
  }

  const [rawgGame, screenshots, stores] = await Promise.all([
    fetchRawgGameById(rawgId),
    fetchRawgScreenshots(rawgId),
    fetchRawgStores(rawgId),
  ])

  const gameData = {
    rawgId: rawgGame.id,
    title: rawgGame.name,
    coverUrl: rawgGame.background_image,
    platforms: getPlatformNames(rawgGame.platforms),
    genres: getGenreNames(rawgGame.genres),
    releaseDate: parseReleaseDate(rawgGame.released),
  }

  const game = await prisma.game.upsert({
    where: { rawgId: rawgGame.id },
    create: gameData,
    update: gameData,
  })

  return {
    ...game,
    description: rawgGame.description_raw?.trim() || null,
    rawgRating: rawgGame.rating ?? null,
    rawgRatingsCount: rawgGame.ratings_count ?? null,
    screenshots,
    stores: mergeStoreLinks(stores, rawgGame.name),
  }
}
