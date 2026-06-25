import Link from "next/link"

import { AuthShell } from "../auth-shell"
import { RegisterForm } from "./register-form"

export const metadata = {
  title: "Регистрация | GameTracker",
}

export default function RegisterPage() {
  return (
    <AuthShell
      title="Регистрация"
      description="Создайте аккаунт по email и паролю, чтобы собирать свою игровую историю."
      footer={
        <>
          Уже есть аккаунт?{" "}
          <Link className="font-medium text-foreground underline" href="/login">
            Войти
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  )
}
