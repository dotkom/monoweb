import type { FeedbackFormId, FeedbackFormWrite } from "@dotkomonline/types"
import { Box, Button, Title } from "@mantine/core"
import type { FC } from "react"
import { FeedbackFormEditForm } from "../components/feedback-form-edit-form"
import { useCreateFeedbackFormMutation, useUpdateFeedbackFormMutation } from "../mutations"
import { useEventFeedbackFormGetQuery } from "../queries"
import { useEventDetailsContext } from "./provider"

export const FeedbackPage: FC = () => {
  const { event } = useEventDetailsContext()
  const feedbackFormQuery = useEventFeedbackFormGetQuery(event.id)
  const createMutation = useCreateFeedbackFormMutation()
  const updateMutation = useUpdateFeedbackFormMutation()

  const onSubmit = (id: FeedbackFormId, data: FeedbackFormWrite) => {
    updateMutation.mutate({
      id,
      data,
    })
  }

  const createEmptyFeedbackForm = () => {
    createMutation.mutate({
      eventId: event.id,
      isActive: false,
      questions: [],
    })
  }

  const defaultValues = {
    isActive: feedbackFormQuery?.data?.isActive ?? false,
    questions: feedbackFormQuery?.data?.questions ?? [],
    eventId: event.id,
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
          />
        ) : (
          <Button onClick={createEmptyFeedbackForm}>Opprett</Button>
        ))}
    </Box>
  )
}
