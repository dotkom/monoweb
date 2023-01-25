import { Text, Title } from "@tremor/react"
import { FC } from "react"

import { FlyoutChildProps } from "../../components/Flyout"

export const MarkDetailsFlyout: FC<FlyoutChildProps> = () => {
  return (
    <div className="w-full p-6">
      <Title>Brant ned Dragvoll</Title>
      <Text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</Text>
    </div>
  )
}
