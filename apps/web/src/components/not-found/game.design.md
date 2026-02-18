# 404 Slingshot Game — Design Document

## Overview

A hidden game on the 404 page, activated by holding the lightning bolt past its full charge. The page transforms into a slingshot defense game where the player launches the Online logo at incoming bugs.

## Activation

- Player holds the bolt on the 404 page
- The existing charge animation completes (0.6s)
- If still holding after full charge, the game triggers
- Transition: 404 content fades out, a `fixed inset-0 z-50` fullscreen div covers the page (hides navbar/footer), canvas fades in
- The logo animates from its 404 position into the slingshot cradle

## Game Design

### Arena

- **Ground:** Horizon line at ~85% screen height. Dark fill on light mode, light fill on dark mode — contrasts against the background.
- **Sky:** Page background color (respects dark mode)
- **Slingshot:** Left side of screen (~15% from left edge), Y-shaped fork sitting on the ground. Two posts forming a V, with a base. The Online logo rests in the cradle between the prongs.

### Slingshot Mechanic (Angry Birds-style)

- Player clicks and drags the logo from its cradle position
- Two elastic band lines stretch from each fork tip to the logo's current drag position
- Drag distance = launch power, drag direction (inverted) = launch angle
- While dragging: 5-8 dotted points show the predicted parabolic trajectory
- On release: bands snap back, logo launches along the computed vector
- Max drag radius capped to prevent absurd launches

### Projectile (The Logo)

- The Online logo, rasterized from the existing SVG to a canvas image
- Rotates while in flight (angular velocity proportional to launch speed)
- Affected by gravity (constant downward acceleration)
- **Piercing:** passes through bugs on hit rather than bouncing, rewarding lined-up shots
- Returns to cradle when: goes off-screen, or hits the ground and stops
- Brief reload delay (~0.5s) before next shot is ready

### Bugs

- Spawn from the right edge, march left toward the slingshot
- Simple critters: round body, two antennae, small legs that wiggle as they walk
- Drawn with basic canvas shapes (circles, lines), no sprite assets needed
- Walk along the ground line
- On hit: small particle burst (expanding, fading circles), bug removed, score +1

### Difficulty (Rate Variable)

- Single `rate` float, starts at 1.0, increases continuously over time
- Controls:
  - **Spawn interval:** `baseInterval / rate` — bugs spawn faster
  - **Bug speed:** `baseSpeed * rate` — bugs march faster
- No discrete waves — just a smooth, relentless ramp
- Keeps the game simple with no wave UI or "wave complete" interruptions

### Game Over

- Triggered when any bug reaches the slingshot's x-position
- Screen shake effect on the canvas
- Canvas freezes (game loop stops drawing new frames)
- Overlay appears on top of frozen canvas:
  - Score (bugs killed) in large monospace text
  - "Prøv igjen" button → resets game state, restarts
  - "Tilbake" button → exits game, returns to normal 404 page

### HUD

- Minimal, top-right corner
- Score: bug kill count, monospace font, white with subtle shadow for readability
- No other UI elements during gameplay

## Technical Architecture

### Files

- **`not-found.tsx`** — React component. Manages `gameActive` state, renders canvas element inside fullscreen overlay, handles charge-threshold trigger and transition animation. Thin wrapper.
- **`not-found-game.ts`** — Pure game logic module. Exports `startGame(canvas: HTMLCanvasElement, onGameOver: (score: number) => void): () => void`. Owns the entire game loop, input handling, physics, rendering, collision detection. Returns a cleanup function that stops the loop and removes event listeners.

### Game Loop (`not-found-game.ts`)

- `requestAnimationFrame`-based loop with delta time
- State: slingshot, projectile (position, velocity, rotation, active/reloading), bugs array, rate, score, input state (dragging, drag position)
- Each frame: update physics → check collisions → remove dead bugs → spawn new bugs → render
- Input: `mousedown`/`mousemove`/`mouseup` and `touchstart`/`touchmove`/`touchend` on the canvas

### Rendering Order

1. Sky (clear canvas)
2. Ground fill + line
3. Slingshot base + posts
4. Back elastic band (fork tip to logo, behind the logo)
5. Bugs (with leg animation)
6. Projectile (logo) — whether in cradle, being dragged, or in flight
7. Front elastic band (fork tip to logo, in front)
8. Trajectory dots (only while dragging)
9. Particles (hit effects)
10. HUD (score)

### Collision Detection

- Circle-circle: each bug has a hitbox radius, the logo has a hitbox radius
- Check distance between centers < sum of radii
- Only check when projectile is in flight (not in cradle or reloading)

### Canvas Sizing

- Canvas fills the fullscreen overlay
- Resize listener updates canvas width/height and adjusts game coordinate system
- Game logic uses a virtual coordinate system (e.g. 1600x900) mapped to actual canvas size, so gameplay feels consistent across screen sizes

### Dark Mode

- Ground and sky adapt based on the page's current theme (dark ground on light mode, light ground on dark mode)
- Logo uses the same colors as the SVG version
- Bugs and slingshot use colors that work on both backgrounds
