"use server"

import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

import { authOptions } from "@/auth"
import { createCollectionSchema } from "@/lib/collection-validation"
import { prisma } from "@/lib/prisma"

export async function createCollection(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || !session.user.username) {
    throw new Error("Нужно войти, чтобы создать коллекцию.")
  }

  const data = createCollectionSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  })

  await prisma.collection.create({
    data: {
      userId: session.user.id,
      title: data.title,
      description: data.description,
    },
  })

  revalidatePath(`/profile/${session.user.username}`)
  revalidatePath("/")
}
