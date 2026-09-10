const themeChangeCountTracker = {
  count: 0
};

export function incrementThemeChangeCounter() {
  themeChangeCountTracker.count += 1;
}

export function hasPassedThemeChangeThreshold(): boolean {
  return themeChangeCountTracker.count >= 20;
}

export function getRandomExplosionSize(): number {
  return (Math.random() + Math.random() + 1) * (100 * Math.random() + 100)
} 