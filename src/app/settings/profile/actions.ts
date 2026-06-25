"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"

import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"])
const maxAvatarSize = 700 * 1024

export type AvatarUploadState = {
  error?: string
  message?: string
}

async function getCurrentUserId() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  return session.user.id
}

export async function updateAvatar(
  _previousState: AvatarUploadState,
  formData: FormData,
): Promise<AvatarUploadState> {
  const userId = await getCurrentUserId()
  const intent = formData.get("intent")

  if (intent === "remove") {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: { username: true },
    })

    revalidatePath("/settings/profile")

    if (user.username) {
      revalidatePath(`/profile/${user.username}`)
    }

    return { message: "Аватар удалён" }
  }

  const avatar = formData.get("avatar")

  if (!(avatar instanceof File) || avatar.size === 0) {
    return { error: "Выберите изображение" }
  }

  if (!allowedImageTypes.has(avatar.type)) {
    return { error: "Поддерживаются только JPG, PNG и WebP" }
  }

  if (avatar.size > maxAvatarSize) {
    return { error: "Файл должен быть не больше 700 KB" }
  }

  const bytes = Buffer.from(await avatar.arrayBuffer())
  const avatarUrl = `data:${avatar.type};base64,${bytes.toString("base64")}`

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    select: { username: true },
  })

  revalidatePath("/settings/profile")

  if (user.username) {
    revalidatePath(`/profile/${user.username}`)
  }

  return { message: "Аватар обновлён" }
}
