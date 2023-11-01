import { getServerSession } from "next-auth"
import { authOptions } from "@dotkomonline/auth/src/dashboard.app"
import { redirect } from "next/navigation"
import { Card, Container, Flex, Title, Text } from "@mantine/core"
import { SignInButton } from "./SignInButton"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (session !== null) {
    redirect("/event")
  }

  return (
    <Flex justify="center" align="center">
      <Container mt="xl">
        <Card>
          <Flex direction="column" gap="2">
            <Title>Logg inn</Title>
            <Text>Vennligst logg inn for å bruke Monoweb Admin</Text>

            <SignInButton />
          </Flex>
        </Card>
      </Container>
    </Flex>
  )
}
