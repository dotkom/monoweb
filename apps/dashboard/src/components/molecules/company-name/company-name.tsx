import { FC } from "react"
import { Company } from "@dotkomonline/types"
import { Group, Image } from "@mantine/core"
import { Icon } from "@iconify/react"

export type CompanyNameProps = {
  company: Company
}

export const CompanyName: FC<CompanyNameProps> = ({ company }) => {
  return (
    <Group>
      {company.image !== null ? (
        <>
          <Image w={40} h={40} fit="contain" src={company.image} alt={`${company.name} logo icon`} />
          {company.name}
        </>
      ) : (
        <>
          <Icon width={40} height={40} icon="tabler:user-circle" />
          {company.name}
        </>
      )}
    </Group>
  )
}
