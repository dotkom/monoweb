import { getServerSession } from "@/lib/auth"
import { Button, Text, Title } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { redirect } from "next/navigation"

export default async function Page() {
  const session = await getServerSession()
  if (session !== null) {
    return redirect("/")
  }

  return (
    <div className="flex justify-center">
      <div className="mt-8 w-full max-w-md rounded-md border p-6">
        <div className="flex flex-col gap-2">
          <Title element="h1" size="lg">
            Logg inn
          </Title>
          <Text className="text-muted-foreground">Vennligst logg inn for å bruke OnlineWeb dashboard</Text>
          <Button element="a" variant="default" className="mt-8" href={createAuthorizeUrl()}>
            Logg inn
          </Button>
        </div>
      </div>
    </div>
  )
}
