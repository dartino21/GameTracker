"use client"

import { useEffect, useRef } from "react"

const BRAND = "#ffab2e"
const VIDEO_SRC = "/horse-gallop.mp4"

type HalftoneHorseProps = {
  variant?: "hero" | "inline"
  gridSize?: number
  className?: string
}

export function HalftoneHorse({
  variant = "hero",
  gridSize = 6,
  className,
}: HalftoneHorseProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const view: HTMLCanvasElement = canvasRef.current
    const ctx = view.getContext("2d")
    const sample = document.createElement("canvas")
    const sctx = sample.getContext("2d", { willReadFrequently: true })
    if (!ctx || !sctx) return
    sctx.imageSmoothingEnabled = true

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    const grid = Math.max(2, gridSize)
    const isHero = variant === "hero"

    const video = document.createElement("video")
    video.src = VIDEO_SRC
    video.muted = true
    video.loop = true
    video.playsInline = true
    video.setAttribute("playsinline", "true")
    video.setAttribute("webkit-playsinline", "true")

    let cssW = 0
    let cssH = 0
    let raf = 0
    let ready = false

    function measure() {
      if (isHero) {
        return { w: window.innerWidth, h: window.innerHeight }
      }
      const rect = view.getBoundingClientRect()
      return { w: Math.max(1, rect.width), h: Math.max(1, rect.height) }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { w, h } = measure()
      cssW = w
      cssH = h
      view.width = Math.floor(cssW * dpr)
      view.height = Math.floor(cssH * dpr)
      if (isHero) {
        view.style.width = `${cssW}px`
        view.style.height = `${cssH}px`
      }
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function luminance(r: number, g: number, b: number) {
      return 0.299 * r + 0.587 * g + 0.114 * b
    }

    function render() {
      const c = ctx!
      const s = sctx!
      c.clearRect(0, 0, cssW, cssH)

      if (ready && video.videoWidth && video.videoHeight) {
        const vAspect = video.videoWidth / video.videoHeight

        let dw: number
        let dh: number
        let dx: number
        let dy: number

        if (isHero) {
          const boxW = Math.min(cssW * 0.92, 1120)
          const boxH = cssH * 0.62
          dw = boxW
          dh = dw / vAspect
          if (dh > boxH) {
            dh = boxH
            dw = dh * vAspect
          }
          dx = (cssW - dw) / 2
          dy = cssH * 0.53 - dh / 2
        } else {
          // Fill the host element as large as possible, keeping aspect ratio.
          dh = cssH
          dw = dh * vAspect
          if (dw > cssW) {
            dw = cssW
            dh = dw / vAspect
          }
          dx = (cssW - dw) / 2
          dy = (cssH - dh) / 2
        }

        const cols = Math.max(1, Math.round(dw / grid))
        const rows = Math.max(1, Math.round(dh / grid))
        const cellW = dw / cols
        const cellH = dh / rows
        const maxR = Math.min(cellW, cellH) * 0.62

        sample.width = cols
        sample.height = rows
        s.clearRect(0, 0, cols, rows)
        s.drawImage(video, 0, 0, cols, rows)
        const data = s.getImageData(0, 0, cols, rows).data

        const lum = new Float32Array(cols * rows)
        for (let i = 0; i < cols * rows; i++) {
          lum[i] = luminance(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])
        }

        // Background level from the four corner cells (subject is absent there).
        const corners = [
          lum[0],
          lum[cols - 1],
          lum[(rows - 1) * cols],
          lum[rows * cols - 1],
        ]
        const bg = corners.reduce((a, b) => a + b, 0) / corners.length

        c.fillStyle = BRAND
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const coverage = Math.min(
              1,
              Math.abs(lum[row * cols + col] - bg) / 95,
            )
            const radius = coverage * maxR
            if (radius <= 0.3) continue
            c.globalAlpha = Math.min(1, 0.45 + coverage * 0.55)
            c.beginPath()
            c.arc(
              dx + col * cellW + cellW / 2,
              dy + row * cellH + cellH / 2,
              radius,
              0,
              Math.PI * 2,
            )
            c.fill()
          }
        }
        c.globalAlpha = 1
      }

      if (!reduceMotion) raf = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener("resize", resize)

    let observer: ResizeObserver | null = null
    if (!isHero && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => resize())
      observer.observe(view)
    }

    function start() {
      ready = true
      if (reduceMotion) {
        try {
          video.currentTime = 0.4
        } catch {
          // ignore seek errors
        }
        render()
      } else {
        void video.play().catch(() => {
          // Autoplay may be blocked; muted video should still play.
        })
        raf = requestAnimationFrame(render)
      }
    }

    video.addEventListener("loadeddata", start)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      observer?.disconnect()
      video.removeEventListener("loadeddata", start)
      video.pause()
      video.removeAttribute("src")
      video.load()
    }
  }, [variant, gridSize])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={
        className ?? "pointer-events-none absolute inset-0 z-0 h-full w-full"
      }
    />
  )
}
