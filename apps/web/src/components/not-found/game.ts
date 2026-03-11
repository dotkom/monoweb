// Virtual canvas dimensions (letterboxed to maintain aspect ratio)
const VIRTUAL_W = 1600
const VIRTUAL_H = 900
const GROUND_Y_RATIO = 0.85
const SLINGSHOT_X_RATIO = 0.12

// Logo projectile
const LOGO_SIZE = 60

// Sprite (thrower character)
const SPRITE_HEIGHT = 180
const SPRITE_WIDTH = 90
// The ball rests at the character's raised hands (near top of sprite)
const SPRITE_HAND_OFFSET_Y = -10

// Physics
const MAX_LAUNCH_SPEED = 1100
const GRAVITY = 800

// Charge mechanic
const INITIAL_LIVES = 3
const CHARGE_DURATION_MS = 1000 // Time for one half-oscillation (0→1 or 1→0)
const LAUNCH_ANGLE = -Math.PI / 4 // 45 degrees upward-right

// Power bar
const POWER_BAR_WIDTH = 10
const POWER_BAR_HEIGHT = 120
const POWER_BAR_OFFSET_X = -40 // Left of the character

// Bugs
const BUG_RADIUS = 20
const BUG_BASE_SPEED = 80
const BUG_SPEED_VARIANCE = 0 // No speed variation
const WAVE_MIN_INTERVAL = 1000 // ms between waves
const WAVE_MAX_INTERVAL = 3000 // ms between waves
const WAVE_MIN_SIZE = 2
const WAVE_MAX_SIZE = 4

interface Point {
  x: number
  y: number
}

interface Projectile {
  x: number
  y: number
  vx: number
  vy: number
}

interface Bug {
  x: number
  y: number
  radius: number
  speed: number
  isTihlde: boolean
}

// Game over button regions (in virtual coordinates)
interface ButtonRegion {
  x: number
  y: number
  w: number
  h: number
}

interface GameState {
  logoImg: HTMLImageElement | null
  logoImgDark: HTMLImageElement | null
  spriteImg: HTMLImageElement | null
  bugImg: HTMLImageElement | null
  abakusImg: HTMLImageElement | null
  charging: boolean
  chargeStart: number
  chargePower: number // 0-1
  projectiles: Projectile[]
  scale: number
  offsetX: number
  offsetY: number
  bugs: Bug[]
  score: number
  lives: number
  nextSpawnAt: number
  cooldownUntil: number
  gameOver: boolean
}

function getCradlePosition(): Point {
  const groundY = VIRTUAL_H * GROUND_Y_RATIO
  // Ball sits at the character's raised hands
  return {
    x: VIRTUAL_W * SLINGSHOT_X_RATIO,
    y: groundY - SPRITE_HEIGHT + SPRITE_HAND_OFFSET_Y,
  }
}

/** Maps a 0-1 input to a 0.2-1 output with a quadratic curve, ensuring a minimum launch power. */
export function powerCurve(t: number): number {
  return 0.12 + 0.88 * t * t
}

