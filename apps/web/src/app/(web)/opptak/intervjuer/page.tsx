import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerAccessToken } from "@/lib/server-access-token"
import { createServerClientWithAccessToken } from "@/utils/trpc/server"
import { ApplicationStatus } from "../ApplicationStatus"

export const metadata: Metadata = { title: "Dine intervjuer | Komitéopptak | Online" }

export default async function InterviewsPage() {
  const accessToken = await getServerAccessToken()

  if (accessToken === null) {
    redirect("/auth/login?returnTo=%2Fopptak%2Fintervjuer")
  }

  const application =
    await createServerClientWithAccessToken(accessToken).committeeApplication.findMyApplication.query()

  if (application === null) {
    redirect("/opptak")
  }

  return <ApplicationStatus application={application} />
}
