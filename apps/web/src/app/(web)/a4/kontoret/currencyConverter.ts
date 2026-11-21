import { yearsToDays } from "date-fns"
import { z } from "zod"

// If updating the enum, remember to add logic in the three functions in this file
export const CURRENCY_VALUES = [
  "NOK",
  "V_BUCKS",
  "ROBUX",
  "COC_GEMS",
  "OPUS_5.5_TOKENS",
  "FIFA_POINTS",
  "CS_KEYS",
  "RP",
  "GTA_DOLLARS",
  "EDDIES",
  "COPIES_OF_UNDERTALE",
  "COPIES_OF_GTA_VI",
  "PK",
  "STORSTIPEND",
  "DAYS_OF_SAMF_MEMBERSHIP",
  "DAYS_OF_APPLECARE_PLUS",
  "HOURS_OF_OW_UPTIME",
  "HOURS_OF_ELECTRICITY",
  "BEERS_AT_CIRCUS",
  "ATB_MONTHLY_TICKETS",
  "OW_BUCKS",
  "ANIMALS",
  "5090",
  "KBO_KANELBOLLE",
  "SESAM_KEBABS",
  "NETFLIX_SUBSCRIPTIONS",
  "CHRISTMAS_STARS",
  "BIRTHS_IN_US",
  "PARACETAMOL",
  "67",
] as const

// Values added here are functional if logic is added and the cookie is manually set to it's value
export const Currencies = z.enum([...CURRENCY_VALUES, "PIZZA_BUDGET"])

export type CurrenciesType = z.infer<typeof Currencies>

