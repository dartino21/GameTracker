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
