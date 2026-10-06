"use client"

import type { CommitteeApplicationApplicantView } from "@dotkomonline/rpc/committee-application"
import { GroupLogoAvatar } from "@/components/atoms/GroupLogo"
import { MazemapEmbed } from "@/components/MazemapEmbed"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Button, Text, Title } from "@dotkomonline/ui"
import { IconCalendarTime, IconCheck, IconArrowUpRight } from "@tabler/icons-react"
import { differenceInCalendarDays, format, isSameDay } from "date-fns"
import { nb } from "date-fns/locale"
import { capitalizeFirstLetter } from "@dotkomonline/utils"

export function ApplicationStatus({ application }: { application: CommitteeApplicationApplicantView }) {
  const [isReady, setIsReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    setIsReady(true)
    const interval = window.setInterval(() => {
      setCurrentTime(new Date())
    }, 30_000)

    return () => window.clearInterval(interval)
  }, [])

  const interviews = application.groups
    .flatMap((group) => {
      if (group.interview === null) {
        return []
      }

      const interview = group.interview
      const startsAt = format(interview.startsAt, "HH:mm")
      const endsAt = format(
        interview.endsAt,
        isSameDay(interview.startsAt, interview.endsAt) ? "HH:mm" : "d. MMM, HH:mm",
        {
          locale: nb,
        }
      )

      let directionsUrl: string | null = null

      if (interview.locationUrl !== null && URL.canParse(interview.locationUrl)) {
        const location = new URL(interview.locationUrl)

        if (location.protocol === "https:" || location.protocol === "http:") {
          directionsUrl = location.href
        }

        if (location.origin === "https://use.mazemap.com" && location.pathname === "/") {
          const parameters = new URLSearchParams(location.search)

          for (const [key, value] of new URLSearchParams(location.hash.slice(1))) {
            parameters.set(key, value)
          }

          const poiId = parameters.get("sharepoi") ?? parameters.get("dest")
          const poiType = parameters.get("sharepoitype") ?? parameters.get("desttype")

          if (poiType === "poi" && poiId !== null && /^\d+$/.test(poiId)) {
            directionsUrl = `https://use.mazemap.com/?desttype=poi&dest=${poiId}`
          }
        }
      }

      return [
        {
          ...interview,
          groupName: group.name,
          imageUrl: group.imageUrl,
          weekday: capitalizeFirstLetter(format(interview.startsAt, "EEEE", { locale: nb })),
          date: format(interview.startsAt, "d. MMM", { locale: nb }),
          time: `${startsAt}–${endsAt}`,
          directionsUrl,
          locationLabel: interview.locationName === "" ? "Møtested kommer" : interview.locationName,
        },
      ]
    })
    .toSorted(
      (firstInterview, secondInterview) => firstInterview.startsAt.getTime() - secondInterview.startsAt.getTime()
    )
  const upcomingInterviews = interviews.filter((interview) => interview.endsAt > currentTime)
  const completedInterviews = interviews.filter((interview) => interview.endsAt <= currentTime)
  const nextInterview = upcomingInterviews[0]
  const canEdit = application.interviewsPublishedAt === null && application.applicationsCloseAt > currentTime
  const deadline = format(application.applicationsCloseAt, "d. MMM yyyy 'kl.' HH:mm", { locale: nb })
  const waitingGroups = application.groups.filter((group) => group.interview === null)
  let relativeDate = ""

  if (nextInterview !== undefined) {
    const daysUntilInterview = differenceInCalendarDays(nextInterview.startsAt, currentTime)

    if (daysUntilInterview === 0) {
      relativeDate = "I dag"
    } else if (daysUntilInterview === 1) {
      relativeDate = "I morgen"
    } else if (daysUntilInterview === -1) {
      relativeDate = "I går"
    } else {
      relativeDate = capitalizeFirstLetter(
        nb.formatDistance("xDays", Math.abs(daysUntilInterview), {
          addSuffix: true,
          comparison: daysUntilInterview > 0 ? 1 : -1,
        })
      )
    }
  }

  if (!isReady) {
    return <Text role="status">Laster søknaden din…</Text>
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 py-8">
      <header className="flex flex-col gap-3">
        <Text className="text-sm text-gray-600 dark:text-stone-400">{application.applicationPeriodName}</Text>
        <Title element="h1" size="xl">
          Dine intervjuer
        </Title>

        {interviews.length === 0 && (
          <Text className="flex items-center gap-2 text-sm text-gray-600 dark:text-stone-400">
            <IconCheck size={18} aria-hidden="true" />
            Søknaden din er sendt inn. Takk for at du vil bli med!
          </Text>
        )}
      </header>

      {canEdit && (
        <section
          aria-labelledby="your-application-title"
          className="flex flex-col gap-4 rounded-xl border border-border p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-col gap-1">
            <Title element="h2" size="sm" id="your-application-title">
              Søknaden din
            </Title>

            <Text className="text-sm text-muted-foreground">
              Du kan endre svar, komiteer og tilgjengelighet frem til {deadline}.
            </Text>
          </div>

          <Link
            href="/opptak/rediger"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Rediger søknaden din
          </Link>
        </section>
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

      {nextInterview !== undefined && (
        <section className="grid items-start gap-6 text-start rounded-xl bg-[radial-gradient(ellipse_at_top_left,var(--color-blue-200)_0%,transparent_65%),linear-gradient(135deg,var(--color-blue-50),var(--color-background)_80%)] p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] dark:bg-[radial-gradient(ellipse_at_top_left,var(--color-blue-950)_0%,transparent_65%),linear-gradient(135deg,var(--color-slate-950),var(--color-background)_80%)]">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex items-center gap-3">
              <GroupLogoAvatar src={nextInterview.imageUrl} alt="" className="size-10 shrink-0" />
              <Title element="h3" size="lg" className="text-start">
                {nextInterview.groupName}
              </Title>
            </div>
            <Text className="text-start text-sm">{nextInterview.locationLabel}</Text>
            <time
              dateTime={nextInterview.startsAt.toISOString()}
              className="flex min-w-0 flex-col items-start gap-2 border-t border-blue-200/70 pt-5 dark:border-blue-800/50"
            >
              <span className="text-xl font-semibold tracking-tight text-blue-950 dark:text-blue-100">
                {relativeDate}
              </span>
              <span className="text-sm font-medium tabular-nums">
                {nextInterview.weekday} · {nextInterview.time}
              </span>
              <span className="text-xs text-muted-foreground">{nextInterview.date}</span>
            </time>
          </div>

          <MazemapEmbed url={nextInterview.locationUrl} title={`Kart: ${nextInterview.locationName}`} />
        </section>
      )}

      {upcomingInterviews.length > 1 && (
        <section aria-labelledby="scheduled-interviews-title" className="flex flex-col gap-3">
          <Title element="h2" size="sm" id="scheduled-interviews-title">
            Senere intervjuer
          </Title>
          <ol className="flex flex-col gap-3">
            {upcomingInterviews.slice(1).map((interview) => {
              return (
                <li
                  key={interview.id}
                  className="flex flex-col gap-4 rounded-xl border border-border p-4 text-start sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <GroupLogoAvatar src={interview.imageUrl} alt="" className="size-10 shrink-0" />
                    <div className="flex min-w-0 flex-col gap-1">
                      <Title element="h3" size="sm" className="text-start">
                        {interview.groupName}
                      </Title>
                      <Text element="time" dateTime={interview.startsAt.toISOString()} className="text-start text-sm">
                        {interview.weekday} {interview.date} · {interview.time}
                      </Text>
                      <Text className="text-start text-sm">{interview.locationLabel}</Text>
                    </div>
                  </div>
                  {interview.directionsUrl !== null && (
                    <Button
                      element="a"
                      variant="secondary"
                      href={interview.directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full shrink-0 sm:w-auto"
                    >
                      Veibeskrivelse
                      <IconArrowUpRight className="size-4" aria-hidden="true" />
                    </Button>
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {interviews.length > 0 && nextInterview === undefined && (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/40 px-6 py-10 text-center">
          <IconCheck size={40} aria-hidden="true" className="text-muted-foreground" />
          <Title element="h2" size="md">
            Ingen flere planlagte intervjuer
          </Title>
          <Text className="text-muted-foreground">Du finner tidligere intervjutider nedenfor.</Text>
        </section>
      )}

      {completedInterviews.length > 0 && (
        <section aria-labelledby="completed-interviews-title" className="flex flex-col gap-3 text-start">
          <Title element="h2" size="sm" id="completed-interviews-title">
            Tidligere intervjuer ({completedInterviews.length})
          </Title>
          <ol className="flex flex-col gap-3">
            {completedInterviews.map((interview) => {
              return (
                <li key={interview.id} className="flex flex-col gap-2 rounded-xl border border-border p-4 text-start">
                  <Title element="h3" size="sm" className="text-start">
                    <GroupLogoAvatar src={interview.imageUrl} alt="" className="mr-2 inline-flex size-8 align-middle" />
                    {interview.groupName}
                  </Title>
                  <Text element="time" dateTime={interview.startsAt.toISOString()} className="text-start text-sm">
                    {interview.weekday} {interview.date}, kl. {interview.time}
                  </Text>
                  <Text className="text-start text-sm">{interview.locationLabel}</Text>
                </li>
              )
            })}
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
                <GroupLogoAvatar src={group.imageUrl} alt="" className="mr-2 inline-flex size-6 align-middle" />
                {group.name}
              </Text>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
