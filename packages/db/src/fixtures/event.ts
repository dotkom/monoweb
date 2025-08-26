import type { Prisma } from "@prisma/client"
import { stripIndents } from "common-tags"
import { addDays, addHours, addMonths, roundToNearestHours, setHours, subDays, subMonths, subWeeks } from "date-fns"

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
    {
      id: "8afc7d51-37cd-4d2f-8ded-b7f7479ff8e6",
      attendanceId: attendanceIds[4],
      createdAt: subWeeks(now, 1),
      updatedAt: subDays(now, 4),
      title: "ITEX",
      start: setHours(addDays(now, 7), 12),
      end: setHours(addDays(now, 10), 18),
      status: "PUBLIC",
      type: "COMPANY",
      description: stripIndents(`
        <p>På turen kan det bli mulighet for intervjuer til både sommerjobb og fast jobb. Dette er både en faglig og sosial tur, der du kan bli bedre kjent med dine nye klassekamerater, og mulige fremtidige arbeidsgivere. Bedriftene ønsker CVer fra de påmeldte, så vi anbefaler å oppdatere denne før turen.</p>
        <p>Turen vil bestå av dagsbesøk og kveldsbesøk, der dagsbesøk er lunsjarrangementer som varer fra kl. 12-15, mens kveldsbesøk er fra kl. 18 og utover.</p>
        <p>De planlagte bedriftene vi skal besøke er foreløpig:</p>
        <ul>
          <li>Bekk</li>
          <li>Accenture</li>
          <li>DNV</li>
          <li>Sopra Steria</li>
          <li>Geodata</li>
          <li>twoday</li>
          <li>Bouvet</li>
          <li>Tietoevry</li>
          <li>Computas</li>
        </ul>
        <p><strong>OBS! Har du nettopp kommet inn på master i informatikk er det viktig at du søker om opptak til 4. her på OW ASAP</strong></p>
        <blockquote>
        <p>Dette gjøres ved å gå til &quot;Min side&quot; -&gt; &quot;Innstillinger&quot; -&gt; &quot;Medlemskap&quot; -&gt; &quot;Oppdater medlemskapet ditt via NTNU&quot;. Hvis dette ikke funker er du nødt til å søke om medlemskap med manuell godkjenning. Det er viktig at all informasjon er riktig for å få det godkjent før påmeldingen. Dokumentasjonen som skal lastes opp er et skjermbilde av studieprogrammet i Studentweb. Jo tidligere dere gjør dette, jo større sjanse er det
        for at dere får det godkjent innen påmeldingen åpner!!</p>
        </blockquote>
        <h2>Transport</h2>
        <p>Vi dekker opp til 500kr hver vei, men dere er selv nødt til å ordne transport på egenhånd ned til Oslo og opp igjen til Trondheim.</p>
        <p>OBS! Det er svært viktig at dere bestiller transport slik at dere er i Oslo i god tid før første bedriftspresentasjonen starter. Det er felles avgang fra hotellet mot kontorene til Bekk/Accenture kl. 17:15! (Ta kontakt på telefon til arrangør om det skulle dukke opp noe)</p>
        <h2>Hjemreise</h2>
        <p>Siste bedriftsbesøk blir på torsdag, dagsbesøk fra kl.12-15. Du må selv bestille billett til Trondheim på torsdag, eller senere hvis du ønsker å tilbringe helgen i Oslo på egen regning. </p>
        <p>Mer info på hvordan få refundert turen kommer senere, TA VARE PÅ KVITTERINGER.</p>
        <h2>Overnatting</h2>
        <p>Vi overnatter på Hotell Bondeheimen, nær Stortinget i Oslo sentrum. Frokostbuffet er inkludert i oppholdet.</p>
        <h2>Kort avmeldingsfrist</h2>
        <p>Merk at avmeldingsfristen er 12. august. Det vil si at etter 12. august binder du deg til å være med på turen og delta på påmeldte bedriftsarrangementer. Grunnen til dette er at vi har frister for deltakerliste for hotell. Etter fristen er gått ut kommer det mer info knyttet til romfordeling, bedrifter, og hvordan man sender reiseregning.</p>
        <p>Spørsmål?
        Send oss en mail på <a href="mailto:bedkom@online.ntnu.no">bedkom@online.ntnu.no</a> om noe skulle være uklart.</p>
        <p>Påmelding er bindende etter avmeldingsfristen og det plikt til å møte på alt.</p>
      `),
      subtitle: "Årets IT-ekskursjon!",
      imageUrl: null,
      locationTitle: "Oslo",
      locationAddress: null,
      locationLink: null,
    },
    {
      attendanceId: attendanceIds[5],
      createdAt: subDays(now, 5),
      updatedAt: subDays(now, 1),
      title: "(ITEX) Kveldsarrangement med Twoday",
      start: setHours(addDays(now, 8), 18),
      end: setHours(addDays(now, 9), 2),
      status: "PUBLIC",
      type: "COMPANY",
      description: stripIndents(`
        <p><strong>TL;DR </strong></p>
        <p><strong>Hva: Bedriftsbesøk hos twoday </strong></p>
        <p><strong>Hvor: Karenslyst allé 57</strong></p>
        <p><strong>Når: 18:00 (mulighet for speedintervjuer fra 15:30)</strong></p>
        <p></p>
        <p><strong>Om arrangementet:</strong></p>
        <p>
          Vi i twoday gleder oss til å bli bedre kjent med dere den 3. september på kontoret vårt i Karenslyst allé 57 på
          Skøyen. Det vil bli presentasjon, leker og moro etterfulgt av deilig mat og mingling ut kvelden.
        </p>
        <p>
          <strong>Speedintervjuer:</strong><br />I tillegg åpner vi opp for muligheten til å delta på speedintervjuer med oss
          i twoday i forkant av bedriftspresentasjonen. Disse vil bli holdt på kontoret vårt på Skøyen mellom kl. 15:30 og
          18:00. Speedintervjuer er første del av rekrutteringsprosessen for alle som er interessert i vårt Graduateprogram
          Nytt Krutt. Er du ferdig student i 2026 og interessert i vårt Graduateprogram? Send inn din søknad her:
          <a target="_blank" rel="noopener noreferrer nofollow" href="https://www.twoday.no/jobb-hos-oss/nytt-krutt">
            https://www.twoday.no/jobb-hos-oss/nytt-krutt
          </a>
          For å sikre et speedintervju må du sende inn din søknad innen den 31. august. Vi vil ta kontakt med alle som har
          søkt i forkant av besøket for å avtale tidspunkt for intervju. Vi ber alle som legger inn en søknad i forbindelse
          med ITEX om å legge inn en kommentar om dette i søknaden.
        </p>
        <p>
          Om twoday twoday handler om mennesker. Fordi det som virkelig betyr noe er hvem du velger å tilbringe dagene dine
          med. I fokus er våre ansatte, våre kunder og samfunnet. Vi tar imot folk slik de er, vi
        </p>
        <p>
          samarbeider og vi blomstrer sammen. Som et IT-konsulenthus med flere tusen spennende kunder har vi utallige
          muligheter, med et formål om å skape en bedre morgendag gjennom teknologi. twoday er en av Nordens ledende
          leverandører av virksomhetskritiske IT-løsninger, konsulenttjenester og datadrevet teknologi. Vi fokuserer på
          skreddersøm og tilpasset programvareutvikling hos våre kunder. I tillegg leverer vi noen av de største og viktigste
          prosjektene i Norge innenfor Analytics og Business Intelligence (BI).
        </p>
      `),
      subtitle: "Kveldsarrangement med Twoday er alltid gøy",
      imageUrl: null,
      locationTitle: "Twodays kontorer",
      locationAddress: "Karenslyst allé 57, Oslo",
      locationLink: null,
      parentId: "8afc7d51-37cd-4d2f-8ded-b7f7479ff8e6",
    },
  ] as const satisfies Prisma.EventCreateManyInput[]
