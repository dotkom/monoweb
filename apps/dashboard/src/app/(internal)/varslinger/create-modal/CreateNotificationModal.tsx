"use client"

import { useQueryNotification } from "@/lib/notifications"
import { useTRPC } from "@/lib/trpc-client"
import type { NotificationCreate } from "@dotkomonline/rpc"
import { Box, Button, Group, ScrollArea, Stack, Stepper, Text } from "@mantine/core"
import { type ContextModalProps, modals } from "@mantine/modals"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type FC, useState } from "react"
import { flattenAudienceRecipientIds, resolveAudience } from "./audience-model"
import { AudienceStep } from "./steps/AudienceStep"
import { ContentStep } from "./steps/ContentStep"
import { DeliveryStep } from "./steps/DeliveryStep"
import {
  createInitialFormState,
  type CreateNotificationFormState,
  type CreateNotificationLaunchContext,
} from "./types"

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function validateContentStep(state: CreateNotificationFormState): string | null {
  if (state.actorGroupId === null || state.actorGroupId.length === 0) {
    return "Sendt av er påkrevd. Velg en gruppe du er medlem av."
  }

  if (state.title.trim().length === 0) {
    return "Tittel er påkrevd."
  }

  if (stripHtml(state.content).length === 0) {
    return "Innhold er påkrevd."
  }

  return null
}

function validateAudienceStep(state: CreateNotificationFormState): string | null {
  const uniqueCount = resolveAudience(state.audience).uniqueCount

  if (uniqueCount === 0) {
    return "Velg minst én mottaker."
  }

  return null
}

export const CreateNotificationModal: FC<ContextModalProps<CreateNotificationLaunchContext>> = ({
  context,
  id,
  innerProps,
}) => {
  const close = () => context.closeModal(id)
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const notification = useQueryNotification()
  const [activeStep, setActiveStep] = useState(0)
  const [state, setState] = useState<CreateNotificationFormState>(() => createInitialFormState(innerProps))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const createMutation = useMutation(
    trpc.notification.create.mutationOptions({
      onMutate: () => {
        notification.loading({
          title: "Lager varsling...",
          message: "Varslingen blir opprettet.",
        })
      },
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({ queryKey: trpc.notification.findMany.queryKey() })

        if (innerProps.invalidatePayload !== undefined) {
          await queryClient.invalidateQueries({
            queryKey: trpc.notification.findManyByPayload.queryKey(innerProps.invalidatePayload),
          })
        }

        notification.complete({
          title: "Varsling opprettet",
          message: `Varslingen "${data.title}" har blitt opprettet.`,
        })
        close()
      },
      onError: (error) => {
        notification.fail({
          title: "Feil oppsto",
          message: `En feil oppsto under opprettelse av varslingen: ${error.toString()}.`,
        })
      },
    })
  )

  const patchState = (patch: Partial<CreateNotificationFormState>) => {
    setState((current) => ({ ...current, ...patch }))
    setErrorMessage(null)
  }

  const handleContinue = () => {
    if (activeStep === 0) {
      const contentError = validateContentStep(state)

      if (contentError !== null) {
        setErrorMessage(contentError)
        return
      }

      setActiveStep(1)
      return
    }

    if (activeStep === 1) {
      const audienceError = validateAudienceStep(state)

      if (audienceError !== null) {
        setErrorMessage(audienceError)
        return
      }

      setActiveStep(2)
    }
  }

  const handleBack = () => {
    setErrorMessage(null)
    setActiveStep((current) => Math.max(0, current - 1))
  }

  const handleSend = () => {
    const contentError = validateContentStep(state)
    const audienceError = validateAudienceStep(state)

    if (contentError !== null) {
      setErrorMessage(contentError)
      setActiveStep(0)
      return
    }

    if (audienceError !== null) {
      setErrorMessage(audienceError)
      setActiveStep(1)
      return
    }

    if (state.actorGroupId === null) {
      setErrorMessage("Sendt av er påkrevd. Velg en gruppe du er medlem av.")
      setActiveStep(0)
      return
    }

    const payload: NotificationCreate = {
      title: state.title.trim(),
      shortDescription: state.shortDescription.trim().length > 0 ? state.shortDescription.trim() : null,
      content: state.content,
      type: state.type,
      payload: state.destination.payload,
      payloadType: state.destination.payloadType,
      actorGroupId: state.actorGroupId,
      taskId: null,
      recipientIds: flattenAudienceRecipientIds(state.audience),
    }

    createMutation.mutate(payload)
  }

  return (
    <Stack gap="md" style={{ height: "70vh" }}>
      <Stepper active={activeStep} onStepClick={setActiveStep} allowNextStepsSelect={false}>
        <Stepper.Step label="Innhold" />
        <Stepper.Step label="Mottakere" />
        <Stepper.Step label="Sending" />
      </Stepper>

      <ScrollArea type="auto" offsetScrollbars style={{ flex: 1, minHeight: 0 }}>
        <Box pr="xs">
          {activeStep === 0 && <ContentStep state={state} onChange={patchState} />}
          {activeStep === 1 && (
            <AudienceStep audience={state.audience} onChange={(audience) => patchState({ audience })} />
          )}
          {activeStep === 2 && (
            <DeliveryStep
              title={state.title}
              destination={state.destination}
              audience={state.audience}
              onReviewAudience={() => setActiveStep(1)}
            />
          )}
        </Box>
      </ScrollArea>

      {errorMessage !== null && (
        <Text size="sm" c="red">
          {errorMessage}
        </Text>
      )}

      <Group justify="space-between" mt="auto">
        <Button type="button" variant="default" onClick={close} disabled={createMutation.isPending}>
          Avbryt
        </Button>
        <Group>
          {activeStep > 0 && (
            <Button type="button" variant="default" onClick={handleBack} disabled={createMutation.isPending}>
              Tilbake
            </Button>
          )}
          {activeStep < 2 ? (
            <Button type="button" onClick={handleContinue}>
              Fortsett
            </Button>
          ) : (
            <Button type="button" onClick={handleSend} loading={createMutation.isPending}>
              Send varsling
            </Button>
          )}
        </Group>
      </Group>
    </Stack>
  )
}

export function openCreateNotificationModal(context: CreateNotificationLaunchContext) {
  modals.openContextModal({
    modal: "notification/create",
    title: "Opprett varsling",
    size: "xl",
    centered: true,
    innerProps: context,
    styles: {
      content: {
        height: "80vh",
        display: "flex",
        flexDirection: "column",
      },
      body: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      },
      header: {
        flexShrink: 0,
      },
    },
  })
}
