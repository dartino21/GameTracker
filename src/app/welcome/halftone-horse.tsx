"use client"

import { useEffect, useRef } from "react"

const VIDEO_SRC = "/horse-gallop.mp4"
const DOT_COLOR = "#ffab2e"
const FALLBACK_BACKGROUND = "#0b0a07"
const TARGET_FPS = 24

type HalftoneHorseProps = {
  variant?: "hero" | "inline"
  gridSize?: number
  className?: string
}

export function HalftoneHorse({
  variant = "hero",
  gridSize = 5,
  className,
}: HalftoneHorseProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isHero = variant === "hero"

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const view = canvas

    const ctx = view.getContext("2d")
    const sampleCanvas = document.createElement("canvas")
    const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true })
    if (!ctx || !sampleCtx) return
    const context = ctx
    const sampleContext = sampleCtx

    const video = document.createElement("video")
    video.src = VIDEO_SRC
    video.muted = true
    video.defaultMuted = true
    video.loop = true
    video.autoplay = true
    video.playsInline = true
    video.preload = "auto"
    video.disablePictureInPicture = true
    video.setAttribute("playsinline", "true")
    video.setAttribute("webkit-playsinline", "true")

    let raf = 0
    let lastFrameTime = 0
    let cssWidth = 1
    let cssHeight = 1
    let ready = false
    let stopped = false
    let rendering = false
    let fallbackPhase = 0
    const fallbackTimer = window.setTimeout(() => {
      if (!ready && !stopped) {
        startRendering()
      }
    }, 1500)

    function measure() {
      if (isHero) {
        return {
          width: Math.max(1, window.innerWidth),
          height: Math.max(1, window.innerHeight),
        }
      }

      const rect = view.getBoundingClientRect()
      return {
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const size = measure()
      cssWidth = size.width
      cssHeight = size.height

      view.width = Math.round(cssWidth * dpr)
      view.height = Math.round(cssHeight * dpr)
      view.style.width = `${cssWidth}px`
      view.style.height = `${cssHeight}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function getDrawBox(sourceWidth: number, sourceHeight: number) {
      const sourceAspect = sourceWidth / sourceHeight

      if (isHero) {
        const maxWidth = Math.min(cssWidth * 0.92, 1120)
        const maxHeight = cssHeight * 0.62
        let width = maxWidth
        let height = width / sourceAspect

        if (height > maxHeight) {
          height = maxHeight
          width = height * sourceAspect
        }

        return {
          x: (cssWidth - width) / 2,
          y: cssHeight * 0.54 - height / 2,
          width,
          height,
        }
      }

      let height = cssHeight
      let width = height * sourceAspect

      if (width > cssWidth) {
        width = cssWidth
        height = width / sourceAspect
      }

      return {
        x: (cssWidth - width) / 2,
        y: (cssHeight - height) / 2,
        width,
        height,
      }
    }

    function clamp(value: number, min: number, max: number) {
      return Math.min(max, Math.max(min, value))
    }

    function drawFallbackFrame() {
      context.fillStyle = FALLBACK_BACKGROUND
      context.fillRect(0, 0, cssWidth, cssHeight)

      const box = getDrawBox(16, 9)
      const grid = Math.max(3, gridSize)
      const cols = Math.max(1, Math.ceil(box.width / grid))
      const rows = Math.max(1, Math.ceil(box.height / grid))
      const cellWidth = box.width / cols
      const cellHeight = box.height / rows
      const maxRadius = Math.min(cellWidth, cellHeight) * 0.34
      const centerX = box.x + box.width * (0.5 + Math.sin(fallbackPhase) * 0.04)
      const centerY = box.y + box.height * 0.54

      context.fillStyle = DOT_COLOR

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = box.x + col * cellWidth + cellWidth / 2
          const y = box.y + row * cellHeight + cellHeight / 2
          const normalizedX = (x - centerX) / box.width
          const normalizedY = (y - centerY) / box.height
          const body =
            Math.pow(normalizedX / 0.34, 2) + Math.pow(normalizedY / 0.18, 2)
          const head =
            Math.pow((normalizedX - 0.36) / 0.12, 2) +
            Math.pow((normalizedY + 0.12) / 0.14, 2)
          const legWave = Math.sin(fallbackPhase * 2 + col * 0.16)
          const legs =
            Math.abs(normalizedX) < 0.28 &&
            normalizedY > 0.12 &&
            normalizedY < 0.42 + legWave * 0.04

          if (body > 1 && head > 1 && !legs) continue

          context.globalAlpha = 0.45 + Math.random() * 0.25
          context.beginPath()
          context.arc(x, y, maxRadius, 0, Math.PI * 2)
          context.fill()
        }
      }

      context.globalAlpha = 1
      fallbackPhase += 0.08
    }

    function renderHalftone() {
      context.clearRect(0, 0, cssWidth, cssHeight)

      if (!ready || !video.videoWidth || !video.videoHeight) {
        drawFallbackFrame()
        return
      }

      const box = getDrawBox(video.videoWidth, video.videoHeight)
      const grid = Math.max(3, gridSize)
      const cols = Math.max(1, Math.ceil(box.width / grid))
      const rows = Math.max(1, Math.ceil(box.height / grid))
      const cellWidth = box.width / cols
      const cellHeight = box.height / rows
      const maxRadius = Math.min(cellWidth, cellHeight) * 0.34

      sampleCanvas.width = cols
      sampleCanvas.height = rows
      sampleContext.clearRect(0, 0, cols, rows)
      try {
        sampleContext.drawImage(video, 0, 0, cols, rows)
      } catch {
        drawFallbackFrame()
        return
      }

      const imageData = sampleContext.getImageData(0, 0, cols, rows).data
      context.fillStyle = DOT_COLOR

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const i = (row * cols + col) * 4
          const red = imageData[i]
          const green = imageData[i + 1]
          const blue = imageData[i + 2]
          const alpha = imageData[i + 3] / 255

          let gray = 0.299 * red + 0.587 * green + 0.114 * blue

          // These values mirror the attached halftone tool: boost brightness
          // slightly, keep contrast natural, and let dark pixels create dots.
          gray = clamp(gray + 20, 0, 255)
          const radius = maxRadius * (1 - gray / 255) * alpha

          if (radius <= 0.35) continue

          context.globalAlpha = clamp(0.28 + radius / maxRadius, 0.35, 1)
          context.beginPath()
          context.arc(
            box.x + col * cellWidth + cellWidth / 2,
            box.y + row * cellHeight + cellHeight / 2,
            radius,
            0,
            Math.PI * 2,
          )
          context.fill()
        }
      }

      context.globalAlpha = 1
    }

    function frame(time: number) {
      if (stopped) return

      if (time - lastFrameTime > 1000 / TARGET_FPS) {
        renderHalftone()
        lastFrameTime = time
      }

      raf = requestAnimationFrame(frame)
    }

    function startRendering() {
      if (rendering) return
      rendering = true
      raf = requestAnimationFrame(frame)
    }

    function start() {
      ready = true
      window.clearTimeout(fallbackTimer)
      resize()
      renderHalftone()

      void video.play().catch(() => {
        // Muted autoplay is widely supported, but the fallback loop keeps a
        // visible animated graphic if a browser still refuses playback.
        ready = false
        renderHalftone()
      })

      startRendering()
    }

    resize()
    window.addEventListener("resize", resize)
    video.addEventListener("canplay", start, { once: true })
    video.addEventListener("loadeddata", start, { once: true })
    video.addEventListener("error", () => {
      ready = false
      startRendering()
    })
    video.addEventListener("playing", startRendering)
    video.addEventListener("timeupdate", renderHalftone)
    video.load()

    let observer: ResizeObserver | null = null
    if (!isHero && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        resize()
        renderHalftone()
      })
      observer.observe(view)
    }

    return () => {
      stopped = true
      window.clearTimeout(fallbackTimer)
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      video.removeEventListener("playing", startRendering)
      video.removeEventListener("timeupdate", renderHalftone)
      observer?.disconnect()
      video.pause()
      video.removeAttribute("src")
      video.load()
    }
  }, [gridSize, isHero])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={
        className ??
        "pointer-events-none absolute inset-0 z-0 h-full w-full opacity-90"
      }
    />
  )
}
