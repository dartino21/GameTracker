import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/auth"
import { AvatarUpload } from "@/components/avatar-upload"
import { SiteHeader } from "@/components/site-header"
import { prisma } from "@/lib/prisma"

export const metadata = {
  title: "Настройки профиля | GameTracker",
}

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/settings/profile")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      username: true,
      name: true,
      avatar: true,
      image: true,
    },
  })

  if (!user) {
    redirect("/login?callbackUrl=/settings/profile")
  }

  const fallbackLabel = user.name || user.username || user.email || "GT"

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 border-x border-border px-5 py-6 sm:px-8 lg:py-8">
        <div className="terminal-window p-5">
          <p className="text-sm text-muted-foreground">Настройки</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Профиль
          </h1>
        </div>

        <AvatarUpload
          currentAvatarUrl={user.avatar || user.image}
          fallbackLabel={fallbackLabel}
        />
      </div>
    </main>
  )
}
