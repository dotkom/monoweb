"use client"

import { Title, Text } from "@dotkomonline/ui"
import { useEffect, useState } from "react"
import { CurrencySelect } from "./components/CurrencySelect"
import { StockList } from "./components/StockList"
import { Currencies, type CurrenciesType } from "./currencyConverter"
import { useStockQuery } from "./queries"

const CHOSEN_CURRENCY_LOCALSTORAGE_KEY = "chosenCurrency"

const KioskPage = () => {
  const { stock, isLoading } = useStockQuery()
  const [currency, setCurrency] = useState<CurrenciesType>("NOK")

  useEffect(() => {
    const stored = Currencies.safeParse(localStorage.getItem(CHOSEN_CURRENCY_LOCALSTORAGE_KEY))
    if (stored.success) {
      setCurrency(stored.data)
    } else {
      localStorage.setItem(CHOSEN_CURRENCY_LOCALSTORAGE_KEY, "NOK")
    }
  }, [])

  const handleCurrencyChange = (currency: CurrenciesType) => {
    setCurrency(currency)
    localStorage.setItem(CHOSEN_CURRENCY_LOCALSTORAGE_KEY, currency)
  }

  return (
    <div className="flex flex-col gap-2">
      <Title element="h1" size="xl">
        Kontoret
      </Title>

      <Text className="text-gray-600 dark:text-stone-300">
        Kontoret er delen av A4 hvor du kan (og skal) chille. Her skole og arbeid IKKE lov. Kontoret kan brukes for å
        varme opp maten din, spille litt smash eller mario kart på switchen, og i kiosken kan du kjøpe snacks, mat,
        drikke og diverse online-merch (som f.eks. klistremerker) når det trengs for lange arbeidsøkter, skippertak og
        liknende.
      </Text>

      <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
        <Title element="h2" size="lg">
          Loot i kiosken:
        </Title>
        <CurrencySelect value={currency} onChange={handleCurrencyChange} />
      </div>
      {isLoading ? (
        <Text>Laster inn lagerstatus ...</Text>
      ) : stock === undefined || stock.length === 0 ? (
        <Text>Fant ingen produkter.</Text>
      ) : (
        <StockList products={stock} currency={currency} />
      )}
    </div>
  )
}

export default KioskPage
