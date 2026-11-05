"use client"

import { Title, Text } from "@dotkomonline/ui"
import { useState } from "react"
import { CurrencySelect } from "./components/CurrencySelect"
import { StockList } from "./components/StockList"
import type { CurrenciesType } from "./currencyConverter"
import { useStockQuery } from "./queries"

const KioskPage = () => {
  const { stock, isLoading } = useStockQuery()
  const [currency, setCurrency] = useState<CurrenciesType>("NOK")

  return (
    <div className="flex flex-col gap-2">
      <Title element="h1" size="xl">
        Kiosken
      </Title>

      <Text className="text-gray-600 dark:text-stone-300">
        Her kan du kjøpe snacks, mat, drikke og diverse online-merch (som f.eks. klistremerker) når det trengs for lange
        arbeidsøkter, skippertak og liknende.
      </Text>

      <div className="flex items-center justify-between gap-4">
        <Title element="h2" size="lg">
          Gjenstående loot i kiosken:
        </Title>
        <CurrencySelect value={currency} onChange={setCurrency} />
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
