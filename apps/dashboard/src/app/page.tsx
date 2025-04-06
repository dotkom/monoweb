import { Button, Card, Container, Flex, Text, Title } from "@mantine/core"
import { redirect } from "next/navigation"
import {auth} from "../auth";

export default async function DashboardPage() {
  const session = await auth.getServerSession()
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

            <Button component="a" className="mt-8" href="/api/auth/authorize">
              Logg inn via Monoweb
            </Button>
          </Flex>
        </Card>
      </Container>
    </Flex>
  )
}
