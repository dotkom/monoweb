import type { Story } from "@ladle/react"
import { COLORS } from "#lib/colors"
import { Title } from "../Typography/Title"
import { Badge, type BadgeVariant } from "./Badge"

export default {
  title: "Badge",
  component: Badge,
}

const BADGE_VARIANTS = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
] as const satisfies readonly BadgeVariant[]

export const All: Story = () => (
  <div className="flex flex-col gap-10">
    <section className="flex flex-col gap-6">
      <Title element="h2" className="capitalize dark:text-white">
        Variants & colors
      </Title>
      {BADGE_VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <Title element="h3" className="text-base font-medium capitalize text-muted-foreground dark:text-white/70">
            {variant}
          </Title>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={variant}>{variant}</Badge>
            {COLORS.map((color) => (
              <Badge key={color} variant={variant} color={color}>
                {color}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </section>
  </div>
)
