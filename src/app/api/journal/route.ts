import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { authOptions } from "@/auth"
import { getGameByRawgId, RawgGameNotFoundError } from "@/lib/games"
import { createJournalEntrySchema } from "@/lib/journal-validation"
import { prisma } from "@/lib/prisma"

async function getCurrentUserId() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  return session.user.id
}

function validationError(error: ZodError) {
  return NextResponse.json(
    {
      error: "Invalid request body.",
      issues: error.issues,
    },
    { status: 400 },
  )
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  try {
    const input = createJournalEntrySchema.parse(await request.json())
    const game = await getGameByRawgId(input.rawgId)

    const journalEntry = await prisma.userGame.create({
      data: {
        userId,
        gameId: game.id,
        status: input.status,
        rating: input.rating ?? null,
        completedDate: input.completedDate ?? null,
        notes: input.notes ?? null,
      },
      include: {
        game: true,
      },
    })

    return NextResponse.json(journalEntry, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error)
    }

    if (error instanceof RawgGameNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Game is already in your journal." },
        { status: 409 },
      )
    }

    return NextResponse.json(
      { error: "Failed to create journal entry." },
      { status: 500 },
    )
  }
}
