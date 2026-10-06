import type { CommitteeApplicationApplicantView } from "@dotkomonline/rpc/committee-application"
import Link from "next/link"
import { Text, Title } from "@dotkomonline/ui"
import { IconCalendarTime, IconCheck, IconMapPin } from "@tabler/icons-react"
import { formatInterviewAvailability } from "./interview-availability"

export function ApplicationStatus({ application }: { application: CommitteeApplicationApplicantView }) {
  const interviews = application.groups
    .flatMap((group) => {
      if (group.interview === null) {
        return []
      }

      return [{ ...group.interview, groupName: group.name }]
    })
    .sort((firstInterview, secondInterview) => firstInterview.startsAt.getTime() - secondInterview.startsAt.getTime())
  const waitingGroups = application.groups.filter((group) => group.interview === null)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 py-8">
      <header className="flex flex-col gap-3">
        <Text className="text-sm text-gray-600 dark:text-stone-400">{application.applicationPeriodName}</Text>
        <Title element="h1" size="xl">
          Dine intervjuer
        </Title>
        <Text className="flex items-center gap-2 text-sm text-gray-600 dark:text-stone-400">
          <IconCheck size={18} aria-hidden="true" />
          Søknaden din er sendt inn. Takk for at du vil bli med!
        </Text>
      </header>

      {application.interviewsPublishedAt === null && application.applicationsCloseAt > new Date() && (
        <Link href="/opptak/rediger" className="w-fit font-medium underline underline-offset-4">
          Rediger søknaden din
        </Link>
      )}

      {interviews.length === 0 && (
        <section
          aria-labelledby="waiting-interviews-title"
          className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 px-6 py-10 text-center dark:border-stone-700 dark:bg-stone-800"
        >
          <IconCalendarTime size={40} aria-hidden="true" className="text-gray-600 dark:text-stone-400" />
          <Title element="h2" size="md" id="waiting-interviews-title">
            {application.interviewsPublishedAt === null
              ? "Du vil snart bli satt opp i intervjuer"
              : "Ingen intervjutider er satt opp"}
          </Title>
          <Text className="max-w-md text-gray-600 dark:text-stone-400">
            {application.interviewsPublishedAt === null
              ? "Vi jobber med å finne intervjutider til deg. Tid og sted vises her så snart intervjuene er klare."
              : "Ta kontakt med komiteene du har søkt på for å avtale intervjutid."}
          </Text>
        </section>
      )}

      {interviews.length > 0 && (
        <section aria-labelledby="scheduled-interviews-title" className="flex flex-col gap-4">
          <Title element="h2" size="md" id="scheduled-interviews-title">
            Avtalte intervjuer
          </Title>
          <Text className="text-sm text-gray-600 dark:text-stone-400">Alle tider er i norsk tid.</Text>
          <ol className="flex flex-col gap-4">
            {interviews.map((interview) => (
              <li
                key={interview.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 p-5 dark:border-stone-700"
              >
                <Title element="h3" size="sm">
                  {interview.groupName}
                </Title>
                <Text element="time" dateTime={interview.startsAt.toISOString()}>
                  {formatInterviewAvailability(interview)}
                </Text>
                <Text className="flex items-center gap-2 text-sm text-gray-600 dark:text-stone-400">
                  <IconMapPin size={18} aria-hidden="true" />
                  {interview.locationUrl !== null && /^https?:\/\//.test(interview.locationUrl) && (
                    <a href={interview.locationUrl} className="underline underline-offset-4">
                      {interview.locationName}
                    </a>
                  )}
                  {(interview.locationUrl === null || !/^https?:\/\//.test(interview.locationUrl)) &&
                    interview.locationName}
                </Text>
              </li>
            ))}
          </ol>
        </section>
      )}

      {waitingGroups.length > 0 && (
        <section aria-labelledby="waiting-groups-title" className="flex flex-col gap-3">
          <Title element="h2" size="sm" id="waiting-groups-title">
            {application.interviewsPublishedAt === null ? "Venter på intervjutid" : "Komiteer uten avtalt intervjutid"}
          </Title>
          {interviews.length > 0 && application.interviewsPublishedAt === null && (
            <Text>Du vil snart bli satt opp i intervjuer med resten av komiteene du har søkt på.</Text>
          )}
          <ul className="flex flex-wrap gap-2">
            {waitingGroups.map((group) => (
              <Text element="li" key={group.id} className="rounded-lg bg-gray-100 px-3 py-2 text-sm dark:bg-stone-800">
                {group.name}
              </Text>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
