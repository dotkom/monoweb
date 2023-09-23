import { Card, Flex, Heading, Container, Text, Button } from "@radix-ui/themes"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { signIn } from "next-auth/react"
import { getServerSession } from "next-auth"
import { authOptions } from "@dotkomonline/auth/src/dashboard.app"
import { redirect } from "next/navigation"
import { SignInButton } from "./SignInButton"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (session !== null) {
    redirect("/event")
  }

  return (
    <Flex justify="center" align="center" className="flex-grow">
      <Container size="1">
        <Card size="2">
          <Flex direction="column" gap="2">
            <Heading as="h1">Logg inn</Heading>
            <Text>Vennligst logg inn for å bruke Monoweb Admin</Text>

            <SignInButton />
          </Flex>
        </Card>
      </Container>
    </Flex>
  )
}
