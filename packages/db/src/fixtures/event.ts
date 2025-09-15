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
      description: stripIndents(`
        <p>Dette kurset gir deg en grundig innføring i hvordan man lager og bruker fixtures i utviklingsprosjekter. Du vil få praktisk erfaring gjennom øvelser, og vi legger vekt på å forstå både hvorfor og hvordan fixtures brukes i moderne programmering og testing.</p>
        <p>Kursdagen består av både forelesning og praktiske oppgaver. Vi starter med en introduksjon til konseptet, der vi ser på hva fixtures er, hvilke problemer de løser, og hvordan de kan bidra til mer robust og gjenbrukbar kode. Deretter går vi over til konkrete eksempler og øvelser der deltakerne får implementere egne løsninger.</p>
        <p>I løpet av kurset vil du blant annet lære:</p>
        <ul>
          <li>Hva fixtures er og hvorfor de er nyttige i testing og utvikling</li>
          <li>Hvordan sette opp enkle og mer avanserte fixtures</li>
          <li>Vanlige feil og fallgruver å unngå</li>
          <li>Beste praksis for struktur og vedlikehold</li>
        </ul>
        <p>Kurset passer for både studenter og utviklere som ønsker å styrke ferdighetene sine innen testdrevet utvikling og programvarekvalitet. Det kreves ingen forkunnskaper utover grunnleggende erfaring med koding og prosjektarbeid.</p>
        <h2>Praktisk informasjon</h2>
        <p>Kurset holdes i <strong>Hovedbygget</strong> på NTNU, adresse 
        <a href="https://maps.app.goo.gl/hSEicfQFamY7r9oX8" target="_blank">Høgskoleringen 1, 7034 Trondheim</a>. Oppmøte er senest kl. 12:00, og programmet varer frem til ca. 16:00. Det vil bli pauser underveis, og enkel servering blir ordnet.</p>
        <blockquote>
          <p><strong>OBS!</strong> Husk å ta med egen PC med nødvendig utviklingsmiljø installert (f.eks. Python eller Node.js, avhengig av dine preferanser). Du får beskjed på forhånd om hvilke biblioteker og verktøy du bør ha klart.</p>
        </blockquote>
        <h2>Sosial del</h2>
        <p>Etter kurset blir det en uformell samling for de som ønsker, med mulighet for å diskutere videre, dele erfaringer og bygge nettverk. Dette er en fin anledning til å bli kjent med andre som er interessert i programvareutvikling og testing.</p>
      `),
      imageUrl: "https://e0.365dm.com/23/06/1600x900/skysports-arsenal-fixtures_6186945.jpg",
      locationAddress: "Høgskoleringen 1, 7034 Trondheim",
      locationTitle: "Hovedbygget",
      locationLink: "https://maps.app.goo.gl/hSEicfQFamY7r9oX8",
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
      imageUrl: "https://aresweden.com/app/uploads/2019/12/NiclasVestefjell_4000px_.jpg",
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
        <p>Bli med på <strong>Sommerfest 2025</strong> på takterrassen! Vi rigger til for en kveld med god stemning, enkel servering, og musikk. Dette er et sosialt arrangement – kom for å slappe av, møte folk og nyte sommeren.</p>
        <h2>Program</h2>
        <ul>
          <li><strong>16:00</strong> - Dørene åpner. Registrering og velkomstdrink.</li>
          <li><strong>17:00</strong> - Grillen tennes. Mat serveres fortløpende.</li>
          <li><strong>18:30</strong> - DJ setter i gang dansbare låter.</li>
          <li><strong>21:30</strong> - Siste servering.</li>
          <li><strong>22:00</strong> - Avslutning og rydding.</li>
        </ul>
        <h2>Servering</h2>
        <p>Det blir enkel <em>grillmeny</em> (kjøtt, fisk og vegetar), salater og brød. Vi tilbyr alkoholfri drikke og et begrenset utvalg øl/vin. Har du allergier eller behov vi må ta hensyn til, <strong>si ifra ved påmelding</strong>.</p>
        <h2>Praktisk info</h2>
        <ul>
          <li><strong>Sted:</strong> Takterrassen (<em>A4, Realfagbygget</em>).</li>
          <li><strong>Tid:</strong> 16:00-22:00.</li>
          <li><strong>Kle deg etter vær:</strong> Utearrangement. Ta med jakke - kvelden kan bli kjølig.</li>
          <li><strong>Aldersgrense:</strong> 18+ for alkoholservering. Ta med legitimasjon.</li>
        </ul>
        <h2>Hva du bør ta med</h2>
        <ul>
          <li>Godt humør og <strong>dansesko</strong>.</li>
          <li>Eventuell egen piknikpledd/lette klær.</li>
          <li>Gyldig legitimasjon.</li>
        </ul>
        <h2>Regler (for å slippe mas senere)</h2>
        <ul>
          <li>Ikke ta med medbrakt alkohol.</li>
          <li>Respekter vakter og naboer - dette er et tak, ikke en nattklubb.</li>
          <li>Rydd etter deg. Søppel i søppelkassene, takk.</li>
        </ul>
        <h2>Tilgjengelighet</h2>
        <p>Adkomst via heis. Gi beskjed ved behov for tilrettelegging, så fikser vi det uten styr.</p>
        <h2>Dårlig vær?</h2>
        <p>Ved regn flyttes arrangementet inn i reserverte lokaler i Realfagbygget. Beskjed sendes på e-post/sms samme dag.</p>
        <h2>Finn frem</h2>
        <p>Oppmøte ved <strong>A4, Realfagbygget</strong>. Spør i resepsjonen hvis du roter deg bort. Takterrassen er skiltet fra A4-inngangen.</p>
        <blockquote>
          <p><strong>OBS:</strong> Meld deg av i tide hvis du ikke kan komme - plasser og mat kastes ikke bort.</p>
        </blockquote>
        <p>Spørsmål? Ta kontakt med arrangørene. Vi sees på taket.</p>
      `),
      imageUrl: "https://c8.alamy.com/comp/2JMRWDA/sommerfest-balloons-confetti-2JMRWDA.jpg",
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
        <p><strong>Vinkurs 🍷</strong> er en unik mulighet til å lære mer om vin på en strukturert, men uformell måte. Kurset gir deg en innføring i smaksmetoder, druesorter og hvordan vinens karakter formes av klima, jordsmonn og produksjonsmetoder. Vi fokuserer også på hvordan vin kan kombineres med mat for å løfte begge deler.</p>
        <h2>Program</h2>
        <ul>
          <li><strong>16:00</strong> - Velkomst og introduksjon til vinsmaking</li>
          <li><strong>16:30</strong> - Grunnleggende smaketeknikker</li>
          <li><strong>17:30</strong> - Smaksrunde: hvite viner fra ulike regioner</li>
          <li><strong>18:30</strong> - Pause med lett servering</li>
          <li><strong>19:00</strong> - Smaksrunde: røde viner og matparinger</li>
          <li><strong>21:00</strong> - Spørsmål, diskusjon og oppsummering</li>
          <li><strong>22:00</strong> - Avslutning</li>
        </ul>
        <h2>Hva du lærer</h2>
        <ul>
          <li>Hvordan identifisere aroma, smak og struktur i vin</li>
          <li>Forskjeller mellom klassiske vinregioner</li>
          <li>Hva som skiller druesorter fra hverandre</li>
          <li>Hvordan velge vin som passer til ulike typer mat</li>
        </ul>
        <h2>Instruktør</h2>
        <p>Kvelden ledes av en <strong>profesjonell sommelier</strong> med lang erfaring fra vinbransjen. Du får både faglig innsikt og praktiske tips som kan brukes i hverdagen.</p>
        <h2>Praktisk informasjon</h2>
        <ul>
          <li><strong>Sted:</strong> Smakslab, Studentersamfundet, Erling Skakkes gate 7, Trondheim (<a href="https://maps.app.goo.gl/2fhoN4riGaY7s4yA7" target="_blank">se kart</a>)</li>
          <li><strong>Tid:</strong> 16:00-22:00</li>
          <li><strong>Aldersgrense:</strong> 18 år (gyldig legitimasjon kreves)</li>
          <li><strong>Språk:</strong> Norsk</li>
        </ul>
        <blockquote>
          <p><strong>OBS:</strong> Det er begrenset med plasser, så meld deg på tidlig. Påmeldingen er bindende. Dersom du ikke kan komme, gi beskjed slik at plassen kan gå videre til andre.</p>
        </blockquote>
        <h2>Tips</h2>
        <p>Unngå sterk parfyme eller tyggegummi under kurset - det forstyrrer både deg selv og andre i smaksopplevelsen. Ta med notatbok hvis du vil huske detaljer fra smaksrundene.</p>
        <p>Dette er en kveld for både nybegynnere og de som allerede har interesse for vin. Ingen forkunnskaper kreves - bare nysgjerrighet og åpent sinn.</p>
      `),
      imageUrl: "https://wine-fun.contents.ne.jp/wp-content/uploads/sites/2/2022/06/eye_1009-1024x538.jpg",
      locationTitle: "Smakslab",
      locationAddress: "Studentersamfundet, Erling Skakkes gate 7, Trondheim",
      locationLink: "https://maps.app.goo.gl/2fhoN4riGaY7s4yA7",
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
        <p><strong>Infomøte om ekskursjonen</strong> er et obligatorisk møte for alle som skal delta på turen til Ås. Her får du en detaljert gjennomgang av programmet, transport, overnatting og praktiske ting du må vite før avreise.</p>
        <h2>Innhold</h2>
        <ul>
          <li>Presentasjon av <strong>programmet dag for dag</strong></li>
          <li>Gjennomgang av <strong>transport og reisetider</strong></li>
          <li>Informasjon om <strong>overnatting</strong> og måltider</li>
          <li>Hva du bør <strong>pakke og forberede</strong></li>
          <li>Praktiske regler og forventninger under turen</li>
        </ul>
        <h2>Spørsmål og svar</h2>
        <p>Reiselederne vil være til stede for å svare på spørsmål. Dette er en god anledning til å få klarhet i ting du lurer på - enten det gjelder logistikk, spesielle behov eller hvordan dagene blir lagt opp.</p>
        <h2>Praktisk informasjon</h2>
        <ul>
          <li><strong>Sted:</strong> Tihlde-rommet, A4-112, Realfagbygget (<a href="https://link.mazemap.com/PIAEEJsD" target="_blank">se kart</a>)</li>
          <li><strong>Tid:</strong> 12:00-13:00</li>
          <li><strong>Varighet:</strong> ca. 1 time</li>
        </ul>
        <blockquote>
          <p><strong>OBS:</strong> Hvis du ikke kan delta, er du selv ansvarlig for å skaffe deg informasjonen fra en medstudent eller reiseleder. Viktig praktisk info deles kun her.</p>
        </blockquote>
        <p>Dette møtet sikrer at alle er best mulig forberedt før ekskursjonen. Ta med notatbok hvis du vil ha en oversiktlig sjekkliste i etterkant.</p>
      `),
      imageUrl: "https://www.987thepeak.com/wp-content/uploads/2021/08/pexels-photo-1710482.jpeg",
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
      imageUrl: "https://www.oslomet.no/var/oslomet/storage/images/6/4/2/7/127246-8-eng-GB/oslo-by-2400x1200px.jpg",
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
      imageUrl: "https://www.twoday.lt/hubfs/LT%20-%20twoday%20Lithuania/LT%20-%20Meta/Meta-min.png",
      locationTitle: "Twodays kontorer",
      locationAddress: "Karenslyst allé 57, Oslo",
      locationLink: null,
      parentId: "8afc7d51-37cd-4d2f-8ded-b7f7479ff8e6",
    },
  ] as const satisfies Prisma.EventCreateManyInput[]
