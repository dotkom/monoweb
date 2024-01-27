import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"

export const events: Insertable<Database["event"]>[] = [
  {
    id: "01HB64TWZK1C5YK5J7VGNZPDGW",
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    title: "Kurs i å lage fixtures",
    start: new Date("2023-02-17 00:00:00+00"),
    end: new Date("2023-02-22 01:33:00+00"),
    status: "PUBLIC",
    type: "SOCIAL",
    public: true,
    description: "Dette er et kurs i å lage fixtures",
    subtitle: "Kurs i fixtures",
    imageUrl:
      "https://online.ntnu.no/_next/image?url=https%3A%2F%2Fonlineweb4-prod.s3.eu-north-1.amazonaws.com%2Fmedia%2Fimages%2Fresponsive%2Flg%2Fdf32b932-f4c4-4a49-9129-a8ab528b1e33.jpeg&w=1200&q=75",
    location: "Hovedbygget",
    waitlist: null,
    extras: JSON.stringify([
      {
        id: "0",
        name: "Hva vil du ha til mat?",
        choices: [
          {
            id: "0",
            name: "Pizza",
          },
          {
            id: "1",
            name: "Burger",
          },
          {
            id: "2",
            name: "Salad",
          },
        ],
      },
      {
        id: "1",
        name: "Når vil du ha mat?",
        choices: [
          {
            id: "0",
            name: "Når jeg kommer",
          },
          {
            id: "1",
            name: "Halvveis i arrangementet",
          },
          {
            id: "2",
            name: "Til slutt",
          },
        ],
      },
    ]),
  },
  {
    id: "01HB64TWZK1N8ABMH8JAE12101",
    createdAt: new Date("2023-02-23 11:03:49.289+00"),
    updatedAt: new Date("2023-02-23 11:03:49.289+00"),
    title: "Åre 2024",
    start: new Date("2023-02-23 11:40:00+00"),
    end: new Date("2023-02-23 11:03:38.63+00"),
    status: "NO_LIMIT",
    type: "SOCIAL",
    public: false,
    description: `Her kommer påmeldingen til å gå fort, så sett alarmen klar og vær rask!:)

    I billettprisen er reise både fra og til, losji og skipass for 2 dager inkludert. Hyttene ligger i hele Fjällbyområdet. Informasjon om området finnes på: https://www.skistar.com/sv/vara-skidorter/are/vinter-i-are/boendekartor/
    
    Det er flere linjeforeninger som skal være der samtidig som oss, så det vil være mye moro opplegg under selve turen<33
    
    Det vil bli felles avreise fra Gløshaugen den 11. januar.
    
    Eventuelle spørsmål angående arrangementet sendes til: arrkom@online.ntnu.no
    
    Registration will go fast here, so set the alarm and be quick!:)
    
    The ticket price includes travel both from and to, accommodation and a skip pass for 2 days. The cabins are located throughout the Fjällby area. Information about the area can be found at: https://www.skistar.com/sv/vara-skidorter/are/vinter-i-are/boendekartor/
    
    There are several student unions that will be there at the same time as us, so there will be a lot of fun planned during the trip itself<33
    
    There will be a joint departure from Gløshaugen on January 11.
    
    Any questions regarding the event should be sent to: arrkom@online.ntnu.no`,
    subtitle:
      "Tidspunktet for Åreturen 2023 er endelig satt, og det er bare å gjøre seg klar for ÅREts høydepunkt!! Datoene for ÅREts tur blir 11. - 14. januar! 🏂🏂",
    imageUrl:
      "https://online.ntnu.no/_next/image?url=https%3A%2F%2Fonlineweb4-prod.s3.eu-north-1.amazonaws.com%2Fmedia%2Fimages%2Fresponsive%2Flg%2Fdf32b932-f4c4-4a49-9129-a8ab528b1e33.jpeg&w=1200&q=75",
    location: "Åre, Sverige",
    waitlist: null,
    extras: null,
  },
]
