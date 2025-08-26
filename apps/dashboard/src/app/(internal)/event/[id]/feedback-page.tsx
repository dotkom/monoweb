import type { EventId, FeedbackFormId, FeedbackFormWrite, FeedbackQuestionWrite } from "@dotkomonline/types"
import { Box, Button, Group, Select, Stack, Title } from "@mantine/core"
import type { FC } from "react"
import { FeedbackFormEditForm } from "../components/feedback-form-edit-form"
import {
  useCreateFeedbackFormCopyMutation,
  useCreateFeedbackFormMutation,
  useUpdateFeedbackFormMutation,
} from "../mutations"
import { useEventAllQuery, useEventFeedbackFormGetQuery } from "../queries"
import { useEventContext } from "./provider"

export const FeedbackPage: FC = () => {
  const { event } = useEventContext()
  const feedbackFormQuery = useEventFeedbackFormGetQuery(event.id)
  const createMutation = useCreateFeedbackFormMutation()
  const createCopyMutation = useCreateFeedbackFormCopyMutation()
  const updateMutation = useUpdateFeedbackFormMutation()
  const { events: eventsWithFeedbackForms } = useEventAllQuery({
    page: { take: 999 },
    filter: { byHasFeedbackForm: true },
  })

  const onSubmit = (id: FeedbackFormId, feedbackForm: FeedbackFormWrite, questions: FeedbackQuestionWrite[]) => {
    updateMutation.mutate({
      id,
      feedbackForm,
      questions,
    })
  }

  const createEmptyFeedbackForm = () => {
    createMutation.mutate({
      feedbackForm: {
        eventId: event.id,
        isActive: false,
      },
      questions: [],
    })
  }

  const createFeedbackFormCopy = (eventIdToCopyFrom: EventId) => {
    createCopyMutation.mutate({
      eventId: event.id,
      eventIdToCopyFrom: eventIdToCopyFrom,
    })
  }

  const defaultValues = {
    feedbackForm: {
      eventId: event.id,
      isActive: feedbackFormQuery?.data?.isActive ?? false,
    },
    questions: feedbackFormQuery?.data?.questions ?? [],
  }

  return (
    <Box>
      <Title order={3} mb={16}>
        Tilbakemeldingsskjema
      </Title>

      {!feedbackFormQuery.isLoading &&
        (feedbackFormQuery.data?.id ? (
          <FeedbackFormEditForm
            onSubmit={onSubmit}
            defaultValues={defaultValues}
            feedbackFormId={feedbackFormQuery.data?.id}
            eventId={event.id}
          />
        ) : (
          <Stack>
            <Title order={4}>Opprett blankt tilbakemeldingsskjema</Title>
            <Group>
              <Button onClick={createEmptyFeedbackForm}>Opprett</Button>
            </Group>
            <Title order={4}>Opprett kopi av tilbakemeldingsskjema fra annet arrangement</Title>
            <Group>
              <Select
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
