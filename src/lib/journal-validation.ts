import { z } from "zod"

import { GameStatus } from "@/generated/prisma/enums"

const gameStatuses = [
  GameStatus.Playing,
  GameStatus.Completed,
  GameStatus.Dropped,
  GameStatus.PlanToPlay,
] as const

const dateValueSchema = z.preprocess(
  (value) => {
    if (value === null) {
      return null
    }

    if (typeof value === "string") {
      const trimmedValue = value.trim()
      return trimmedValue ? new Date(trimmedValue) : null
    }

    return value
  },
  z.date("completedDate must be a valid date.").nullable(),
)

const notesValueSchema = z.preprocess(
  (value) => {
    if (value === null) {
      return null
    }

    if (typeof value === "string") {
      const trimmedValue = value.trim()
      return trimmedValue || null
    }

    return value
  },
  z.string().max(2000, "notes must be 2000 characters or less.").nullable(),
)

const ratingValueSchema = z.number().int().min(1).max(10).nullable()

export const createJournalEntrySchema = z.object({
  rawgId: z.number().int().positive(),
  status: z.enum(gameStatuses).default(GameStatus.PlanToPlay),
  rating: ratingValueSchema.optional(),
  completedDate: dateValueSchema.optional(),
  notes: notesValueSchema.optional(),
})

export const updateJournalEntrySchema = z
  .object({
    status: z.enum(gameStatuses).optional(),
    rating: ratingValueSchema.optional(),
    completedDate: dateValueSchema.optional(),
    notes: notesValueSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  })

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>
