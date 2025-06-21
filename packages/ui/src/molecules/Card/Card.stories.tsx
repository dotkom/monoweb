import type { Story } from "@ladle/react"
import { Text } from "../../atoms/Typography/Text"
import { Title } from "../../atoms/Typography/Title"
import { CARD_SIZES, CARD_VARIANTS, Card } from "./Card"

export const Normal: Story = () => (
  <div className="flex flex-col gap-12">
    {CARD_VARIANTS.map((variant) => (
      <section key={variant} className="flex flex-col gap-4">
        <Title element="h2" className="capitalize font-poppins dark:text-white">
          {variant}
        </Title>

        <div className="flex gap-3">
          {CARD_SIZES.toReversed().map((size) => (
            <div className="flex flex-col gap-3" key={size}>
              <div key={`${variant}-${size}`}>
                <Card key={`${variant}-${size}`} variant={variant} size={size}>
                  <div className="flex p-3 bg-red-5 rounded-md h-48 w-48 items-center text-center justify-center">
                    <Text>Card {size}</Text>
                  </div>
                </Card>
              </div>
              <div key={`${variant}-${size}-tight`}>
                <Card key={`${variant}-${size}-tight`} variant={variant} size={size} smallRounding>
                  <div className="flex p-3 bg-red-5 rounded-md h-48 w-48 items-center text-center justify-center">
                    <Text>Card {size} tight rounding</Text>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </section>
    ))}
  </div>
)
