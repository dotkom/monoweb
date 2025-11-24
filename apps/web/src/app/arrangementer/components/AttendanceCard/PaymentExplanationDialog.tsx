import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  Text,
  Title,
} from "@dotkomonline/ui"
import { IconQuestionMark, IconX } from "@tabler/icons-react"
import { useState } from "react"

export const PaymentExplanationDialog = () => {
  const [open, setOpen] = useState(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <div className="flex flex-row gap-2 items-center text-slate-700 hover:text-black dark:text-stone-300 dark:hover:text-stone-100 transition-colors">
          <IconQuestionMark className="size-[1.25em]" />
          <Text className="text-sm">Hvordan virker betaling?</Text>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent onOutsideClick={() => setOpen(false)}>
        <div className="flex flex-row gap-4 justify-between">
          <AlertDialogTitle className="flex flex-row gap-2 items-center justify-between font-medium" asChild>
            <Title element="h1" size="lg">
              Betalingsinformasjon
            </Title>
          </AlertDialogTitle>
          <AlertDialogCancel>
            <IconX className="size-[1.25em]" />
          </AlertDialogCancel>
        </div>

        <div className="flex flex-col gap-4">
          <Text className="text-sm">
            Når du melder deg på et arrangement med betaling, aktiveres betalingsknappen. Den viser så en nedtelling som
            indikerer hvor lenge du har på deg til å reservere en betaling.
          </Text>
          <Text className="text-sm">
            Dersom ingen betaling er reservert innen nedtellingen er ferdig, vil du automatisk bli avmeldt
            arrangementet. Etter avmeldingsfristen blir du i stedet suspendert inntil du har betalt.
          </Text>
          <Text className="text-sm">
            Beløpet holdes av på kontoen din og trekkes senest på den femte dagen, eller før dersom avmeldingsfristen
            inntrer tidligere. Etter avmeldingsfristen blir du i stedet trukket med en gang.
          </Text>
          <Text className="text-sm">
            Du kan selv melde deg av når som helst før avmeldingsfristen. Da blir betalingsreservasjonen automatisk
            kansellert i banken din.
          </Text>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
