import Link from "next/link"
import type { ReactNode } from "react"

type AuthShellProps = {
  title: string
  description: string
  footer: ReactNode
  children: ReactNode
}

export function AuthShell({
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <main className="flex min-h-screen bg-background text-foreground">
      <section className="hidden min-h-screen flex-1 flex-col justify-between border-r border-border bg-sidebar p-10 text-primary lg:flex">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          <span className="text-primary">&gt;_</span> GameTracker
        </Link>
        <div className="max-w-md">
          <p className="text-3xl font-semibold leading-tight">
            Веди игровую библиотеку, отмечай прохождения и возвращайся к
            любимым историям.
          </p>
        </div>
      </section>
      <section className="flex min-h-screen flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 space-y-2">
            <Link
              href="/"
              className="block text-sm font-semibold text-muted-foreground lg:hidden"
            >
              GameTracker
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
          {children}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </section>
    </main>
  )
}
