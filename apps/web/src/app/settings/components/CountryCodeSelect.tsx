"use client";

import { CountryCodes } from "@/utils/countryCodes";
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
} from "@dotkomonline/ui";
import { ReactCountryFlag } from "@fadi-ui/react-country-flag";
import { ComponentProps } from "react";
import { useForm } from "react-hook-form";

// steal prop type from Select
export const CountryCodeSelect = (props: ComponentProps<typeof Select>) => {
  return (
    <Select
      {...props}
      defaultValue="NO" // Set default value
    >
      <SelectTrigger className="w-fit h-full">
        <ReactCountryFlag countryCode="NO" width={20} />
        <SelectValue placeholder="+47" />
        <SelectIcon className="max-sm:hidden" />
      </SelectTrigger>

      <SelectPortal>
        <SelectContent>
          <SelectScrollUpButton />
          <SelectViewport>
            <SelectGroup>
              <SelectLabel>Landskode</SelectLabel>
              {CountryCodes.sort((a, b) => a.dial_code.localeCompare(b.dial_code)).map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <div className="flex flex-row items-center justify-between">
                    <span>{country.dial_code}</span>
                    <ReactCountryFlag countryCode={country.code} width={20} />
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectViewport>
          <SelectScrollDownButton />
        </SelectContent>
      </SelectPortal>
    </Select>
  );
};
