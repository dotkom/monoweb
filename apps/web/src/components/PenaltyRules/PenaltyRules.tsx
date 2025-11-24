import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  TextLink,
  Title,
  cn,
} from "@dotkomonline/ui"
import Image from "next/image"
import type { PropsWithChildren } from "react"

export const PenaltyRules = ({ variant = "default" }: PenaltyRulesProps) => {
  const compact = variant === "compact"

  return (
    <div className={cn("flex flex-col", compact ? "gap-8" : "gap-12")}>
      <WhatIsAMark compact={compact} />
      <WhatGivesAMark compact={compact} />
      <CancellationPolicy compact={compact} />
      <WaitlistPolicy compact={compact} />
      <PaymentPolicy compact={compact} />
      <BehaviorPolicy compact={compact} />
      <CompanyEventPolicy compact={compact} />
      <WhyHaveIGotMarks compact={compact} />
    </div>
  )
}

const WhatIsAMark = ({ compact }: RuleVariantProps) => {
  return (
    <RuleSection>
      <RuleTitle compact={compact}>Hva er en prikk?</RuleTitle>
      <RuleText compact={compact}>
        Prikker er et straffetiltak for å sikre at medlemmene av Online følger reglene. Det at du har aktive prikker
        innebærer at du vil måtte vente en viss periode etter ordinær påmeldingsstart for å melde deg på et arrangement.
        Hver prikk varer i 14 dager fra tidspunktet du får den.
      </RuleText>

      <MarkTable compact={compact} />

      <RuleText compact={compact}>
        Prikker er overlappende. Dette betyr at dersom du får nye prikker når du allerede har aktive prikker fra en
        annen anledning, så vil disse prikkene plusses sammen. Hver anledning som har gitt deg prikker vil ha sin egen
        levetid før de ikke er aktive lenger.
      </RuleText>

      <RuleTitle compact={compact} level="subsection">
        Eksempel
      </RuleTitle>
      <RuleText compact={compact}>
        Du får 2 prikker for å melde deg av et arrangement sent. Nå har du fire timers utsettelse på alle påmeldinger.
        Fire dager senere får du to nye prikker for å ikke ha sendt inn tilbakemeldingsskjema innen tidsfristen. Nå vil
        du i ti dager fremover ha totalt 4 aktive prikker og dermed ha 24 timers utsettelse på alle påmeldinger. Etter
        disse ti dagene vil de to første prikkene løpe ut og du vil da kun ha to aktive prikker i fire dager. Dette
        medfører fire timers utsettelse på påmeldinger.
      </RuleText>

      <Image
        src="https://s3.eu-north-1.amazonaws.com/cdn.online.ntnu.no/web/prikkeregler-visualisation.png"
        alt="Eksempel på prikker"
        className="rounded-md"
        // 493x188 is the size of the image. 700 was chosen arbitrarily and 267 maintains aspect ratio.
        width={compact ? 493 : 700}
        height={compact ? 188 : 267}
      />

      <RuleTitle compact={compact} level="subsection">
        Ferier
      </RuleTitle>
      <RuleText compact={compact}>
        Varigheten til prikker er fryst i ferier. Disse er definert fra 5. desember til 10. januar og 1. juni til 15.
        august. Dersom en prikk gis 24. mai vil altså denne prikken utløpe 20. august.
      </RuleText>
    </RuleSection>
  )
}