export const convertCurrency = (currency: CurrenciesType, value: number, currentKWHPrice: number) => {
  // ALL PRICES AS OF 05.11.2026
  switch (currency) {
    case "NOK":
      return `${value.toFixed(2)} kr`
    case "V_BUCKS":
      return `${((value / 89) * 800).toFixed(2)} V-Bucks` // 800 v-bucks costs 89kr
    case "ROBUX":
      return `${((value / 42) * 240).toFixed(2)} Robux` // 240 v-bucks costs 42kr
    case "COC_GEMS":
      return `${((value / 59) * 80).toFixed(2)} gems` // 80 gems costs 59kr
    case "OPUS_5.5_TOKENS":
      return `${((value / 47) /*approx. nok / 5 usd*/ * 1_000_000).toFixed(0)} tokens` // $5 per million tokens
    case "FIFA_POINTS":
      return `${((value / 279) * 2800).toFixed(2)} FIFA points` // 2800 FC points costs 279
    case "CS_KEYS":
      return `${(value / 23.5).toFixed(2)} keys` // A CS key costs 23.50kr
    case "RP":
      return `${((value / 201.93) * 2540).toFixed(2)} RP` // A 2540RP gift card costs 201.93kr
    case "GTA_DOLLARS":
      return `$${((value / 39) * 200_000).toFixed(2)}` // a $200000 shark card costs 39kr
    case "EDDIES":
      /* Math is somewhat convoluted, stick with me

        The caclulation is based off of the fact that the TTRPG Cyberpunk 2020 (second installment of the series)
        takes place in 2020, and we can use an item of known value in the TTRPG, and compare to the price in Cyberpunk 2077
        to get the €$ infation in that timespan

        1. Adjust for 2020 inflation (multiply by 1 / 1.23, source: Norges Bank)
        2. Convert the 2020 NOK value to USD (convertion rate at the time) (multiply by 0.1, source: Google graph for nok usd in 2020)
        3. As the TTRPG encompasses different regions with different currencies,
           there is a convertion rate for USD to Eurodollars, which is 2$ per 1€$
           (source: p. 23 of the "Home of the Brave" Cyberpunk source book: 
           "The purchasing power of the Eurodollar is approximately twice the purchasing power of the U.S. dollar."),
           which we use to get the amount of 2020 eddies the kiosk item is worth (divide by 2)
        4. Use the value of the Militech Crusher shotgun
           (as it seems the be the only fucking non-iconic gun that appears in any TTRPG game and the video game),
           as a price anchor to calculate 2020->2077 in-universe inflation. The gun (tier 1*) costs [450 €$] in Cyberpunk 2020,
           which increases to a whopping [7700 €$]**, giving an inflation of [[1611.11%]] between 2020 and 2077
           * Tier 1 was chosen as the TTRPG does not have weapon tiers, and it felt the most fitting as you can buy it
             right after creating a fresh character. In addition, a tier 5 crusher costs about [[160,000]] €$, which would
             equate to an inflation rate of [[35 455.56%]], which seemed like too much
           ** The 7700 number was guesstimated. After visiting EVERY arms dealer on a fresh save file, not a
              SINGLE one sold a crusher, but I had one in my inventory, which sold for [770 €$], and comparing the
              sale prices of other weapons in my inventory and the purchace prices of weapons they DID have available,
              I found that buying a wepons costs about [10 times] what you get when you sell the same weapon in game
        5. Multiply the value we got from step 3 with the inflation rate from step 4 (17.11) to find the value of the item in 2077 Eurodollars
        6. Cry yourself to sleep because you spent this much time researching USD->Eurodollar exchange rates, weapons overlaps between the 
           TTRPGs and videogame, and searching for a vendor who would sell a crusher (apparently an impossible task), and it is currently 5:30AM
        7. Wake up, realize your math is very off and fix it, then shed a single tear
      */
      return `${(((value * (1 / 1.23) * 0.1) / 2) * 16.11).toFixed(2)} €$`
    case "COPIES_OF_UNDERTALE":
      return `${(value / 70).toFixed(2)} kopier av Undertale` // Undertale costs 70kr
    case "COPIES_OF_GTA_VI":
      return `${(value / 899).toFixed(3)} kopier av GTA VI` // GTA VI costs 899 kr
    case "PK":
      return `${(value / 10.22).toFixed(2)} PK-er` // A PK costs 10,22kr in the kiosk
    case "STORSTIPEND":
      return `${(value / 30_976).toFixed(6)} storstipend` // Storstipend v27 will be 30976kr
    case "DAYS_OF_SAMF_MEMBERSHIP":
      return `${((value / 1100) * yearsToDays(3)).toFixed(2)} dager med Samf-medlemskap` // 3 years samf membership costs 1100kr
    case "DAYS_OF_APPLECARE_PLUS":
      return `${((value / 1059) * yearsToDays(1)).toFixed(2)} dager med AppleCare+` // 1 year applecare+ on a macbook pro 13 inch is 1059kr
    case "HOURS_OF_OW_UPTIME":
      return `${(((value * 0.11) /*NOK in a USD*/ / 310.51) * 31 * 24).toFixed(2)} timer med OW-oppetid` // We consistently spent approx. $310 the last months on aws
    case "HOURS_OF_ELECTRICITY":
      return `${(value / currentKWHPrice).toFixed(2)} timer strøm`
    case "BEERS_AT_CIRCUS":
      return `${(value / 60).toFixed(2)} pils på Circus` // A beer at circus costs 60kr
    case "ATB_MONTHLY_TICKETS":
      return `${(value / 265).toFixed(2)} ATB månedskort` // A 30-day ticket costs 265kr for a student
    case "OW_BUCKS":
      return `${(value * Math.random() * 5).toFixed(2)} OW bucks` // OW bucks is a really volatile currency
    case "ANIMALS":
      return `${(value / (179 / 11)).toFixed(4)} animals` // A CD of the album V costs 179kr, and there is 11 songs on the album
    case "5090":
      return `${(value / 89_990).toFixed(5)} 5090-er` // As of 11.11.2026, the cheapest rtx 5090 is 89990kr
    case "KBO_KANELBOLLE":
      return `${(value / 26).toFixed(2)} kanelboller` // A kanelbolle costs 26kr on kanelbolleonsdag
    case "SESAM_KEBABS":
      return `${(value / 169).toFixed(2)} kebaber` // A Sesam kebab costs 169kr
    case "NETFLIX_SUBSCRIPTIONS":
      return `${(value / 119).toFixed(2)} måneder med Netflix` // A month of netflix starts at 119kr
    case "CHRISTMAS_STARS":
      return `${(value / 19.9).toFixed(2)} julestjerner` // A Clas Ohlson julestjerne costs 19.90kr
    case "BIRTHS_IN_US":
      return `${((value * 0.11) / 20416).toFixed(6)} fødsler` // A birth in the US costs 20416 USD on average
    case "PARACETAMOL":
      return `${(value / ((59.9 / 20) * 2)).toFixed(2)} gram` // A box of 20 500mg tablets of paracetamol costs 59,90 kr
    case "67":
      return "67" // 67
    case "PIZZA_BUDGET":
      return `${value}/30000 av dotkoms gamle pizzabudsjett` // We used to get 30k a year for pizza :(
    default:
      return `${value.toFixed(2)} kr`
  }
}

