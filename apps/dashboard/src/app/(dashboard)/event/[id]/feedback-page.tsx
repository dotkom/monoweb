import type { FeedbackFormId } from "@dotkomonline/types"
import { Box, Button } from "@mantine/core"
import type { FC } from "react"
import { FeedbackFormEditForm, type FormValues } from "../components/feedback-form-edit-form"
import { useCreateFeedbackFormMutation, useUpdateFeedbackFormMutation } from "../mutations"
import { useEventFeedbackFormGetQuery } from "../queries"
import { useEventDetailsContext } from "./provider"

export const FeedbackPage: FC = () => {
  const { event } = useEventDetailsContext()
  const feedbackFormQuery = useEventFeedbackFormGetQuery(event.id)
  const createMutation = useCreateFeedbackFormMutation()
  const updateMutation = useUpdateFeedbackFormMutation()

  const onSubmit = (id: FeedbackFormId, formValues: FormValues) => {
    updateMutation.mutate({
      id,
      data: {
        eventId: event.id,
        ...formValues,
      },
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
  }

  return (
    <Box>
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
