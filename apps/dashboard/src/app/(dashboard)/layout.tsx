import { getServerSession } from "next-auth"
import { authOptions } from "@dotkomonline/auth/src/web.app"
import { redirect } from "next/navigation"
import { PropsWithChildren } from "react"
import { Container, Flex, Heading, Text } from "@radix-ui/themes"
import { TabMenu } from "../TabMenu"
import { SignOutButton } from "../SignOutButton"

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const session = await getServerSession(authOptions)
  if (session === null) {
    redirect("/")
  }
  return (
    <Container>
      <Flex gap="2" direction="column">
        <Heading as="h1">OnlineWeb Admin</Heading>
        <Text>Lorem ipsum dolor sit, det nye admin grensesnittet til Monoweb.</Text>
        <div>
          <SignOutButton />
        </div>

        <TabMenu />
        {children}
      </Flex>
    </Container>
  )
}
