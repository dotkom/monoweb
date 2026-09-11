const themeChangeCountTracker = {
  count: 0,
  lastClickTime: 0,
  explosionEnabled: false,
  doStartAnimation: false,
  explosionModeStartTime: 0,
};

export function incrementThemeChangeCounter() {
  const now = Date.now()
  if (now - themeChangeCountTracker.lastClickTime > 500) { // Requires at most 500 ms between each click
    themeChangeCountTracker.count = 0
  }

  themeChangeCountTracker.lastClickTime = now
  themeChangeCountTracker.count += 1
}

export function isExplodeMode(): boolean {
  if (themeChangeCountTracker.count >= 20 ) {
    themeChangeCountTracker.count = 0
    themeChangeCountTracker.explosionEnabled = !themeChangeCountTracker.explosionEnabled

    themeChangeCountTracker.doStartAnimation = themeChangeCountTracker.explosionEnabled
    themeChangeCountTracker.explosionModeStartTime = Date.now()
  }

  return themeChangeCountTracker.explosionEnabled
}

export function isExplodeModeStartAnimation(): boolean {
  if (Date.now() - themeChangeCountTracker.explosionModeStartTime > 5000) {
    themeChangeCountTracker.doStartAnimation = false
  }

  return themeChangeCountTracker.doStartAnimation
}

export function getRandomExplosionSize(): number {
  return (Math.random() + Math.random() + 1) * (100 * Math.random() + 100)
}

export function getRandomExplosionPosition(): string {
  return `${Math.random() * 100}%`
}