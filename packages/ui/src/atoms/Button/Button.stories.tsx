import type { Story } from "@ladle/react"
import { IconBolt } from "@tabler/icons-react"
import type { VariantProps } from "class-variance-authority"
import type { buttonVariants } from "#components/button"
import { BUTTON_COLORS, PROJECT_BUTTON_VARIANTS, type ButtonVariant } from "#lib/button-extensions"
import { Title } from "../Typography/Title"
import { Button } from "./Button"

export default {
  title: "Button",
  component: Button,
}

const SHADCN_VARIANTS = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const satisfies readonly ButtonVariant[]

const COLORABLE_VARIANTS = ["default", "outline", "secondary", "ghost"] as const satisfies readonly ButtonVariant[]

function variantSupportsColor(variant: ButtonVariant): variant is (typeof COLORABLE_VARIANTS)[number] {
  return COLORABLE_VARIANTS.includes(variant as (typeof COLORABLE_VARIANTS)[number])
}

const BUTTON_SIZES = ["default", "xs", "sm", "lg", "xl"] as const satisfies readonly NonNullable<
  VariantProps<typeof buttonVariants>["size"]
>[]

export const All: Story = () => (
  <div className="flex flex-col gap-10">
    <section className="flex flex-col gap-6">
      <Title element="h2" className="capitalize dark:text-white">
        Variants & colors
      </Title>
      {SHADCN_VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <Title element="h3" className="text-base font-medium capitalize text-muted-foreground dark:text-white/70">
            {variant}
          </Title>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant={variant}>{variant}</Button>
            {variantSupportsColor(variant) &&
              BUTTON_COLORS.map((color) => (
                <Button key={color} variant={variant} color={color}>
                  {color}
                </Button>
              ))}
          </div>
        </div>
      ))}
      {PROJECT_BUTTON_VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-2">
          <Title element="h3" className="text-base font-medium capitalize text-muted-foreground dark:text-white/70">
            {variant}
          </Title>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant={variant}>{variant}</Button>
          </div>
        </div>
      ))}
    </section>

    <section className="flex flex-col gap-3">
      <Title element="h2" className="capitalize dark:text-white">
        Sizes
      </Title>
      <div className="flex flex-wrap items-end gap-3">
        {BUTTON_SIZES.map((size) => (
          <Button key={size} size={size}>
            {size}
          </Button>
        ))}
      </div>
    </section>

    <section className="flex flex-col gap-3">
      <Title element="h2" className="capitalize dark:text-white">
        With icons
      </Title>
      <div className="flex flex-wrap gap-3">
        <Button variant="default" icon={<IconBolt className="size-4" />}>
          Icon left
        </Button>
        <Button variant="secondary" iconRight={<IconBolt className="size-4" />}>
          Icon right
        </Button>
        <Button
          variant="outline"
          color="blue"
          icon={<IconBolt className="size-4" />}
          iconRight={<IconBolt className="size-4" />}
        >
          Both sides
        </Button>
      </div>
    </section>

    <section className="flex flex-col gap-3">
      <Title element="h2" className="capitalize dark:text-white">
        Disabled
      </Title>
      <div className="flex flex-wrap gap-3">
        {SHADCN_VARIANTS.map((variant) => (
          <Button key={variant} variant={variant} disabled>
            {variant}
          </Button>
        ))}
      </div>
    </section>
  </div>
)
