import { type BugReportFormResult, BugReportFormSchema } from "@dotkomonline/rpc/user"
import { Button, Textarea, TextInput } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconMail } from "@tabler/icons-react"
import { useMutation } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { useTRPC } from "src/utils/trpc/client"
import { useAuthenticatedUser } from "src/utils/use-authenticated-user"

export interface BugReportProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export const BugReportForm = ({ setOpen }: BugReportProps) => {
  const trpc = useTRPC()
  const { dbUser } = useAuthenticatedUser()
  const mutate = useMutation(trpc.user.sendBugReportEmail.mutationOptions())

  const form = useForm<BugReportFormResult>({
    defaultValues: {
      email: dbUser?.email ?? undefined,
    },
    mode: "onChange",
    resolver: zodResolver(BugReportFormSchema),
  })

  const handleSubmit = (values: BugReportFormResult) => {
    mutate.mutateAsync(values)

    setOpen(false)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col pt-4 gap-5">
      <Controller
        control={form.control}
        name="email"
        render={() => (
          <div className="flex flex-col gap-2">
            <TextInput
              label="E-post"
              type="email"
              placeholder="ola.nordmann@gmail.com"
              description="Legg til e-post om du ønsker oppdateringer om problemet"
              required={false}
              id="email"
              {...form.register("email")}
            />
          </div>
        )}
      />
      <Controller
        control={form.control}
        name="title"
        rules={{ required: "Rapporten trenger tittel" }}
        render={() => (
          <div className="flex flex-col gap-2">
            <TextInput
              label="Tittel"
              placeholder="Får ikke meldt meg på et arrangement"
              required={true}
              id="title"
              {...form.register("title")}
            />
          </div>
        )}
      />
      <Controller
        control={form.control}
        name="body"
        rules={{ required: "Rapporten trenger innhold" }}
        render={() => (
          <div className="flex flex-col gap-2">
            <Textarea
              label="Innhold"
              placeholder="Jeg får ikke melde meg på ITEX. Når jeg trykker meld på..."
              description="Vennligst forklar feilen så grundig som mulig"
              required={true}
              id="body"
              {...form.register("body")}
            />
          </div>
        )}
      />

      <div className="flex flex-row-reverse gap-4 pt-2 rounded-t-lg">
        <Button
          type="submit"
          variant={form.formState.isValid ? "default" : "outline"}
          color={form.formState.isValid ? "brand" : "gray"}
          size="lg"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
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
