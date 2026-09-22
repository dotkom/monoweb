"use client"

import { useCompanyAllInfiniteQuery, useCompanyByIdQuery } from "@/app/(internal)/bedrifter/queries"
import type { CompanyId } from "@dotkomonline/rpc/company"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@dotkomonline/ui"
import { useEffect, useMemo, useState } from "react"

export type CompanySelectOption = {
  label: string
  value: CompanyId
}

export type CompanySelectInputProps = {
  id?: string
  value: string
  onChange: (companyId: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  excludeCompanyIds?: CompanyId[]
}

export function CompanySelectInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  required,
  invalid,
  excludeCompanyIds,
}: CompanySelectInputProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => {
      clearTimeout(timeout)
    }
  }, [searchQuery])

  const { companies, isFetching } = useCompanyAllInfiniteQuery({
    filter: {
      bySearchTerm: debouncedSearchQuery,
    },
    shouldKeepPreviousData: true,
  })

  const selectedCompanyId = value.length > 0 ? value : null
  const { data: selectedCompany, isLoading: isSelectedCompanyLoading } = useCompanyByIdQuery(
    selectedCompanyId ?? "",
    Boolean(selectedCompanyId)
  )

  const options = useMemo(() => {
    const fromSearch: CompanySelectOption[] = companies
      .filter((company) => !excludeCompanyIds?.some((excludeId) => company.id === excludeId))
      .map((company) => ({
        label: company.name,
        value: company.id,
      }))

    if (selectedCompany && !fromSearch.some((option) => option.value === selectedCompany.id)) {
      fromSearch.push({
        value: selectedCompany.id,
        label: selectedCompany.name,
      })
    }

    return fromSearch
  }, [companies, excludeCompanyIds, selectedCompany])

  const selectedOption = useMemo(() => {
    if (!selectedCompanyId) {
      return null
    }

    return options.find((option) => option.value === selectedCompanyId) ?? null
  }, [options, selectedCompanyId])

  const newFetchIsPending = isFetching || searchQuery !== debouncedSearchQuery

  return (
    <Combobox
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setSearchQuery("")
        }
      }}
      id={id}
      disabled={disabled}
      required={required}
      items={options}
      value={selectedOption}
      onValueChange={(next: CompanySelectOption | null) => {
        onChange(next?.value ?? "")
      }}
      inputValue={open ? searchQuery : (selectedOption?.label ?? "")}
      onInputValueChange={(next) => {
        if (!open) {
          return
        }

        setSearchQuery(next)
      }}
      itemToStringLabel={(item: CompanySelectOption) => item.label}
      isItemEqualToValue={(a: CompanySelectOption, b: CompanySelectOption) => a.value === b.value}
    >
      <ComboboxInput
        placeholder={isSelectedCompanyLoading ? "Henter bedrift..." : placeholder}
        showClear={!required}
        aria-invalid={invalid ? true : undefined}
      />
      <ComboboxContent>
        <ComboboxEmpty>{newFetchIsPending ? "Laster bedrifter..." : "Ingen bedrift funnet"}</ComboboxEmpty>
        <ComboboxList>
          {(item: CompanySelectOption) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
