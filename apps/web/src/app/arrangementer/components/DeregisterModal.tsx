"use client"

import type { Attendee } from "@dotkomonline/rpc/attendance"
import { DeregisterReasonTypeSchema, type Event, mapDeregisterReasonTypeToLabel } from "@dotkomonline/rpc/event"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  Button,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  Textarea,
  Title,
  cn,
} from "@dotkomonline/ui"
import { IconInfoCircle, IconUserMinus, IconX } from "@tabler/icons-react"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const DEREGISTER_REASON_TYPE_OPTIONS = Object.values(DeregisterReasonTypeSchema.enum).map((type) => ({
  value: type,
  label: mapDeregisterReasonTypeToLabel(type),
}))

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  event: Event
  attendee: Attendee
  unregisterForAttendance: (deregisterReason: DeregisterReasonFormResult) => void
}

export const DeregisterModal = ({ open, setOpen, event, unregisterForAttendance, attendee }: Props) => {
  const hasCompanyOrganizer = event.companies.length > 0

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent size="lg" initialFocus={false} onOutsideClick={() => setOpen(false)}>
        <div className="flex flex-row gap-4 justify-between">
          <AlertDialogTitle asChild>
            <Title element="h1" size="lg">
              Avmelding
            </Title>
          </AlertDialogTitle>
          <AlertDialogCancel>
            <IconX className="size-[1.25em]" />
          </AlertDialogCancel>
        </div>
        <div className="mb-4 flex flex-col gap-3">
          <AlertDialogDescription>Er du sikker på at du vil melde deg av arrangementet?</AlertDialogDescription>

          {hasCompanyOrganizer && (
            <div className="flex flex-col gap-3 rounded-lg border bg-yellow-50 border-yellow-200 dark:border-yellow-700 dark:bg-yellow-900/20 p-2 -mx-2">
              <div className="flex flex-row gap-1 items-center">
                <IconInfoCircle className="size-3.5 text-yellow-700 dark:text-yellow-500" />
                <Text element="span" className="text-xs text-yellow-700 dark:text-yellow-500">
                  Dette arrangementet er i samarbeid med en bedrift.
                </Text>
              </div>

              <Text element="span" className="text-sm">
                Arrangementer med bedrifter er en viktig del av samarbeidet vårt med næringslivet, og utgjør en av
                hovedinntektskildene til linjeforeningen.
              </Text>

              <Text element="span" className="text-sm">
                Avmelding like før arrangementstart kan føre til at det blir vanskeligere å finne samarbeid i fremtiden.
              </Text>
            </div>
          )}
        </div>

        <DeregisterForm
          unregisterForAttendance={unregisterForAttendance}
          setOpen={setOpen}
          open={open}
          attendee={attendee}
          event={event}
        />
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const DeregisterReasonFormSchema = z.object({
  type: DeregisterReasonTypeSchema,
  details: z.string().nullable(),
})
export type DeregisterReasonFormResult = z.infer<typeof DeregisterReasonFormSchema>

const DeregisterForm = ({ unregisterForAttendance, setOpen, open }: Props) => {
  const form = useForm<DeregisterReasonFormResult>({
    defaultValues: {
      details: null,
    },
    mode: "onChange",
  })

  const { trigger } = form

  useEffect(() => {
    if (open) {
      trigger()
    }
  }, [trigger, open])

  const handleSubmit = (values: DeregisterReasonFormResult) => {
    unregisterForAttendance(values)

    setOpen(false)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
      <Controller
        control={form.control}
        name="type"
        rules={{ required: "Du må velge en grunn" }}
        render={({ field }) => (
          <div className="flex flex-col gap-1 md:gap-1.5">
            <Label htmlFor="type" className="flex flex-row items-center gap-0.5">
              <Text element="span">Avmeldingsgrunn</Text>
              <Text element="span" className="text-red-500">
                *
              </Text>
            </Label>
            <Select
              value={field.value ?? null}
              onValueChange={(selectedValue) => field.onChange(selectedValue ?? undefined)}
              items={DEREGISTER_REASON_TYPE_OPTIONS}
            >
              <SelectTrigger
                id="type"
                className={cn(
                  form.formState.errors.type &&
                    "border-red-600 focus:ring-red-600 focus:border-red-600 dark:border-red-400 dark:focus:ring-red-400 dark:focus:border-red-400"
                )}
              >
                <SelectValue
                  placeholder="Velg grunn"
                  className={cn(
                    "placeholder:text-gray-500 transition-all",
                    form.formState.errors.type && "text-red-600 dark:text-red-400"
                  )}
                />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {DEREGISTER_REASON_TYPE_OPTIONS.map((type) => (
                    <SelectItem value={type.value} key={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {form.formState.errors.type && (
              <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
                {form.formState.errors.type.message ?? "En feil oppstod"}
              </Text>
            )}
          </div>
        )}
      />

      <div className="flex flex-col gap-1 md:gap-1.5">
        <Label htmlFor="details">Begrunnelse</Label>
        <Textarea placeholder="Skriv inn begrunnelse..." {...form.register("details")} id="details" />
      </div>

      <div className="flex flex-row gap-4 justify-end items-center">
        <Button variant="ghost" size="lg" type="button" onClick={() => setOpen(false)}>
          Avbryt
        </Button>

        <Button
          type="submit"
          variant={form.formState.isValid ? "default" : "outline"}
          color={form.formState.isValid ? "red" : "gray"}
          size="lg"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          <IconUserMinus className="size-[1.25em]" />
          Meld meg av
        </Button>
      </div>
    </form>
  )
}
