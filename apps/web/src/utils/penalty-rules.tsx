import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Text, TextLink, Title, cn } from "@dotkomonline/ui"
import Image from "next/image"
import Link from "next/link"

interface Props {
  small: boolean
}

export const PenaltyRules = ({ small = false }: Partial<Props>) => {
  return (
    <div className={cn("flex flex-col", small ? "gap-8" : "gap-12")}>
      <WhatIsAMark small={small} />
      <WhatGivesAMark small={small} />
      <CancellationPolicy small={small} />
      <WaitlistPolicy small={small} />
      <PaymentPolicy small={small} />
      <BehaviorPolicy small={small} />
      <CompanyEventPolicy small={small} />
      <WhyHaveIGotMarks small={small} />
    </div>
  )
}

const WhatIsAMark = ({ small }: Props) => (
  <section className="flex flex-col gap-4">
    <Title size={small ? "md" : "lg"}>Hva er en prikk?</Title>
    <Text className={cn(small && "text-sm")}>
      Prikker er et straffetiltak for å sikre at medlemmene av Online følger reglene. Det at du har aktive prikker
      innebærer at du vil måtte vente en viss periode etter ordinær påmeldingsstart for å melde deg på et arrangement.
      Hver prikk varer i 14 dager fra tidspunktet du får den.
    </Text>

    <MarkTable small={small} />

    <Text className={cn(small && "text-sm")}>
      Prikker er overlappende. Dette betyr at dersom du får nye prikker når du allerede har aktive prikker fra en annen
      anledning, så vil disse prikkene plusses sammen. Hver anledning som har gitt deg prikker vil ha sin egen levetid
      før de ikke er aktive lenger.
    </Text>

    <Title element="h3" size={small ? "sm" : "md"}>
      Eksempel
    </Title>
    <Text className={cn(small && "text-sm")}>
      Du får 2 prikker for å melde deg av et arrangement sent. Nå har du fire timers utsettelse på alle påmeldinger.
      Fire dager senere får du to nye prikker for å ikke ha sendt inn tilbakemeldingsskjema innen tidsfristen. Nå vil du
      i ti dager fremover ha totalt 4 aktive prikker og dermed ha 24 timers utsettelse på alle påmeldinger. Etter disse
      ti dagene vil de to første prikkene løpe ut og du vil da kun ha to aktive prikker i fire dager. Dette medfører
      fire timers utsettelse på påmeldinger.
    </Text>

    <Image
      src="https://s3.eu-north-1.amazonaws.com/cdn.online.ntnu.no/web/prikkeregler-visualisation.png"
      alt="Eksempel på prikker"
      className="rounded-md"
      // 493x188 is the size of the image. 700 was chosen arbitrarily and 267 maintains aspect ratio.
      width={small ? 493 : 700}
      height={small ? 188 : 267}
    />

    <Title element="h3" size={small ? "sm" : "md"}>
      Ferier
    </Title>
    <Text className={cn(small && "text-sm")}>
      Varigheten til prikker er fryst i ferier. Disse er definert fra 5. desember til 10. januar og 1. juni til 15.
      august. Dersom en prikk gis 24. mai vil altså denne prikken utløpe 20. august.
    </Text>
  </section>
)

const WhatGivesAMark = ({ small }: Props) => (
  <section className="flex flex-col gap-4">
    <Title size={small ? "md" : "lg"}>Hva gir prikker?</Title>
    <Text className={cn(small && "text-sm")}>
      Dette er en kort punktliste. Unntak og videre forklaringer finner du lenger ned.
    </Text>

    <ul className="list-disc pl-6 space-y-2">
      <Text element="li" className={cn(small && "text-sm")}>
        Å melde seg av etter avmeldingsfristen inntil 2 timer før arrangementstart gir 2 prikker, etter dette gis det 3
        prikker.
      </Text>
      <Text element="li" className={cn(small && "text-sm")}>
        Å ikke møte opp på et arrangement man har plass på gir 3 prikker.
      </Text>
      <Text element="li" className={cn(small && "text-sm")}>
        Å møte opp etter arrangementets start eller innslipp er ferdig gir i utgangspunktet 3 prikker. Her vil en
        skjønnsmessig vurdering bli foretatt ut fra hvor sent deltakeren ankom arrangementet.
      </Text>
      <Text element="li" className={cn(small && "text-sm")}>
        Å ikke svare på tilbakemeldingsskjema innen tidsfristen gir 2 prikker.
      </Text>
      <Text element="li" className={cn(small && "text-sm")}>
        Å ikke overholde betalingsfristen gir 1 prikk. Dette medfører i tillegg suspensjon fra alle Onlines
        arrangementer inntil betaling er gjennomført.
      </Text>
    </ul>

    <Text className={cn(small && "text-sm")}>
      Den ansvarlige komiteen kan også foreta en skjønnsmessig vurdering som gagner deltakeren.
    </Text>
  </section>
)

const CancellationPolicy = ({ small }: Props) => (
  <section className="flex flex-col gap-4">
    <Title size={small ? "md" : "lg"}>Avmelding</Title>
    <ul className="list-disc pl-6 space-y-2">
      <Text element="li" className={cn(small && "text-sm")}>
        Ved sykdom eller andre ekstraordinære hendelser vil man ikke få prikk ved avmelding 5 timer før
        arrangementsstart. Etter dette gis prikker som normalt iht. punktene over.
      </Text>
      <Text element="li" className={cn(small && "text-sm")}>
        Alle komiteer ønsker at du melder deg av arrangementer selv om du vet dette vil medføre prikker. Dette er slik
        at noen andre kan bli obs på plassen sin så tidlig som mulig.
      </Text>
    </ul>
  </section>
)

