import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerAccessToken } from "@/lib/server-access-token"
import { createServerClientWithAccessToken, server } from "@/utils/trpc/server"
import { ApplicationFlow } from "../ApplicationFlow"

export const metadata: Metadata = { title: "Rediger søknad | Online" }

export default async function EditApplicationPage() {
  const accessToken = await getServerAccessToken()
  if (accessToken === null) {
    redirect("/auth/login?returnTo=%2Fopptak%2Frediger")
  }
  const applicationPeriod = await server.committeeApplication.findOpenPeriod.query()
  if (applicationPeriod === null) {
    redirect("/opptak/intervjuer")
  }
  const application = await createServerClientWithAccessToken(accessToken).committeeApplication.findMyApplication.query(
    { applicationPeriodId: applicationPeriod.id }
  )
  if (application === null) {
    redirect("/opptak")
  }
  if (application.interviewsPublishedAt !== null || application.applicationsCloseAt <= new Date()) {
    redirect("/opptak/intervjuer")
  }
  return <ApplicationFlow applicationPeriod={applicationPeriod} application={application} />
}
