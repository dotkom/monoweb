import type { Prisma } from "@prisma/client"

export const getGroupFixtures: () => Prisma.GroupCreateManyInput[] = () => [
  {
    slug: "dotkom",
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    abbreviation: "Dotkom",
    name: "Drifts- og utviklingskomiteen",
    about:
      "Dotkom er komiteen som er ansvarlig for utvikling og vedlikehold av Online sine nettsider, samt drift av maskinparken.\n\nDotkom har også ansvaret for å sikre at Online på best mulig måte benytter IT i sine arbeidsprosesser, der Online er tjent med det. Dotkom er som følge av det, også forpliktet til å utvikle og vedlikeholde IT-systemer som Online er tjent med - med hensyn til Online som linjeforening og Online sine studenter.",
    email: "dotkom@online.ntnu.no",
    imageUrl:
      "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/xs/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png",
    type: "COMMITTEE",
  },
  {
    slug: "bedkom",
    createdAt: new Date("2023-02-23 11:03:49.289+00"),
    abbreviation: "Bedkom",
    about:
      "Bedriftskomiteen er bindeleddet mellom næringslivet og informatikkstudenter, og skal i tillegg samarbeide med andre linjeforeninger på NTNU for å ivareta informatikkstudentenes interesser. Vårt mål er å kommunisere og formidle våre studenter som potensielle arbeidstakere til aktuelle bedrifter på en positiv måte. For å fremme dette er bedriftspresentasjoner en viktig del av vårt virke, i tillegg til andre måter å kommunisere ut informasjon til studentene - på en god måte.\n\nVi er en hardtarbeidende komitè som igjennom mange år har opparbeidet oss et meget stort kontaktnett av bedrifter. Bedriftskomiteen opererer som en kontaktpunkt for bedrifter og studentene på informatikkstudiet.\n\nSom medlem i bedriftskomiteen får du en unik mulighet til å komme i kontakt med mange bedrifter, som vil gagne dine medstudenter og deg selv.",
    email: "bedkom@online.ntnu.no",
    imageUrl:
      "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/xs/974b88bd-de01-4b59-856f-f53d9bb600a0.png",
    type: "COMMITTEE",
  },
  {
    slug: "arrkom",
    createdAt: new Date("2023-02-25 11:03:49.289+00"),
    abbreviation: "Arrkom",
    about:
      "Arrangementskomiteen har som hovedansvar å arrangere sosiale tilstelninger for informatikkstudenter.\n\nOnline arrangerer både tradisjonsrike fester, og andre sosiale arrangementer, i løpet av skoleåret. Dette er et tilbud til deg slik at du kan ha det moro og knytte nye kontakter innad i linjeforeningen. Vi bidrar jobber for økt samhold og sosialisering blant Onlines medlemmer. Dette gjør vi ved å bidra til et variert sosialt tilbud for alle Onlinere.\n\nVi skal være en aktiv og synlig komité som inkluderer alle og sørger for å tilby et så variert tilbud av arrangementer at enhver av Onlines medlemmer kan stille på flest mulig av disse.",
    email: "arrkom@online.ntnu.no",
    imageUrl:
      "https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/xs/0954f3de-da25-44eb-b3a9-7dbba7e23f25.png",
    type: "COMMITTEE",
  },
  {
    slug: "hs",
    createdAt: new Date("2023-02-15 11:03:49.289+00"),
    abbreviation: "Hovedstyret",
    email: "hovedstyret@online.ntnu.no",
    about:
      "Hovedstyret velges av linjeforeningens medlemmer på generalforsamlingen i løpet av vårsemesteret og sitter ett år frem i tid. Styret består av leder, nestleder, økonomiansvarlig og alle styremedlemmene.\n\nHovedstyret er først og fremst en møteplass for koordinering av de forskjellige komiteene. Styret driver også med økonomistyring og annet administrativt arbeid.\n\nHovedstyret er også linjeforeningens ansikt utad, og opprettholder kontakten med fakultet, institutt og representerer Online ved forskjellige anledninger.",
    type: "COMMITTEE",
  },
  {
    slug: "ekskom",
    createdAt: new Date("2023-02-10 11:03:49.289+00"),
    abbreviation: "Ekskom",
    email: "ekskom@online.ntnu.no",
    about:
      "Ekskursjonskomiteens hovedmål er å planlegge og gjennomføre ekskursjoner for studenter ved linjeforeningen Online, spesielt rettet mot studenter i 3. året eller høyere.",
    type: "NODE_COMMITTEE",
  },
  {
    slug: "stipendsushi",
    createdAt: new Date("2023-02-20 11:03:49.289+00"),
    abbreviation: "Stipendsushi",
    about:
      "Stipendsushi er en interessegruppe for alle onlinere som liker sushi. Rundt den 15. hver måned arrangeres det felles tur til et spisested i byen som serverer sushi.",
    type: "INTEREST_GROUP",
  },
]

export const getGroupRoleFixtures: () => Prisma.GroupRoleCreateInput[] = () =>
  getGroupFixtures().flatMap((group) => [
    {
      groupId: group.slug,
      name: "Leder",
      type: "LEADER",
    },
    {
      groupId: group.slug,
      name: "Vinstraffansvarlig",
      type: "PUNISHER",
    },
    {
      groupId: group.slug,
      name: "Nestleder",
      type: "COSMETIC",
    },
    {
      groupId: group.slug,
      name: "Tillitsvalgt",
      type: "COSMETIC",
    },
    {
      groupId: group.slug,
      name: "Økonomiansvarlig",
      type: "COSMETIC",
    },
    {
      groupId: group.slug,
      name: "Medlem",
      type: "COSMETIC",
    },
  ])
