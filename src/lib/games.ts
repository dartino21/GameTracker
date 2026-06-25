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
  platforms?: RawgPlatform[] | null
  genres?: RawgGenre[] | null
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

export type PopularGame = {
  id: number
  name: string
  released: string | null
  background_image: string | null
  rating: number
  genres: string[]
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
  results?: RawgPopularGame[] | null
}

export async function getPopularGames(limit = 8): Promise<PopularGame[]> {
  const now = new Date()
  const fromDate = new Date(now)
  fromDate.setFullYear(now.getFullYear() - 1)

  const toIso = (date: Date) => date.toISOString().slice(0, 10)

  const rawgUrl = new URL(RAWG_GAMES_API_URL)
  rawgUrl.search = new URLSearchParams({
    key: getRawgApiKey(),
    ordering: "-added",
    dates: `${toIso(fromDate)},${toIso(now)}`,
    page_size: String(limit),
  }).toString()

  const response = await fetch(rawgUrl, {
    next: { revalidate: 60 * 60 },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch popular games from RAWG.")
  }

  const data = (await response.json()) as RawgPopularResponse

  return (data.results ?? []).map((game) => ({
    id: game.id,
    name: game.name,
    released: game.released,
    background_image: game.background_image,
    rating: game.rating,
    genres: getGenreNames(game.genres),
  }))
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
