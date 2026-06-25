import Link from "next/link"

import { AuthShell } from "../auth-shell"
import { LoginForm } from "./login-form"

export const metadata = {
  title: "Вход | GameTracker",
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Вход"
      description="Войдите по email и паролю, чтобы продолжить вести игровой дневник."
      footer={
        <>
          Нет аккаунта?{" "}
          <Link className="font-medium text-foreground underline" href="/register">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  )
}