const WhatGivesAMark = ({ compact }: RuleVariantProps) => (
  <RuleSection>
    <RuleTitle compact={compact}>Hva gir prikker?</RuleTitle>
    <RuleText compact={compact}>
      Dette er en kort punktliste. Unntak og videre forklaringer finner du lenger ned.
    </RuleText>

    <RuleList>
      <RuleListItem compact={compact}>
        Å melde seg av etter avmeldingsfristen inntil 2 timer før arrangementstart gir 2 prikker, etter dette gis det 3
        prikker.
      </RuleListItem>
      <RuleListItem compact={compact}>Å ikke møte opp på et arrangement man har plass på gir 3 prikker.</RuleListItem>
      <RuleListItem compact={compact}>
        Å møte opp etter arrangementets start eller innslipp er ferdig gir i utgangspunktet 3 prikker. Her vil en
        skjønnsmessig vurdering bli foretatt ut fra hvor sent deltakeren ankom arrangementet.
      </RuleListItem>
      <RuleListItem compact={compact}>
        Å ikke svare på tilbakemeldingsskjema innen tidsfristen gir 2 prikker.
      </RuleListItem>
      <RuleListItem compact={compact}>
        Å ikke overholde betalingsfristen gir 1 prikk. Dette medfører i tillegg suspensjon fra alle Onlines
        arrangementer inntil betaling er gjennomført.
      </RuleListItem>
    </RuleList>

    <RuleText compact={compact}>
      Den ansvarlige komiteen kan også foreta en skjønnsmessig vurdering som gagner deltakeren.
    </RuleText>
  </RuleSection>
)

const CancellationPolicy = ({ compact }: RuleVariantProps) => (
  <RuleSection>
    <RuleTitle compact={compact}>Avmelding</RuleTitle>
    <RuleList>
      <RuleListItem compact={compact}>
        Ved sykdom eller andre ekstraordinære hendelser vil man ikke få prikk ved avmelding 5 timer før
        arrangementsstart. Etter dette gis prikker som normalt iht. punktene over.
      </RuleListItem>
      <RuleListItem compact={compact}>
        Alle komiteer ønsker at du melder deg av arrangementer selv om du vet dette vil medføre prikker. Dette er slik
        at noen andre kan bli obs på plassen sin så tidlig som mulig.
      </RuleListItem>
    </RuleList>
  </RuleSection>
)

const WaitlistPolicy = ({ compact }: RuleVariantProps) => (
  <RuleSection>
    <RuleTitle compact={compact}>Venteliste</RuleTitle>
    <RuleList>
      <RuleListItem compact={compact}>
        Hvis du står på venteliste kan du melde deg av helt til avmeldingsfristen.
      </RuleListItem>
      <RuleListItem compact={compact}>
        Når du står på venteliste er du inneforstått med at du når som helst kan få plass på arrangementet og dermed er
        bundet til reglene for arrangementet på lik linje med andre påmeldte.
      </RuleListItem>
    </RuleList>
  </RuleSection>
)

const PaymentPolicy = ({ compact }: RuleVariantProps) => (
  <RuleSection>
    <RuleTitle compact={compact}>Betaling</RuleTitle>
    <RuleList>
      <RuleListItem compact={compact}>
        Ved manglende betaling suspenderes man fra alle Onlines arrangementer inntil betalingen er gjennomført.
      </RuleListItem>
      <RuleListItem compact={compact}>
        Ved betalt arrangement, men manglende oppmøte, vil man ikke få tilbakebetalt dersom avmelding skjer etter frist.
        Dersom neste på venteliste er tilgjengelig kan dette gjøres unntak for.
      </RuleListItem>
    </RuleList>
  </RuleSection>
)

const BehaviorPolicy = ({ compact }: RuleVariantProps) => (
  <RuleSection>
    <RuleTitle compact={compact}>Oppførsel</RuleTitle>
    <RuleList>
      <RuleListItem compact={compact}>
        Ved upassende oppførsel under et av Onlines arrangement vil du stå økonomisk ansvarlig for eventuelle skader, og
        i verste fall risikere utestengelse fra alle Onlines arrangement.
      </RuleListItem>
    </RuleList>
  </RuleSection>
)

