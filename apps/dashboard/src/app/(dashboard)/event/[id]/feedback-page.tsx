import { Box, Text } from "@mantine/core"
import Link from "next/link"
import type { FC } from "react"
import { FeedbackForm, type FormValues } from "../components/feedback-form"
import { useCreateFeedbackFormMutation, useUpdateFeedbackFormMutation } from "../mutations"
import { useEventFeedbackFormGetQuery } from "../queries"
import { useEventDetailsContext } from "./provider"

export const FeedbackPage: FC = () => {
  const { event } = useEventDetailsContext()
  const feedbackFormQuery = useEventFeedbackFormGetQuery(event.id)
  const createMutation = useCreateFeedbackFormMutation()
  const updateMutation = useUpdateFeedbackFormMutation()

  const onSubmit = (formValues: FormValues) => {
    if (feedbackFormQuery?.data?.id) {
      updateMutation.mutate({
        id: feedbackFormQuery.data.id,
        data: {
          eventId: event.id,
          ...formValues,
        },
      })
    } else {
      createMutation.mutate({
        eventId: event.id,
        ...formValues,
      })
    }
  }

  const defaultValues = {
    isActive: feedbackFormQuery?.data?.isActive ?? false,
    questions: feedbackFormQuery?.data?.questions ?? [],
  }

  return (
    <Box>
      {event.end.getTime() <= Date.now() ? (
        <Text>
          Du kan ikke endre tilbakemeldingsskjemaet etter arrangemenetet har fullført. Se svar{" "}
          {/* TODO: Link to answers page */}
          <Link href={"/"}>her</Link>
        </Text>
      ) : (
        !feedbackFormQuery.isLoading && <FeedbackForm onSubmit={onSubmit} defaultValues={defaultValues} />
      )}
    </Box>
  )
}