function isDarkMode(): boolean {
  const theme = document.documentElement.getAttribute("data-theme")
  if (theme === "dark") return true
  if (theme === "light") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
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

function drawTrajectoryDots(ctx: CanvasRenderingContext2D, power: number): void {
  if (power < 0.02) return

  const cradle = getCradlePosition()
  const speed = powerCurve(power) * MAX_LAUNCH_SPEED
  const vx = Math.cos(LAUNCH_ANGLE) * speed
  const vy = Math.sin(LAUNCH_ANGLE) * speed

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

function drawPowerBar(ctx: CanvasRenderingContext2D, power: number): void {
  if (power < 0.01) return

  const baseX = VIRTUAL_W * SLINGSHOT_X_RATIO + POWER_BAR_OFFSET_X
  const groundY = VIRTUAL_H * GROUND_Y_RATIO
  const barBottom = groundY - 30
  const barTop = barBottom - POWER_BAR_HEIGHT

  // Background
  ctx.fillStyle = isDarkMode() ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"
  ctx.fillRect(baseX, barTop, POWER_BAR_WIDTH, POWER_BAR_HEIGHT)

  // Fill (green → yellow → red)
  const fillHeight = POWER_BAR_HEIGHT * power
  const r = Math.min(power * 2, 1) * 255
  const g = Math.min((1 - power) * 2, 1) * 255
  ctx.fillStyle = `rgb(${r}, ${g}, 50)`
  ctx.fillRect(baseX, barBottom - fillHeight, POWER_BAR_WIDTH, fillHeight)

  // Border
  ctx.strokeStyle = isDarkMode() ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"
  ctx.lineWidth = 1.5
  ctx.strokeRect(baseX, barTop, POWER_BAR_WIDTH, POWER_BAR_HEIGHT)
}

function drawSlingshot(ctx: CanvasRenderingContext2D, state: GameState): void {
  const baseX = VIRTUAL_W * SLINGSHOT_X_RATIO
  const groundY = VIRTUAL_H * GROUND_Y_RATIO
  const cradle = getCradlePosition()
  const logoImg = isDarkMode() ? state.logoImgDark : state.logoImg

  // Draw the sprite character (thrower) standing on the ground
  if (state.spriteImg) {
    ctx.drawImage(state.spriteImg, baseX - SPRITE_WIDTH / 2, groundY - SPRITE_HEIGHT, SPRITE_WIDTH, SPRITE_HEIGHT)
  }

  // Draw power bar and trajectory while charging
  if (state.charging) {
    drawPowerBar(ctx, state.chargePower)
    drawTrajectoryDots(ctx, state.chargePower)
  }

  // Draw all in-flight projectiles
  if (logoImg) {
    for (const p of state.projectiles) {
      ctx.drawImage(logoImg, p.x - LOGO_SIZE / 2, p.y - LOGO_SIZE / 2, LOGO_SIZE, LOGO_SIZE)
    }
  }

  // Draw the ball at the cradle only when ready (not during cooldown)
  if (performance.now() >= state.cooldownUntil && logoImg) {
    const ballScale = state.charging ? 1 + state.chargePower * 0.3 : 1
    const size = LOGO_SIZE * ballScale
    ctx.drawImage(logoImg, cradle.x - size / 2, cradle.y - size / 2, size, size)
  }
}

function drawBug(ctx: CanvasRenderingContext2D, bug: Bug, state: GameState): void {
  if (bug.isTihlde && state.bugImg) {
    const h = bug.radius * 2
    const w = h * (state.bugImg.naturalWidth / state.bugImg.naturalHeight)
    ctx.drawImage(state.bugImg, bug.x - w / 2, bug.y - h / 2, w, h)
    return
  }

  if (state.abakusImg) {
    const size = bug.radius * 2
    ctx.drawImage(state.abakusImg, bug.x - size / 2, bug.y - size / 2, size, size)
    return
  }
}

function drawBugs(ctx: CanvasRenderingContext2D, state: GameState): void {
  for (const bug of state.bugs) {
    drawBug(ctx, bug, state)
  }
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState): void {
  const dark = isDarkMode()
  ctx.font = "bold 32px monospace"
  ctx.textAlign = "right"
  ctx.textBaseline = "top"

  // Shadow
  ctx.fillStyle = dark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)"
  ctx.fillText(state.score.toString(), VIRTUAL_W - 28, 52)

  // Text
  ctx.fillStyle = dark ? "#ffffff" : "#18181b"
  ctx.fillText(state.score.toString(), VIRTUAL_W - 30, 50)

  // Lives
  ctx.font = "28px sans-serif"
  ctx.textAlign = "left"
  const heartsText = "❤️".repeat(state.lives) + "🖤".repeat(INITIAL_LIVES - state.lives)
  ctx.fillText(heartsText, 30, 75)

  ctx.textAlign = "start"
  ctx.textBaseline = "alphabetic"
}

function randomWaveInterval(): number {
  return WAVE_MIN_INTERVAL + Math.random() * (WAVE_MAX_INTERVAL - WAVE_MIN_INTERVAL)
}

function spawnWave(state: GameState): void {
  const groundY = VIRTUAL_H * GROUND_Y_RATIO
  const count = WAVE_MIN_SIZE + Math.floor(Math.random() * (WAVE_MAX_SIZE - WAVE_MIN_SIZE + 1))
  const lastBugOffset = (count - 1) * BUG_RADIUS * 3
  const isTihlde = Math.random() < 0.5
  let slowestSpeed = BUG_BASE_SPEED
  for (let i = 0; i < count; i++) {
    const speed = BUG_BASE_SPEED * (1 + (Math.random() * 2 - 1) * BUG_SPEED_VARIANCE)
    if (speed < slowestSpeed) slowestSpeed = speed
    // TIHLDE logos fly at a fixed height in the air; red circles walk on the ground
    const y = isTihlde ? groundY * 0.6 : groundY - BUG_RADIUS
    state.bugs.push({
      x: VIRTUAL_W + BUG_RADIUS + i * BUG_RADIUS * 3,
      y,
      radius: BUG_RADIUS,
      speed,
      isTihlde,
    })
  }
  // Time for the last bug to fully cross the right wall into the viewport (use slowest speed)
  const entryDistance = lastBugOffset + BUG_RADIUS * 2
  const entryTimeMs = (entryDistance / slowestSpeed) * 1000
  state.nextSpawnAt = performance.now() + entryTimeMs + randomWaveInterval()
}

function updateBugs(state: GameState, dt: number): void {
  const slingshotX = VIRTUAL_W * SLINGSHOT_X_RATIO

  for (const bug of state.bugs) {
    bug.x -= bug.speed * dt
  }

  const reached = state.bugs.filter((bug) => bug.x <= slingshotX)
  if (reached.length > 0) {
    state.bugs = state.bugs.filter((bug) => bug.x > slingshotX)
    state.lives -= reached.length
    if (state.lives <= 0) {
      state.lives = 0
      state.gameOver = true
      return
    }
  }

  // Spawn logic
  const now = performance.now()
  if (now >= state.nextSpawnAt) {
    spawnWave(state)
  }

}

function checkCollisions(state: GameState): void {
  if (state.projectiles.length === 0) return

  const hitRadius = BUG_RADIUS + LOGO_SIZE / 2
  state.bugs = state.bugs.filter((bug) => {
    for (const p of state.projectiles) {
      const dx = p.x - bug.x
      const dy = p.y - bug.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < hitRadius) {
        state.score += 1
        return false
      }
    }
    return true
  })
}

