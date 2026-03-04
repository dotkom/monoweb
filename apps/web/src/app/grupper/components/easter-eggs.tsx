/**
 * Easter eggs configuration for group pages.
 *
 * To add a new Easter egg:
 * 1. Add a new entry to GROUP_EASTER_EGGS with the group name as key
 * 2. Define the avatar className using the easter egg utilities from packages/config/tailwind.css
 * 3. Optionally add a wandering mascot config for a full-page character
 *
 * Available CSS classes (defined in packages/config/tailwind.css):
 * - easter-egg-gold-border: Animated spinning gold gradient border with glow
 * - easter-egg-coin-flip: 3D coin flip animation
 */

import type { ReactNode } from "react"

/** Configuration for the wandering mascot easter egg */
export interface MascotConfig {
  /** The sprite to render — either an emoji string or a React node (e.g. an SVG) */
  sprite: string | ((facing: "left" | "right") => ReactNode)
  /** Emoji or text left as footprints (default: "🐾") */
  footprint?: string
  /** Text shown in the speech bubble when clicked (default: "HONK!") */
  clickText?: string
  /** Messages dropped as sticky notes */
  notes: string[]
}

export interface GroupEasterEgg {
  /** Additional CSS classes for the group avatar */
  avatarClassName?: string
  /** Wandering mascot configuration */
  mascot?: MascotConfig
}

/**
 * Easter eggs mapped by group name (case-insensitive matching).
 */
const GROUP_EASTER_EGGS: Record<string, GroupEasterEgg> = {
  "faxe-ordenen": {
    avatarClassName:
      "easter-egg-gold-border easter-egg-coin-flip rounded-full relative border-transparent border-[3px] [transform-style:preserve-3d]",
  },
  "golfline": {
    mascot: {
      sprite: "goose",
      footprint: "🐾",
      clickText: "HONK!",
      notes: [
        "HONK!",
        "Har du lest Readme?",
        "rm -rf /",
        "Jeg spiser brodet ditt na",
        "Husk a melde deg pa!",
        "Denne siden tilhorer na gasa",
        "HJONK HJONK",
        "404: Goose not found\n(just kidding)",
        "while(true) { honk() }",
        "Gasa > Penguinen",
        "Untitled Goose Page",
        "Rake in the lake",
        "Det er ingen bugs.\nBare gas.",
        "git push --force",
      ],
    },
  },
  "clashline": {
    mascot: {
      sprite: "barbarian",
      footprint: "⚔️",
      clickText: "RAAAAAH!",
      notes: [
        "HEHEHEHA",
        "Elixir leak detected!",
        "Nerf Miner",
        "Midladder moment",
        "GG WP\n...EZ",
        "2.6 hog cycle enjoyer",
        "GRRRR!",
        "Log bait er cringe",
        "Clash Royale > alt annet",
        "Han spilte mega knight...",
        "POSITIVE ELIXIR TRADE",
        "Thanks!\nThanks!\nThanks!",
        "git commit -m 'rage quit'",
        "Pass Royale er worth",
      ],
    },
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
