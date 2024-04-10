import type { Database } from "@dotkomonline/db"
import type { Insertable } from "kysely"

export const getInterestGroupFixtures: () => Insertable<Database["interestGroup"]>[] = () => [
  {
    updatedAt: new Date("2023-01-25 19:58:43.138389+00"),
    name: "Meme & Vin & Klin & Grin",
    createdAt: new Date("2023-01-25 19:58:43.138389+00"),
    description: 'Meme og Vin og Klin og Grin, også kjent som MVKG, er Onlines desidert beste kilde for memes. Navnet er vår oppskrift for en typisk fredag kveld, men ikke et krav for å delta. Om du har en kreativ sjel, liker å snoke i chatter eller bare vil holde deg informert på sladder og nyheter, så rask deg over til slackkanalen "memeogvinogklinoggrin2" og bli med på kaoset!',
    link: "https://onlinentnu.slack.com/archives/C01DG6JFNSG",
    image: "https://online.ntnu.no/_next/image?url=https%3A%2F%2Fonlineweb4-prod.s3.eu-north-1.amazonaws.com%2Fmedia%2Fimages%2Fresponsive%2Flg%2F43b39ece-abc1-4b4e-a35d-83367b977845.png&w=1200&q=75",
    isActive: true,
  },
  {
    updatedAt: new Date("2023-01-25 19:58:43.138389+00"),
    name: "RacingLine",
    createdAt: new Date("2023-01-25 19:58:43.138389+00"),
    description: "RacingLine er interessegruppen for deg som digger å benkre deg ned foran fjernsynsapparatet hver søndag for å se dyre biler kjøre i 300km/t 60 ganger rundt i ring.",
    link: "https://onlinentnu.slack.com/archives/C01FDMJ0V8Q",
    image: "https://online.ntnu.no/_next/image?url=https%3A%2F%2Fonlineweb4-prod.s3.eu-north-1.amazonaws.com%2Fmedia%2Fimages%2Fresponsive%2Flg%2F1f0e434b-9ba1-4a1f-ab3b-f72bd6194f19.png&w=1200&q=75",
    isActive: true,
  },
  {
    updatedAt: new Date("2023-01-25 20:05:31.034217+00"),
    name: "Stipendsushi",
    createdAt: new Date("2023-01-25 20:05:31.034217+00"),
    description: "Stipendsushi er en nodekomité for alle onlinere som liker sushi. Rundt den 15. hver måned arrangeres det felles tur til et spisested i byen som serverer sushi.",
    image: "https://online.ntnu.no/_next/image?url=https%3A%2F%2Fonlineweb4-prod.s3.eu-north-1.amazonaws.com%2Fmedia%2Fimages%2Fresponsive%2Flg%2Fdbfa6625-028d-43f0-8b25-44011c2d20e0.png&w=1200&q=75",
    isActive: true,
  },
]
