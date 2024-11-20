"use client"
import { Box, Button, Divider, Text, Title } from "@mantine/core"
import { FC } from "react"
import { useUserDetailsContext } from "./provider"
import { useConfirmDeleteModal } from "src/components/molecules/ConfirmDeleteModal/confirm-delete-modal"
import { useDeleteUserMutation } from "src/modules/user/mutations"
import { useRouter } from "next/navigation"
import { revalidatePath } from "next/cache"

export const UserActionsPage: FC = () => {
  const { user } = useUserDetailsContext()
  const deleteUser = useDeleteUserMutation()
  const router = useRouter()

  const open = useConfirmDeleteModal({
    title: "Slett bruker",
    text: `Er du sikker på at du vil slette ${user.givenName}?`,
    onConfirm: () => {
      deleteUser.mutate({ auth0Id: user.auth0Id })
      router.push("/user")
    },
  })
  return (
    <Box>
      <Box>
        <Title order={3}>Blokker bruker</Title>
        <Text size="sm" c="dimmed" mb={10}>
          Blokker bruker fra Online Web. Brukeren vil ikke kunne logge inn før blokkeringen er fjernet
        </Text>
        {/* <BlockUserForm /> */}
      </Box>
      <Divider my={32} />
      <Box>
        <Title order={3}>Slett bruker</Title>
        <Text size="sm" c="dimmed" mb={10}>
          Fjern bruker fra Online Web og Auth0. All data om {user.name} vil fjernes. Denne handlingen kan ikke angres.
        </Text>
        <Button onClick={open} color="red">
          Slett bruker
        </Button>
      </Box>
    </Box>
  )
}
