import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { authOptions } from "@/auth"
import { updateJournalEntrySchema } from "@/lib/journal-validation"
import { prisma } from "@/lib/prisma"

type JournalEntryRouteContext = {
  params: Promise<{
    id: string
  }>
}

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

function getUpdateData(input: ReturnType<typeof updateJournalEntrySchema.parse>) {
  return {
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.rating !== undefined ? { rating: input.rating } : {}),
    ...(input.completedDate !== undefined
      ? { completedDate: input.completedDate }
      : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
  }
}

export async function PUT(
  request: Request,
  { params }: JournalEntryRouteContext,
) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { id } = await params

  try {
    const input = updateJournalEntrySchema.parse(await request.json())

    const updateResult = await prisma.userGame.updateMany({
      where: {
        id,
        userId,
      },
      data: getUpdateData(input),
    })

    if (updateResult.count === 0) {
      return NextResponse.json(
        { error: "Journal entry was not found." },
        { status: 404 },
      )
    }

    const journalEntry = await prisma.userGame.findUnique({
      where: { id },
      include: { game: true },
    })

    return NextResponse.json(journalEntry)
  } catch (error) {
    if (error instanceof ZodError) {
      return validationError(error)
    }

    return NextResponse.json(
      { error: "Failed to update journal entry." },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: JournalEntryRouteContext,
) {
  const userId = await getCurrentUserId()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { id } = await params
  const deleteResult = await prisma.userGame.deleteMany({
    where: {
      id,
      userId,
    },
  })

  if (deleteResult.count === 0) {
    return NextResponse.json(
      { error: "Journal entry was not found." },
      { status: 404 },
    )
  }

  return new Response(null, { status: 204 })
}
