"use client"

import { MembershipDisplay } from "@/components/molecules/MembershipDisplay/MembershipDisplay"
import { useTRPC } from "@/utils/trpc/client"
import { useFullPathname } from "@/utils/use-full-pathname"
import { useSession } from "@dotkomonline/oauth2/react"
import { findActiveMembership } from "@dotkomonline/types"
import { Button, Text, Title } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconAlertTriangle, IconLink } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { redirect, useSearchParams } from "next/navigation"

export default function MedlemskapPage() {
  const fullPathname = useFullPathname()
  const searchParams = useSearchParams()
  const session = useSession()

  const returnedFromFeide = searchParams.get("returnedFromFeide") === "true"

  const trpc = useTRPC()

  const { data: user } = useQuery({
    ...trpc.user.getMe.queryOptions(),
    enabled: session !== null,
  })

  if (session === null) {
    redirect(createAuthorizeUrl({ redirectAfter: fullPathname }))
  }

  const activeMembership = user ? findActiveMembership(user) : null

  return (
    <div className="flex flex-col gap-6">
      {returnedFromFeide && (
        <div className="flex items-center dark:bg-red-900 bg-red-600 p-6 text-white rounded-xl gap-4">
          <IconAlertTriangle width={36} height={36} />
          <Text>
            Vi kunne ikke bekrefte ditt medlemsskap automatisk. Dersom dette er feil ta kontakt med{" "}
            <Link className="underline" href="/grupper/hs">
              Hovedstyret
            </Link>
            .
          </Text>
        </div>
      )}

      <Title size="xl">Medlemskap</Title>

      <MembershipDisplay activeMembership={activeMembership} />

      {activeMembership ? (
        <Text className="text-sm text-gray-500 dark:text-stone-500">
          Medlemskap er gyldig på semesterbasis. Ved feil angitt informasjon, ta kontakt med{" "}
          <Link className="underline" href="/grupper/hs">
            Hovedstyret
          </Link>
          .
        </Text>
      ) : (
        <div className="flex flex-col gap-3">
          <Text>
            For å registrere medlemskap må du knytte en FEIDE-konto til brukeren din. Gå til{" "}
            <Link className="underline" href="/innstillinger/bruker">
              Min bruker
            </Link>{" "}
            for å tilknytte FEIDE.
          </Text>

          <Button element={Link} href="/innstillinger/bruker" className="w-fit">
            <div className="flex gap-2 items-center">
              <IconLink size="1rem" />
              <Text className="text-sm">Tilknytt FEIDE</Text>
            </div>
          </Button>

          <Text className="text-sm text-gray-500 dark:text-stone-500">
            Har du ikke tilgang til FEIDE? Ta kontakt med{" "}
            <Link className="underline" href="/grupper/hs">
              Hovedstyret
            </Link>{" "}
            for å registrere medlemskap manuelt.
          </Text>
        </div>
      )}
    </div>
  )
}
