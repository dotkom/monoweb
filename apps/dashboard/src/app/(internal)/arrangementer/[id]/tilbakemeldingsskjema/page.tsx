"use client"

import { FieldShell } from "@/components/forms/FieldShell"
import { EventSelectInput } from "@/components/forms/new-form/EventSelectInput"
import { type EventId, getDefaultFeedbackAnswerDeadline } from "@dotkomonline/rpc/event"
import type { FeedbackFormId, FeedbackFormWrite, FeedbackQuestionWrite } from "@dotkomonline/rpc/feedback-form"
import { Button, Text, Title } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { useEffect, useRef, useState } from "react"
import { useEventContext } from "../provider"
import {
  useCreateFeedbackFormCopyMutation,
  useCreateFeedbackFormMutation,
  useUpdateFeedbackFormMutation,
} from "../../mutations"
import { useEventFeedbackFormGetQuery } from "../../queries"
import { useEventEditPermission } from "../../use-event-edit-permission"
import { FeedbackFormEditForm, toFeedbackFormValues } from "./components/FeedbackFormEditForm"

export default function EventFeedbackPage() {
  const { event } = useEventContext()
  const { canEdit } = useEventEditPermission()
  const feedbackFormQuery = useEventFeedbackFormGetQuery(event.id)
  const createMutation = useCreateFeedbackFormMutation()
  const createCopyMutation = useCreateFeedbackFormCopyMutation()
  const updateMutation = useUpdateFeedbackFormMutation()
  const [isDrafting, setIsDrafting] = useState(false)

  const formIdRef = useRef<FeedbackFormId | undefined>(feedbackFormQuery.data?.id)

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
    <div>
      <Title size="md">Tilbakemeldingsskjema</Title>

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
          <div className="flex flex-col gap-4">
            {!canCreateFeedbackForm ? (
              <Text className="mb-2 text-red-700">
                Arrangementet er over. Det er ikke lenger mulig å opprette tilbakemeldingsskjema
              </Text>
            ) : (
              <Text className="mb-2 text-red-700">
                Det vil ikke være mulig å opprette tilbakemeldingsskjema etter arrangementet er over
              </Text>
            )}

            <Title element="h3" size="sm">
              Opprett blankt tilbakemeldingsskjema
            </Title>
            <Button
              type="button"
              variant="default"
              className="w-fit"
              onClick={() => setIsDrafting(true)}
              disabled={!canCreateFeedbackForm || !canEdit}
            >
              Opprett
            </Button>
            <Title element="h3" size="sm">
              Opprett kopi av tilbakemeldingsskjema fra annet arrangement
            </Title>
            <FieldShell id="feedback-copy-event" label="Velg arrangement">
              <EventSelectInput
                id="feedback-copy-event"
                value=""
                onChange={(data) => {
                  if (data) {
                    createFeedbackFormCopy(data)
                  }
                }}
                placeholder="Velg et arrangement..."
                disabled={!canCreateFeedbackForm || !canEdit}
              />
            </FieldShell>
          </div>
        ))}
    </div>
  )
}
