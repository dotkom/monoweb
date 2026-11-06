import { TZDate } from "@date-fns/tz"
import { format, minutesToMilliseconds } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { useTRPC } from "@/utils/trpc/client"

export const useStockQuery = () => {
  const trpc = useTRPC()
  const { data: stock, isLoading } = useQuery(trpc.kiosk.getProductStock.queryOptions())
  return { stock, isLoading }
}

const OSLO_TIMEZONE = "Europe/Oslo"

/** Price area NO3 covers Trøndelag (Midt-Norge). */
const PRICE_AREA = "NO3"

const BASE_URL = "https://www.hvakosterstrommen.no/api/v1/prices"

const ElectricityPriceSchema = z.object({
  NOK_per_kWh: z.number(),
  EUR_per_kWh: z.number(),
  EXR: z.number(),
  time_start: z.string(),
  time_end: z.string(),
})

const ElectricityPricesSchema = z.array(ElectricityPriceSchema)

export const fetchCurrentKWHPrice = async (): Promise<number> => {
  // The API takes the date in Oslo time, e.g. .../v1/prices/2026/11-05_NO3.json
  const datePath = format(new TZDate(new Date(), OSLO_TIMEZONE), "yyyy/MM-dd")
  const res = await fetch(`${BASE_URL}/${datePath}_${PRICE_AREA}.json`)

  if (!res.ok) {
    return 1.1 // approx. average electricity price in Trøndelag for 2026, incl. VAT, as fallback
  }

  const prices = ElectricityPricesSchema.parse(await res.json())

  // time_start/time_end come with explicit offsets (+01:00/+02:00), so comparing
  // instants is safe regardless of the runtime's timezone.
  const now = new Date()
  const current = prices.find((price) => new Date(price.time_start) <= now && now < new Date(price.time_end))

  if (current === undefined) {
    return 1.1 // approx. average electricity price in Trøndelag for 2026, incl. VAT, as fallback
  }

  return current.NOK_per_kWh * 1.25 // API returns prices without VAT
}

export const useCurrentKWHPrice = () => {
  const { data: kwhPrice, isLoading } = useQuery({
    queryKey: ["currentKWHPrice"],
    queryFn: fetchCurrentKWHPrice,
    // The spot price changes once per hour, so there is no need to refetch on every mount.
    staleTime: minutesToMilliseconds(30),
  })
  return { kwhPrice, isLoading }
}
