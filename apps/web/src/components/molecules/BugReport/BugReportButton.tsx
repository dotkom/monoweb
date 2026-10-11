"use client"

import { AppRouter } from "@dotkomonline/rpc";
import { Button, toast } from "@dotkomonline/ui";
import { IconCheck, IconFidgetSpinner, IconLoader2 } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import type { TRPCClientErrorLike } from "@trpc/client"
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTRPC } from "src/app/(admin)/admin/lib/trpc-client";
import { useAuthenticatedUser } from "src/app/(admin)/admin/lib/use-authenticated-user";

export interface BugReportButtonProps {
    message: string,
    error: TRPCClientErrorLike<AppRouter>
}

type SendingStateEnum = "unsent" | "sending" | "sent" | "error"

export const BugReportButton = ({ message, error }: BugReportButtonProps) => {
    const trpc = useTRPC()
    const { dbUser } = useAuthenticatedUser()

    const [sendingState, setSendingState] = useState<SendingStateEnum>("unsent") 

    const pathname = usePathname()
    const searchParams = useSearchParams()

    const mutate = useMutation(
        trpc.user.sendBugReportEmail.mutationOptions({
            onSuccess: () => {
                setSendingState("sent")
            },
            onError: () => {
                toast.add({
                    title: "Feil",
                    description: "Kunne ikke sende e-post",
                })
            },
        })
    )
    
    function onClick() {
        const trpcPath = error?.data?.path ?? undefined

        setSendingState("sending")

        mutate.mutateAsync({
            title: "Admin bug report",
            body: `Url: https://online.ntnu.no/${pathname + searchParams.toString()}\n${trpcPath ? `Trpc-path: ${trpcPath}` : ""}\n${message}`,
            email: dbUser?.email ?? undefined,
        })
    }

    switch (sendingState) {
        case "unsent": {
            return (
                <Button onClick={onClick}>Rapporter feil</Button>
            )
        }
        case "sending": {
            return (
                <Button onClick={onClick} disabled={true}>
                    <div className="flex flex-row items-center gap-2">
                        <IconLoader2 className="animate-spin" />
                        Sender
                    </div>
                </Button>
            )
        }
        case "sent": {
            return (
                <Button onClick={onClick} disabled={true}>
                    <div className="flex flex-row items-center gap-2">
                        <IconCheck />
                        Sendt
                    </div>
                </Button>
            )
        }
    }
}