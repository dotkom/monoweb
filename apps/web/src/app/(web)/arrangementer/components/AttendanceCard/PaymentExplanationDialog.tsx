"use client"

import { DialogClose, DialogContent, DialogTitle, Text, Title } from "@dotkomonline/ui"
import { IconX } from "@tabler/icons-react"

export const PaymentExplanationDialogContent = () => (
  <DialogContent size="lg">
    <div className="flex flex-row gap-4 justify-between">
      <DialogTitle className="flex flex-row gap-2 items-center justify-between font-medium" asChild>
        <Title element="h1" size="lg">
          Betalingsinformasjon
        </Title>
      </DialogTitle>
      <DialogClose>
        <IconX className="size-[1.25em]" />
      </DialogClose>
    </div>

    <div className="flex flex-col gap-4">
      <Text className="text-sm">
        Når du melder deg på et arrangement med betaling, aktiveres betalingsknappen. Den viser så en nedtelling som
        indikerer hvor lenge du har på deg til å reservere en betaling.
      </Text>
      <Text className="text-sm">
        Dersom ingen betaling er reservert innen nedtellingen er ferdig, vil du automatisk bli avmeldt arrangementet.
        Etter avmeldingsfristen blir du i stedet suspendert inntil du har betalt.
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
  </DialogContent>
)
