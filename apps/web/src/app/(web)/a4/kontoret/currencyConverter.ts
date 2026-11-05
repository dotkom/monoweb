import { yearsToDays } from "date-fns"
import { z } from "zod"

export const CURRENCY_VALUES = [
  "NOK",
  "V_BUCKS",
  "ROBUX",
  "COC_GEMS",
  "OPUS_5.5_TOKENS",
  "FIFA_POINTS",
  "CS_KEYS",
  "GTA_DOLLARS",
  "COPIES_OF_UNDERTALE",
  "PK",
  "STORSTIPEND",
  "DAYS_OF_SAMF_MEMBERSHIP",
  "DAYS_OF_APPLECARE_PLUS",
  "HOURS_OF_OW_UPTIME",
  "HOURS_OF_ELECTRICITY",
  "BEERS_AT_CIRCUS",
  "ATB_MONTHLY_TICKETS",
  "OW_BUCKS",
  "67",
] as const

// CURRENCY_VALUES are the currencies shown in the UI dropdown, in display order.
// PIZZA_BUDGET is kept as a valid enum value for future use, but is not shown.
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
      return `${(value / 28).toFixed(2)} keys` // A CS key costs 28kr
    case "GTA_DOLLARS":
      return `$${((value / 39) * 200_000).toFixed(2)}` // a $200000 shark card costs 39kr
    case "COPIES_OF_UNDERTALE":
      return `${(value / 70).toFixed(2)} kopier av Undertale` // Undertale costs 70kr
    case "PK":
      return `${(value / 10.33).toFixed(2)} PK-er` // A PK costs 10,33kr in the kiosk
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
    case "67":
      return "67" // 67
    case "OW_BUCKS":
      return `${(value * Math.random() * 5).toFixed(2)} OW bucks` // OW bucks is a really volatile currency
    case "PIZZA_BUDGET":
      return `${value}/30000 av dotkoms gamle pizzabudsjett` // We used to get 30k a year for pizza :(
    default:
      return "Ukjent pris"
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
    case "GTA_DOLLARS":
      return "GTA Online dollar"
    case "COPIES_OF_UNDERTALE":
      return "Undertale kopier"
    case "PK":
      return "PowerKings"
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
    case "67":
      return "67" // 67
    case "OW_BUCKS":
      return "OW Bucks"
    case "PIZZA_BUDGET":
      return "Andeler av dotkoms gamle pizzabudsjett"
    default:
      return "Ukjent pris"
  }
}
