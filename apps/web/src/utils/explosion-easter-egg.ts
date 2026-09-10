const themeChangeCountTracker = {
  count: 0
};

export function incrementThemeChangeCounter() {
  themeChangeCountTracker.count += 1;
  console.log(`Function ran! Current count: ${themeChangeCountTracker.count}`);
}

export function hasPassedThemeChangeThreshold(): boolean {
  return themeChangeCountTracker.count >= 20;
}

export function getRandomExplosionSize(): number {
  const num = (Math.random() + Math.random() + 1) * (100 * Math.random() + 100)
  console.log(num)
  return num
} 