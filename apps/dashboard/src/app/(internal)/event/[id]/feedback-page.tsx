import type { FeedbackFormId, FeedbackFormWrite, FeedbackQuestionWrite } from "@dotkomonline/types"
import { Box, Button, Title } from "@mantine/core"
import type { FC } from "react"
import { FeedbackFormEditForm } from "../components/feedback-form-edit-form"
import { useCreateFeedbackFormMutation, useUpdateFeedbackFormMutation } from "../mutations"
import { useEventFeedbackFormGetQuery } from "../queries"
import { useEventContext } from "./provider"

export const FeedbackPage: FC = () => {
  const { event, attendance } = useEventContext()
  const feedbackFormQuery = useEventFeedbackFormGetQuery(event.id)
  const createMutation = useCreateFeedbackFormMutation()
  const updateMutation = useUpdateFeedbackFormMutation()

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
          <Button onClick={createEmptyFeedbackForm}>Opprett</Button>
        ))}
    </Box>
  )
}
