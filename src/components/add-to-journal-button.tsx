"use client"

import { Check, Loader2, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useId, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"

type GameStatus = "Playing" | "Completed" | "Dropped" | "PlanToPlay"

type AddToJournalButtonProps = {
  rawgId: number
  gameTitle: string
}

const statusOptions: Array<{ value: GameStatus; label: string }> = [
  { value: "Playing", label: "Играю" },
  { value: "Completed", label: "Пройдено" },
  { value: "Dropped", label: "Заброшено" },
  { value: "PlanToPlay", label: "В планах" },
]

export function AddToJournalButton({
  rawgId,
  gameTitle,
}: AddToJournalButtonProps) {
  const router = useRouter()
  const titleId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const rating = formData.get("rating")
    const completedDate = formData.get("completedDate")
    const notes = formData.get("notes")

    setIsSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/journal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rawgId,
          status: formData.get("status"),
          rating: rating ? Number(rating) : null,
          completedDate: completedDate || null,
          notes: notes || null,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Не удалось добавить игру в журнал.")
      }

      setMessage("Игра добавлена в журнал.")
      router.refresh()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не удалось добавить игру в журнал.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function closeModal() {
    if (isSubmitting) {
      return
    }

    setIsOpen(false)
    setError(null)
    setMessage(null)
  }

  return (
    <>
      <Button className="h-10" onClick={() => setIsOpen(true)} type="button">
        <Plus aria-hidden="true" />
        Добавить в журнал
      </Button>

      {isOpen ? (
        <div
          aria-labelledby={titleId}
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/55 px-4 py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal()
            }
          }}
          role="dialog"
        >
          <div className="w-full max-w-lg rounded-md bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
              <div>
                <h2
                  className="text-lg font-semibold tracking-tight"
                  id={titleId}
                >
                  Добавить в журнал
                </h2>
                <p className="mt-1 text-sm text-zinc-500">{gameTitle}</p>
              </div>
              <Button
                aria-label="Закрыть"
                disabled={isSubmitting}
                onClick={closeModal}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <X aria-hidden="true" />
              </Button>
            </div>

            <form className="space-y-4 px-5 py-5" onSubmit={onSubmit}>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">
                  Статус
                </span>
                <select
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20"
                  defaultValue="PlanToPlay"
                  name="status"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-zinc-700">
                    Оценка
                  </span>
                  <select
                    className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20"
                    defaultValue=""
                    name="rating"
                  >
                    <option value="">Без оценки</option>
                    {Array.from({ length: 10 }, (_, index) => index + 1).map(
                      (rating) => (
                        <option key={rating} value={rating}>
                          {rating}/10
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-zinc-700">
                    Дата прохождения
                  </span>
                  <input
                    className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20"
                    name="completedDate"
                    type="date"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-zinc-700">
                  Заметка
                </span>
                <textarea
                  className="mt-2 min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20"
                  maxLength={2000}
                  name="notes"
                  placeholder="Коротко о впечатлениях"
                />
              </label>

              {error ? (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              {message ? (
                <p className="flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
                  <Check className="size-4" aria-hidden="true" />
                  {message}
                </p>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  disabled={isSubmitting}
                  onClick={closeModal}
                  type="button"
                  variant="outline"
                >
                  Отмена
                </Button>
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Plus aria-hidden="true" />
                  )}
                  Добавить
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