const CompanyEventPolicy = ({ compact }: RuleVariantProps) => (
  <RuleSection>
    <RuleTitle compact={compact}>Bedriftsarrangementer</RuleTitle>
    <RuleList>
      <RuleListItem compact={compact}>
        Ved bedriftsarrangementer åpner dørene i henhold til starttid på arrangementet. Ti minutter etter at dørene
        åpner slippes oppmøte på ventelisten inn dersom det er plass. 15 minutter etter at dørene åpner stenger
        innslippet.
      </RuleListItem>
      <RuleListItem compact={compact}>
        Det kreves at en deltaker svarer på den elektroniske tilbakemeldingen etter bedriftsarrangementer. Det vil komme
        e-post etter arrangementet med lenke til tilbakemeldingsskjema som må besvares innen den oppgitte fristen.
        Dersom en deltaker ikke svarer innen fristen, vil dette gi to prikker.
      </RuleListItem>
      <RuleListItem compact={compact}>
        Deltakere på bedriftsarrangementer skal delta på alle obligatoriske deler av arrangementet. For
        bedriftspresentasjon og kurs vil dette henholdsvis innebære selve presentasjonen og kursopplegget. De første 45
        minuttene med påfølgende mingling regnes også som obligatorisk. Dersom en deltaker forlater den obligatoriske
        delen uten gyldig grunn vil dette medføre 2 prikker.
      </RuleListItem>
    </RuleList>
  </RuleSection>
)

const WhyHaveIGotMarks = ({ compact }: RuleVariantProps) => {
  return (
    <RuleSection>
      <RuleTitle compact={compact}>Hvorfor har jeg fått prikk?</RuleTitle>
      <RuleText compact={compact}>
        I{" "}
        <RuleTextLink compact={compact} href="/profil">
          profilen din
        </RuleTextLink>{" "}
        vil du kunne se prikkene dine, og eventuelle begrunnelser.
      </RuleText>
      <RuleText compact={compact}>
        Dersom du mener noe feil har skjedd, vennligst ta kontakt med arrangøren som står oppført på arrangementet.
        Kontaktinfo for arrangerende komité vises på arrangementssiden.
      </RuleText>
    </RuleSection>
  )
}

const markRows = [
  ["1 prikk", "1 time"],
  ["2 prikker", "4 timer"],
  ["3 prikker", "24 timer"],
  ["6+ prikker", "Suspensjon i 14 dager fra siste prikk"],
] as const

const MarkTable = ({ compact }: RuleVariantProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>
          <RuleText compact={compact}>Antall prikker</RuleText>
        </TableHead>
        <TableHead>
          <RuleText compact={compact}>Utsettelse på påmeldinger</RuleText>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {markRows.map(([marks, delay]) => (
        <TableRow key={marks}>
          <TableCell>
            <RuleText compact={compact} className="text-gray-700 dark:text-stone-300">
              {marks}
            </RuleText>
          </TableCell>
          <TableCell>
            <RuleText compact={compact} className="text-gray-700 dark:text-stone-300">
              {delay}
            </RuleText>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

interface PenaltyRulesProps {
  variant?: "default" | "compact"
}

interface RuleTextProps extends PropsWithChildren {
  compact: boolean
  className?: string
  element?: "p" | "li"
}

interface RuleTitleProps extends PropsWithChildren {
  compact: boolean
  level?: "section" | "subsection"
}

interface RuleTextLinkProps extends PropsWithChildren {
  compact: boolean
  href: string
}

function RuleSection({ children }: PropsWithChildren) {
  return <section className="flex flex-col gap-4">{children}</section>
}

function RuleTitle({ children, compact, level = "section" }: RuleTitleProps) {
  const isSubsection = level === "subsection"

  return (
    <Title
      element={isSubsection ? "h3" : undefined}
      size={isSubsection ? (compact ? "sm" : "md") : compact ? "md" : "lg"}
    >
      {children}
    </Title>
  )
}

function RuleText({ children, className, compact, element }: RuleTextProps) {
  return (
    <Text element={element} className={cn(compact && "text-sm", className)}>
      {children}
    </Text>
  )
}

function RuleTextLink({ children, compact, href }: RuleTextLinkProps) {
  return (
    <TextLink href={href} size={compact ? "sm" : "md"}>
      {children}
    </TextLink>
  )
}

function RuleList({ children }: PropsWithChildren) {
  return <ul className="list-disc pl-6 space-y-2">{children}</ul>
}

interface RuleVariantProps {
  compact: boolean
}

function RuleListItem({ children, compact }: PropsWithChildren<RuleVariantProps>) {
  return (
    <RuleText compact={compact} element="li">
      {children}
    </RuleText>
  )
}
