"use client"

import { FeideIcon } from "@/components/icons/FeideIcon"
import { MembershipDisplay } from "@/components/molecules/MembershipDisplay/MembershipDisplay"
import { useTRPC } from "@/utils/trpc/client"
import { useFullPathname } from "@/utils/use-full-pathname"
import { useSession } from "@dotkomonline/oauth2/react"
import { findActiveMembership } from "@dotkomonline/types"
import { Button, Text, Title } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconAlertTriangle, IconArrowUpRight } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { redirect, useSearchParams } from "next/navigation"

function LoadingCard({ className = "h-36" }: { className?: string }) {
  return <div className={`w-full rounded-xl bg-gray-100 dark:bg-stone-800 animate-pulse ${className}`} />
}

function MembershipPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-40 rounded-full bg-gray-300 dark:bg-stone-600 animate-pulse" />
        <div className="h-4 w-full max-w-2xl rounded-full bg-gray-200 dark:bg-stone-700 animate-pulse" />
        <div className="h-4 w-3/4 max-w-xl rounded-full bg-gray-200 dark:bg-stone-700 animate-pulse" />
      </div>

      <LoadingCard className="h-24" />
      <LoadingCard className="h-48" />
      <LoadingCard className="h-32" />
    </div>
  )
}

export default function MedlemskapPage() {
  const fullPathname = useFullPathname()
  const searchParams = useSearchParams()
  const session = useSession()

  const returnedFromFeide = searchParams.get("returnedFromFeide") === "true"

  const trpc = useTRPC()

  const { data: user, isLoading: userIsLoading } = useQuery({
    ...trpc.user.getMe.queryOptions(),
    enabled: session !== null,
  })

  const { data: auth0Connections, isLoading: auth0ConnectionsIsLoading } = useQuery({
    ...trpc.user.getAuth0Connections.queryOptions({ userId: session?.sub ?? "" }),
    enabled: session !== null,
  })

  if (session === null) {
    redirect(createAuthorizeUrl({ redirectAfter: fullPathname }))
  }

  const feideAuthorizeUrl = createAuthorizeUrl({
    connection: "FEIDE",
    redirectAfter: fullPathname,
  })

  const isLoading = userIsLoading || auth0ConnectionsIsLoading || user === undefined || auth0Connections === undefined
  const hasFeideLinked = auth0Connections?.hasFeide === true
  const activeMembership = user ? findActiveMembership(user) : null

  if (isLoading) {
    return <MembershipPageSkeleton />
  }

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

      <div className="flex flex-col gap-2">
        <Title size="xl">Medlemskap</Title>

        <Text className="text-sm text-gray-500 dark:text-stone-500">
          Her kan du se medlemsstatusen din og hva du må gjøre for å få eller oppdatere medlemskapet ditt.
        </Text>
      </div>

      <MembershipDisplay activeMembership={activeMembership} name={user?.name ?? null} />

      {activeMembership ? (
        <Text className="text-sm">
          Medlemskap er gyldig på semesterbasis. Dersom medlemskapet ditt viser feil informasjon, må du kontakte{" "}
          <Link className="underline" href="/grupper/hs">
            Hovedstyret
          </Link>
          .
        </Text>
      ) : hasFeideLinked ? (
        <>
          <div className="flex flex-col gap-3">
            <Title size="sm">Registrer medlemskap</Title>

            <Text className="text-sm">
              For å registrere medlemskap automatisk må du logge inn med FEIDE. Dette skjer automatisk hver gang du
              logger inn med FEIDE.
            </Text>

            <div className="flex flex-wrap gap-3">
              <Button
                element={Link}
                href={feideAuthorizeUrl}
                prefetch={false}
                color="brand"
                className="w-fit px-5 py-3.5 rounded-lg"
              >
                <div className="flex gap-2 items-center">
                  <FeideIcon size={16} variant="white" />
                  <Text className="text-sm">Logg inn med FEIDE</Text>
                </div>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Title size="sm">Har du ikke FEIDE-konto?</Title>
            <Text className="text-sm">
              Dersom du ikke har en FEIDE-konto, må du kontakte{" "}
              <Link className="underline" href="/grupper/hs">
                Hovedstyret
              </Link>{" "}
              for å registrere medlemskapet ditt.
            </Text>
            <Text className="text-sm text-gray-500 dark:text-stone-500">
              Ved systemfeil kan du kontakte{" "}
              <Link className="underline" href="/grupper/dotkom">
                Dotkom
              </Link>
              .
            </Text>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <Title size="sm">Knytt FEIDE til brukeren din</Title>

            <Text className="text-sm">
              For å få medlemskap automatisk må FEIDE være knyttet til kontoen din først. Du gjør dette på siden{" "}
              <Link className="underline" href="/innstillinger/bruker">
                Min bruker
              </Link>
              .
            </Text>

            <div className="flex flex-wrap gap-3">
              <Button
                element={Link}
                href="/innstillinger/bruker"
                color="brand"
                className="w-fit p-4 rounded-lg font-medium"
              >
                <div className="flex gap-2 items-center">
                  <Text className="text-sm">Gå til Min bruker</Text>
                  <IconArrowUpRight className="size-4" />
                </div>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Title size="sm">Har du ikke FEIDE-konto?</Title>
            <Text className="text-sm">
              Dersom du ikke har en FEIDE-konto, må du kontakte{" "}
              <Link className="underline" href="/grupper/hs">
                Hovedstyret
              </Link>{" "}
              for å registrere medlemskapet ditt.
            </Text>
            <Text className="text-sm text-gray-500 dark:text-stone-500">
              Ved systemfeil kan du kontakte{" "}
              <Link className="underline" href="/grupper/dotkom">
                Dotkom
              </Link>
              .
            </Text>
          </div>
        </>
      )}
    </div>
  )
}
