"use client"

import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

type GameScreenshot = {
  id: number
  image: string
}

type GameScreenshotsProps = {
  gameTitle: string
  screenshots: GameScreenshot[]
}

export function GameScreenshots({
  gameTitle,
  screenshots,
}: GameScreenshotsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const activeScreenshot =
    activeIndex === null ? null : screenshots[activeIndex] ?? null

  function openScreenshot(index: number) {
    setActiveIndex(index)
  }

  const closeScreenshot = useCallback(() => {
    setActiveIndex(null)
  }, [])

  const showPrevious = useCallback(() => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex
      }

      return currentIndex === 0 ? screenshots.length - 1 : currentIndex - 1
    })
  }, [screenshots.length])

  const showNext = useCallback(() => {
    setActiveIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex
      }

      return currentIndex === screenshots.length - 1 ? 0 : currentIndex + 1
    })
  }, [screenshots.length])

  useEffect(() => {
    if (activeIndex === null) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeScreenshot()
      }

      if (event.key === "ArrowLeft") {
        showPrevious()
      }

      if (event.key === "ArrowRight") {
        showNext()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [activeIndex, closeScreenshot, showNext, showPrevious])

  return (
    <section aria-labelledby="screenshots-heading">
      <h2
        className="mb-4 flex items-center gap-2 border-b border-border pb-2 text-xl font-semibold tracking-tight"
        id="screenshots-heading"
      >
        <ImageIcon className="size-5 text-primary" aria-hidden="true" />
        Скриншоты
      </h2>
      {screenshots.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {screenshots.map((screenshot, index) => (
            <button
              aria-label={`Открыть скриншот ${index + 1}`}
              className="group relative aspect-video w-full overflow-hidden border border-border bg-card text-left outline-none transition-colors hover:border-primary focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/30"
              key={screenshot.id}
              onClick={() => openScreenshot(index)}
              type="button"
            >
              <Image
                alt={`Скриншот ${gameTitle}`}
                className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                fill
                sizes="(min-width: 1024px) 448px, (min-width: 640px) 50vw, 100vw"
                src={screenshot.image}
                unoptimized
              />
              <span className="absolute bottom-2 right-2 border border-border bg-background/85 px-2 py-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                Открыть
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex min-h-48 items-center justify-center border border-dashed border-border bg-card text-sm text-muted-foreground">
          Скриншоты пока недоступны.
        </div>
      )}

      {activeScreenshot ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeScreenshot()
            }
          }}
          role="dialog"
        >
          <Button
            aria-label="Закрыть"
            className="absolute right-4 top-4 z-10"
            onClick={closeScreenshot}
            size="icon-lg"
            type="button"
            variant="outline"
          >
            <X aria-hidden="true" />
          </Button>

          {screenshots.length > 1 ? (
            <>
              <Button
                aria-label="Предыдущий скриншот"
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2"
                onClick={showPrevious}
                size="icon-lg"
                type="button"
                variant="outline"
              >
                <ChevronLeft aria-hidden="true" />
              </Button>
              <Button
                aria-label="Следующий скриншот"
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2"
                onClick={showNext}
                size="icon-lg"
                type="button"
                variant="outline"
              >
                <ChevronRight aria-hidden="true" />
              </Button>
            </>
          ) : null}

          <div className="relative h-full max-h-[90vh] w-full max-w-7xl">
            <Image
              alt={`Скриншот ${gameTitle}`}
              className="object-contain"
              fill
              priority
              sizes="100vw"
              src={activeScreenshot.image}
              unoptimized
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}
