import { type EventId, getDefaultFeedbackAnswerDeadline } from "@dotkomonline/rpc/event"
import type { FeedbackFormId, FeedbackFormWrite, FeedbackQuestionWrite } from "@dotkomonline/rpc/feedback-form"
import { Box, Button, Group, Select, Stack, Title, Text } from "@mantine/core"
import { type FC, useEffect, useRef, useState } from "react"
import { FeedbackFormEditForm, toFeedbackFormValues } from "../components/feedback-form-edit-form"
import {
  useCreateFeedbackFormCopyMutation,
  useCreateFeedbackFormMutation,
  useUpdateFeedbackFormMutation,
} from "../mutations"
import { useEventAllQuery, useEventFeedbackFormGetQuery } from "../queries"
import { useEventContext } from "./provider"
import { useEventEditPermission } from "@/hooks/use-event-edit-permission"
import { getCurrentUTC } from "@dotkomonline/utils"

export const FeedbackPage: FC = () => {
  const { event } = useEventContext()
  const { canEdit } = useEventEditPermission()
  const feedbackFormQuery = useEventFeedbackFormGetQuery(event.id)
  const createMutation = useCreateFeedbackFormMutation()
  const createCopyMutation = useCreateFeedbackFormCopyMutation()
  const updateMutation = useUpdateFeedbackFormMutation()
  const [isDrafting, setIsDrafting] = useState(false)

  const formIdRef = useRef<FeedbackFormId | undefined>(feedbackFormQuery.data?.id)
  const { events: eventsWithFeedbackForms } = useEventAllQuery({
    page: { take: 999 },
    filter: { byHasFeedbackForm: true },
  })

  const defaultAnswerDeadline = getDefaultFeedbackAnswerDeadline(event.end)
  const feedbackFormId = feedbackFormQuery.data?.id
  const showEditor = Boolean(feedbackFormId) || isDrafting

  useEffect(() => {
    formIdRef.current = feedbackFormId
    if (feedbackFormId) {
      setIsDrafting(false)
    }
  }, [feedbackFormId])

  const onSave = async (feedbackForm: FeedbackFormWrite, questions: FeedbackQuestionWrite[]) => {
    if (formIdRef.current) {
      return await updateMutation.mutateAsync({
        id: formIdRef.current,
        feedbackForm,
        questions,
      })
    }

    const created = await createMutation.mutateAsync({
      feedbackForm,
      questions,
    })
    formIdRef.current = created.id
    return created
  }

  const createFeedbackFormCopy = (eventIdToCopyFrom: EventId) => {
    createCopyMutation.mutate({
      eventId: event.id,
      eventIdToCopyFrom: eventIdToCopyFrom,
    })
  }

  const defaultValues = feedbackFormQuery.data
    ? toFeedbackFormValues(feedbackFormQuery.data)
    : {
        feedbackForm: {
          eventId: event.id,
          answerDeadline: defaultAnswerDeadline,
        },
        questions: [],
      }

  const now = getCurrentUTC()
  const canCreateFeedbackForm = event.end > now

  return (
    <Box>
      <Title order={3} mb={16}>
        Tilbakemeldingsskjema
      </Title>

      {!feedbackFormQuery.isLoading &&
        (showEditor ? (
          <FeedbackFormEditForm
            onSave={onSave}
            defaultValues={defaultValues}
            feedbackFormId={feedbackFormId}
            eventId={event.id}
            readOnly={!canEdit}
          />
        ) : (
          <Stack>
            {!canCreateFeedbackForm ? (
              <Text mb={8} c="red.7">
                Arrangementet er over. Det er ikke lenger mulig å opprette tilbakemeldingsskjema
              </Text>
            ) : (
              <Text mb={8} c="red.7">
                Det vil ikke være mulig å opprette tilbakemeldingsskjema etter arrangementet er over
              </Text>
            )}

            <Title order={5}>Opprett blankt tilbakemeldingsskjema</Title>
            <Group>
              <Button onClick={() => setIsDrafting(true)} disabled={!canCreateFeedbackForm || !canEdit}>
                Opprett
              </Button>
            </Group>
            <Title order={5}>Opprett kopi av tilbakemeldingsskjema fra annet arrangement</Title>
            <Group>
              <Select
                disabled={!canCreateFeedbackForm || !canEdit}
                searchable={true}
                onChange={(data) => data && createFeedbackFormCopy(data)}
                placeholder="Velg et arrangement..."
                data={eventsWithFeedbackForms.map((event) => ({
                  label: event.event.title,
                  value: event.event.id,
                }))}
              />
            </Group>
          </Stack>
        ))}
    </Box>
  )
}
