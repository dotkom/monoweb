import { authOptions } from "@dotkomonline/auth/src/dashboard.app"
import { Card, Container, Flex, Text, Title } from "@mantine/core"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { SignInButton } from "./SignInButton"

import { TestComp } from "./testcomp"

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

// export default async function DashboardPage() {
//   return <TestComp />
// }
