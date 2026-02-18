// Virtual canvas dimensions (letterboxed to maintain aspect ratio)
const VIRTUAL_W = 1600
const VIRTUAL_H = 900
const GROUND_Y_RATIO = 0.85
const SLINGSHOT_X_RATIO = 0.12

// Logo projectile
const LOGO_SIZE = 60
const LOGO_HITBOX_RADIUS = 40

// Slingshot pedestal
const PEDESTAL_WIDTH = 12
const PEDESTAL_HEIGHT = 80

// Physics
const MAX_DRAG_DISTANCE = 150
const MAX_LAUNCH_SPEED = 1500
const GRAVITY = 800
const RELOAD_DELAY_MS = 500

interface Point {
  x: number
  y: number
}

interface Projectile {
  active: boolean
  x: number
  y: number
  vx: number
  vy: number
}

interface GameState {
  logoImg: HTMLImageElement | null
  logoImgDark: HTMLImageElement | null
  dragging: boolean
  dragX: number
  dragY: number
  projectile: Projectile
  scale: number
  offsetX: number
  offsetY: number
}

function getCradlePosition(): Point {
  return {
    x: VIRTUAL_W * SLINGSHOT_X_RATIO,
    y: VIRTUAL_H * GROUND_Y_RATIO - PEDESTAL_HEIGHT - LOGO_SIZE / 2,
  }
}

function getDistance(dx: number, dy: number): number {
  return Math.sqrt(dx * dx + dy * dy)
}

/** Maps a 0-1 input to a 0-1 output with a quadratic curve. */
export function powerCurve(t: number): number {
  return t * t
}

function computeLaunchVelocity(dragX: number, dragY: number, cradle: Point): { vx: number; vy: number; t: number } {
  const dx = cradle.x - dragX
  const dy = cradle.y - dragY
  const dist = getDistance(dx, dy)
  const t = Math.min(dist / MAX_DRAG_DISTANCE, 1)
  const power = powerCurve(t) * MAX_LAUNCH_SPEED
  return { vx: (dx / dist) * power, vy: (dy / dist) * power, t }
}

