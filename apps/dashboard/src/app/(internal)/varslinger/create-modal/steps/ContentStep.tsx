"use client"

import { useAuthorization } from "@/auth/authorization-context"
import { RichTextEditorField } from "@/components/forms/RichTextInput/RichTextInput"
import { useTRPC } from "@/lib/trpc-client"
import { mapNotificationTypeToLabel } from "@dotkomonline/rpc"
import { Input, Select, SegmentedControl, Stack, TextInput, Textarea } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import type { FC } from "react"
import { DestinationCard } from "../components/DestinationCard"
import {
  SHORT_DESCRIPTION_MAX_LENGTH,
  type ActorGroupOption,
  type CreateNotificationFormState,
} from "../types"

interface ContentStepProps {
  state: CreateNotificationFormState
  onChange: (patch: Partial<CreateNotificationFormState>) => void
}

export const ContentStep: FC<ContentStepProps> = ({ state, onChange }) => {
  const trpc = useTRPC()
  const { affiliations, isAdministrator } = useAuthorization()
  const { data: groups = [] } = useQuery(trpc.group.all.queryOptions())

  const remainingCharacters = SHORT_DESCRIPTION_MAX_LENGTH - state.shortDescription.length

  const eligibleActorOptions: ActorGroupOption[] = (() => {
    const candidateOptions =
      state.actorGroupOptions.length > 0
        ? state.actorGroupOptions
        : groups.map((group) => ({ slug: group.slug, label: group.abbreviation }))

    if (isAdministrator) {
      return candidateOptions
    }

    return candidateOptions.filter((option) => affiliations.has(option.slug))
  })()

  return (
    <Stack gap="md">
      {state.typeMode === "broadcast" && !state.typeLocked ? (
        <Input.Wrapper label="Type" required>
          <SegmentedControl
            fullWidth
            value={state.type}
            onChange={(value) => onChange({ type: value as "BROADCAST" | "BROADCAST_IMPORTANT" })}
            data={[
              { label: "Vanlig varsling", value: "BROADCAST" },
              { label: "Viktig varsling", value: "BROADCAST_IMPORTANT" },
            ]}
          />
        </Input.Wrapper>
      ) : (
        <TextInput label="Type" value={mapNotificationTypeToLabel(state.type)} readOnly />
      )}

      <Select
        label="Sendt av"
        placeholder="Velg gruppe"
        data={eligibleActorOptions.map((option) => ({ value: option.slug, label: option.label }))}
        value={state.actorGroupId}
        onChange={(value) => onChange({ actorGroupId: value })}
        disabled={state.actorGroupLocked}
        searchable
        required
        clearable={false}
        nothingFoundMessage="Ingen tilgjengelige grupper"
      />

      <TextInput
        label="Tittel"
        placeholder="Ny informasjon om arrangementet"
        required
        value={state.title}
        onChange={(event) => onChange({ title: event.currentTarget.value })}
      />

      <Textarea
        label="Kort beskrivelse"
        placeholder="En kort forhåndsvisning som vises i varslingslisten"
        value={state.shortDescription}
        onChange={(event) => {
          const nextValue = event.currentTarget.value.slice(0, SHORT_DESCRIPTION_MAX_LENGTH)
          onChange({ shortDescription: nextValue })
        }}
        minRows={2}
        description={`${remainingCharacters} tegn gjenstår`}
      />

      <Input.Wrapper label="Innhold" required>
        <RichTextEditorField
          value={state.content}
          onChange={(value) => onChange({ content: value })}
          editorProps={{}}
        />
      </Input.Wrapper>

      <DestinationCard
        destination={state.destination}
        locked={state.destinationLocked}
        onClear={() =>
          onChange({
            destination: {
              payloadType: "NONE",
              payload: null,
              label: "Ingen destinasjon",
            },
          })
        }
      />
    </Stack>
  )
}
