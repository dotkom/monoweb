import { OnlineLogo } from "@/components/atoms/OnlineLogo"
import { Button, Text, Title, cn } from "@dotkomonline/ui"
import { IconArrowUpRight, IconExternalLink, IconMessageReport } from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"

export function Welcome() {
  return (
    <section className="max-w-3xl mx-auto w-full">
      <div className="flex flex-col gap-4">
        <Title element="h3">
          Velkommen til <OnlineLogo aria-hidden style="brand" className="ml-0.75 h-5 inline-block dark:hidden" />
          <OnlineLogo aria-hidden style="black" className="ml-0.75 h-5 inline-block not-dark:hidden" />!
        </Title>

        <Text className="leading-7">
          Vi er linjeforeningen for informatikkstudenter ved NTNU. Det er vi som sørger for at studietiden blir den
          beste tiden i ditt liv! Vi i Online arrangerer utflukter, turer, fester, og holder kurs og
          bedriftspresentasjoner gjennom hele året.
        </Text>

        <div className="flex flex-col gap-2">
          <Button
            element={Link}
            href="https://wiki.online.ntnu.no/trondheimsstudent/ny-student/"
            rel="noopener noreferrer"
            target="_blank"
            className="w-fit -ml-2 px-2 text-sm min-[350px]:text-base font-normal bg-white/40 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/12"
            size="lg"
          >
            Ny i Trondheim? Se hva du bør vite <IconExternalLink aria-hidden className="size-4" />
          </Button>

          <Button
            element={Link}
            variant="ghost"
            href="https://online.ntnu.no/arrangementer/ITEX-2026/c809d593-9249-42bb-94ff-7a37649bd117"
            rel="noopener noreferrer"
            target="_blank"
            className="w-fit -ml-2 px-2 text-sm min-[350px]:text-base font-normal"
            size="lg"
          >
            Ny på master? Se info om <span className="min-[400px]:hidden">ITEX </span>
            <span className="max-[400px]:hidden">IT-ekskursjonen </span>
            <IconArrowUpRight aria-hidden className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

export function About({ className }: { className?: string }) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <Title element="h3">Fadderukene</Title>
      <Text>
        I fadderukene blir du kjent med både linjeforeningen, NTNU og mange medstudenter. Dette er den første muligheten
        din til å stifte bekjentskaper som varer studietiden ut. Vi i Online anbefaler alle å ta del i det supre
        fadderopplegget vårt!
      </Text>
      <Text>
        Du trenger ikke å melde deg på fadderukene, så lenge du kommer på immatrikuleringen. Dersom du ikke har mulighet
        til å møte opp, kan du sende en e-post til velkom@online.ntnu.no så ordner vi det for deg.
      </Text>
      <Text>Fadderukene starter den 11. august for både bachelor og master.</Text>
    </section>
  )
}

export function Debug({ className, showNavbarHint = false }: { className?: string; showNavbarHint?: boolean }) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <Title element="h3">Har du opplevd noe ugreit?</Title>

      <Text>
        Online har et eget uavhengig organ for varslingssaker kalt{" "}
        <Button
          size="sm"
          variant="link"
          element={Link}
          href="/grupper/debug"
          target="_blank"
          rel="noopener noreferrer"
          className="font-normal text-base px-0"
        >
          Debug
          <IconArrowUpRight aria-hidden className="size-4" />
        </Button>
      </Text>

      <Text>
        Vi ønsker at alle skal ha det bra og føle seg trygge. Derfor håper vi at du tar kontakt dersom du har opplevd
        noe ubehagelig under fadderukene. Ser du at noen andre opplever noe ubehagelig er det viktig å huske på at du
        også har et ansvar for å si ifra. Vi tar imot alt, og om du er i tvil er det bare å sende oss en melding.
      </Text>

      <Text>
        Tar du kontakt med oss vil all informasjon behandles strengt konfidensielt. Vi kan bistå med alt fra en uformell
        prat til å hjelpe deg med å oppsøke profesjonell hjelp eller rådgivning.
      </Text>

      <div className="flex flex-col gap-1">
        <Button
          color="brand"
          element={Link}
          size="xl"
          href="https://docs.google.com/forms/d/e/1FAIpQLScvjEqVsiRIYnVqCNqbH_-nmYk3Ux6la8a7KZzsY3sJDbW-iA/viewform"
          rel="noopener noreferrer"
          target="_blank"
          className="max-[350px]:text-sm w-fit gap-0.5 dark:text-white dark:bg-blue-800/18 dark:hover:bg-blue-800/35"
        >
          Ta kontakt med{" "}
          <Image
            src="https://cdn.online.ntnu.no/offlines/1762441216022-1c2ccd59-54f5-44bd-bc86-88270c832fcf-output.png"
            alt="Debug"
            width={24}
            height={24}
            className="inline-block ml-1 dark:bg-white dark:rounded-full dark:mr-0.5"
          />{" "}
          Debug her
          <IconExternalLink aria-hidden className="ml-0.5 min-[350px]:ml-1.5 size-4 min-[350px]:size-5" />
        </Button>

        {showNavbarHint ? (
          <div className="flex flex-row gap-2 items-center">
            <Text className="text-xs text-violet-900/60 dark:text-violet-300/75">
              <span className="font-semibold tracking-wide">Husk!</span> Du kan alltid trykke på denne knappen i
              navbaren:
            </Text>

            <IconMessageReport aria-hidden className="size-6 shrink-0" />
          </div>
        ) : null}
      </div>

      <Text>
        Du kan også ta kontakt med{" "}
        <Button
          element={Link}
          variant="link"
          href="https://sikresiden.no"
          target="_blank"
          rel="noopener noreferrer"
          className="text-base font-normal px-0"
        >
          Sikresiden.no
          <IconExternalLink aria-hidden className="size-4" />
        </Button>{" "}
        som gir forebyggende opplæring og råd om hva du skal gjøre i en krisesituasjon. Siden er et samarbeid mellom 33
        universiteter, høgskoler og forskningsvirksomheter i Norge.
      </Text>
    </section>
  )
}
