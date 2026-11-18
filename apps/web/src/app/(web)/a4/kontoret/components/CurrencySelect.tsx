import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@dotkomonline/ui"
import { useState } from "react"
import {
  type CurrenciesType,
  Currencies,
  CURRENCY_VALUES,
  explainCurrencyCalculation,
  mapCurrencyEnumToString,
} from "../currencyConverter"

const COLLAPSED_COUNT = 3
const COLLAPSED_CURRENCIES: readonly CurrenciesType[] = CURRENCY_VALUES.slice(0, COLLAPSED_COUNT)

// Items are only used to resolve labels for the trigger, and cover the entire enum —
// including currencies that are not rendered in the dropdown (e.g. PIZZA_BUDGET).
const currencyItems = Currencies.options.map((currency) => ({
  value: currency,
  label: mapCurrencyEnumToString(currency),
}))

type CurrencySelectProps = {
  value: CurrenciesType
  onChange: (currency: CurrenciesType) => void
}

const CurrencyOptionTooltip = ({ currency }: { currency: CurrenciesType }) => {
  const [calculation, description] = explainCurrencyCalculation(currency)

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span className="w-full">{mapCurrencyEnumToString(currency)}</span>
      </TooltipTrigger>
      <TooltipContent side="right" align="center" className="max-w-72 flex-col items-start gap-1 py-2">
        <span className="text-bold">Hvordan vi regner ut vekslingskursen:</span>
        <span className="font-mono text-xs font-medium">{calculation}</span>
        <span
          className="text-muted-foreground [&_a]:underline [&_a]:underline-offset-2"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static descriptions from explainCurrencyCalculation
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </TooltipContent>
    </Tooltip>
  )
}

export const CurrencySelect = ({ value, onChange }: CurrencySelectProps) => {
  const [showAll, setShowAll] = useState(!COLLAPSED_CURRENCIES.includes(value))
  const visibleCurrencies = showAll ? CURRENCY_VALUES : COLLAPSED_CURRENCIES

  return (
    <div className="flex w-64 flex-col gap-1">
      <Text size="sm">Valuta:</Text>
      <Select
        value={value}
        items={currencyItems}
        onValueChange={(currency) => onChange(currency as CurrenciesType)}
        onOpenChange={(open) => {
          if (open) {
            // Collapse the list on open, unless the selected currency is only visible when expanded.
            setShowAll(!COLLAPSED_CURRENCIES.includes(value))
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Velg valuta" />
        </SelectTrigger>
        <SelectContent>
          {visibleCurrencies.map((currency) => (
            <SelectItem className="cursor-pointer" key={currency} value={currency}>
              <CurrencyOptionTooltip currency={currency} />
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
    </div>
  )
}
