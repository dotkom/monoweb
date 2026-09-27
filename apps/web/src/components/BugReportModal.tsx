import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  Button,
  Checkbox,
  Label,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@dotkomonline/ui"
import { IconMail, IconX } from "@tabler/icons-react"
import { Controller, useForm } from "react-hook-form";
import { boolean, string, z } from "zod";
import { useTRPC } from "@/utils/trpc/client";
import { useAuthenticatedUser } from "@/utils/use-authenticated-user";

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}

export const BugReportModal = ({ open, setOpen }: Props) => {
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent size="lg" className="p-0!" onOutsideClick={() => setOpen(false)}>
        <div className="flex items-center justify-between px-4 pt-4 rounded-t-lg">
          <AlertDialogTitle asChild>
            <Title element="h1" size="lg">
              Rapporter en feil
            </Title>
          </AlertDialogTitle>
          <AlertDialogCancel>
            <IconX className="size-[1.25em]" />
          </AlertDialogCancel>
        </div>
        <div className="flex flex-col gap-1 px-4 pb-4 rounded-lg min-h-[25dvh] max-h-[75dvh] overflow-y-auto">
          <AlertDialogDescription>Har du oppdaget noe feil på nettsiden vår? Skriv en forklaring på hva som skjedde og hva du forventet.</AlertDialogDescription>

          <BugReportForm
            setOpen={setOpen}
            open={open}
          />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const BugReportFormSchema = z.object({
  email: z.string().optional(),
  title: z.string(),
  body: z.string(),
  anonymous: z.boolean(),
})
export type BugReportFormResult = z.infer<typeof BugReportFormSchema>

export const BugReportForm = ({ open, setOpen }: Props) => {
  const { dbUser } = useAuthenticatedUser()

  const form = useForm<BugReportFormResult>({
    defaultValues: {
      anonymous: dbUser == null ? true : undefined,
      email: dbUser?.email ?? undefined,
    },
    mode: "onChange",
  })

  const { trigger } = form

  useEffect(() => {
    if (open) {
      trigger()
    }
  }, [trigger, open])

  const handleSubmit = (values: BugReportFormResult) => {
    // TODO: send email through backend
    console.log(values)
    
    setOpen(false)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col pt-4 gap-2">
      <Controller
        control={form.control}
        name="email"
        rules={{
          validate: (value) =>
            (!(form.watch("anonymous") ?? false))
              ? (value?.trim().length ? true : "E-post er påkrevd")
              : true,
        }}
        render={() => (
          <div className="flex flex-col gap-2">
            <TextInput
              label="E-post"
              placeholder="ola.nordmann@gmail.com"
              required={!(form.watch("anonymous") ?? false)}
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
              placeholder="Jeg får ikke melde meg på ITEX, når jeg trykker meld på..."
              required={true}
              id="body"
              {...form.register("body")}
            />
          </div>
        )}
      />

      <Controller
        control={form.control}
        name="anonymous"
        render={({ field }) => (
          <div className="flex flex-col gap-2">
            <Checkbox
              label="Send anonymt"
              id="anonymous"
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked)
                form.trigger("email")
              }}
            />
          </div>
        )}
      />

      <div className="flex flex-row gap-4 pt-2 justify-between rounded-t-lg">
        <Button variant="secondary" size="lg" type="button" onClick={() => setOpen(false)}>
          Avbryt
        </Button>

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
      </div>
    </form>
  )
}