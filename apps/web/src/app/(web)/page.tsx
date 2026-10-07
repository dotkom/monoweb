import {EventCard} from "@/components/molecules/EventListItem/EventCard"
import {EventListItem} from "@/components/molecules/EventListItem/EventListItem"
import {OnlineHeroVisual} from "@/components/molecules/OnlineHero/OnlineHeroVisual"
import {AuthNotice} from "@/components/notices/auth-notice"
import {IdentityLinkSuccessNotice} from "@/components/notices/identity-link-success-notice"
import {IDENTITY_LINK_STATUS_COOKIE, IDENTITY_LINK_STATUS_VALUE} from "@/lib/link-identity-cookies"
import {cookies} from "next/headers"
import {server} from "@/utils/trpc/server"
import {TZDate} from "@date-fns/tz"
import type {EventWithAttendanceSummary} from "@dotkomonline/rpc/event"
import {Button, Text, Title, cn} from "@dotkomonline/ui"
import {getCurrentUTC} from "@dotkomonline/utils"
import {IconArrowRight} from "@tabler/icons-react"
import {startOfDay} from "date-fns"
import {Link} from "@/components/link"

const SeAlleButton = ({label = "Se alle"}: { label?: string }) => (
    <Button
        element={Link}
        href="/arrangementer"
        className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            "text-brand-800 hover:text-black",
            "bg-blue-200 hover:bg-blue-100",
            "dark:bg-brand dark:hover:bg-brand/75 dark:text-white dark:hover:text-white",
        )}
    >
        {label}
        <IconArrowRight className="size-4"/>
    </Button>
)

export default async function App() {
    let events: Awaited<ReturnType<typeof server.event.findFeaturedEvents.query>> = []
    try {
        events = await server.event.findFeaturedEvents.query({
            limit: 2,
        })
    } catch (e) {
        console.error("Failed to fetch featured events", e)
    }

    let user: Awaited<ReturnType<typeof server.user.findMe.query>> = null
    const cookieStore = await cookies()
    const showIdentityLinkSuccess = cookieStore.get(IDENTITY_LINK_STATUS_COOKIE)?.value === IDENTITY_LINK_STATUS_VALUE

    if (!showIdentityLinkSuccess) {
        try {
            user = await server.user.findMe.query()
        } catch (e) {
            console.error("Failed to fetch user", e)
        }
    }

    const startOfToday = startOfDay(new TZDate(getCurrentUTC(), "Europe/Oslo"))

    let eventsUserIsAttending: Awaited<ReturnType<typeof server.event.allSummariesByAttendingUserId.query>>["items"] = []
    if (user) {
        try {
            eventsUserIsAttending = (
                await server.event.allSummariesByAttendingUserId.query({
                    id: user.id,
                    take: 2,
                    filter: {
                        orderBy: "asc",
                        byEndDate: {
                            min: startOfToday,
                            max: null,
                        },
                    },
                })
            ).items
        } catch (e) {
            console.error("Failed to fetch user attending events", e)
        }
    }

    return (
        <section className="flex flex-col gap-16 w-full">
            <div className="flex flex-col gap-8 ">
                <AuthNotice/>
                <IdentityLinkSuccessNotice initialVisible={showIdentityLinkSuccess}/>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <Title className="text-4xl font-bold">Hei, TODO HENTE NAVN!</Title>
                    {user && eventsUserIsAttending.length > 0 && <SeAlleButton />}
                </div>

                <Title className="text-1xl font-semibold">Dine arrangementer</Title>

                <div className="flex flex-col md:flex-row gap-8 md:items-end">
                    {!user ? (
                        <Text className="text-gray-500 dark:text-stone-500">
                            Logg inn for å se arrangementer du er påmeldt.
                        </Text>
                    ) : eventsUserIsAttending.length === 0 ? (
                        <Text className="text-gray-500 dark:text-stone-500">
                            Du har ingen kommende arrangementer. Meld deg på et arrangement for å se det her!
                        </Text>
                    ) : (
                        <div className="flex-1 min-w-0">
                            <div className="hidden md:grid md:grid-cols-2 gap-6">
                                {eventsUserIsAttending.map(({event, attendance}) => (
                                    <EventCard key={event.id} event={event} attendance={attendance} userId={user.id}/>
                                ))}
                            </div>

                            <div className="md:hidden">
                                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
                                    {eventsUserIsAttending.map(({event, attendance}) => (
                                        <div
                                            key={event.id}
                                            className="shrink-0 w-[85vw] max-w-[24rem] snap-center first:ml-0"
                                        >
                                            <EventCard event={event} attendance={attendance} userId={user.id}/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TODO: endre for ikke logget inn person */}
                    <div className="w-full md:w-1/3 shrink-0 md:self-end md:-mt-24">
                        <OnlineHeroVisual/>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <Title className="text-3xl font-semibold">Arrangementer</Title>
                    {events.length > 0 && <SeAlleButton label="Se alle"/>}
                </div>

                {events.length > 0 ? (
                    <>
                        {/* Desktop */}
                        <div className="hidden md:grid md:grid-cols-2 gap-6">
                            {events.map(({event, attendance}) => (
                                <EventCard key={event.id} event={event} attendance={attendance} userId={user?.id}/>
                            ))}
                        </div>

                        {/* Mobil */}
                        <div className="md:hidden">
                            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
                                {events.map(({event, attendance}) => (
                                    <div
                                        key={event.id}
                                        className="shrink-0 w-[85vw] max-w-[24rem] snap-center first:ml-0"
                                    >
                                        <EventCard event={event} attendance={attendance} userId={user?.id}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <Text className="text-gray-500 dark:text-stone-500">Det er ingen arrangementer å vise.</Text>
                )}
            </div>
        </section>
    )
}

function _AttendancePaymentOopsNotice({eventWithAttendance}: { eventWithAttendance: EventWithAttendanceSummary }) {
    return (
        <div className="w-full p-6 text-white bg-red-600 rounded-2xl">
            <div className="flex flex-col gap-4 w-fit">
                <Text className="text-sm text-red-200">Oops. Dotkom har klusset med betaling igjen :(</Text>
                <Text className="text-2xl text-red-50 font-bold">Du må gjennomføre en betaling på nytt!</Text>

                <div className="bg-white dark:bg-stone-950 p-2 rounded-xl text-black dark:text-white">
                    <EventListItem
                        event={eventWithAttendance.event}
                        attendance={eventWithAttendance.attendance}
                        className="-mt-2"
                    />
                </div>

                <Text className="text-sm text-red-200">
                    Du skal bare trukket <span className="underline">én</span> gang! Selv om du tidligere har betalt.
                    <br/>
                    Dersom du allerede har blitt trukket fra kontoen eller har et beløp reservert og ser denne
                    meldingen, ta kontakt.
                </Text>
                <Text className="text-sm text-red-200">
                    Kontakt dotkom@online.ntnu.no og arrangør dersom det oppstår problemer.
                </Text>
            </div>
        </div>
    )
}