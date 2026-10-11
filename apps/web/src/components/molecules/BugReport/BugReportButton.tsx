"use client"

import type { AppRouter } from "@dotkomonline/rpc"
import { Button } from "@dotkomonline/ui"
import { IconCheck, IconLoader } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import type { TRPCClientErrorLike } from "@trpc/client"
import { usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useTRPC } from "src/app/(admin)/admin/lib/trpc-client"
import { useAuthenticatedUser } from "src/app/(admin)/admin/lib/use-authenticated-user"

export interface BugReportButtonProps {
  message: string
  error: TRPCClientErrorLike<AppRouter>
}

type SendingState = "unsent" | "sending" | "sent" | "error"

export const BugReportButton = ({ message, error }: BugReportButtonProps) => {
  const trpc = useTRPC()
  const { dbUser } = useAuthenticatedUser()

  const [sendingState, setSendingState] = useState<SendingState>("unsent")

  const pathname = usePathname()
  const searchParams = useSearchParams()

  const mutate = useMutation(
    trpc.user.sendBugReportEmail.mutationOptions({
      onSuccess: () => {
        setSendingState("sent")
      },
      onMutate: () => {
        setSendingState("sending")
      },
      onError: () => {
        setSendingState("error")
      },
    })
  )

  function onClick() {
    const trpcPath = error?.data?.path ?? undefined

    let body = "En admin rapporterte en feil fra Adminsiden\n"
    body += `Url: https://online.ntnu.no/${pathname + searchParams.toString()}\n`

    if (trpcPath) {
      body += `Trpc-path: ${trpcPath}\n`
    }

    body += message

    mutate.mutateAsync({
      title: "Admin bug report",
      body: body,
      email: dbUser?.email ?? undefined,
    })
  }

  function getButtonLabel() {
    switch (sendingState) {
      case "unsent":
        return "Rapporter feil"
      case "sending":
        return "Sender"
      case "sent":
        return "Sendt"
      case "error":
        return "Kunne ikke sende e-posten"
    }
  }

  return (
    <Button
      onClick={onClick}
      disabled={sendingState === "sending" || sendingState === "sent"}
      className="flex flex-row gap-2 items-center"
    >
      {sendingState === "sending" ? <IconLoader className="animate-spin" /> : sendingState === "sent" && <IconCheck />}
      {getButtonLabel()}
    </Button>
  )
}
