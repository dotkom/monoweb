"use client"
import { CountryCodes } from "@/utils/countryCodes"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectLabel,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from "@dotkomonline/ui"
import { type CountryCodes as CountryCodeProps, ReactCountryFlag } from "@fadi-ui/react-country-flag"
import { useState } from "react"

export const CountryCodeSelect = () => {
  const [currentCountry, setCurrentCountry] = useState<CountryCodeProps>("NO")
  return (
    <Select onValueChange={(value) => setCurrentCountry(value as CountryCodeProps)}>
      <SelectTrigger className="w-fit h-full">
        <ReactCountryFlag countryCode={currentCountry} width={20} />
        <SelectValue placeholder="+47" defaultValue={"NO"} defaultChecked />
        <SelectIcon className="max-sm:hidden" />
      </SelectTrigger>

      <SelectPortal>
        <SelectContent>
          <SelectScrollUpButton />
          <SelectViewport>
            <SelectGroup>
              <SelectLabel>Landskode</SelectLabel>
              {CountryCodes.sort((a, b) => a.dial_code.localeCompare(b.dial_code)).map((country) => (
                <div className="flex flex-row items-center justify-between">
                  <SelectItem
                    label={country.dial_code}
                    value={country.code}
                    onClick={() => {
                      setCurrentCountry(country.code as CountryCodeProps)
                    }}
                  />
                  <ReactCountryFlag countryCode={country.code as CountryCodeProps} width={20} />
                </div>
              ))}
            </SelectGroup>
          </SelectViewport>
          <SelectScrollDownButton />
        </SelectContent>
      </SelectPortal>
    </Select>
  )
}
