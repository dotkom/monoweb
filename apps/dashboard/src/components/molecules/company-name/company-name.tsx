import { Company } from "@dotkomonline/types"
import { Icon } from "@iconify/react"
import { Group, Image } from "@mantine/core"
import { FC, useState } from "react"

export type CompanyNameProps = {
  company: Company
}

export const CompanyName: FC<CompanyNameProps> = ({ company }) => {
  const [imageError, setImageError] = useState(false)

  return (
    <Group>
      {company.image === null ? (
        <>
          <Icon width={40} height={40} icon="tabler:user-circle" />
          {company.name}
        </>
      ) : (
        <>
          {imageError ? (
            <Icon width={40} height={40} icon="tabler:photo-x" />
          ) : (
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
          )}
          {company.name}
        </>
      )}
    </Group>
  )
}
