/**
 * Easter eggs configuration for group pages.
 *
 * To add a new Easter egg:
 * 1. Add a new entry to GROUP_EASTER_EGGS with the group name as key
 * 2. Define the avatar className using the easter egg utilities from packages/config/tailwind.css
 * 3. Optionally add other customizations as the system expands
 *
 * Available CSS classes (defined in packages/config/tailwind.css):
 * - easter-egg-gold-border: Animated spinning gold gradient border with glow
 * - easter-egg-coin-flip: 3D coin flip animation
 */

export interface GroupEasterEgg {
  /** Additional CSS classes for the group avatar */
  avatarClassName?: string
}

/**
 * Easter eggs mapped by group name (case-insensitive matching).
 */
const GROUP_EASTER_EGGS: Record<string, GroupEasterEgg> = {
  "faxe-ordenen": {
    avatarClassName:
      "easter-egg-gold-border easter-egg-coin-flip rounded-full relative border-transparent border-[3px] [transform-style:preserve-3d]",
  },
}

/**
 * Get Easter egg configuration for a group if one exists.
 */
export function getGroupEasterEgg(groupName: string | null | undefined): GroupEasterEgg | null {
  if (!groupName) {
    return null
  }

  const normalizedName = groupName.toLowerCase()
  return GROUP_EASTER_EGGS[normalizedName] ?? null
}
