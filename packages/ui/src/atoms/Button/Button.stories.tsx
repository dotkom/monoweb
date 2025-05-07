import type { Story } from "@ladle/react"
import { Icon } from "../Icon/Icon"
import { Title } from "../Typography/Title"
import { BUTTON_COLORS, BUTTON_SIZES, BUTTON_VARIANTS, Button, type ButtonSize } from "./Button"

const icon = (size: ButtonSize) => <Icon icon="tabler:bolt" width={size === "sm" ? 16 : size === "md" ? 20 : 24} />

export const AllVariants: Story = () => (
  <div className="flex flex-col gap-12">
    {BUTTON_VARIANTS.map((variant) => (
      <section key={variant} className="flex flex-col gap-4">
        <Title element="h2" className="capitalize font-poppins">
          {variant}
        </Title>

        <div className="flex gap-3">
          {BUTTON_COLORS.map((color) => (
            <div className="flex flex-col gap-3" key={color}>
              {BUTTON_SIZES.toReversed().map((size) => (
                <div key={`${variant}-${color}-${size}`}>
                  <Button key={`${variant}-${color}-${size}`} variant={variant} size={size} color={color}>
                    {`${size} ${color}`}
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
)

export const DisabledVariants: Story = () => (
  <div className="flex flex-col gap-12">
    {BUTTON_VARIANTS.map((variant) => (
      <section key={variant} className="flex flex-col gap-4">
        <Title element="h2" className="capitalize font-poppins">
          {variant} (disabled)
        </Title>

        <div className="flex gap-3">
          {BUTTON_COLORS.map((color) => (
            <div className="flex flex-col gap-3" key={color}>
              {BUTTON_SIZES.toReversed().map((size) => (
                <div key={`${variant}-${color}-${size}`}>
                  <Button key={`${variant}-${color}-${size}`} variant={variant} size={size} color={color} disabled>
                    {`${size} ${color}`}
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
)

export const AllVariantsWithIcon: Story = () => (
  <div className="flex flex-col gap-12">
    {BUTTON_VARIANTS.map((variant) => (
      <section key={variant} className="flex flex-col gap-4">
        <Title element="h2" className="capitalize font-poppins">
          {variant}
        </Title>

        <div className="flex gap-3">
          {BUTTON_COLORS.map((color) => (
            <div className="flex flex-col gap-3" key={color}>
              {BUTTON_SIZES.toReversed().map((size) => (
                <div key={`${variant}-${color}-${size}`}>
                  <Button
                    key={`${variant}-${color}-${size}`}
                    variant={variant}
                    size={size}
                    color={color}
                    icon={icon(size)}
                  >
                    {`${size} ${color}`}
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
)

export const DisabledVariantsWithIcon: Story = () => (
  <div className="flex flex-col gap-12">
    {BUTTON_VARIANTS.map((variant) => (
      <section key={variant} className="flex flex-col gap-4">
        <Title element="h2" className="capitalize font-poppins">
          {variant} (disabled)
        </Title>

        <div className="flex gap-3">
          {BUTTON_COLORS.map((color) => (
            <div className="flex flex-col gap-3" key={color}>
              {BUTTON_SIZES.toReversed().map((size) => (
                <div key={`${variant}-${color}-${size}`}>
                  <Button
                    key={`${variant}-${color}-${size}`}
                    variant={variant}
                    size={size}
                    color={color}
                    icon={icon(size)}
                    disabled
                  >
                    {`${size} ${color}`}
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
)