function isDarkMode(): boolean {
  const theme = document.documentElement.getAttribute("data-theme")
  if (theme === "dark") return true
  if (theme === "light") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function canvasToVirtual(clientX: number, clientY: number, canvas: HTMLCanvasElement, state: GameState): Point {
  const rect = canvas.getBoundingClientRect()
  const pixelX = (clientX - rect.left) * devicePixelRatio
  const pixelY = (clientY - rect.top) * devicePixelRatio
  return {
    x: (pixelX - state.offsetX) / state.scale,
    y: (pixelY - state.offsetY) / state.scale,
  }
}

function drawGround(ctx: CanvasRenderingContext2D): void {
  const dark = isDarkMode()
  const groundY = VIRTUAL_H * GROUND_Y_RATIO

  ctx.fillStyle = dark ? "#d4d4d8" : "#27272a"
  ctx.fillRect(0, groundY, VIRTUAL_W, VIRTUAL_H - groundY)

  ctx.strokeStyle = dark ? "#e4e4e7" : "#18181b"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(0, groundY)
  ctx.lineTo(VIRTUAL_W, groundY)
  ctx.stroke()
}

function drawTrajectoryDots(ctx: CanvasRenderingContext2D, state: GameState): void {
  if (!state.dragging) return

  const cradle = getCradlePosition()
  const { vx, vy, t } = computeLaunchVelocity(state.dragX, state.dragY, cradle)
  if (t < 0.02) return

  const groundY = VIRTUAL_H * GROUND_Y_RATIO
  const timeStep = 0.12
  const dotCount = 8

  ctx.fillStyle = isDarkMode() ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)"
  for (let i = 1; i <= dotCount; i++) {
    const t = i * timeStep
    const px = cradle.x + vx * t
    const py = cradle.y + vy * t + 0.5 * GRAVITY * t * t
    if (py > groundY || px < 0 || px > VIRTUAL_W) break
    ctx.beginPath()
    ctx.arc(px, py, 4, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawBand(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number): void {
  ctx.strokeStyle = isDarkMode() ? "#a8a29e" : "#78716c"
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(fromX, fromY)
  ctx.lineTo(toX, toY)
  ctx.stroke()
}

function drawSlingshot(ctx: CanvasRenderingContext2D, state: GameState): void {
  const dark = isDarkMode()
  const baseX = VIRTUAL_W * SLINGSHOT_X_RATIO
  const groundY = VIRTUAL_H * GROUND_Y_RATIO
  const cradle = getCradlePosition()
  const img = dark ? state.logoImgDark : state.logoImg

  // Pedestal
  ctx.fillStyle = dark ? "#a8a29e" : "#78716c"
  ctx.fillRect(baseX - PEDESTAL_WIDTH / 2, groundY - PEDESTAL_HEIGHT, PEDESTAL_WIDTH, PEDESTAL_HEIGHT)

  // Determine logo position based on current state
  let logoX = cradle.x
  let logoY = cradle.y

  if (state.dragging) {
    drawBand(ctx, baseX, groundY - PEDESTAL_HEIGHT, state.dragX, state.dragY)
    drawTrajectoryDots(ctx, state)
    logoX = state.dragX
    logoY = state.dragY
  } else if (state.projectile.active) {
    logoX = state.projectile.x
    logoY = state.projectile.y
  }

  if (img) {
    ctx.drawImage(img, logoX - LOGO_SIZE / 2, logoY - LOGO_SIZE / 2, LOGO_SIZE, LOGO_SIZE)
  }
}

function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.clearRect(0, 0, VIRTUAL_W, VIRTUAL_H)
  drawGround(ctx)
  drawSlingshot(ctx, state)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function startGame(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return () => {}

  const cradle = getCradlePosition()

  const state: GameState = {
    logoImg: null,
    logoImgDark: null,
    dragging: false,
    dragX: cradle.x,
    dragY: cradle.y,
    projectile: { active: false, x: 0, y: 0, vx: 0, vy: 0 },
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  }

  let animFrame = 0
  let stopped = false
  let lastTime = 0
  let reloadTimer: ReturnType<typeof setTimeout> | null = null

  function resize(): void {
    canvas.width = canvas.clientWidth * devicePixelRatio
    canvas.height = canvas.clientHeight * devicePixelRatio
  }

  function startDrag(clientX: number, clientY: number): void {
    if (state.projectile.active) return
    const pos = canvasToVirtual(clientX, clientY, canvas, state)
    if (getDistance(pos.x - cradle.x, pos.y - cradle.y) <= LOGO_HITBOX_RADIUS) {
      state.dragging = true
      state.dragX = pos.x
      state.dragY = pos.y
    }
  }

  function moveDrag(clientX: number, clientY: number): void {
    if (!state.dragging) return
    const pos = canvasToVirtual(clientX, clientY, canvas, state)
    const dx = pos.x - cradle.x
    const dy = pos.y - cradle.y
    const dist = getDistance(dx, dy)
    if (dist <= MAX_DRAG_DISTANCE) {
      state.dragX = pos.x
      state.dragY = pos.y
    } else {
      const ratio = MAX_DRAG_DISTANCE / dist
      state.dragX = cradle.x + dx * ratio
      state.dragY = cradle.y + dy * ratio
    }
  }

  function endDrag(): void {
    if (!state.dragging) return
    state.dragging = false

    const { vx, vy, t } = computeLaunchVelocity(state.dragX, state.dragY, cradle)
    if (t < 0.02) return

    state.projectile = { active: true, x: cradle.x, y: cradle.y, vx, vy }
  }

  function onMouseDown(e: MouseEvent): void {
    startDrag(e.clientX, e.clientY)
  }

  function onMouseMove(e: MouseEvent): void {
    moveDrag(e.clientX, e.clientY)
  }

  function onTouchStart(e: TouchEvent): void {
    const touch = e.touches[0]
    if (!touch) return
    startDrag(touch.clientX, touch.clientY)
    if (state.dragging) e.preventDefault()
  }

  function onTouchMove(e: TouchEvent): void {
    const touch = e.touches[0]
    if (!touch) return
    moveDrag(touch.clientX, touch.clientY)
    if (state.dragging) e.preventDefault()
  }

  canvas.addEventListener("mousedown", onMouseDown)
  window.addEventListener("mousemove", onMouseMove)
  window.addEventListener("mouseup", endDrag)
  canvas.addEventListener("touchstart", onTouchStart, { passive: false })
  canvas.addEventListener("touchmove", onTouchMove, { passive: false })
  canvas.addEventListener("touchend", endDrag)

  function updateProjectile(dt: number): void {
    const p = state.projectile
    if (!p.active) return

    p.vy += GRAVITY * dt
    p.x += p.vx * dt
    p.y += p.vy * dt

    const groundY = VIRTUAL_H * GROUND_Y_RATIO
    const isOutOfBounds = p.y > groundY || p.x < -LOGO_SIZE || p.x > VIRTUAL_W + LOGO_SIZE || p.y < -LOGO_SIZE * 2
    if (isOutOfBounds) {
      p.active = false
      reloadTimer = setTimeout(() => {
        state.dragX = cradle.x
        state.dragY = cradle.y
      }, RELOAD_DELAY_MS)
    }
  }

  function loop(time: number): void {
    if (stopped) return

    const dt = lastTime === 0 ? 1 / 60 : Math.min((time - lastTime) / 1000, 0.05)
    lastTime = time

    resize()

    const scaleX = canvas.width / VIRTUAL_W
    const scaleY = canvas.height / VIRTUAL_H
    state.scale = Math.min(scaleX, scaleY)
    state.offsetX = (canvas.width - VIRTUAL_W * state.scale) / 2
    state.offsetY = (canvas.height - VIRTUAL_H * state.scale) / 2

    updateProjectile(dt)

    ctx.setTransform(state.scale, 0, 0, state.scale, state.offsetX, state.offsetY)
    render(ctx, state)
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    animFrame = requestAnimationFrame(loop)
  }

  Promise.all([loadImage("/online-logo-o.svg"), loadImage("/online-logo-o-darkmode.svg")]).then(([light, dark]) => {
    state.logoImg = light
    state.logoImgDark = dark
  })

  animFrame = requestAnimationFrame(loop)

  return function cleanup(): void {
    stopped = true
    cancelAnimationFrame(animFrame)
    if (reloadTimer) clearTimeout(reloadTimer)
    canvas.removeEventListener("mousedown", onMouseDown)
    window.removeEventListener("mousemove", onMouseMove)
    window.removeEventListener("mouseup", endDrag)
    canvas.removeEventListener("touchstart", onTouchStart)
    canvas.removeEventListener("touchmove", onTouchMove)
    canvas.removeEventListener("touchend", endDrag)
  }
}
