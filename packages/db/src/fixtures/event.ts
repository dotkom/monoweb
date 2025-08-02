import type { Prisma } from "@prisma/client"
import { stripIndents } from "common-tags"
import { addDays, addHours, addMonths, roundToNearestHours, setHours, subDays, subMonths } from "date-fns"

const now = roundToNearestHours(new Date(), { roundingMethod: "ceil" })

const lastMonth = subMonths(now, 1)
const tomorrow = addDays(now, 1)
const nextMonth = addMonths(now, 1)

export const getEventFixtures = (attendanceIds: string[]) =>
  [
    {
      attendanceId: attendanceIds[0],
      createdAt: now,
      updatedAt: now,
      title: "Kurs i å lage fixtures",
      start: addHours(tomorrow, 4),
      end: addHours(tomorrow, 8),
      status: "PUBLIC",
      type: "SOCIAL",
      description: "Dette er et kurs i å lage fixtures",
      subtitle: "Kurs i fixtures",
      imageUrl:
        "https://online.ntnu.no/_next/image?url=https%3A%2F%2Fonlineweb4-prod.s3.eu-north-1.amazonaws.com%2Fmedia%2Fimages%2Fresponsive%2Flg%2Fdf32b932-f4c4-4a49-9129-a8ab528b1e33.jpeg&w=1200&q=75",
      locationAddress: "Høgskoleringen 1, 7034 Trondheim",
      locationTitle: "Hovedbygget",
      locationLink:
        "https://www.google.com/maps/place/Hovedbygningen+(NTNU)/@63.4194658,10.3995042,17z/data=!3m1!4b1!4m6!3m5!1s0x466d3195b7c6960b:0xf8307e00da9b2556!8m2!3d63.4194658!4d10.4020791!16s%2Fg%2F11dflf4b45?entry=ttu",
    },
    {
      attendanceId: attendanceIds[1],
      createdAt: new Date("2025-01-17 11:03:49.289+00"),
      updatedAt: new Date("2025-02-22 09:04:21.942+00"),
      title: "Åre 2025",
      start: new Date("2025-02-23 12:00:00+00"),
      end: new Date("2025-02-27 20:00:00.00+00"),
      status: "PUBLIC",
      type: "SOCIAL",
      description: stripIndents(`
      <p>Her kommer påmeldingen til å gå fort, så sett alarmen klar og vær rask!:)</p>

      <p>I billettprisen er reise både fra og til, losji og skipass for 2 dager inkludert. Hyttene ligger i hele Fjällbyområdet. Informasjon om området finnes på: https://www.skistar.com/sv/vara-skidorter/are/vinter-i-are/boendekartor/</p>

      <p>Det er flere linjeforeninger som skal være der samtidig som oss, så det vil være mye moro opplegg under selve turen<33</p>

      <p>Det vil bli felles avreise fra Gløshaugen den 11. januar.</p>

      <p>Eventuelle spørsmål angående arrangementet sendes til: arrkom@online.ntnu.no</p>

      <p>Registration will go fast here, so set the alarm and be quick!:)</p>

      <p>The ticket price includes travel both from and to, accommodation and a skip pass for 2 days. The cabins are located throughout the Fjällby area. Information about the area can be found at: https://www.skistar.com/sv/vara-skidorter/are/vinter-i-are/boendekartor/</p>

      <p>There are several student unions that will be there at the same time as us, so there will be a lot of fun planned during the trip itself<33</p>

      <p>There will be a joint departure from Gløshaugen on January 11.</p>

      <p>Any selections regarding the event should be sent to: arrkom@online.ntnu.no</p>
    `),
      subtitle:
        "Tidspunktet for Åreturen 2025 er endelig satt, og det er bare å gjøre seg klar for ÅREts høydepunkt!! Datoene for ÅREts tur blir 11. - 14. januar! 🏂🏂",
      imageUrl:
        "https://online.ntnu.no/_next/image?url=https%3A%2F%2Fonlineweb4-prod.s3.eu-north-1.amazonaws.com%2Fmedia%2Fimages%2Fresponsive%2Flg%2Fdf32b932-f4c4-4a49-9129-a8ab528b1e33.jpeg&w=1200&q=75",
      locationTitle: "Åre",
      locationAddress: "Åre, Sverige",
      locationLink: "https://maps.app.goo.gl/8dA2NN9YWDp7XyuV6",
    },
    {
      attendanceId: attendanceIds[2],
      createdAt: subDays(now, 30),
      updatedAt: subDays(now, 25),
      title: "Sommerfest 2025",
      start: addHours(addDays(nextMonth, 5), 16),
      end: addHours(addDays(nextMonth, 5), 22),
      status: "PUBLIC",
      type: "SOCIAL",
      description: stripIndents(`
      <p>Årets sommerfest med mat, drikke og musikk.</p>
      <p>Ta med godt humør og dansesko!</p>
    `),
      subtitle: "Feir sommeren med oss på takterrassen!",
      imageUrl: null,
      locationTitle: "Takterrassen",
      locationAddress: "A4, Realfagbygget",
    },
    {
      attendanceId: attendanceIds[3],
      createdAt: subMonths(now, 3),
      updatedAt: subMonths(now, 3),
      title: "Vinkurs 🍷",
      start: setHours(addDays(now, 6), 16),
      end: setHours(addDays(now, 6), 22),
      status: "PUBLIC",
      type: "ACADEMIC",
      description: stripIndents(`
      <p>Lær å smake og kombinere vin fra forskjellige regioner.</p>
      <p>Profesjonell sommelier guider oss gjennom smaksprøver.</p>
    `),
      subtitle: "Bli bedre kjent med vinens verden",
      imageUrl: null,
      locationTitle: "Smakslab",
      locationAddress: "Studentersamfundet, Erling Skakkes gate 7, Trondheim",
      locationLink: "https://maps.google.com/?q=Studentersamfundet",
    },
    {
      attendanceId: null,
      createdAt: subMonths(now, 4),
      updatedAt: subMonths(now, 4),
      title: "Infomøte om ekskursjonen",
      start: addHours(subDays(lastMonth, 10), 12),
      end: addHours(subDays(lastMonth, 10), 13),
      status: "PUBLIC",
      type: "SOCIAL",
      description: stripIndents(`
      <p>Vi går gjennom programmet for ekskursjonen til Ås.</p>
      <p>Spørsmål besvares av reiselederne.</p>
    `),
      subtitle: "Alt du trenger å vite før turen",
      imageUrl: null,
      locationTitle: "Tihlde-rommet",
      locationAddress: "A4-112, Realfagbygget",
      locationLink: "https://link.mazemap.com/PIAEEJsD",
    },
  ] as const satisfies Prisma.EventCreateManyInput[]
