"use client"

import { ImageUp, Loader2, Trash2 } from "lucide-react"
import Image from "next/image"
import { useActionState, useEffect, useMemo, useState } from "react"

import {
  updateAvatar,
  type AvatarUploadState,
} from "@/app/settings/profile/actions"
import { Button } from "@/components/ui/button"

type AvatarUploadProps = {
  currentAvatarUrl?: string | null
  fallbackLabel: string
}

const initialState: AvatarUploadState = {}

export function AvatarUpload({
  currentAvatarUrl,
  fallbackLabel,
}: AvatarUploadProps) {
  const [state, formAction, isPending] = useActionState(
    updateAvatar,
    initialState,
  )
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const displayUrl = previewUrl || currentAvatarUrl
  const initials = useMemo(
    () => fallbackLabel.trim().slice(0, 2).toUpperCase(),
    [fallbackLabel],
  )

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  return (
    <div className="border border-border bg-card p-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {displayUrl ? (
          <Image
            alt=""
            className="size-24 rounded-full object-cover ring-1 ring-border"
            height={96}
            src={displayUrl}
            unoptimized
            width={96}
          />
        ) : (
          <div className="flex size-24 items-center justify-center rounded-full border border-primary/50 bg-secondary text-2xl font-semibold text-primary">
            {initials}
          </div>
        )}

        <div className="flex-1">
          <h2 className="text-lg font-semibold tracking-tight">Аватар</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Загрузите JPG, PNG или WebP до 700 KB. Изображение сохранится в базе
            как URL-строка.
          </p>

          <form action={formAction} className="mt-4 flex flex-col gap-3">
            <input
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:h-9 file:border file:border-primary file:bg-primary/15 file:px-3 file:text-sm file:font-medium file:uppercase file:tracking-wider file:text-primary hover:file:bg-primary hover:file:text-primary-foreground"
              name="avatar"
              onChange={onFileChange}
              type="file"
            />
            <div className="flex flex-wrap gap-2">
              <Button className="h-9" disabled={isPending} type="submit">
                {isPending ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <ImageUp aria-hidden="true" />
                )}
                Сохранить
              </Button>
              {currentAvatarUrl ? (
                <Button
                  className="h-9"
                  disabled={isPending}
                  name="intent"
                  type="submit"
                  value="remove"
                  variant="outline"
                >
                  <Trash2 aria-hidden="true" />
                  Удалить
                </Button>
              ) : null}
            </div>
          </form>

          {state.error ? (
            <p className="mt-3 text-sm text-destructive">{state.error}</p>
          ) : null}
          {state.message ? (
            <p className="mt-3 text-sm text-muted-foreground">{state.message}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
