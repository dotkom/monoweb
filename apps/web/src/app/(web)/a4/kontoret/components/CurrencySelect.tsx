import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@dotkomonline/ui"
import { useState } from "react"
import { type CurrenciesType, CURRENCY_VALUES, mapCurrencyEnumToString } from "../currencyConverter"

const COLLAPSED_COUNT = 3
const COLLAPSED_CURRENCIES = CURRENCY_VALUES.slice(0, COLLAPSED_COUNT)

const currencyItems = CURRENCY_VALUES.map((currency) => ({
  value: currency,
  label: mapCurrencyEnumToString(currency),
}))

type CurrencySelectProps = {
  value: CurrenciesType
  onChange: (currency: CurrenciesType) => void
}

export const CurrencySelect = ({ value, onChange }: CurrencySelectProps) => {
  const [showAll, setShowAll] = useState(!COLLAPSED_CURRENCIES.includes(value))
  const visibleCurrencies = showAll ? CURRENCY_VALUES : COLLAPSED_CURRENCIES

  return (
    <Select
      value={mapCurrencyEnumToString(value)}
      items={currencyItems}
      onValueChange={(currency) => onChange(currency as CurrenciesType)}
      onOpenChange={(open) => {
        if (open) {
          // Collapse the list on open, unless the selected currency is only visible when expanded.
          setShowAll(!COLLAPSED_CURRENCIES.includes(value))
        }
      }}
    >
      <SelectTrigger className="min-w-40 max-w-99">
        <SelectValue placeholder="Velg valuta" />
      </SelectTrigger>
      <SelectContent>
        {visibleCurrencies.map((currency) => (
          <SelectItem key={currency} value={currency}>
            {mapCurrencyEnumToString(currency)}
          </SelectItem>
        ))}
        {!showAll && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 w-full text-gray-500 dark:text-stone-400"
            onClick={() => setShowAll(true)}
          >
            Vis mer ...
          </Button>
        )}
      </SelectContent>
    </Select>
  )
}
