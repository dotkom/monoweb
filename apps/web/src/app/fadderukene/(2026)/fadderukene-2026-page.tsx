import type { FadderukePageProps } from "../lib"
import type { ContestId } from "@dotkomonline/rpc/contest"
import type { EventWithAttendance } from "@dotkomonline/rpc/event"
import { getServerSession } from "@/auth"
import { Button, Text, Title, cn } from "@dotkomonline/ui"
import { IconCalendarEvent, IconHandClick, IconTrophy } from "@tabler/icons-react"
import Image from "next/image"
import { ScrollingClouds } from "./clouds"
import { EventTimeline } from "./event-timeline"
import { Leaderboard } from "./leaderboard"
import { About, Debug, Welcome } from "./sections"

export async function Fadderukene2026Page({ childEventsWithAttendance, contestId }: FadderukePageProps) {
  const session = await getServerSession()
  const showRegisterButton = session === null

  return (
    <div className="relative min-h-full">
      <div className="md:hidden">
        <Mobile showRegisterButton={showRegisterButton} />
      </div>
      <div className="hidden md:block">
        <Desktop showRegisterButton={showRegisterButton} />
      </div>

      <div className="relative left-1/2 w-[calc(100dvw+2px)] -mx-px -translate-x-1/2 overflow-x-clip">
        <div className="relative grid bg-[#EDE3D4] dark:bg-taupe-800 pb-24">
          <CaveBackground />

          <div className="col-start-1 row-start-1 relative z-10 flex w-full max-w-(--content-max-width) mx-auto flex-col gap-12 md:gap-24 px-(--page-padding-x) pt-12 md:mt-86 md:pt-0">
            <LeaderboardSection contestId={contestId} />
            <ProgramSection eventsWithAttendance={childEventsWithAttendance} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Mobile({ showRegisterButton }: { showRegisterButton: boolean }) {
  return (
    <div className="relative left-1/2 w-dvw -translate-x-1/2 overflow-x-clip bg-[#EDE3D4] dark:bg-taupe-800">
      <div className="relative">
        <div aria-hidden className="absolute inset-x-0 -top-44 bottom-0 bg-sky-100 dark:bg-sky-950" />

        <ScrollingClouds className="-top-14 z-0" imageClassName="w-[max(220vw,140rem)]" />

        <Image
          src="/fadderuke-2026-background-small.svg"
          alt=""
          width={894}
          height={441}
          priority
          draggable={false}
          className="relative z-1 block h-auto w-full pointer-events-none select-none dark:hidden"
        />
        <Image
          src="/fadderuke-2026-background-small-dark.svg"
          alt=""
          width={894}
          height={441}
          priority
          draggable={false}
          className="relative z-1 block h-auto w-full pointer-events-none select-none not-dark:hidden"
        />

        <Torch className="top-0 min-[400px]:top-2" imageClassName="w-36 min-[350px]:w-40 min-[400px]:w-44" />
      </div>

      <div className="relative flex w-full max-w-(--content-max-width) mx-auto flex-col gap-12 px-(--page-padding-x) pt-8">
        <header className="w-full max-w-3xl mx-auto">
          <div className="flex flex-col items-center">
            <Text className="text-lg min-[350px]:text-xl uppercase font-bold font-marcellus">Velkommen til</Text>

            <Text
              element="h1"
              className="text-[2.5rem] min-[350px]:text-5xl uppercase font-bold font-marcellus text-center"
            >
              Onlinelekene
            </Text>

            <Title element="h2" className="flex flex-row gap-1 w-fit max-[350px]:font-medium">
              <span className="text-sm min-[350px]:text-base">Linjeforeningen Onlines fadderuker</span>
              <span className="text-sm min-[350px]:text-base text-brand dark:text-brand-accent">2026</span>
            </Title>
          </div>
        </header>

        <JumpLinks
          showRegisterButton={showRegisterButton}
          buttonClassName="h-14 bg-[#dfd0b9] hover:bg-[#c5b59d] dark:bg-white/5 dark:hover:bg-white/12"
        />

        <Welcome />
        <About />

        <div className="rounded-xl bg-violet-100 dark:bg-violet-500/6 p-3 -mx-3">
          <Debug />
        </div>
      </div>
    </div>
  )
}

function Desktop({ showRegisterButton }: { showRegisterButton: boolean }) {
  return (
    <div className="relative left-1/2 w-dvw -translate-x-1/2 overflow-x-clip bg-[#EDE3D4] dark:bg-taupe-800">
      <div className="relative grid">
        <div aria-hidden className="absolute inset-x-0 -top-44 bottom-0 bg-sky-100 dark:bg-sky-950" />

        <div aria-hidden className="col-start-1 row-start-1 z-0 flex min-h-full flex-col">
          <div className="w-[max(100%,64rem)] shrink-0 pt-4">
            <div className="aspect-[1024/956.56] w-full" />
          </div>
          <div className="-mt-8 min-h-8 flex-1 bg-[#1c4b7a] dark:bg-[#22292b]" />
        </div>

        <ScrollingClouds className="top-48 z-1" imageClassName="w-[max(220vw,140rem)]" duration="180s" />
        <ScrollingClouds className="top-182 z-1" imageClassName="w-[max(220vw,140rem)]" duration="220s" delay="-110s" />

        <div aria-hidden className="col-start-1 row-start-1 z-1 flex justify-start self-start overflow-hidden pt-4">
          <Image
            src="/fadderuke-2026-background.svg"
            alt=""
            width={1024}
            height={957}
            priority
            draggable={false}
            className="block w-[max(100%,64rem)] max-w-none h-auto shrink-0 pointer-events-none select-none dark:hidden"
          />
          <Image
            src="/fadderuke-2026-background-dark.svg"
            alt=""
            width={1024}
            height={957}
            priority
            draggable={false}
            className="block w-[max(100%,64rem)] max-w-none h-auto shrink-0 pointer-events-none select-none not-dark:hidden"
          />
        </div>

        <Torch className="top-22" imageClassName="w-56 sm:w-70" />

        <div className="col-start-1 row-start-1 relative z-2 flex w-full max-w-(--content-max-width) mx-auto flex-col gap-16 md:gap-24 px-(--page-padding-x)">
          <header className="flex flex-col justify-center items-center gap-12">
            <div className="flex flex-col gap-8 items-center max-w-3xl">
              <div className="flex flex-col items-center">
                <Text className="text-xl sm:text-2xl uppercase font-bold font-marcellus">Velkommen til</Text>

                <Text element="h1" className="text-6xl md:text-7xl lg:text-[5rem] uppercase font-bold font-marcellus">
                  Onlinelekene
                </Text>

                <Title element="h2" className="flex flex-row gap-1 w-fit">
                  <span className="text-base">Linjeforeningen Onlines fadderuker</span>
                  <span className="text-base text-brand dark:text-brand-accent">2026</span>
                </Title>
              </div>
            </div>
          </header>

          <JumpLinks
            showRegisterButton={showRegisterButton}
            className="mt-58"
            buttonClassName="h-16 bg-sky-300/25 hover:bg-sky-300/50 dark:bg-white/5 dark:hover:bg-white/12"
          />

          <Welcome />

          <div className="rounded-lg bg-white/10 p-2 backdrop-blur-2xl">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
              <div className="relative h-64 overflow-hidden rounded-sm md:h-80 lg:h-full lg:min-h-96">
                <Image
                  src="https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/wide/34a15dcf-66da-4ff5-9405-8e154a5bfe03.jpeg"
                  alt="Fadderukene 2017"
                  fill
                  sizes="(min-width: 1024px) 50vw, (min-width: 640px) 100vw, 0px"
                  className="object-cover object-left"
                />
              </div>

              <About className="p-2 lg:p-4" />
            </div>
          </div>

          <div className="dark:bg-stone-900 dark:rounded-xl">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-500/6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
                <Debug className="p-2 lg:p-4" showNavbarHint />

                <div className="relative h-64 overflow-hidden rounded-sm bg-violet-200 md:h-80 lg:h-full lg:min-h-96">
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
          </div>
        </div>
      </div>
    </div>
  )
}

function Torch({ className, imageClassName }: { className?: string; imageClassName?: string }) {
  return (
    <div aria-hidden className={cn("absolute inset-x-0 z-2 flex justify-center", className)}>
      <Image
        src="/fadderuke-2026-torch.svg"
        alt=""
        width={478.7576}
        height={591.5662}
        priority
        draggable={false}
        className={cn("h-auto shrink-0 pointer-events-none select-none dark:hidden", imageClassName)}
      />
      <Image
        src="/fadderuke-2026-torch-dark.svg"
        alt=""
        width={478.7576}
        height={591.5662}
        priority
        draggable={false}
        className={cn("h-auto shrink-0 pointer-events-none select-none not-dark:hidden", imageClassName)}
      />
    </div>
  )
}

function JumpLinks({
  showRegisterButton,
  className,
  buttonClassName,
}: {
  showRegisterButton: boolean
  className?: string
  buttonClassName?: string
}) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <nav className={cn(className)}>
        <div className="grid grid-cols-2 gap-3">
          <Button element="a" href="#program" size="lg" className={buttonClassName}>
            <IconCalendarEvent aria-hidden className="size-4.5" />
            Program
          </Button>

          <Button element="a" href="#pallen" size="lg" className={buttonClassName}>
            <IconTrophy aria-hidden className="size-4.5" />
            Pallen
          </Button>
        </div>
      </nav>

      {showRegisterButton && (
        <div className="flex flex-row gap-2 sm:gap-3 items-center">
          <Text className="text-sm sm:text-base">Har du ikke bruker enda?</Text>{" "}
          <Button
            element="a"
            size="sm"
            color="brand"
            href="/api/auth/authorize?screen_hint=signup"
            className="sm:hidden bg-violet-300 text-black hover:bg-violet-200 dark:bg-brand-accent dark:hover:bg-brand-accent/80"
          >
            Registrer deg
          </Button>
          <Button
            element="a"
            size="lg"
            color="brand"
            href="/api/auth/authorize?screen_hint=signup"
            className="max-sm:hidden bg-violet-300 text-black hover:bg-violet-200 dark:bg-brand-accent dark:hover:bg-brand-accent/80"
          >
            Registrer deg
          </Button>
        </div>
      )}
    </div>
  )
}

