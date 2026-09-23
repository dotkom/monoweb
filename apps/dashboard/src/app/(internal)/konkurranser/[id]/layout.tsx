"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { ResourceDetailError } from "@/components/ResourceDetailLayout/ResourceDetailError"
import {
  ResourceDetailLayout,
  type ResourceDetailNavItem,
} from "@/components/ResourceDetailLayout/ResourceDetailLayout"
import { Text, TextLink } from "@dotkomonline/ui"
import { IconListDetails, IconUsers } from "@tabler/icons-react"
import { useParams } from "next/navigation"
import { Fragment, type PropsWithChildren } from "react"
import { useGroupAbbreviationMap } from "../../grupper/queries"
import { useDeleteContestMutation } from "../mutations"
import { useContestWithContestantsQuery } from "../queries"
import { ContestContext } from "./provider"

export default function ContestDetailsLayout({ children }: PropsWithChildren) {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, error } = useContestWithContestantsQuery(id)
  const deleteContest = useDeleteContestMutation()

  const { canEditContest } = useAuthorization()
  const canEdit = canEditContest(data?.contest.groups ?? [])

  const { abbreviationBySlug } = useGroupAbbreviationMap()
  const organizers = data?.contest.groups ?? []

  if (isLoading) {
    return null
  }

  if (isError || !data) {
    return (
      <ResourceDetailError
        backHref="/konkurranser"
        title="Feil ved henting av konkurranse"
        message={error?.message ?? "Ukjent feil"}
      />
    )
  }

  const basePath = `/konkurranser/${id}`

  const navItems: ResourceDetailNavItem[] = [
    {
      href: basePath,
      label: "Info",
      icon: IconListDetails,
    },
    {
      href: `${basePath}/deltagere`,
      label: "Deltagere",
      icon: IconUsers,
    },
  ]

  const organizersList = organizers.map((organizer, index) => (
    <Fragment key={organizer}>
      <TextLink href={`/grupper/${organizer}`}>{abbreviationBySlug.get(organizer) ?? organizer}</TextLink>
      {index < organizers.length - 1 && ", "}
    </Fragment>
  ))

  return (
    <ResourceDetailLayout
      title={data.contest.name}
      backHref="/konkurranser"
      navItems={navItems}
      onDelete={() => deleteContest.mutate({ contestId: id })}
      missingDeletePermission={
        canEdit
          ? undefined
          : "Du har ikke redigeringstilgang til denne konkurransen. Kontakt dotkom dersom du mener dette er en feil."
      }
      readOnlyNotice={
        canEdit
          ? undefined
          : {
              title: "Du kan ikke redigere konkurransen.",
              message: "Dette er fordi du ikke er arrangør. Kontakt dotkom dersom du mener dette er en feil.",
            }
      }
      description={organizers.length > 0 ? <Text>Arrangørkomiteer: {organizersList}</Text> : "—"}
    >
      <ContestContext.Provider value={{ contest: data.contest, contestants: data.contestants }}>
        {children}
      </ContestContext.Provider>
    </ResourceDetailLayout>
  )
}
