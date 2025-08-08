import { GenericTable } from "@/components/GenericTable"
import { Box, Button, Stack, Text, Title } from "@mantine/core"
import { compareDesc } from "date-fns"
import { type FC, useMemo } from "react"
import { useCreateMembershipModal } from "../components/create-membership-modal"
import { useMembershipTable } from "../components/use-membership-table"
import { useUserDetailsContext } from "./provider"

export const MembershipPage: FC = () => {
  const { user } = useUserDetailsContext()
  const open = useCreateMembershipModal({ user })

  const memberships = useMemo(
    () => user.memberships.toSorted((a, b) => compareDesc(a.start, b.start)),
    [user.memberships]
  )
  const table = useMembershipTable({ data: memberships, userId: user.id })

  return (
    <Stack>
      <Title>Medlemskap</Title>
      <Text>
        Bruk <strong>Opprett medlemskap</strong> for ny informasjon. Bruk <strong>Oppdater</strong> kun for å rette opp
        i eksisterende informasjon.
      </Text>
      <Box>
        <Button onClick={open}>Opprett medlemskap</Button>
      </Box>
      <GenericTable table={table} />
    </Stack>
  )
}
