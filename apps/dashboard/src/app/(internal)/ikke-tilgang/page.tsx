import { Button, Stack, Text, Title } from "@mantine/core"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <Stack align="center" justify="center" mih="50vh" gap="md">
      <Title order={1}>Ingen tilgang</Title>
      <Text c="dimmed" ta="center" maw={480}>
        Du har ikke tilgang til denne siden. Kontakt HS eller Dotkom hvis du mener dette er feil.
      </Text>
      <Button component={Link} href="/arrangementer">
        Tilbake til dashboard
      </Button>
    </Stack>
  )
}
