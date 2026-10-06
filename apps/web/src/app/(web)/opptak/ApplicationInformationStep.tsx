import { Text, Title } from "@dotkomonline/ui"
import { IconUsers, IconPencil, IconCalendar } from "@tabler/icons-react"

export function ApplicationInformationStep() {
  return (
    <div className="flex flex-col gap-8">
      <section className="relative isolate -mx-3 overflow-hidden rounded-2xl bg-blue-50 p-5 sm:p-6 dark:bg-blue-950/40">
        <div className="relative z-10 w-3/5 pr-4 sm:pr-6">
          <Title
            element="h1"
            size="lg"
            id="application-step-title"
            tabIndex={-1}
            className="mb-3 text-blue-700 outline-none dark:text-blue-200"
          >
            Nysgjerrig på komitélivet i Online?
          </Title>

          <Text className="max-w-prose text-sm leading-relaxed text-slate-700 dark:text-blue-100/80">
            Vil du skape noe sammen med andre, prøve noe nytt eller bli bedre kjent med folk i Online? Utforsk gruppene
            og fortell oss hva du har lyst til å være med på.
          </Text>
        </div>
        <div
          aria-hidden="true"
          data-decoration="mesh"
          className="pointer-events-none absolute inset-y-0 right-0 w-2/5 overflow-hidden"
        >
          <div className="absolute left-0 -top-12 size-96 bg-blue-500/25 mask-[url('/committee-application/mesh.svg')] mask-left mask-no-repeat mask-contain dark:bg-blue-300/15" />
        </div>
      </section>

      <section aria-labelledby="application-introduction-steps" className="flex flex-col gap-4">
        <Title element="h2" size="sm" id="application-introduction-steps">
          Slik søker du
        </Title>

        <ol className="flex flex-col gap-4">
          <li className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <IconUsers className="size-5" aria-hidden="true" />
            </span>
            <div>
              <Text className="font-medium">Finn gruppene som passer deg</Text>
              <Text className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Les om komiteene og velg de du er nysgjerrig på.
              </Text>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <IconPencil className="size-5" aria-hidden="true" />
            </span>
            <div>
              <Text className="font-medium">Fortell litt om deg selv</Text>
              <Text className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Skriv om interessene dine og hvem du er.
              </Text>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <IconCalendar className="size-5" aria-hidden="true" />
            </span>
            <div>
              <Text className="font-medium">Velg tider og se over søknaden</Text>
              <Text className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Marker når du ikke kan komme på intervju.
              </Text>
            </div>
          </li>
        </ol>
      </section>
      <Text className="text-sm text-muted-foreground">
        Du kan gå tilbake og endre valgene dine underveis og etterpå.
      </Text>
    </div>
  )
}
