export type AspectRatio = {
  width: number
  height: number
}

const ASPECT_RATIO_TOLERANCE = 0.05

export function getImageDimensions(source: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const image = new window.Image()

    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight })
    }

    image.onerror = () => {
      resolve(null)
    }

    image.src = source
  })
}

export async function preloadImage(source: string): Promise<void> {
  await getImageDimensions(source)
}

async function doesImageMatchAspectRatio(source: string, aspectRatio: AspectRatio): Promise<boolean> {
  const dimensions = await getImageDimensions(source)

  if (dimensions === null) {
    return true
  }

  if (dimensions.height === 0 || aspectRatio.height === 0) {
    return false
  }

  const expectedRatio = aspectRatio.width / aspectRatio.height
  const actualRatio = dimensions.width / dimensions.height

  return Math.abs(actualRatio - expectedRatio) / expectedRatio <= ASPECT_RATIO_TOLERANCE
}

export async function getAspectRatioWarning(
  source: string,
  aspectRatio: AspectRatio | undefined
): Promise<string | null> {
  if (aspectRatio === undefined) {
    return null
  }

  const isAspectRatioMatch = await doesImageMatchAspectRatio(source, aspectRatio)

  if (isAspectRatioMatch) {
    return null
  }

  return `Bildet har ikke det anbefalte sideforholdet ${aspectRatio.width}:${aspectRatio.height}.`
}
