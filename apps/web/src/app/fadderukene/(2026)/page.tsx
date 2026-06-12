import { Button, Text, Title } from "@dotkomonline/ui"
import { Leaderboard } from "./leaderboard"
import { EventTimeline } from "./event-timeline"
import Image from "next/image"
import type { FadderukePageProps } from "../lib"
import Link from "next/link"
import {
  IconArrowUpRight,
  IconCalendarEvent,
  IconExternalLink,
  IconMessageReport,
  IconTrophy,
} from "@tabler/icons-react"
import { OnlineLogo } from "@/components/atoms/OnlineLogo"

export default function Fadderukene2026Page({ childEventsWithAttendance }: FadderukePageProps) {
  return (
    <div className="relative left-1/2 w-dvw -translate-x-1/2 overflow-x-clip rounded-b-2xl bg-[#EDE3D4] p-2 pb-16">
      <div aria-hidden className="absolute -top-44 left-0 h-44 w-full bg-[#D5E3EA]" />
      <div aria-hidden className="absolute inset-x-0 top-0 flex justify-center overflow-hidden bg-[#D5E3EA] pt-36">
        <Image
          src="/fadderuke-2026-background-mobile.svg"
          alt=""
          width={1022}
          height={1025}
          priority
          className="w-[max(100%,36rem)] max-w-none h-auto shrink-0 lg:hidden"
        />
        <Image
          src="/fadderuke-2026-background-desktop.svg"
          alt=""
          width={1022}
          height={1025}
          priority
          className="hidden w-full h-auto lg:block"
        />
      </div>
      <div className="relative flex w-full max-w-(--content-max-width) mx-auto flex-col gap-16 md:gap-24 px-(--page-padding-x) pb-16">
        <section className="flex flex-col justify-center items-center gap-12">
          <div className="flex flex-col gap-8 items-center max-w-3xl">
            <div className="flex flex-col items-center">
              <Text className="text-xl sm:text-2xl uppercase font-bold font-marcellus">Velkommen til</Text>

              <Text
                element="h1"
                className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] uppercase font-bold font-marcellus"
              >
                Onlinelekene
              </Text>

              <Title element="h2" className="flex flex-row gap-1 w-fit">
                <span className="text-base">Linjeforeningen Onlines fadderuker</span>
                <span className="text-base text-brand">2026</span>
              </Title>
            </div>

            <div className="shrink-0">
              <Image
                src="/fadderuke-2026-logo.svg"
                alt="Fadderuke"
                width={200}
                height={200}
                className="w-32 sm:w-40 lg:w-50 h-auto drop-shadow-md"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button element="a" href="#arrangementer">
              <IconCalendarEvent aria-hidden className="size-4" />
              Arrangementer
            </Button>
            <Button element="a" href="#leaderboard">
              <IconTrophy aria-hidden className="size-4" />
              Pallen
            </Button>
          </div>
        </section>

        <section className="max-w-3xl mx-auto rounded-lg bg-white/6 p-3 md:p-4 backdrop-blur-2xl">
          <div className="flex flex-col gap-4">
            <Title element="h3">
              Velkommen til <OnlineLogo aria-hidden className="ml-0.75 h-5 inline-block" />!
            </Title>

            <Text className="leading-7 text-zinc-800">
              Vi er linjeforeningen for informatikkstudenter ved NTNU. Det er vi som sørger for at studietiden blir den
              beste tiden i ditt liv! Vi i Online arrangerer utflukter, turer, fester, og holder kurs og
              bedriftspresentasjoner gjennom hele året.
            </Text>

            <div className="flex flex-col gap-2">
              <Button
                element={Link}
                color="brand"
                href="https://wiki.online.ntnu.no/trondheimsstudent/ny-student/"
                rel="noopener noreferrer"
                target="_blank"
                className="w-fit -ml-2 px-2 text-base font-normal"
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
                className="w-fit -ml-2 px-2 text-base font-normal"
                size="lg"
              >
                Ny på master? Se info om IT-ekskursjonen <IconArrowUpRight aria-hidden className="size-4" />
              </Button>
            </div>
          </div>
        </section>

        <div className="rounded-lg bg-white/6 p-2 backdrop-blur-2xl">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
            <div className="relative hidden h-64 overflow-hidden rounded-sm sm:block md:h-80 lg:h-full lg:min-h-96">
              <Image
                src="https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/wide/34a15dcf-66da-4ff5-9405-8e154a5bfe03.jpeg"
                alt="Fadderukene 2017"
                fill
                sizes="(min-width: 1024px) 50vw, (min-width: 640px) 100vw, 0px"
                className="object-cover object-left"
              />
            </div>

            <section className="flex flex-col gap-4 p-2 lg:p-4">
              <Title element="h3">Fadderukene</Title>
              <Text>
                I fadderukene blir du kjent med både linjeforeningen, NTNU og mange medstudenter. Dette er den første
                muligheten din til å stifte bekjentskaper som varer studietiden ut. Vi i Online anbefaler alle å ta del
                i det supre fadderopplegget vårt!
              </Text>
              <Text>
                Du trenger ikke å melde deg på fadderukene, så lenge du kommer på immatrikuleringen. Dersom du ikke har
                mulighet til å møte opp, kan du sende en e-post til velkom@online.ntnu.no så ordner vi det for deg.
              </Text>
              <Text>Fadderukene starter den 11. august for både bachelor og master.</Text>
            </section>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-violet-100">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
            <section className="flex flex-col gap-4 p-2 lg:p-4">
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
                Vi ønsker at alle skal ha det bra og føle seg trygge. Derfor håper vi at du tar kontakt dersom du har
                opplevd noe ubehagelig under fadderukene. Ser du at noen andre opplever noe ubehagelig er det viktig å
                huske på at du også har et ansvar for å si ifra. Vi tar imot alt, og om du er i tvil er det bare å sende
                oss en melding.
              </Text>

              <Text>
                Tar du kontakt med oss vil all informasjon behandles strengt konfidensielt. Vi kan bistå med alt fra en
                uformell prat til å hjelpe deg med å oppsøke profesjonell hjelp eller rådgivning.
              </Text>

              <div className="relative">
                <Button
                  color="brand"
                  element={Link}
                  size="xl"
                  href="https://docs.google.com/forms/d/e/1FAIpQLScvjEqVsiRIYnVqCNqbH_-nmYk3Ux6la8a7KZzsY3sJDbW-iA/viewform"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="w-fit gap-0.5"
                >
                  Ta kontakt med{" "}
                  <Image
                    src="https://cdn.online.ntnu.no/offlines/1762441216022-1c2ccd59-54f5-44bd-bc86-88270c832fcf-output.png"
                    alt="Debug"
                    width={24}
                    height={24}
                    className="inline-block ml-1"
                  />{" "}
                  Debug her
                  <IconExternalLink aria-hidden className="ml-1.5 size-4" />
                </Button>

                <div className="absolute top-14 -left-46 not-2xl:hidden pointer-events-none">
                  <div className="relative flex flex-col items-center bg-white gap-2 p-2 rounded-md w-35 shadow-sm">
                    <svg
                      aria-hidden
                      className="absolute left-7 -top-13 h-16 w-42 overflow-visible text-brand"
                      viewBox="0 0 192 64"
                      fill="none"
                    >
                      <title>Pil til kontaktknappen</title>

                      <defs>
                        <marker
                          id="fadderuke-debug-arrow"
                          markerWidth="8"
                          markerHeight="8"
                          refX="7"
                          refY="4"
                          orient="auto"
                          markerUnits="strokeWidth"
                          viewBox="0 0 8 8"
                        >
                          <path
                            d="M 1.25 1.15
                              Q 1.05 0.95 1.45 1.05
                              L 6.35 3.55
                              Q 7 4 6.35 4.45
                              L 1.45 6.95
                              Q 1.05 7.05 1.25 6.85
                              Q 3.75 4.55 4.85 4
                              Q 3.75 3.45 1.25 1.15
                              Z"
                            fill="currentColor"
                          />
                        </marker>
                      </defs>

                      <path
                        d="M 42 52 C 42 22 78 14 184 14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        markerEnd="url(#fadderuke-debug-arrow)"
                      />
                    </svg>

                    <Text className="text-xs">Du kan alltids trykke på denne knappen i navbaren:</Text>

                    <IconMessageReport aria-hidden className="size-6" />
                  </div>
                </div>
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
                som gir forebyggende opplæring og råd om hva du skal gjøre i en krisesituasjon. Siden er et samarbeid
                mellom 33 universiteter, høgskoler og forskningsvirksomheter i Norge.
              </Text>
            </section>

            <div className="relative hidden h-64 overflow-hidden rounded-sm bg-violet-200 sm:block md:h-80 lg:h-full lg:min-h-96">
              <Image
                src="https://cdn.online.ntnu.no/images/debug-members-spring-2026.jpg"
                alt="Debug members spring 2026"
                fill
                sizes="(min-width: 1024px) 50vw, (min-width: 640px) 100vw, 0px"
                className="object-contain lg:object-cover object-top"
              />
            </div>
          </div>
        </div>

        <section id="leaderboard" className="max-w-3xl mx-auto w-full scroll-mt-28">
          <Leaderboard />
        </section>

        <section id="arrangementer" className="max-w-3xl mx-auto flex w-full flex-col gap-4 scroll-mt-28">
          <Title element="h3">Arrangementer</Title>
          <EventTimeline eventsWithAttendance={childEventsWithAttendance} />
        </section>
      </div>
    </div>
  )
}