function getGameOverButtons(): { retry: ButtonRegion; back: ButtonRegion } {
  const centerX = VIRTUAL_W / 2
  const centerY = VIRTUAL_H / 2
  const btnW = 200
  const btnH = 50
  const gap = 20
  return {
    retry: { x: centerX - btnW - gap / 2, y: centerY + 50, w: btnW, h: btnH },
    back: { x: centerX + gap / 2, y: centerY + 50, w: btnW, h: btnH },
  }
}

function drawGameOver(ctx: CanvasRenderingContext2D, state: GameState): void {
  const dark = isDarkMode()

  // Semi-transparent overlay
  ctx.fillStyle = dark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.6)"
  ctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H)

  const centerX = VIRTUAL_W / 2

  // Score text
  ctx.font = "bold 64px monospace"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(`Score: ${state.score}`, centerX, VIRTUAL_H / 2 - 30)

  // Buttons
  const { retry, back } = getGameOverButtons()

  for (const [btn, label] of [
    [retry, "Prøv igjen"],
    [back, "Tilbake"],
  ] as const) {
    // Button background
    ctx.fillStyle = "rgba(255,255,255,0.15)"
    ctx.beginPath()
    ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 8)
    ctx.fill()

    // Button border
    ctx.strokeStyle = "rgba(255,255,255,0.4)"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 8)
    ctx.stroke()

    // Button text
    ctx.font = "bold 24px monospace"
    ctx.fillStyle = "#ffffff"
    ctx.fillText(label, btn.x + btn.w / 2, btn.y + btn.h / 2)
  }

  ctx.textAlign = "start"
  ctx.textBaseline = "alphabetic"
}

