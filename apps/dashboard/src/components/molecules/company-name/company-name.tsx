import type { Company } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import { Group, Image } from "@mantine/core"
import { type FC, useState } from "react"

export interface CompanyNameProps {
  company: Company
}

export const CompanyName: FC<CompanyNameProps> = ({ company }) => {
  const [imageError, setImageError] = useState(false)

  const renderIcon = (iconName: string) => <Icon width={40} height={40} icon={iconName} />

  const renderImage = () => (
    <Image
      w={40}
      h={40}
      fit="contain"
      src={company.image}
      alt={`${company.name} logo icon`}
      onError={(_) => {
        setImageError(true)
      }}
    />
  )

  const hasNoImage = () => company.image === null
  const hasImageError = () => company.image !== null && imageError
  const hasWorkingImage = () => company.image !== null && !imageError

  return (
    <Group>
      {hasNoImage() && renderIcon("tabler:user-circle")}
      {hasImageError() && renderIcon("tabler:photo-x")}
      {hasWorkingImage() && renderImage()}
      {company.name}
    </Group>
  )
}
