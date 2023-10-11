import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"

export const committees: Insertable<Database["committee"]>[] = [
  {
    id: "060bc7ee-d9ac-43bb-bc97-178deceb42cc",
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    name: "Dotkom",
    description:
      "Drifts- og Utviklingskomiteen er komiteen som er ansvarlig for utvikling og vedlikehold av Online sine nettsider, samt drift av maskinparken.\n\nDotkom har også ansvaret for å sikre at Online på best mulig måte benytter IT i sine arbeidsprosesser, der Online er tjent med det. Dotkom er som følge av det, også forpliktet til å utvikle og vedlikeholde IT-systemer som Online er tjent med - med hensyn til Online som linjeforening og Online sine studenter.",
    email: "dotkom@online.ntnu.no",
    image:
      "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/xs/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
  },
  {
    id: "23361509-94d5-4123-81ca-fd2795223942",
    createdAt: new Date("2023-02-23 11:03:49.289+00"),
    name: "Bedkom",
    description:
      "Bedriftskomiteen er bindeleddet mellom næringslivet og informatikkstudenter, og skal i tillegg samarbeide med andre linjeforeninger på NTNU for å ivareta informatikkstudentenes interesser. Vårt mål er å kommunisere og formidle våre studenter som potensielle arbeidstakere til aktuelle bedrifter på en positiv måte. For å fremme dette er bedriftspresentasjoner en viktig del av vårt virke, i tillegg til andre måter å kommunisere ut informasjon til studentene - på en god måte.\n\nVi er en hardtarbeidende komitè som igjennom mange år har opparbeidet oss et meget stort kontaktnett av bedrifter. Bedriftskomiteen opererer som en kontaktpunkt for bedrifter og studentene på informatikkstudiet.\n\nSom medlem i bedriftskomiteen får du en unik mulighet til å komme i kontakt med mange bedrifter, som vil gagne dine medstudenter og deg selv.",
    email: "bedkom@online.ntnu.no",
    image:
      "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/xs/974b88bd-de01-4b59-856f-f53d9bb600a0.png",
  },
  {
    id: "d19021fb-2f10-4b5c-92dd-098fe5cee4d7",
    createdAt: new Date("2023-02-25 11:03:49.289+00"),
    name: "Arrkom",
    description:
      "Arrangementskomiteen har som hovedansvar å arrangere sosiale tilstelninger for informatikkstudenter.\n\nOnline arrangerer både tradisjonsrike fester, og andre sosiale arrangementer, i løpet av skoleåret. Dette er et tilbud til deg slik at du kan ha det moro og knytte nye kontakter innad i linjeforeningen. Vi bidrar jobber for økt samhold og sosialisering blant Onlines medlemmer. Dette gjør vi ved å bidra til et variert sosialt tilbud for alle Onlinere.\n\nVi skal være en aktiv og synlig komité som inkluderer alle og sørger for å tilby et så variert tilbud av arrangementer at enhver av Onlines medlemmer kan stille på flest mulig av disse.",
    email: "arrkom@online.ntnu.no",
    image:
      "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/xs/0954f3de-da25-44eb-b3a9-7dbba7e23f25.png",
  },
  {
    id: "97913415-399b-4ddc-9a1e-deedc886c1b4",
    createdAt: new Date("2023-02-15 11:03:49.289+00"),
    name: "Hovedstyret",
    email: "hovedstyret@online.ntnu.no",
    description:
      "Hovedstyret velges av linjeforeningens medlemmer på generalforsamlingen i løpet av vårsemesteret og sitter ett år frem i tid. Styret består av leder, nestleder, økonomiansvarlig og alle styremedlemmene.\n\nHovedstyret er først og fremst en møteplass for koordinering av de forskjellige komiteene. Styret driver også med økonomistyring og annet administrativt arbeid.\n\nHovedstyret er også linjeforeningens ansikt utad, og opprettholder kontakten med fakultet, institutt og representerer Online ved forskjellige anledninger.",
  },
]
