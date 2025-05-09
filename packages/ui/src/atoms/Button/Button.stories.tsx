import type { Story } from "@ladle/react"
import { Icon } from "../Icon/Icon"
import { Title } from "../Typography/Title"
import { BUTTON_COLORS, BUTTON_SIZES, BUTTON_VARIANTS, Button, type ButtonSize } from "./Button"

const icon = (size: ButtonSize) => <Icon icon="tabler:bolt" width={size === "sm" ? 14 : size === "md" ? 17 : 20} />

export const AllVariants: Story = () => (
  <div className="flex flex-col gap-12">
    {BUTTON_VARIANTS.map((variant) => (
      <section key={variant} className="flex flex-col gap-4">
        <Title element="h2" className="capitalize font-poppins dark:text-white">
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
                    className="flex-shrink-0 whitespace-pre"
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

export const DisabledVariants: Story = () => (
  <div className="flex flex-col gap-12">
    {BUTTON_VARIANTS.map((variant) => (
      <section key={variant} className="flex flex-col gap-4">
        <Title element="h2" className="capitalize font-poppins dark:text-white">
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
                    className="flex-shrink-0 whitespace-pre"
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

export const AllVariantsWithIcon: Story = () => (
  <div className="flex flex-col gap-12">
    {BUTTON_VARIANTS.map((variant) => (
      <section key={variant} className="flex flex-col gap-4">
        <Title element="h2" className="capitalize font-poppins dark:text-white">
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
                    iconRight={icon(size)}
                    className="flex-shrink-0 whitespace-pre"
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
        <Title element="h2" className="capitalize font-poppins dark:text-white">
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
                    iconRight={icon(size)}
                    className="flex-shrink-0 whitespace-pre"
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