export const explainCurrencyCalculation = (currency: CurrenciesType) => {
  switch (currency) {
    case "NOK":
      return ["pris * 1", "Du vet hva en krone er"]
    case "V_BUCKS":
      return ["(pris / 89) * 800", "800 v-bucks koster 89 kr"]
    case "ROBUX":
      return ["(pris / 42) * 240", "240 robux koster 42 kr"]
    case "COC_GEMS":
      return ["(pris / 59) * 80", "80 gems koster 59 kr"]
    case "OPUS_5.5_TOKENS":
      return ["(pris / 5 USD i kr) * 1 million", "1 million tokens koster 5 dollar"]
    case "FIFA_POINTS":
      return ["(pris / 279) * 2000", "2000 fifa points koster 279 kr"]
    case "CS_KEYS":
      return ["pris / 23,50", "En key koster 23,50 kr"]
    case "RP":
      return ["(pris / 201,93) * 2540", "Et gavekort med 2540 RP koster 201,93 kr"]
    case "GTA_DOLLARS":
      return ["(pris / 39) * 200 000", "Et gavekort med 200 000 dollar koster 39 kr"]
    case "EDDIES":
      return [
        "((((pris * (1 / 1,23)) / 10) / 2) * 17,11",
        "Pris inflasjonsjustert for 2020 (1 kr da er verdt 1,23 kr nå), konvertert til USD (0.1), konvertert til Eurodollars (2$ = 1€$), inflasjonsjustert fra 2020 til 2077 med salgsverdien av et kjent objekt (i dette tilfellet, en Militech Crusher) i Cyberpunk 2020 (tabletop RPG) og Cyberpunk 2077 (videospill), som gir 1711,11% inflasjon",
      ]
    case "COPIES_OF_UNDERTALE":
      return ["pris / 70", "Undertale koster 70 kr"]
    case "COPIES_OF_GTA_VI":
      return ["pris / 899", "GTA VI koster 899 kr"]
    case "PK":
      return ["pris / 10,22", "En PK koster 10,22 kr i kiosken"]
    case "STORSTIPEND":
      return ["pris / 30 976", "I 26/27 skoleåret var storstipend på 30 976 kr"]
    case "DAYS_OF_SAMF_MEMBERSHIP":
      return ["(pris / 1100) * antall dager i 3 år", "Et treårs medlemskap på Studentersamfundet koster 1100 kr"]
    case "DAYS_OF_APPLECARE_PLUS":
      return ["(pris / 1059) * 365", 'Applecare+ på en 13" MacBook pro koster 1059 kr i året']
    case "HOURS_OF_OW_UPTIME":
      return [
        "(pris / 310 USD i kr) * antall timer i en måned",
        "OW koster ca. 310 dollar i måneden å vedlikeholde i AWS kostnader",
      ]
    case "HOURS_OF_ELECTRICITY":
      return [
        "pris / nåværende spotpris",
        'Vi henter spotprisen live i regionen NO3 fra <a href="https://www.hvakosterstrommen.no/strompris-api" target="_blank">hvakosterstrommen.no</a>',
      ]
    case "BEERS_AT_CIRCUS":
      return ["pris / 60", "En øl på Circus koster 60 kr"]
    case "ATB_MONTHLY_TICKETS":
      return ["pris / 265", "Et månedskort koster 265 kr for studenter"]
    case "OW_BUCKS":
      return ["pris * et tilfeldig tall mellom 0 og 5", "OW bucks er desverre en veldig volatil valuta"]
    case "ANIMALS":
      return ["pris / (179 / 11)", 'Albumet "V" som "Animals" finnes på har 11 sanger, og koster 179 kr']
    case "5090":
      return ["pris / 89 990", "De billigeste 5090ene koster 89 990 kr"]
    case "KBO_KANELBOLLE":
      return ["pris / 26", "En kanelbolla koster 26 kr på kanelbolleonsdag"]
    case "SESAM_KEBABS":
      return ["pris / 169", "En vanlig kebabrull koster 169 kr på sesam"]
    case "NETFLIX_SUBSCRIPTIONS":
      return ["pris / 119", "En måned med netflix koster 119 kr"]
    case "CHRISTMAS_STARS":
      return ["pris / 19,90", "En julestjerne på Clas Ohlson koster 19,90 kr"]
    case "BIRTHS_IN_US":
      return ["pris / 20 416 USD i kr", "Gjennomsnittsprisen på å føde et barn i USA er 20 416 dollar"]
    case "PARACETAMOL":
      return ["pris / ((59,90 / 20) / 0,5)", "En pakke 20 tabletter 500mg Paracet koster 59,90 kr"]
    case "67":
      return ["67", "67"]
    case "PIZZA_BUDGET":
      return ["pris / 30 000", "Dotkom pleide å få 30 000 kr i året for bruk på mat på arbeidskvelder"]
    default:
      return ["", ""]
  }
}

