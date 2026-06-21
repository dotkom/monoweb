import { Button, Text, Title } from "@dotkomonline/ui"
import { IconBarrierBlock, IconExternalLink } from "@tabler/icons-react"
import Link from "next/link"

export function GenericFadderukenePage() {
  return (
    <div className="flex flex-col gap-8">
      <Title element="h1" size="xl">
        Onlines fadderuker
      </Title>

      <div className="flex flex-row gap-3 items-center">
        <IconBarrierBlock className="size-10 text-yellow-500" />
        <Text className="text-lg text-muted-foreground">Denne siden er under utvikling</Text>
      </div>

      <div className="flex flex-col gap-2">
        <Text className="text-sm">Les mer på disse sidene:</Text>
        <ul className="list-disc list-inside">
          <li>
            <Button
              element={Link}
              variant="ghost"
              href="https://wiki.online.ntnu.no/trondheimsstudent/fadderuka/"
              className="text-base px-2 -mx-2 font-normal"
            >
              Fadderuka wikiside
              <IconExternalLink className="size-4" />
            </Button>
          </li>
          <li>
            <Button
              element={Link}
              variant="ghost"
              href="https://wiki.online.ntnu.no/trondheimsstudent/ny-student/"
              className="text-base px-2 -mx-2 font-normal"
            >
              Ny i Trondheim wikiside
              <IconExternalLink className="size-4" />
            </Button>
          </li>
        </ul>
      </div>
    </div>
  )
}
