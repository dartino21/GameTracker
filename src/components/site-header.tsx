import { LogIn } from "lucide-react"
import { getServerSession } from "next-auth"
import Link from "next/link"

import { HeaderSearch } from "@/components/header-search"
import { HorseLogo } from "@/components/horse-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/user-menu"
import { authOptions } from "@/auth"

export async function SiteHeader() {
  const session = await getServerSession(authOptions)
  const user = session?.user
  const menuLabel =
    user?.username || user?.name || user?.email?.split("@")[0] || "Аккаунт"

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="terminal-bar mx-auto w-full max-w-6xl border-x border-border sm:px-5">
        GAMETRACKER://MAIN <span className="ml-auto hidden text-primary sm:inline">STATUS: ONLINE</span>
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 border-x border-border px-5 py-3 sm:flex-row sm:items-center sm:gap-6 sm:px-8">
        <HorseLogo className="shrink-0" />

        <div className="flex-1">
          <HeaderSearch />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {user ? (
            <UserMenu label={menuLabel} username={user.username} />
          ) : (
            <Button asChild size="lg">
              <Link href="/welcome">
                <LogIn aria-hidden="true" />
                Войти / Регистрация
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