export const mapCurrencyEnumToString = (currency: CurrenciesType) => {
  switch (currency) {
    case "NOK":
      return "NOK"
    case "V_BUCKS":
      return "V-bucks"
    case "ROBUX":
      return "Robux"
    case "COC_GEMS":
      return "Clash of Clans gems"
    case "OPUS_5.5_TOKENS":
      return "Opus 5.5 tokens"
    case "FIFA_POINTS":
      return "FIFA points"
    case "CS_KEYS":
      return "CS2 case keys"
    case "RP":
      return "League of Legends RP"
    case "GTA_DOLLARS":
      return "GTA Online dollar"
    case "EDDIES":
      return "Cyberpunk 2077 Eurodollars"
    case "COPIES_OF_UNDERTALE":
      return "Undertale kopier"
    case "COPIES_OF_GTA_VI":
      return "GTA VI kopier"
    case "PK":
      return "Powerkings"
    case "STORSTIPEND":
      return "Andel storstipend"
    case "DAYS_OF_SAMF_MEMBERSHIP":
      return "Dager med samf medlemskap"
    case "DAYS_OF_APPLECARE_PLUS":
      return "Dager med Applecare+"
    case "HOURS_OF_OW_UPTIME":
      return "Timer med OW oppetid"
    case "HOURS_OF_ELECTRICITY":
      return "Timer strøm i midt-Norge"
    case "BEERS_AT_CIRCUS":
      return "Øl på Circus"
    case "ATB_MONTHLY_TICKETS":
      return "ATB månedskort"
    case "OW_BUCKS":
      return "OW Bucks"
    case "ANIMALS":
      return "Animals av Maroon 5"
    case "5090":
      return "RTX 5090er"
    case "KBO_KANELBOLLE":
      return "Kanelboller på KBO"
    case "SESAM_KEBABS":
      return "Kebaber på Sesam"
    case "NETFLIX_SUBSCRIPTIONS":
      return "Måneder med Netflix"
    case "CHRISTMAS_STARS":
      return "Julestjerner fra Clas Ohlson"
    case "BIRTHS_IN_US":
      return "Fødsler i USA"
    case "PARACETAMOL":
      return "Gram Paracet"
    case "67":
      return "67" // 67
    case "PIZZA_BUDGET":
      return "Andeler av dotkoms gamle pizzabudsjett"
    default:
      return "Ukjent valuta"
  }
}
