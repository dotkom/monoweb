import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Icon,
  Text,
} from "@dotkomonline/ui"

export const PaymentExplanationDialog = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button type="button" className="flex flex-row gap-1 items-center">
          <Icon icon="material-symbols:info-outline-rounded" className="text-lg" />
          <Text className="text-sm">Hvordan fungerer betaling?</Text>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex flex-row gap-2 items-center justify-between font-medium">
            <span className="flex flex-row gap-2 items-center">
              <Icon
                icon="material-symbols:info-outline-rounded"
                className="text-3xl text-blue-500 dark:text-stone-300"
              />
              <Text className="text-xl">Betalingsinformasjon</Text>
            </span>
            <AlertDialogCancel>
              <Icon icon="tabler:x" className="text-lg" />
            </AlertDialogCancel>
          </AlertDialogTitle>
          <AlertDialogDescription className="flex flex-col gap-2">
            <Text element="span" className="text-left">
              Når du melder deg på et arrangement med betaling, aktiveres betalingsknappen. Den viser så en nedtelling
              som indikerer hvor lenge du har på deg til å reservere en betaling.
            </Text>
            <Text element="span" className="border-l-2 border-brand pl-3 my-1 text-left">
              <strong>Reservert betaling: </strong>
              Beløpet holdes av i banken din, men trekkes ikke før arrangementet starter.
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
