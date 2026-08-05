/** How much of the ghost the primary covers when comparing. */
export const COMPARE_OVERLAP = 0.4

export const LABEL_OFFSET_FROM_TOP = 12
export const MIN_INSIDE_LABEL_BAR_HEIGHT_PX = 36
export const MIN_INSIDE_LABEL_BAR_WIDTH_PX = 32
export const ABOVE_LABEL_GAP = 6
export const BAR_RADIUS = 4

/**
 * Compare off: the primary fills the whole slot.
 * Compare on: two equally wide bars inside that same slot, the primary shifted right so it
 * covers COMPARE_OVERLAP of the ghost.
 */
export function barGeometry(slotX: number, slotWidth: number, showComparison: boolean) {
  if (!showComparison) {
    return { ghostX: slotX, ghostWidth: 0, primaryX: slotX, primaryWidth: slotWidth }
  }

  const barWidth = slotWidth / (2 - COMPARE_OVERLAP)

  return {
    ghostX: slotX,
    ghostWidth: barWidth,
    primaryX: slotX + slotWidth - barWidth,
    primaryWidth: barWidth,
  }
}

export function topRoundedRectPath(x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height)

  if (r <= 0) {
    return `M ${x} ${y + height} L ${x} ${y} L ${x + width} ${y} L ${x + width} ${y + height} Z`
  }

  return [
    `M ${x} ${y + height}`,
    `L ${x} ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    `L ${x + width - r} ${y}`,
    `A ${r} ${r} 0 0 1 ${x + width} ${y + r}`,
    `L ${x + width} ${y + height}`,
    `Z`,
  ].join(" ")
}
