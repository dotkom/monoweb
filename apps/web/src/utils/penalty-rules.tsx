import { env } from "@/env"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Text, Title } from "@dotkomonline/ui"
import Image from "next/image"
import Link from "next/link"

export const PenaltyRules = () => {
  return (
    <div className="flex flex-col gap-6 ">
      <WhatIsAMark />
      <WhatGivesAMark />
      <CancellationPolicy />
      <WaitlistPolicy />
      <PaymentPolicy />
      <BehaviorPolicy />
      <CompanyEventPolicy />
      <WhyHaveIGotMarks />
    </div>
  )
}

const WhatIsAMark = () => (
  <section className="space-y-4">
    <Title className="font-bold">Hva er en prikk?</Title>
    <Text>
      Prikker er et straffetiltak for å sikre at medlemmene av Online følger reglene. Det at du har aktive prikker
      innebærer at du vil måtte vente en viss periode etter ordinær påmeldingsstart for å melde deg på et arrangement.
      Hver prikk varer i 14 dager fra tidspunktet du får den.
    </Text>

    <MarkTable />
    <Text>
      Prikker er overlappende. Dette betyr at dersom du får nye prikker når du allerede har aktive prikker fra en annen
      anledning, så vil disse prikkene plusses sammen. Hver anledning som har gitt deg prikker vil ha sin egen levetid
      før de ikke er aktive lenger.
    </Text>

    <Title size={"lg"} className="font-semibold mt-4">
      Eksempel
    </Title>
    <Text>
      Du får 2 prikker for å melde deg av et arrangement sent. Nå har du fire timers utsettelse på alle påmeldinger.
      Fire dager senere får du to nye prikker for å ikke ha sendt inn tilbakemeldingsskjema innen tidsfristen. Nå vil du
      i ti dager fremover ha totalt 4 aktive prikker og dermed ha 24 timers utsettelse på alle påmeldinger. Etter disse
      ti dagene vil de to første prikkene løpe ut og du vil da kun ha to aktive prikker i fire dager. Dette medfører
      fire timers utsettelse på påmeldinger.
    </Text>

    <Text className="italic">Eksempelet visualisert:</Text>
    <Image
      src="https://s3.eu-north-1.amazonaws.com/cdn.online.ntnu.no/web/prikkeregler-visualisation.png"
      alt="Eksempel på prikker"
      className="w-auto h-auto"
      width={700}
      height={400}
    />

    <Title size={"md"} className="font-semibold mt-4">
      Ferier
    </Title>
    <Text>
      Varigheten til prikker er fryst i ferier. Disse er definert fra 5. desember til 10. januar og 1. juni til 15.
      august. Dersom en prikk gis 24. mai vil altså denne prikken utløpe 20. august.
    </Text>
  </section>
)

const WhatGivesAMark = () => (
  <section className="space-y-4">
    <Title className="font-bold">Hva gir prikker?</Title>
    <Text>Dette er en kort punktliste. Unntak og videre forklaringer finner du lenger ned.</Text>
    <ul className="list-disc pl-6 space-y-2 ">
      <li>
        Å melde seg av etter avmeldingsfristen inntil 2 timer før arrangementstart gir 2 prikker, etter dette gis det 3
        prikker.
      </li>
      <li>Å ikke møte opp på et arrangement man har plass på gir 3 prikker.</li>
      <li>
        Å møte opp etter arrangementets start eller innslipp er ferdig gir i utgangspunktet 3 prikker. Her vil en
        skjønnsmessig vurdering bli foretatt ut fra hvor sent deltakeren ankom arrangementet.
      </li>
      <li>Å ikke svare på tilbakemeldingsskjema innen tidsfristen gir 2 prikker.</li>
      <li>
        Å ikke overholde betalingsfristen gir 1 prikk. Dette medfører i tillegg suspensjon fra alle Onlines
        arrangementer inntil betaling er gjennomført.
      </li>
    </ul>
    <Text>Den ansvarlige komiteen kan også foreta en skjønnsmessig vurdering som gagner deltakeren.</Text>
  </section>
)

const CancellationPolicy = () => (
  <section className="space-y-4">
    <Title className="font-bold">Avmelding</Title>
    <ul className="list-disc pl-6 space-y-2">
      <li>
        Ved sykdom eller andre ekstraordinære hendelser vil man ikke få prikk ved avmelding 5 timer før
        arrangementsstart. Etter dette gis prikker som normalt iht. punktene over.
      </li>
      <li>
        Alle komiteer ønsker at du melder deg av arrangementer selv om du vet dette vil medføre prikker. Dette er slik
        at noen andre kan bli obs på plassen sin så tidlig som mulig.
      </li>
    </ul>
  </section>
)

