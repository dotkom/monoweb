import { Button, Text, Title } from "@dotkomonline/ui"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Title element="h1" size="xl">
        Ingen tilgang
      </Title>
      <Text className="max-w-lg text-center text-muted-foreground">
        Du har ikke tilgang til denne siden. Kontakt HS eller Dotkom hvis du mener dette er feil.
      </Text>
      <Button variant="default" element={Link} href="/arrangementer">
        Tilbake til dashboard
      </Button>
    </div>
  )
}
