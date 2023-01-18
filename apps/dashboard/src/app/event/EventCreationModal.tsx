import { Text, Title } from "@tremor/react"
import { FC } from "react"

import { ModalChildProps } from "../../components/Modal"

export const EventCreationModal: FC<ModalChildProps> = () => {
  return (
    <div className="w-full p-6">
      <Title>Åre 2022</Title>
      <Text>Lorem ipsum dolor sit amet, consetetur sadipscing elitr.</Text>
    </div>
  )
}
