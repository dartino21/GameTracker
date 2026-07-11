import Link from "next/link"
import type { ReactNode } from "react"

type AuthShellProps = { title: string; description: string; footer: ReactNode; children: ReactNode }

export function AuthShell({ title, description, footer, children }: AuthShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-5 text-foreground sm:p-8">
      <section className="terminal-window grid w-full max-w-5xl lg:grid-cols-[0.85fr_1.15fr]">
        <div className="border-b border-border bg-sidebar p-6 lg:border-b-0 lg:border-r lg:p-10">
          <Link className="terminal-command text-sm font-semibold text-primary" href="/">gametracker</Link>
          <p className="mt-12 text-xs uppercase tracking-[0.2em] text-muted-foreground">ACCESS NODE / 01</p>
          <p className="mt-4 max-w-sm text-xl font-semibold leading-relaxed">Ведите игровую библиотеку, отмечайте прохождения и возвращайтесь к любимым историям.</p>
        </div>
        <div className="p-6 sm:p-10">
          <p className="terminal-prompt text-xs uppercase tracking-[0.2em] text-muted-foreground">AUTH / {title}</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
          <div className="mt-8 border-t border-border pt-6">{children}</div>
          <div className="mt-6 text-sm text-muted-foreground">{footer}</div>
        </div>
      </section>
    </main>
  )
}
