import { useTRPC } from "@/utils/trpc/client"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import {
  BUG_REPORT_BODY_MAX_LENGTH,
  BUG_REPORT_TITLE_MAX_LENGTH,
  type BugReportFormResult,
  BugReportFormSchema,
} from "@dotkomonline/rpc/user"
import { Button, Text, Textarea, TextInput, toast } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconMail } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { useFullPathname } from "src/utils/use-full-pathname"
import { BugReportEmailRequired } from "./BugReportEmailRequired"

export interface BugReportProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export const BugReportForm = ({ setOpen }: BugReportProps) => {
  const trpcClient = useTRPC()
  const { dbUser: user, isLoading, isInvalid } = useAuthenticatedUser()
  const fullPathname = useFullPathname()
  const bugReportMutation = useMutation(
    trpcClient.user.sendBugReportEmail.mutationOptions({
      onSuccess: () => {
        setOpen(false)

        toast.add({
          title: "Suksess",
          description: "Feilrapporten er sendt. Du får en bekreftelse på e-post.",
        })
      },
      onError: () => {
        toast.add({
          title: "Feil",
          description: "Noe gikk galt. Vennligst prøv igjen senere.",
        })
      },
    })
  )

  const form = useForm<BugReportFormResult>({
    mode: "onChange",
    resolver: zodResolver(BugReportFormSchema),
  })

  const handleSubmit = (values: BugReportFormResult) => {
    bugReportMutation.mutate({ ...values, userAgent: navigator.userAgent })
  }

  if (isLoading) {
    return <Text className="pt-4">Laster bruker …</Text>
  }

  if (!user || isInvalid) {
    return (
      <div className="flex flex-col gap-4 pt-4">
        <Text>Du må være logget inn for å rapportere en feil.</Text>
        <Button element="a" href={createAuthorizeUrl({ returnTo: fullPathname })} className="w-fit">
          Logg inn
        </Button>
      </div>
    )
  }

  if (!user.email) {
    return (
      <div className="pt-4">
        <BugReportEmailRequired />
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col pt-4 gap-5">
      <Controller
        control={form.control}
        name="title"
        rules={{ required: "Rapporten trenger tittel" }}
        render={() => (
          <TextInput
            label="Tittel"
            placeholder="Får ikke meldt meg på et arrangement"
            required
            id="title"
            maxLength={BUG_REPORT_TITLE_MAX_LENGTH}
            error={form.formState.errors.title?.message}
            {...form.register("title")}
          />
        )}
      />
      <Controller
        control={form.control}
        name="body"
        rules={{ required: "Rapporten trenger innhold" }}
        render={() => (
          <Textarea
            label="Innhold"
            placeholder="Jeg får ikke melde meg på ITEX. Når jeg trykker meld på..."
            description="Vennligst forklar feilen så grundig som mulig"
            required
            id="body"
            maxLength={BUG_REPORT_BODY_MAX_LENGTH}
            error={form.formState.errors.body?.message}
            {...form.register("body")}
          />
        )}
      />

      <div className="flex flex-row-reverse gap-4 pt-2 rounded-t-lg">
        <Button type="submit" variant="default" size="lg" disabled={bugReportMutation.isPending}>
          <IconMail className="size-[1.25em]" />
          Send
        </Button>

        <Button variant="secondary" size="lg" type="button" onClick={() => setOpen(false)}>
          Avbryt
        </Button>
      </div>
    </form>
  )
}
