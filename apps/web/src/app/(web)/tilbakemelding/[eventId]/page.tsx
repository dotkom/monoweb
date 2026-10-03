import { EventFeedbackForm } from "@/app/tilbakemelding/components/FeedbackForm"
import { getServerSession } from "@/auth"
import { env } from "@/env"
import { server } from "@/utils/trpc/server"
import type { Event } from "@dotkomonline/rpc/event"
import type { FeedbackRejectionCause } from "@dotkomonline/rpc/feedback-form"
import { Text, TextLink, Title } from "@dotkomonline/ui"
import { createAbsoluteEventPageUrl, createAuthorizeUrl } from "@dotkomonline/utils"
import { redirect } from "next/navigation"

function getFailureMessage(cause: FeedbackRejectionCause) {
  switch (cause) {
    case "ALREADY_ANSWERED":
      return "Du har allerede svart på dette skjemaet."
    case "DID_NOT_ATTEND":
      return "Du kan ikke svare på dette skjemaet."
    case "TOO_EARLY":
      return "Tilbakemelding er ikke tilgjengelig ennå."
    case "TOO_LATE":
      return "Fristen for å gi tilbakemelding har utløpt."
    case "NO_FEEDBACK_FORM":
      return "Dette arrangementet har ikke et tilbakemeldingsskjema."
  }
}

const EventFeedbackPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<{ preview: string }>
}) => {
  const { eventId } = await params
  const { preview } = await searchParams
  const isPreview = preview === "true"

  const session = await getServerSession()

  if (session === null) {
    const authorizeParams = new URLSearchParams()
    if (!authorizeParams.has("returnTo")) {
      authorizeParams.set("returnTo", `/tilbakemelding/${eventId}${preview ? `?preview=${preview}` : ""}`)
    }
    redirect(createAuthorizeUrl(authorizeParams))
  }

  const feedbackForm = await server.event.feedback.getFormByEventId.query(eventId)

  if (isPreview) {
    const staffPreview = await server.event.feedback.getFeedbackFormStaffPreview.query(feedbackForm.id)

    return (
      <PageContent event={staffPreview.event} isPreview>
        <EventFeedbackForm feedbackForm={staffPreview.feedbackForm} preview />
      </PageContent>
    )
  }

  const feedbackEligibility = await server.event.feedback.getFeedbackEligibility.query(feedbackForm.id)

  if (feedbackEligibility.success) {
    return (
      <PageContent event={feedbackEligibility.event} isPreview={false}>
        <EventFeedbackForm
          feedbackForm={feedbackEligibility.feedbackForm}
          attendee={feedbackEligibility.attendee}
          preview={isPreview}
        />
      </PageContent>
    )
  }

  const { event } = await server.event.get.query(eventId)

  return (
    <PageContent event={event} isPreview={false}>
      <Text>{getFailureMessage(feedbackEligibility.cause)}</Text>
    </PageContent>
  )
}

export default EventFeedbackPage

interface PageContentProps {
  event: Event
  isPreview: boolean
  children: React.ReactNode
}

const PageContent = ({ event, isPreview, children }: PageContentProps) => (
  <div className="mx-auto flex max-w-2xl flex-col px-3 py-12">
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <Title element="h1" className="text-gray-800 dark:text-stone-300">
            Gi tilbakemelding på {event.title}
          </Title>
          {isPreview && (
            <Text className="text-sm text-muted-foreground">
              Forhåndsvisning - det er ikke mulig å sende inn tilbakemelding.
            </Text>
          )}
        </div>
        <TextLink
          href={createAbsoluteEventPageUrl(env.NEXT_PUBLIC_ORIGIN, event.id, event.title)}
          className="w-fit text-gray-800 dark:text-stone-300 hover:text-gray-600 dark:hover:text-stone-400 underline"
        >
          Se arrangement
        </TextLink>
      </div>
    </div>

    <div className="mt-8">{children}</div>
  </div>
)
