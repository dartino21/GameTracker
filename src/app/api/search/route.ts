import { NextResponse } from "next/server";

const RAWG_API_URL = "https://api.rawg.io/api/games";
const CACHE_TTL_MS = 60 * 60 * 1000;

type RawgPlatform = {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
};

type RawgGenre = {
  id: number;
  name: string;
  slug: string;
};

type RawgGame = {
  id: number;
  slug: string;
  name: string;
  released: string | null;
  background_image: string | null;
  rating: number;
  metacritic: number | null;
  platforms?: RawgPlatform[];
  genres?: RawgGenre[];
};

type RawgSearchResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGame[];
};

type CacheEntry = {
  expiresAt: number;
  data: RawgSearchResponse;
};

declare global {
  var rawgSearchCache: Map<string, CacheEntry> | undefined;
}

const searchCache = globalThis.rawgSearchCache ?? new Map<string, CacheEntry>();
globalThis.rawgSearchCache = searchCache;

function getCachedSearch(cacheKey: string) {
  const cached = searchCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    searchCache.delete(cacheKey);
    return null;
  }

  return cached.data;
}

function sanitizeRawgSearchResponse(data: RawgSearchResponse): RawgSearchResponse {
  return {
    ...data,
    next: data.next ? "/api/search" : null,
    previous: data.previous ? "/api/search" : null,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Search query parameter `q` is required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.RAWG_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "RAWG_API_KEY is not configured." },
      { status: 500 },
    );
  }

  const cacheKey = query.toLowerCase();
  const cached = getCachedSearch(cacheKey);

  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "X-Cache": "HIT",
      },
    });
  }

  const rawgUrl = new URL(RAWG_API_URL);
  rawgUrl.search = new URLSearchParams({
    key: apiKey,
    search: query,
    page_size: "20",
  }).toString();

  const response = await fetch(rawgUrl, { cache: "no-store" });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch games from RAWG." },
      { status: 502 },
    );
  }

  const data = sanitizeRawgSearchResponse(
    (await response.json()) as RawgSearchResponse,
  );

  searchCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "X-Cache": "MISS",
    },
  });
}
