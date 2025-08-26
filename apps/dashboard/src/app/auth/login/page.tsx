import { auth } from "@/lib/auth"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { Button, Card, Container, Flex, Text, Title } from "@mantine/core"
import { redirect } from "next/navigation"

export default async function Page() {
  const session = await auth.getServerSession()
  if (session !== null) {
    return redirect("/")
  }

  return (
    <Flex justify="center" align="center">
      <Container mt="xl">
        <Card>
          <Flex direction="column" gap="2">
            <Title>Logg inn</Title>
            <Text>Vennligst logg inn for å bruke Monoweb Admin</Text>

            <Button component="a" className="mt-8" href={createAuthorizeUrl()}>
              Logg inn via Monoweb
            </Button>
          </Flex>
        </Card>
      </Container>
    </Flex>
  )
}