function render(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.clearRect(0, 0, VIRTUAL_W, VIRTUAL_H)
  drawGround(ctx)
  drawBugs(ctx, state)
  drawSlingshot(ctx, state)
  drawHUD(ctx, state)

  if (state.gameOver) {
    drawGameOver(ctx, state)
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function createInitialState(): Omit<GameState, "logoImg" | "logoImgDark" | "spriteImg" | "bugImg" | "abakusImg"> {
  return {
    charging: false,
    chargeStart: 0,
    chargePower: 0,
    projectiles: [],
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    bugs: [],
    score: 0,
    lives: INITIAL_LIVES,
    nextSpawnAt: performance.now() + randomWaveInterval(),
    cooldownUntil: 0,
    gameOver: false,
  }
}

export function startGame(canvas: HTMLCanvasElement, onExit?: () => void): () => void {
  const maybeCtx = canvas.getContext("2d")
  if (!maybeCtx) return () => {}
  const ctx: CanvasRenderingContext2D = maybeCtx

  const cradle = getCradlePosition()

  const state: GameState = {
    logoImg: null,
    logoImgDark: null,
    spriteImg: null,
    bugImg: null,
    abakusImg: null,
    ...createInitialState(),
  }

  let animFrame = 0
  let stopped = false
  let lastTime = 0

  function resize(): void {
    canvas.width = canvas.clientWidth * devicePixelRatio
    canvas.height = canvas.clientHeight * devicePixelRatio
  }

  let mouseHeld = false

  function startCharge(): void {
    if (state.gameOver) return
    mouseHeld = true
    if (performance.now() < state.cooldownUntil) return
    state.charging = true
    state.chargeStart = performance.now()
    state.chargePower = 0
  }

  function release(): void {
    mouseHeld = false
    if (!state.charging) return
    state.charging = false

    if (state.chargePower < 0.02) return

    const speed = powerCurve(state.chargePower) * MAX_LAUNCH_SPEED
    state.projectiles.push({
      x: cradle.x,
      y: cradle.y,
      vx: Math.cos(LAUNCH_ANGLE) * speed,
      vy: Math.sin(LAUNCH_ANGLE) * speed,
    })
    state.chargePower = 0
    state.cooldownUntil = performance.now() + 1000
  }

  function resetGame(): void {
    Object.assign(state, createInitialState())
    lastTime = 0
    animFrame = requestAnimationFrame(loop)
  }

  function virtualCoordsFromEvent(e: MouseEvent | Touch): Point {
    const rect = canvas.getBoundingClientRect()
    const canvasX = (e.clientX - rect.left) * devicePixelRatio
    const canvasY = (e.clientY - rect.top) * devicePixelRatio
    return {
      x: (canvasX - state.offsetX) / state.scale,
      y: (canvasY - state.offsetY) / state.scale,
    }
  }

  function isInsideButton(pt: Point, btn: ButtonRegion): boolean {
    return pt.x >= btn.x && pt.x <= btn.x + btn.w && pt.y >= btn.y && pt.y <= btn.y + btn.h
  }

  function handleGameOverClick(e: MouseEvent | Touch): boolean {
    if (!state.gameOver) return false

    const pt = virtualCoordsFromEvent(e)
    const { retry, back } = getGameOverButtons()

    if (isInsideButton(pt, retry)) {
      resetGame()
      return true
    }
    if (isInsideButton(pt, back)) {
      onExit?.()
      return true
    }
    return false
  }

  function onMouseDown(e: MouseEvent): void {
    e.preventDefault()
    if (handleGameOverClick(e)) return
    startCharge()
  }

  function onTouchStart(e: TouchEvent): void {
    e.preventDefault()
    if (e.touches[0] && handleGameOverClick(e.touches[0])) return
    startCharge()
  }

  canvas.addEventListener("mousedown", onMouseDown)
  window.addEventListener("mouseup", release)
  canvas.addEventListener("touchstart", onTouchStart, { passive: false })
  canvas.addEventListener("touchend", release)

  function updateCharge(): void {
    if (!state.charging && mouseHeld && performance.now() >= state.cooldownUntil) {
      state.charging = true
      state.chargeStart = performance.now()
      state.chargePower = 0
    }
    if (!state.charging) return
    const elapsed = performance.now() - state.chargeStart
    state.chargePower = Math.min(elapsed / CHARGE_DURATION_MS, 1)
  }

  function updateProjectiles(dt: number): void {
    const groundY = VIRTUAL_H * GROUND_Y_RATIO
    state.projectiles = state.projectiles.filter((p) => {
      p.vy += GRAVITY * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      return p.y <= groundY && p.x >= -LOGO_SIZE && p.x <= VIRTUAL_W + LOGO_SIZE && p.y >= -LOGO_SIZE * 2
    })
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

    if (!state.gameOver) {
      updateCharge()
      updateProjectiles(dt)
      updateBugs(state, dt)
      checkCollisions(state)
    }

    ctx.setTransform(state.scale, 0, 0, state.scale, state.offsetX, state.offsetY)
    render(ctx, state)
    ctx.setTransform(1, 0, 0, 1, 0, 0)

    if (state.gameOver) {
      // Render one final frame with the overlay, then stop
      return
    }

    animFrame = requestAnimationFrame(loop)
  }

  Promise.all([
    loadImage("/online-logo-o.svg"),
    loadImage("/online-logo-o-darkmode.svg"),
    loadImage("/sprite.png"),
    loadImage("/tihlde-logo.svg"),
    loadImage("/abakus-circle.png"),
  ]).then(([light, dark, sprite, bug, abakus]) => {
    state.logoImg = light
    state.logoImgDark = dark
    state.spriteImg = sprite
    state.bugImg = bug
    state.abakusImg = abakus
  })

  animFrame = requestAnimationFrame(loop)

  return function cleanup(): void {
    stopped = true
    cancelAnimationFrame(animFrame)
    canvas.removeEventListener("mousedown", onMouseDown)
    window.removeEventListener("mouseup", release)
    canvas.removeEventListener("touchstart", onTouchStart)
    canvas.removeEventListener("touchend", release)
  }
}