const WaitlistPolicy = ({ small }: Props) => (
  <section className="flex flex-col gap-4">
    <Title size={small ? "md" : "lg"}>Venteliste</Title>
    <ul className="list-disc pl-6 space-y-2">
      <Text element="li" className={cn(small && "text-sm")}>
        Hvis du står på venteliste kan du melde deg av helt til avmeldingsfristen.
      </Text>
      <Text element="li" className={cn(small && "text-sm")}>
        Når du står på venteliste er du inneforstått med at du når som helst kan få plass på arrangementet og dermed er
        bundet til reglene for arrangementet på lik linje med andre påmeldte.
      </Text>
    </ul>
  </section>
)

const PaymentPolicy = ({ small }: Props) => (
  <section className="flex flex-col gap-4">
    <Title size={small ? "md" : "lg"}>Betaling</Title>
    <ul className="list-disc pl-6 space-y-2">
      <Text element="li" className={cn(small && "text-sm")}>
        Ved manglende betaling suspenderes man fra alle Onlines arrangementer inntil betalingen er gjennomført.
      </Text>
      <Text element="li" className={cn(small && "text-sm")}>
        Ved betalt arrangement, men manglende oppmøte, vil man ikke få tilbakebetalt dersom avmelding skjer etter frist.
        Dersom neste på venteliste er tilgjengelig kan dette gjøres unntak for.
      </Text>
    </ul>
  </section>
)

const BehaviorPolicy = ({ small }: Props) => (
  <section className="flex flex-col gap-4">
    <Title size={small ? "md" : "lg"}>Oppførsel</Title>
    <ul className="list-disc pl-6 space-y-2">
      <Text element="li" className={cn(small && "text-sm")}>
        Ved upassende oppførsel under et av Onlines arrangement vil du stå økonomisk ansvarlig for eventuelle skader, og
        i verste fall risikere utestengelse fra alle Onlines arrangement.
      </Text>
    </ul>
  </section>
)

const CompanyEventPolicy = ({ small }: Props) => (
  <section className="flex flex-col gap-4">
    <Title size={small ? "md" : "lg"}>Bedriftsarrangementer</Title>
    <ul className="list-disc pl-6 space-y-2">
      <Text element="li" className={cn(small && "text-sm")}>
        Ved bedriftsarrangementer åpner dørene i henhold til starttid på arrangementet. Ti minutter etter at dørene
        åpner slippes oppmøte på ventelisten inn dersom det er plass. 15 minutter etter at dørene åpner stenger
        innslippet.
      </Text>
      <Text element="li" className={cn(small && "text-sm")}>
        Det kreves at en deltaker svarer på den elektroniske tilbakemeldingen etter bedriftsarrangementer. Det vil komme
        e-post etter arrangementet med lenke til tilbakemeldingsskjema som må besvares innen den oppgitte fristen.
        Dersom en deltaker ikke svarer innen fristen, vil dette gi to prikker.
      </Text>
      <Text element="li" className={cn(small && "text-sm")}>
        Deltakere på bedriftsarrangementer skal delta på alle obligatoriske deler av arrangementet. For
        bedriftspresentasjon og kurs vil dette henholdsvis innebære selve presentasjonen og kursopplegget. De første 45
        minuttene med påfølgende mingling regnes også som obligatorisk. Dersom en deltaker forlater den obligatoriske
        delen uten gyldig grunn vil dette medføre 2 prikker.
      </Text>
    </ul>
  </section>
)

const WhyHaveIGotMarks = ({ small }: Props) => {
  return (
    <section className="flex flex-col gap-4">
      <Title size={small ? "md" : "lg"}>Hvorfor har jeg fått prikk?</Title>
      <Text className={cn(small && "text-sm")}>
        I{" "}
        <TextLink href="/profil">
          profilen din
        </TextLink>{" "}
        vil du kunne se prikkene dine, og eventuelle begrunnelser.
      </Text>
      <Text className={cn(small && "text-sm")}>
        Dersom du mener noe feil har skjedd, vennligst ta kontakt med arrangøren som står oppført på arrangementet.
        Kontaktinfo for arrangerende komité vises på arrangementssiden.
      </Text>
    </section>
  )
}

const MarkTable = ({ small }: Props) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>
          <Text className={cn(small && "text-sm")}>Antall prikker</Text>
        </TableHead>
        <TableHead>
          <Text className={cn(small && "text-sm")}>Utsettelse på påmeldinger</Text>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>
          <Text className={cn("text-gray-700 dark:text-stone-300", small && "text-sm")}>1 prikk</Text>
        </TableCell>
        <TableCell>
          <Text className={cn("text-gray-700 dark:text-stone-300", small && "text-sm")}>1 time</Text>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <Text className={cn("text-gray-700 dark:text-stone-300", small && "text-sm")}>2 prikker</Text>
        </TableCell>
        <TableCell>
          <Text className={cn("text-gray-700 dark:text-stone-300", small && "text-sm")}>4 timer</Text>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <Text className={cn("text-gray-700 dark:text-stone-300", small && "text-sm")}>3 prikker</Text>
        </TableCell>
        <TableCell>
          <Text className={cn("text-gray-700 dark:text-stone-300", small && "text-sm")}>24 timer</Text>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <Text className={cn("text-gray-700 dark:text-stone-300", small && "text-sm")}>6+ prikker</Text>
        </TableCell>
        <TableCell>
          <Text className={cn("text-gray-700 dark:text-stone-300", small && "text-sm")}>
            Suspensjon i 14 dager fra siste prikk
          </Text>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
)