const WaitlistPolicy = () => (
  <section className="space-y-4">
    <Title className="font-bold">Venteliste</Title>
    <ul className="list-disc pl-6 space-y-2">
      <li>Hvis du står på venteliste kan du melde deg av helt til arrangementet starter.</li>
      <li>
        Når du står på venteliste er du inneforstått med at du når som helst kan få plass på arrangementet og dermed er
        bundet til reglene for arrangementet på lik linje med andre påmeldte.
      </li>
    </ul>
  </section>
)

const PaymentPolicy = () => (
  <section className="space-y-4">
    <Title className="font-bold">Betaling</Title>
    <ul className="list-disc pl-6 space-y-2">
      <li>Ved manglende betaling suspenderes man fra alle Onlines arrangementer inntil betalingen er gjennomført.</li>
      <li>
        Ved betalt arrangement, men manglende oppmøte, vil man ikke få tilbakebetalt dersom avmelding skjer etter frist.
        Dersom neste på venteliste er tilgjengelig kan dette gjøres unntak for.
      </li>
    </ul>
  </section>
)

const BehaviorPolicy = () => (
  <section className="space-y-4">
    <Title className="font-bold">Oppførsel</Title>
    <ul className="list-disc pl-6 space-y-2">
      <li>
        Ved upassende oppførsel under et av Onlines arrangement vil du stå økonomisk ansvarlig for eventuelle skader, og
        i verste fall risikere utestengelse fra alle Onlines arrangement.
      </li>
    </ul>
  </section>
)

const CompanyEventPolicy = () => (
  <section className="space-y-4">
    <Title className="font-bold">Bedriftsarrangementer</Title>
    <ul className="list-disc pl-6 space-y-2">
      <li>
        Ved bedriftsarrangementer åpner dørene i henhold til starttid på arrangementet. Ti minutter etter at dørene
        åpner slippes oppmøte på ventelisten inn dersom det er plass. 15 minutter etter at dørene åpner stenger
        innslippet.
      </li>
      <li>
        Det kreves at en deltaker svarer på den elektroniske tilbakemeldingen etter bedriftsarrangementer. Det vil komme
        e-post etter arrangementet med lenke til tilbakemeldingsskjema som må besvares innen den oppgitte fristen.
        Dersom en deltaker ikke svarer innen fristen, vil dette gi to prikker.
      </li>
      <li>
        Deltakere på bedriftsarrangementer skal delta på alle obligatoriske deler av arrangementet. For
        bedriftspresentasjon og kurs vil dette henholdsvis innebære selve presentasjonen og kursopplegget. De første 45
        minuttene med påfølgende mingling regnes også som obligatorisk. Dersom en deltaker forlater den obligatoriske
        delen uten gyldig grunn vil dette medføre 2 prikker.
      </li>
    </ul>
  </section>
)

const WhyHaveIGotMarks = () => {
  return (
    <section className="space-y-4">
      <Title className="font-bold">Hvorfor har jeg fått prikk?</Title>
      <Text>
        Under{" "}
        <Link href={`${env.NEXT_PUBLIC_HOME_URL}profil`} className="text-blue-600 underline">
          Profil
        </Link>{" "}
        vil du kunne se prikkene dine, og eventuelle begrunnelser.
      </Text>
      <Text>
        Dersom du mener noe feil har skjedd, vennligst ta kontakt med arrangøren som står oppført på arrangementet.
        Kontaktinfo for arrangerende komité vises på arrangementssiden.
      </Text>
    </section>
  )
}

const MarkTable = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>
          <Text className="font-bold">Antall prikker</Text>
        </TableHead>
        <TableHead>
          <Text className="font-bold">Utsettelse på påmeldinger</Text>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>
          <Text>1 prikk</Text>
        </TableCell>
        <TableCell>
          <Text>1t</Text>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <Text>2 prikker</Text>
        </TableCell>
        <TableCell>
          <Text>4t</Text>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <Text>3 prikker</Text>
        </TableCell>
        <TableCell>
          <Text>24t</Text>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell>
          <Text>6+ prikker</Text>
        </TableCell>
        <TableCell>
          <Text>Suspensjon i 14 dager fra siste prikk</Text>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
)