function CaveBackground() {
  return (
    <div aria-hidden className="col-start-1 row-start-1 hidden justify-start self-start overflow-hidden md:flex">
      <Image
        src="/fadderuke-2026-background-cave.svg"
        alt=""
        width={1024}
        height={267}
        priority
        draggable={false}
        className="block -mt-px w-[max(100%,64rem)] max-w-none h-auto shrink-0 pointer-events-none select-none dark:hidden"
      />
      <Image
        src="/fadderuke-2026-background-cave-dark.svg"
        alt=""
        width={1024}
        height={267}
        priority
        draggable={false}
        className="block -mt-px w-[max(100%,64rem)] max-w-none h-auto shrink-0 pointer-events-none select-none not-dark:hidden"
      />
    </div>
  )
}

function LeaderboardSection({ contestId }: { contestId: ContestId | null }) {
  if (contestId === null) {
    return null
  }

  return (
    <section id="pallen" className="max-w-3xl mx-auto w-full scroll-mt-28">
      <Leaderboard contestId={contestId} />
    </section>
  )
}

function ProgramSection({ eventsWithAttendance }: { eventsWithAttendance: EventWithAttendance[] }) {
  return (
    <section id="program" className="max-w-3xl mx-auto flex w-full flex-col gap-4 scroll-mt-28">
      <Title element="h3">Program</Title>

      {eventsWithAttendance.length > 0 ? (
        <div className="flex flex-row gap-1 items-center">
          <IconHandClick className="size-4 sm:size-4.5 shrink-0 text-muted-foreground" />
          <Text className="text-xs sm:text-sm text-muted-foreground">
            Trykk på et arrangement for å se mer info<span className="max-sm:hidden">rmasjon</span>.
          </Text>
        </div>
      ) : null}

      <EventTimeline eventsWithAttendance={eventsWithAttendance} />
    </section>
  )
}
