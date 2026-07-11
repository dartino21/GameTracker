import { z } from "zod"

export const createCollectionSchema = z.object({
  title: z.string().trim().min(2, "Название слишком короткое").max(80, "Название слишком длинное"),
  description: z.string().trim().max(240, "Описание слишком длинное").optional(),
})
