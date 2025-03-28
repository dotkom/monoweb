import { Card, Container, Flex, Text, Title } from "@mantine/core"
import { redirect } from "next/navigation"
import { auth } from "../auth"
import { SignInButton } from "./SignInButton"

export default async function DashboardPage() {
  const session = await auth()
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
