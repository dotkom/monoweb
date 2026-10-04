import { stripIndents } from "common-tags"
import {
  addDays,
  addMonths,
  addWeeks,
  roundToNearestHours,
  setHours,
  subDays,
  subHours,
  subMonths,
  subWeeks,
} from "date-fns"
import type { Prisma } from "../"

const now = roundToNearestHours(new Date(), { roundingMethod: "ceil" })

export const X_SPORT_SURF_EVENT_ID = "a1b2c3d4-e5f6-4789-a012-111111111101"
export const RACINGLINE_MONACO_EVENT_ID = "a1b2c3d4-e5f6-4789-a012-111111111201"
export const JUL_GLOGG_EVENT_ID = "a1b2c3d4-e5f6-4789-a012-111111111301"
export const VODKA_BYMARKA_EVENT_ID = "a1b2c3d4-e5f6-4789-a012-111111111401"
export const FAXE_RITUALE_EVENT_ID = "a1b2c3d4-e5f6-4789-a012-111111111501"
export const MINELINE_BUILD_EVENT_ID = "a1b2c3d4-e5f6-4789-a012-111111111601"

export const getInterestGroupEventFixtures = () =>
  [
    {
      id: X_SPORT_SURF_EVENT_ID,
      createdAt: subWeeks(now, 2),
      updatedAt: subDays(now, 3),
      title: "Surfetur til Stadlandet",
      start: setHours(addWeeks(now, 3), 8),
      end: setHours(addDays(addWeeks(now, 3), 2), 18),
      registerEnd: setHours(addDays(now, 20), 23),
      deregisterDeadline: setHours(addDays(now, 18), 23),
      status: "PUBLISHED",
      interestGroupId: "x-sport",
      description: stripIndents(`
        <p><strong>Surfetur til Stadlandet</strong> er årets høydepunkt for X-Sport. Vi drar vestover for tre dager med bølger, camping og god stemning.</p>
        <h2>Program</h2>
        <ul>
          <li><strong>Fredag:</strong> Avreise fra Trondheim tidlig morgen. Oppmøte ved Gløshaugen.</li>
          <li><strong>Lørdag:</strong> Surfing hele dagen (nivåtilpasset). Kveld med grilling.</li>
          <li><strong>Søndag:</strong> Siste økt og hjemreise.</li>
        </ul>
        <h2>Praktisk</h2>
        <ul>
          <li>Utstyr kan leies på stedet hvis du ikke har eget.</li>
          <li>Ta med sovepose, varmt tøy og godt humør.</li>
          <li>Erfaring er ikke påkrevd - vi tar hensyn til nivå.</li>
        </ul>
        <blockquote>
          <p><strong>OBS:</strong> Påmelding er bindende etter avmeldingsfrist. Spørsmål? Slack #x-sport.</p>
        </blockquote>
      `),
      imageUrl: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&q=80",
      locationTitle: "Stadlandet",
      locationAddress: "Stad, Vestland",
      locationLink: "https://maps.app.goo.gl/8dA2NN9YWDp7XyuV6",
    },
    {
      createdAt: subWeeks(now, 1),
      updatedAt: now,
      title: "Topptur til Sylan",
      start: setHours(addWeeks(now, 5), 7),
      end: setHours(addDays(addWeeks(now, 5), 1), 17),
      registerEnd: setHours(addDays(now, 34), 23),
      deregisterDeadline: setHours(addDays(now, 32), 23),
      status: "PUBLISHED",
      interestGroupId: "x-sport",
      description: stripIndents(`
        <p>Helgetur til <strong>Sylan</strong> med overnatting i hytte. Vi går i rolig tempo og tilpasser ruta etter vær og form.</p>
        <h2>Hva du trenger</h2>
        <ul>
          <li>Gode fjellsko / sko etter sesong</li>
          <li>Vindtett jakke, lag-på-lag</li>
          <li>Mat til turen (felles middag ordnes)</li>
        </ul>
        <p>Oppmøte ved Gløshaugen. Transport i bil - vi fordeler seter i Slack.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
      locationTitle: "Sylan",
      locationAddress: "Tydal / Sylan, Trøndelag",
      locationLink: null,
    },
    {
      createdAt: subDays(now, 10),
      updatedAt: subDays(now, 2),
      title: "Klatrekveld på Grip",
      start: setHours(addDays(now, 9), 18),
      end: setHours(addDays(now, 9), 21),
      registerEnd: setHours(addDays(now, 8), 23),
      deregisterDeadline: setHours(addDays(now, 6), 23),
      status: "PUBLISHED",
      interestGroupId: "x-sport",
      description: stripIndents(`
        <p>Lavterskel <strong>klatrekveld</strong> på Grip klatresenter. Vi booker plasser sammen og hjelper hverandre med sikring.</p>
        <p>Nybegynnere er hjertelig velkomne. Ta med treningstøy - sko kan leies.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=1200&q=80",
      locationTitle: "Grip klatresenter",
      locationAddress: "Beddingen 16, 7042 Trondheim",
      locationLink: "https://maps.app.goo.gl/hSEicfQFamY7r9oX8",
    },
    {
      createdAt: subMonths(now, 2),
      updatedAt: subMonths(now, 2),
      title: "Skiweekend i Oppdal",
      start: setHours(subWeeks(now, 6), 8),
      end: setHours(addDays(subWeeks(now, 6), 1), 18),
      registerEnd: setHours(subDays(now, 43), 23),
      deregisterDeadline: setHours(subDays(now, 45), 23),
      status: "PUBLISHED",
      interestGroupId: "x-sport",
      description: stripIndents(`
        <p>Klassisk <strong>skiweekend i Oppdal</strong>. Alpint, telemark eller snowboard - alt er lov.</p>
        <p>Vi delte hytte og kjørte i bil. Takk til alle som var med!</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&q=80",
      locationTitle: "Oppdal skisenter",
      locationAddress: "Oppdal, Trøndelag",
      locationLink: null,
    },
    {
      createdAt: subMonths(now, 4),
      updatedAt: subMonths(now, 4),
      title: "Surfehelg på Jæren",
      start: setHours(subMonths(now, 3), 9),
      end: setHours(addDays(subMonths(now, 3), 2), 16),
      registerEnd: setHours(subDays(subMonths(now, 3), 1), 23),
      deregisterDeadline: setHours(subDays(subMonths(now, 3), 3), 23),
      status: "PUBLISHED",
      interestGroupId: "x-sport",
      description: "<p>Vårens surfehelg på Jæren. Sol, vind og noen solide økter i vannet.</p>",
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
      locationTitle: "Jæren",
      locationAddress: "Jæren, Rogaland",
      locationLink: null,
    },
    {
      createdAt: subDays(now, 4),
      updatedAt: subDays(now, 1),
      title: "Rafting på Driva",
      start: setHours(addMonths(now, 1), 10),
      end: setHours(addMonths(now, 1), 16),
      registerEnd: setHours(addMonths(now, 1), 10),
      deregisterDeadline: subHours(setHours(addMonths(now, 1), 10), 2),
      status: "IN_REVIEW",
      interestGroupId: "x-sport",
      description: stripIndents(`
        <p>Forslag: <strong>rafting på Driva</strong> med guide. Lavterskel, men vått!</p>
        <p>Venter på godkjenning før vi åpner for interesse.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&q=80",
      locationTitle: "Driva",
      locationAddress: "Oppdal / Driva",
      locationLink: null,
    },
    {
      id: RACINGLINE_MONACO_EVENT_ID,
      createdAt: subDays(now, 14),
      updatedAt: subDays(now, 1),
      title: "Race night: Monaco GP",
      start: setHours(addDays(now, 12), 14),
      end: setHours(addDays(now, 12), 18),
      registerEnd: setHours(addDays(now, 11), 23),
      deregisterDeadline: setHours(addDays(now, 9), 23),
      status: "PUBLISHED",
      interestGroupId: "racingline",
      description: stripIndents(`
        <p>Vi samles for å se <strong>Monaco Grand Prix</strong> sammen. Stor skjerm, snacks og heftig race-chat.</p>
        <h2>Praktisk</h2>
        <ul>
          <li>Oppmøte litt før start slik at vi får satt oss.</li>
          <li>Ta gjerne med favorittdrikke og snacks å dele.</li>
          <li>Tippekamp underveis - premier til de beste tipperne.</li>
        </ul>
      `),
      imageUrl: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1200&q=80",
      locationTitle: "Onlinekontoret",
      locationAddress: "A4-137, Realfagbygget",
      locationLink: "https://link.mazemap.com/PIAEEJsD",
    },
    {
      createdAt: subDays(now, 7),
      updatedAt: now,
      title: "Simracing på kontoret",
      start: setHours(addDays(now, 5), 18),
      end: setHours(addDays(now, 5), 22),
      registerEnd: setHours(addDays(now, 4), 23),
      deregisterDeadline: setHours(addDays(now, 2), 23),
      status: "PUBLISHED",
      interestGroupId: "racingline",
      description: stripIndents(`
        <p><strong>Simracing-kveld</strong> med ratter og pedaler. Vi kjører kvalifisering og heat - nybegynnere får opplæring.</p>
        <p>Spill: iRacing / Assetto Corsa (avhengig av oppsett). Ta med egen kontroller om du har.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80",
      locationTitle: "Onlinekontoret",
      locationAddress: "A4-137, Realfagbygget",
      locationLink: "https://link.mazemap.com/PIAEEJsD",
    },
    {
      createdAt: subDays(now, 20),
      updatedAt: subDays(now, 5),
      title: "Karting på Lade",
      start: setHours(addWeeks(now, 2), 17),
      end: setHours(addWeeks(now, 2), 20),
      registerEnd: setHours(addWeeks(now, 2), 17),
      deregisterDeadline: setHours(addDays(now, 13), 23),
      status: "PUBLISHED",
      interestGroupId: "racingline",
      description: stripIndents(`
        <p>Vi booker banen på <strong>Lade karting</strong> for en kveld med heat og latter.</p>
        <ul>
          <li>Pris per person kommer når vi har tall på påmeldte.</li>
          <li>Aldersgrense / høydekrav følger banen.</li>
          <li>Meld interesse tidlig - begrenset antall kart.</li>
        </ul>
      `),
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
      locationTitle: "Lade karting",
      locationAddress: "Lade, Trondheim",
      locationLink: null,
    },
    {
      createdAt: subMonths(now, 1),
      updatedAt: subWeeks(now, 3),
      title: "Sesongavslutning: race wrap-up",
      start: setHours(subWeeks(now, 2), 19),
      end: setHours(subWeeks(now, 2), 23),
      registerEnd: setHours(subWeeks(now, 2), 19),
      deregisterDeadline: setHours(subDays(now, 15), 23),
      status: "PUBLISHED",
      interestGroupId: "racingline",
      description: "<p>Sesongavslutning med høydepunkter, memes og kåring av årets tipperkonge.</p>",
      imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=80",
      locationTitle: "Realfagskjelleren",
      locationAddress: "Herman Krags veg 12, Trondheim",
      locationLink: null,
    },
    {
      createdAt: subDays(now, 3),
      updatedAt: subDays(now, 3),
      title: "Nattlig Spa-Francorchamps watch party",
      start: setHours(addDays(now, 20), 1),
      end: setHours(addDays(now, 20), 5),
      registerEnd: setHours(addDays(now, 19), 23),
      deregisterDeadline: setHours(addDays(now, 17), 23),
      status: "REJECTED",
      interestGroupId: "racingline",
      description: "<p>Forslag om nattlig watch party ble avslått - for sent på natten for kontoret.</p>",
      imageUrl: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?w=1200&q=80",
      locationTitle: "Onlinekontoret",
      locationAddress: "A4-137, Realfagbygget",
      locationLink: null,
    },
    {
      id: JUL_GLOGG_EVENT_ID,
      createdAt: subDays(now, 8),
      updatedAt: subDays(now, 1),
      title: "Gløggkveld på kontoret",
      start: setHours(addDays(now, 18), 17),
      end: setHours(addDays(now, 18), 20),
      registerEnd: setHours(addDays(now, 17), 23),
      deregisterDeadline: setHours(addDays(now, 15), 23),
      status: "PUBLISHED",
      interestGroupId: "folk-som-er-glad-i-jul",
      description: stripIndents(`
        <p>Vi sparker i gang julesesongen med <strong>gløgg, pepperkaker og julemusikk</strong> på Onlinekontoret.</p>
        <h2>Servering</h2>
        <ul>
          <li>Alkoholfri og vanlig gløgg</li>
          <li>Pepperkaker (ta gjerne med egne bakverk!)</li>
          <li>Julequiz med premier</li>
        </ul>
        <p>Kle deg julete om du vil - juletøy premieres.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&q=80",
      locationTitle: "Onlinekontoret",
      locationAddress: "A4-137, Realfagbygget",
      locationLink: "https://link.mazemap.com/PIAEEJsD",
    },
    {
      createdAt: subDays(now, 5),
      updatedAt: now,
      title: "Juleverksted: ornamenter og kort",
      start: setHours(addDays(now, 25), 16),
      end: setHours(addDays(now, 25), 19),
      registerEnd: setHours(addDays(now, 24), 23),
      deregisterDeadline: setHours(addDays(now, 22), 23),
      status: "PUBLISHED",
      interestGroupId: "folk-som-er-glad-i-jul",
      description: stripIndents(`
        <p><strong>Juleverksted</strong> der vi lager ornamenter, julekort og annen hygge. Materialer er inkludert.</p>
        <p>Ingen krav til kreative evner - det viktigste er stemningen.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1200&q=80",
      locationTitle: "A4, Realfagbygget",
      locationAddress: "Høgskoleringen 1, Trondheim",
      locationLink: "https://maps.app.goo.gl/hSEicfQFamY7r9oX8",
    },
    {
      createdAt: subDays(now, 12),
      updatedAt: subDays(now, 4),
      title: "Julebord for interessen",
      start: setHours(addMonths(now, 2), 18),
      end: setHours(addMonths(now, 2), 23),
      registerEnd: setHours(addMonths(now, 2), 18),
      deregisterDeadline: setHours(subDays(addMonths(now, 2), 1), 23),
      status: "PUBLISHED",
      interestGroupId: "folk-som-er-glad-i-jul",
      description: stripIndents(`
        <p>Årets <strong>julebord</strong> for Folk som er glad i jul. Mat, leker og julespirit - bokstavelig talt.</p>
        <p>Mer info om sted og meny kommer nærmere datoen. Meld interesse for å få oppdateringer.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1606914469633-bd39206ea739?w=1200&q=80",
      locationTitle: "TBA",
      locationAddress: "Trondheim",
      locationLink: null,
    },
    {
      createdAt: subMonths(now, 10),
      updatedAt: subMonths(now, 9),
      title: "Adventskalender-kickoff",
      start: setHours(subMonths(now, 9), 17),
      end: setHours(subMonths(now, 9), 19),
      registerEnd: setHours(subMonths(now, 9), 17),
      deregisterDeadline: setHours(subDays(subMonths(now, 9), 1), 23),
      status: "PUBLISHED",
      interestGroupId: "folk-som-er-glad-i-jul",
      description: "<p>Kickoff for fjorårets digitale adventskalender. Takk til alle som bidro med lukeinnhold!</p>",
      imageUrl: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1200&q=80",
      locationTitle: "Onlinekontoret",
      locationAddress: "A4-137, Realfagbygget",
      locationLink: null,
    },
    {
      createdAt: subDays(now, 2),
      updatedAt: subDays(now, 2),
      title: "Lucia-tog gjennom A4",
      start: setHours(addDays(now, 40), 8),
      end: setHours(addDays(now, 40), 9),
      registerEnd: setHours(addDays(now, 39), 23),
      deregisterDeadline: setHours(addDays(now, 37), 23),
      status: "IN_REVIEW",
      interestGroupId: "folk-som-er-glad-i-jul",
      description: "<p>Forslag: Lucia-tog gjennom A4 med lussekatter. Venter på godkjenning fra backlog/bygg.</p>",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80",
      locationTitle: "A4, Realfagbygget",
      locationAddress: "Høgskoleringen 1, Trondheim",
      locationLink: null,
    },
    {
      id: VODKA_BYMARKA_EVENT_ID,
      createdAt: subDays(now, 6),
      updatedAt: subDays(now, 1),
      title: "Vodka i Bymarka",
      start: setHours(addDays(now, 7), 17),
      end: setHours(addDays(now, 7), 22),
      registerEnd: setHours(addDays(now, 6), 23),
      deregisterDeadline: setHours(addDays(now, 4), 23),
      status: "PUBLISHED",
      interestGroupId: "vodka-i-skogen",
      description: stripIndents(`
        <p>Klassisk <strong>Vodka i Bymarka</strong>. Vi går inn til et koselig sted, tenner bål (hvis tillatt) og nyter skogen.</p>
        <h2>Regler</h2>
        <ul>
          <li>Ta med eget drikke - vi deler gjerne, men ingen forventninger.</li>
          <li>Rydd etter deg. Skogen skal se bedre ut når vi går.</li>
          <li>Kle deg etter vær. Det blir kaldt når sola går ned.</li>
        </ul>
        <p>Oppmøte ved Skistua. Vi går i samlet flokk.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
      locationTitle: "Bymarka / Skistua",
      locationAddress: "Skistua, Trondheim",
      locationLink: "https://maps.app.goo.gl/8dA2NN9YWDp7XyuV6",
    },
    {
      createdAt: subDays(now, 15),
      updatedAt: subDays(now, 8),
      title: "Høsttur til Estenstadmarka",
      start: setHours(subWeeks(now, 1), 16),
      end: setHours(subWeeks(now, 1), 21),
      registerEnd: setHours(subWeeks(now, 1), 16),
      deregisterDeadline: setHours(subDays(now, 8), 23),
      status: "PUBLISHED",
      interestGroupId: "vodka-i-skogen",
      description: "<p>Høsttur til Estenstadmarka med fargerike trær og varm drikke. Stor suksess!</p>",
      imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80",
      locationTitle: "Estenstadmarka",
      locationAddress: "Estenstad, Trondheim",
      locationLink: null,
    },
    {
      createdAt: subDays(now, 4),
      updatedAt: now,
      title: "Midnatttur med termos",
      start: setHours(addDays(now, 14), 22),
      end: setHours(addDays(now, 15), 1),
      registerEnd: setHours(addDays(now, 13), 23),
      deregisterDeadline: setHours(addDays(now, 11), 23),
      status: "PUBLISHED",
      interestGroupId: "vodka-i-skogen",
      description: stripIndents(`
        <p><strong>Midnatttur</strong> under stjernehimmelen. Kort tur til et utsiktspunkt, termos og stille prat.</p>
        <p>Pannelykt anbefales. Vi er tilbake i byen rundt 01:00.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80",
      locationTitle: "Bymarka",
      locationAddress: "Trondheim",
      locationLink: null,
    },
    {
      createdAt: subMonths(now, 2),
      updatedAt: subMonths(now, 2),
      title: "Sommersolhverv i skogen",
      start: setHours(subMonths(now, 3), 18),
      end: setHours(subMonths(now, 3), 23),
      registerEnd: setHours(subMonths(now, 3), 18),
      deregisterDeadline: setHours(subDays(subMonths(now, 3), 1), 23),
      status: "PUBLISHED",
      interestGroupId: "vodka-i-skogen",
      description: "<p>Feiring av sommersolhverv med lengste dag og lengste skål.</p>",
      imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80",
      locationTitle: "Ladestien",
      locationAddress: "Lade, Trondheim",
      locationLink: null,
    },
    {
      id: FAXE_RITUALE_EVENT_ID,
      createdAt: subDays(now, 9),
      updatedAt: subDays(now, 2),
      title: "Faxe-ritualet",
      start: setHours(addDays(now, 11), 19),
      end: setHours(addDays(now, 11), 23),
      registerEnd: setHours(addDays(now, 10), 23),
      deregisterDeadline: setHours(addDays(now, 8), 23),
      status: "PUBLISHED",
      interestGroupId: "faxe-ordenen",
      description: stripIndents(`
        <p>Det hellige <strong>Faxe-ritualet</strong> gjennomføres. Nye riddere kan innvies, gamle kan fornye edene sine.</p>
        <h2>Kveldens gang</h2>
        <ul>
          <li>Åpningsseremoni</li>
          <li>Skål i tre omganger</li>
          <li>Leker og brorskap</li>
          <li>Avslutning med ordenens hymne</li>
        </ul>
        <blockquote>
          <p>Medbring minst én kald Faxe. Ordenen ser alt.</p>
        </blockquote>
      `),
      imageUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=1200&q=80",
      locationTitle: "Realfagskjelleren",
      locationAddress: "Herman Krags veg 12, Trondheim",
      locationLink: null,
    },
    {
      createdAt: subDays(now, 18),
      updatedAt: subDays(now, 10),
      title: "Skål på Kjelleren",
      start: setHours(subDays(now, 9), 20),
      end: setHours(subDays(now, 9), 1),
      registerEnd: setHours(subDays(now, 9), 20),
      deregisterDeadline: setHours(subDays(now, 10), 23),
      status: "PUBLISHED",
      interestGroupId: "faxe-ordenen",
      description: "<p>Uformell skålkveld på Realfagskjelleren. Ingen ritualer - bare Faxe og venner.</p>",
      imageUrl: "https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=1200&q=80",
      locationTitle: "Realfagskjelleren",
      locationAddress: "Herman Krags veg 12, Trondheim",
      locationLink: null,
    },
    {
      createdAt: subDays(now, 3),
      updatedAt: now,
      title: "Ordenens generalforsamling",
      start: setHours(addWeeks(now, 4), 18),
      end: setHours(addWeeks(now, 4), 21),
      registerEnd: setHours(addWeeks(now, 4), 18),
      deregisterDeadline: setHours(addDays(now, 27), 23),
      status: "PUBLISHED",
      interestGroupId: "faxe-ordenen",
      description: stripIndents(`
        <p><strong>Generalforsamling</strong> for Faxe-ordenen. Valg, saksliste og etterfølgende skål.</p>
        <p>Alle medlemmer har møte- og stemmerett. Sakspapirer sendes i Slack.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=1200&q=80",
      locationTitle: "Onlinekontoret",
      locationAddress: "A4-137, Realfagbygget",
      locationLink: "https://link.mazemap.com/PIAEEJsD",
    },
    {
      createdAt: subDays(now, 11),
      updatedAt: subDays(now, 6),
      title: "Faxe-smaking: klassisk vs. ny",
      start: setHours(addDays(now, 16), 18),
      end: setHours(addDays(now, 16), 21),
      registerEnd: setHours(addDays(now, 15), 23),
      deregisterDeadline: setHours(addDays(now, 13), 23),
      status: "PUBLISHED",
      interestGroupId: "faxe-ordenen",
      description: stripIndents(`
        <p>Blindsmaking der vi sammenligner <strong>klassisk Faxe</strong> med nyere varianter. Notatark og vann serveres.</p>
        <p>Aldersgrense 18+. Ta med legitimasjon.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=1200&q=80",
      locationTitle: "Smakslab",
      locationAddress: "Studentersamfundet, Erling Skakkes gate 7, Trondheim",
      locationLink: "https://maps.app.goo.gl/2fhoN4riGaY7s4yA7",
    },
    {
      createdAt: subMonths(now, 1),
      updatedAt: subMonths(now, 1),
      title: "Midnattsmesse for Faxe",
      start: setHours(subDays(now, 20), 23),
      end: setHours(subDays(now, 19), 2),
      registerEnd: setHours(subDays(now, 20), 23),
      deregisterDeadline: setHours(subDays(now, 21), 23),
      status: "DELETED",
      interestGroupId: "faxe-ordenen",
      description: "<p>Arrangementet ble avlyst og slettet - forvirring rundt bookingen.</p>",
      imageUrl: "https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?w=1200&q=80",
      locationTitle: "Realfagskjelleren",
      locationAddress: "Herman Krags veg 12, Trondheim",
      locationLink: null,
    },

    // ---------------------------------------------------------------------------
    // Mineline
    // ---------------------------------------------------------------------------
    {
      id: MINELINE_BUILD_EVENT_ID,
      createdAt: subDays(now, 5),
      updatedAt: subDays(now, 1),
      title: "Build night: ny spawn",
      start: setHours(addDays(now, 4), 19),
      end: setHours(addDays(now, 4), 23),
      registerEnd: setHours(addDays(now, 3), 23),
      deregisterDeadline: setHours(addDays(now, 1), 23),
      status: "PUBLISHED",
      interestGroupId: "mineline",
      description: stripIndents(`
        <p>Vi bygger ny <strong>spawn</strong> sammen på Mineline-serveren. Voice i Discord, bygging i spill.</p>
        <h2>Tema</h2>
        <p>Moderne campus-inspirert spawn med plass til butikker, warps og infoskilt.</p>
        <p>Ingen krav til byggestil - vi trenger også folk til terraforming og redstone.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80",
      locationTitle: "Online Discord / Mineline",
      locationAddress: null,
      locationLink: null,
    },
    {
      createdAt: subDays(now, 12),
      updatedAt: subDays(now, 3),
      title: "Redstone-workshop",
      start: setHours(addDays(now, 10), 18),
      end: setHours(addDays(now, 10), 21),
      registerEnd: setHours(addDays(now, 9), 23),
      deregisterDeadline: setHours(addDays(now, 7), 23),
      status: "PUBLISHED",
      interestGroupId: "mineline",
      description: stripIndents(`
        <p>Workshop i <strong>redstone</strong>: dører, heiser, sorteringsmaskiner og enkle datamaskiner.</p>
        <p>Passer for nybegynnere. Vi starter på creative-plot og tar med tips til survival.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1200&q=80",
      locationTitle: "Onlinekontoret + Discord",
      locationAddress: "A4-137, Realfagbygget",
      locationLink: "https://link.mazemap.com/PIAEEJsD",
    },
    {
      createdAt: subWeeks(now, 5),
      updatedAt: subWeeks(now, 4),
      title: "Survival weekend: nether-update",
      start: setHours(subWeeks(now, 3), 12),
      end: setHours(addDays(subWeeks(now, 3), 1), 20),
      registerEnd: setHours(subDays(now, 22), 23),
      deregisterDeadline: setHours(subDays(now, 24), 23),
      status: "PUBLISHED",
      interestGroupId: "mineline",
      description: "<p>Helg dedikert til nether-utforskning, farmbygging og felles boss-fight.</p>",
      imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80",
      locationTitle: "Mineline-serveren",
      locationAddress: null,
      locationLink: null,
    },
    {
      createdAt: subDays(now, 8),
      updatedAt: now,
      title: "Server-restart og vedlikehold",
      start: setHours(addDays(now, 2), 10),
      end: setHours(addDays(now, 2), 12),
      registerEnd: setHours(addDays(now, 1), 23),
      deregisterDeadline: setHours(subDays(now, 1), 23),
      status: "PUBLISHED",
      interestGroupId: "mineline",
      description: stripIndents(`
        <p>Planlagt <strong>server-restart</strong> med plugin-oppdateringer og backup.</p>
        <p>Serveren er nede i vedlikeholdsvinduet. Etterpå blir det felles innlogging og feiring på spawn.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=1200&q=80",
      locationTitle: "Mineline-serveren",
      locationAddress: null,
      locationLink: null,
    },
    {
      createdAt: subMonths(now, 2),
      updatedAt: subMonths(now, 2),
      title: "Mineline-LAN på kontoret",
      start: setHours(subMonths(now, 1), 17),
      end: setHours(subMonths(now, 1), 23),
      registerEnd: setHours(subMonths(now, 1), 17),
      deregisterDeadline: setHours(subDays(subMonths(now, 1), 1), 23),
      status: "PUBLISHED",
      interestGroupId: "mineline",
      description: "<p>LAN på kontoret der alle spilte på samme server. Pizza og byggekonkurranse.</p>",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
      locationTitle: "Onlinekontoret",
      locationAddress: "A4-137, Realfagbygget",
      locationLink: null,
    },
    {
      createdAt: subDays(now, 1),
      updatedAt: subDays(now, 1),
      title: "Speedrun-kveld: any%",
      start: setHours(addWeeks(now, 6), 19),
      end: setHours(addWeeks(now, 6), 23),
      registerEnd: setHours(addWeeks(now, 6), 19),
      deregisterDeadline: setHours(addDays(now, 41), 23),
      status: "IN_REVIEW",
      interestGroupId: "mineline",
      description: "<p>Forslag om speedrun-kveld med any%-kategorier. Under vurdering.</p>",
      imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
      locationTitle: "Discord",
      locationAddress: null,
      locationLink: null,
    },
    {
      createdAt: subDays(now, 2),
      updatedAt: now,
      title: "Fjelltur til Gråkallen",
      start: setHours(addDays(now, 6), 10),
      end: setHours(addDays(now, 6), 15),
      registerEnd: setHours(addDays(now, 5), 23),
      deregisterDeadline: setHours(addDays(now, 3), 23),
      status: "PUBLISHED",
      interestGroupId: "x-sport",
      description: stripIndents(`
        <p>Søndagstur til <strong>Gråkallen</strong>. Rolig tempo, niste og utsikt.</p>
        <p>Oppmøte ved Lian. Ta med gode sko og jakke.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80",
      locationTitle: "Gråkallen",
      locationAddress: "Bymarka, Trondheim",
      locationLink: null,
    },
    {
      createdAt: subDays(now, 16),
      updatedAt: subDays(now, 12),
      title: "Quali + race: Imola watch party",
      start: setHours(subDays(now, 11), 14),
      end: setHours(subDays(now, 11), 18),
      registerEnd: setHours(subDays(now, 11), 14),
      deregisterDeadline: setHours(subDays(now, 12), 23),
      status: "PUBLISHED",
      interestGroupId: "racingline",
      description: "<p>Felles visning av Imola - både kvalifisering-highlights og race.</p>",
      imageUrl: "https://images.unsplash.com/photo-1455729552865-3658a5d39692?w=1200&q=80",
      locationTitle: "Onlinekontoret",
      locationAddress: "A4-137, Realfagbygget",
      locationLink: null,
    },
    {
      createdAt: subDays(now, 20),
      updatedAt: subDays(now, 18),
      title: "Pepperkakebaking",
      start: setHours(subDays(now, 14), 16),
      end: setHours(subDays(now, 14), 19),
      registerEnd: setHours(subDays(now, 14), 16),
      deregisterDeadline: setHours(subDays(now, 15), 23),
      status: "PUBLISHED",
      interestGroupId: "folk-som-er-glad-i-jul",
      description: "<p>Felles pepperkakebaking. Deig, former og julemusikk var på plass.</p>",
      imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80",
      locationTitle: "Onlinekontoret",
      locationAddress: "A4-137, Realfagbygget",
      locationLink: null,
    },
    {
      createdAt: subDays(now, 1),
      updatedAt: now,
      title: "Beach cleanup + badetur",
      start: setHours(addDays(now, 21), 11),
      end: setHours(addDays(now, 21), 15),
      registerEnd: setHours(addDays(now, 20), 23),
      deregisterDeadline: setHours(addDays(now, 18), 23),
      status: "PUBLISHED",
      interestGroupId: "x-sport",
      description: stripIndents(`
        <p>Vi rydder søppel langs <strong>Ladestien</strong> og tar et bad etterpå for de som tør.</p>
        <p>Hansker og sekker ordnes. Ta med håndkle.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
      locationTitle: "Ladestien",
      locationAddress: "Lade, Trondheim",
      locationLink: null,
    },
    {
      createdAt: subDays(now, 7),
      updatedAt: subDays(now, 2),
      title: "Creative build contest",
      start: setHours(addDays(now, 28), 18),
      end: setHours(addDays(now, 30), 20),
      registerEnd: setHours(addDays(now, 27), 23),
      deregisterDeadline: setHours(addDays(now, 25), 23),
      status: "PUBLISHED",
      interestGroupId: "mineline",
      description: stripIndents(`
        <p>Helg med <strong>byggkonkurranse</strong> på creative. Tema kunngjøres fredag kveld.</p>
        <p>Stemming søndag. Premier til vinnerne (æresbevisning på spawn).</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1200&q=80",
      locationTitle: "Mineline-serveren",
      locationAddress: null,
      locationLink: null,
    },
    {
      createdAt: subDays(now, 4),
      updatedAt: subDays(now, 1),
      title: "Ordenens blåtur",
      start: setHours(addWeeks(now, 7), 12),
      end: setHours(addDays(addWeeks(now, 7), 1), 16),
      registerEnd: setHours(addDays(now, 48), 23),
      deregisterDeadline: setHours(addDays(now, 46), 23),
      status: "PUBLISHED",
      interestGroupId: "faxe-ordenen",
      description: stripIndents(`
        <p>Blåtur for Faxe-ordenen. Destinasjon hemmeligholdes til avreise - pakk for både by og natur.</p>
        <p>Medlemskap i ordenen er ikke påkrevd, men Faxe er det.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&q=80",
      locationTitle: "TBA",
      locationAddress: "Trøndelag",
      locationLink: null,
    },
    {
      createdAt: subDays(now, 3),
      updatedAt: now,
      title: "Vodka & vandring: Nidelva",
      start: setHours(addDays(now, 19), 17),
      end: setHours(addDays(now, 19), 21),
      registerEnd: setHours(addDays(now, 18), 23),
      deregisterDeadline: setHours(addDays(now, 16), 23),
      status: "PUBLISHED",
      interestGroupId: "vodka-i-skogen",
      description: stripIndents(`
        <p>Urban variant: spasertur langs <strong>Nidelva</strong> med stopp for termos og prat.</p>
        <p>Mer by enn skog, men ånden er den samme.</p>
      `),
      imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80",
      locationTitle: "Nidelva",
      locationAddress: "Trondheim sentrum",
      locationLink: null,
    },
    {
      createdAt: subHours(now, 20),
      updatedAt: now,
      title: "Friday night quali tips",
      start: setHours(addDays(now, 3), 19),
      end: setHours(addDays(now, 3), 21),
      registerEnd: setHours(addDays(now, 2), 23),
      deregisterDeadline: setHours(now, 23),
      status: "PUBLISHED",
      interestGroupId: "racingline",
      description: "<p>Kort fredagskveld med tippeskjema før kvalifisering og lett snacks.</p>",
      imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
      locationTitle: "Onlinekontoret",
      locationAddress: "A4-137, Realfagbygget",
      locationLink: null,
    },
  ] as const satisfies Prisma.InterestGroupEventCreateManyInput[]

type InterestAssignment = {
  eventId: string
  userIndexes: number[]
  createdDaysAgo: number
}

const interestAssignments: InterestAssignment[] = [
  {
    eventId: X_SPORT_SURF_EVENT_ID,
    userIndexes: [0, 1, 2, 4, 7, 9],
    createdDaysAgo: 10,
  },
  {
    eventId: RACINGLINE_MONACO_EVENT_ID,
    userIndexes: [0, 3, 5, 6, 8],
    createdDaysAgo: 8,
  },
  {
    eventId: JUL_GLOGG_EVENT_ID,
    userIndexes: [1, 2, 4, 7, 8, 10],
    createdDaysAgo: 5,
  },
  {
    eventId: VODKA_BYMARKA_EVENT_ID,
    userIndexes: [0, 2, 5, 6, 9],
    createdDaysAgo: 4,
  },
  {
    eventId: FAXE_RITUALE_EVENT_ID,
    userIndexes: [1, 3, 4, 5, 7, 8, 10],
    createdDaysAgo: 6,
  },
  {
    eventId: MINELINE_BUILD_EVENT_ID,
    userIndexes: [0, 1, 3, 6, 9, 10],
    createdDaysAgo: 3,
  },
]

export const getInterestGroupEventRegistrationFixtures = (userIds: string[]) => {
  const registrations: Prisma.InterestGroupEventRegistrationCreateManyInput[] = []

  for (const assignment of interestAssignments) {
    for (const [offset, userIndex] of assignment.userIndexes.entries()) {
      const userId = userIds[userIndex]
      if (userId === undefined) {
        continue
      }

      registrations.push({
        interestGroupEventId: assignment.eventId,
        userId,
        createdAt: subDays(now, assignment.createdDaysAgo - offset),
      })
    }
  }

  return registrations
}
