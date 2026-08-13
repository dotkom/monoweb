"use client"

import { useTRPC } from "@/lib/trpc-client"
import type { Feature, FeatureKey } from "@dotkomonline/rpc/feature"
import {
  Alert,
  Box,
  Button,
  Divider,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { differenceInCalendarDays, format, isAfter, isBefore, isValid, parseISO } from "date-fns"
import { useEffect, useState } from "react"

const FEATURES: Record<FeatureKey, { label: string; description: string }> = {
  "fadderuke-2026-notice": {
    label: "Fadderukene 2026-banner",
    description: "Banneret øverst på forsiden.",
  },
  "front-page-notice": {
    label: "Melding på forsiden",
    description: "En kort melding over hovedinnholdet.",
  },
}

type ActivationMode = "off" | "always" | "scheduled"

type FeatureDraft = {
  feature: Feature
  mode: ActivationMode
  startsAt: string
  endsAt: string
  noticeText: string
}

function getActivationMode(feature: Feature): ActivationMode {
  if (!feature.enabled) return "off"
  return feature.startsAt || feature.endsAt ? "scheduled" : "always"
}

function getNoticeText(configuration: unknown) {
  if (configuration && typeof configuration === "object" && "text" in configuration) {
    const text = (configuration as { text?: unknown }).text
    return typeof text === "string" ? text : ""
  }
  return ""
}

function toInputDate(date: Date | null) {
  return date ? format(date, "yyyy-MM-dd'T'HH:mm") : ""
}

function toDraft(feature: Feature): FeatureDraft {
  return {
    feature,
    mode: getActivationMode(feature),
    startsAt: toInputDate(feature.startsAt),
    endsAt: toInputDate(feature.endsAt),
    noticeText: getNoticeText(feature.configuration),
  }
}

function getScheduleStatus(draft: FeatureDraft, now = new Date()) {
  const startsAt = parseISO(draft.startsAt)
  const endsAt = parseISO(draft.endsAt)

  if (!draft.startsAt || !draft.endsAt || !isValid(startsAt) || !isValid(endsAt)) {
    return "Ikke synlig"
  }

  if (isBefore(now, startsAt)) {
    return `Synlig om ${Math.max(1, differenceInCalendarDays(startsAt, now))} dager`
  }

  if (!isAfter(now, endsAt)) {
    return `Synlig i ${Math.max(1, differenceInCalendarDays(endsAt, now))} dager til`
  }

  return "Ikke synlig"
}

export default function FeaturesPage() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const query = useQuery(trpc.feature.all.queryOptions())
  const [drafts, setDrafts] = useState<FeatureDraft[]>([])
  const [errors, setErrors] = useState<Partial<Record<FeatureKey, string>>>({})

  useEffect(() => {
    if (query.data) setDrafts(query.data.map(toDraft))
  }, [query.data])

  const mutation = useMutation(trpc.feature.update.mutationOptions())

  const updateDraft = (key: FeatureKey, update: Partial<FeatureDraft>) => {
    setDrafts((current) => current.map((draft) => (draft.feature.key === key ? { ...draft, ...update } : draft)))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const save = async () => {
    const validationErrors: Partial<Record<FeatureKey, string>> = {}
    for (const draft of drafts) {
      if (draft.mode === "scheduled" && (!draft.startsAt || !draft.endsAt)) {
        validationErrors[draft.feature.key] = "Velg både start og slutt."
      } else if (draft.mode === "scheduled" && isAfter(parseISO(draft.startsAt), parseISO(draft.endsAt))) {
        validationErrors[draft.feature.key] = "Slutt må være etter start."
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      await Promise.all(
        drafts.map((draft) =>
          mutation.mutateAsync({
            key: draft.feature.key,
            enabled: draft.mode !== "off",
            startsAt: draft.mode === "scheduled" ? parseISO(draft.startsAt) : null,
            endsAt: draft.mode === "scheduled" ? parseISO(draft.endsAt) : null,
            configuration:
              draft.feature.key === "front-page-notice" ? { text: draft.noticeText } : draft.feature.configuration,
          })
        )
      )
      await queryClient.invalidateQueries(trpc.feature.all.queryOptions())
      notifications.show({ color: "green", message: "Endringene ble lagret" })
    } catch (error) {
      notifications.show({
        color: "red",
        message: error instanceof Error ? error.message : "Kunne ikke lagre endringene",
      })
    }
  }

  return (
    <Stack gap="lg" maw={900}>
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={1}>Funksjoner</Title>
          <Text c="dimmed" size="sm">
            Velg om innhold skal være skjult, alltid synlig eller planlagt.
          </Text>
        </div>
        <Button onClick={save} loading={mutation.isPending} disabled={drafts.length === 0}>
          Lagre endringer
        </Button>
      </Group>

      {query.error && <Alert color="red">{query.error.message}</Alert>}

      <Skeleton visible={query.isLoading} mih={240}>
        <Paper withBorder radius="md">
          {drafts.map((draft, index) => {
            const key = draft.feature.key
            const details = FEATURES[key]

            return (
              <Box key={key}>
                {index > 0 && <Divider />}
                <Box p="lg">
                  <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
                    <div>
                      <Text fw={600}>{details.label}</Text>
                      <Text size="sm" c="dimmed">
                        {details.description}
                      </Text>
                    </div>
                    <Select
                      label="Synlighet"
                      w={190}
                      allowDeselect={false}
                      value={draft.mode}
                      onChange={(value) => updateDraft(key, { mode: value as ActivationMode })}
                      data={[
                        { value: "off", label: "Skjult" },
                        { value: "always", label: "Vis alltid" },
                        { value: "scheduled", label: "Planlagt" },
                      ]}
                    />
                  </Group>

                  {draft.mode === "scheduled" && (
                    <Box mt="md">
                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <TextInput
                          type="datetime-local"
                          label="Fra"
                          value={draft.startsAt}
                          error={errors[key]}
                          onChange={(event) => updateDraft(key, { startsAt: event.currentTarget.value })}
                        />
                        <TextInput
                          type="datetime-local"
                          label="Til"
                          value={draft.endsAt}
                          onChange={(event) => updateDraft(key, { endsAt: event.currentTarget.value })}
                        />
                      </SimpleGrid>
                      <Text size="xs" c="dimmed" mt={6}>
                        {getScheduleStatus(draft)}
                      </Text>
                    </Box>
                  )}

                  {key === "front-page-notice" && (
                    <Textarea
                      mt="md"
                      label="Melding"
                      description="Markdown støttes."
                      placeholder="Skriv meldingen som skal vises på forsiden"
                      autosize
                      minRows={3}
                      value={draft.noticeText}
                      onChange={(event) => updateDraft(key, { noticeText: event.currentTarget.value })}
                    />
                  )}
                </Box>
              </Box>
            )
          })}
        </Paper>
      </Skeleton>
    </Stack>
  )
}
