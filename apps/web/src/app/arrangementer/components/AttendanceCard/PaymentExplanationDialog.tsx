import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Text,
} from "@dotkomonline/ui"
import { IconInfoCircle, IconX } from "@tabler/icons-react"

export const PaymentExplanationDialog = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <div className="text-sm flex flex-row gap-1 items-center cursor-pointer text-slate-800 hover:text-black dark:text-stone-400 dark:hover:text-stone-100 transition-colors">
          <IconInfoCircle className="h-[1.25em] w-[1.25em]" />
          <Text>Hvordan fungerer betaling?</Text>
        </div>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex flex-row gap-2 items-center justify-between font-medium">
            <span className="text-xl flex flex-row gap-2 items-center">
              <IconInfoCircle className="h-[1.25em] w-[1.25em] text-blue-500 dark:text-stone-300" />
              <Text>Betalingsinformasjon</Text>
            </span>
            <AlertDialogCancel>
              <IconX className="h-[1.25em] w-[1.25em]" />
            </AlertDialogCancel>
          </AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-2">
            <Text element="span" className="text-left">
              Når du melder deg på et arrangement med betaling, aktiveres betalingsknappen. Den viser så en nedtelling
              som indikerer hvor lenge du har på deg til å reservere en betaling.
            </Text>
            <Text element="span" className="border-l-2 border-brand pl-3 my-1 text-left">
              <strong>Reservert betaling: </strong>
              Beløpet holdes av på kontoen din og trekkes senest på den femte dagen, eller før dersom avmeldingsfristen
              inntrer tidligere.
            </Text>
            <Text element="span" className="text-left">
              Dersom ingen betaling er reservert innen nedtellingen er ferdig, vil du automatisk bli avmeldt
              arrangementet.
            </Text>
            <Text element="span" className="text-left">
              Du kan selv melde deg av når som helst før avmeldingsfristen. Da blir betalingsreservasjonen automatisk
              kansellert i banken din.
            </Text>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  )
}
