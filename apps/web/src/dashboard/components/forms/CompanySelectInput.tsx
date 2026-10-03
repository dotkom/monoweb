"use client"

import { useCompaniesByIdsQuery, useCompanyAllInfiniteQuery } from "@dashboard/app/bedrifter/queries"
import type { Company, CompanyId } from "@dotkomonline/rpc/company"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@dotkomonline/ui"
import { useEffect, useState } from "react"

export type CompanySelectOption = {
  label: string
  value: CompanyId
}

type CompanySelectInputBaseProps = {
  id?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  excludeCompanyIds?: CompanyId[]
}

export type CompanySelectInputProps = CompanySelectInputBaseProps &
  (
    | {
        multiple?: false
        value: string
        onChange: (companyId: string) => void
      }
    | {
        multiple: true
        value: string[]
        onChange: (companyIds: string[]) => void
      }
  )

function toOption(company: Company): CompanySelectOption {
  return { label: company.name, value: company.id }
}

export function CompanySelectInput(props: CompanySelectInputProps) {
  const { id, placeholder, disabled, required, invalid, excludeCompanyIds } = props
  const multiple = props.multiple === true
  const selectedIds = multiple ? props.value : props.value.length > 0 ? [props.value] : []

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [open, setOpen] = useState(false)
  const anchor = useComboboxAnchor()

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

  const newFetchIsPending = isFetching || searchQuery !== debouncedSearchQuery

  const { companies: selectedCompanies, isLoading: isSelectedCompaniesLoading } = useCompaniesByIdsQuery(
    selectedIds,
    selectedIds.length > 0
  )

  const options = companies.filter((company) => !excludeCompanyIds?.includes(company.id)).map(toOption)

  const selectedById = new Map(selectedCompanies.map((company) => [company.id, company]))
  const selectedOptions = selectedIds.flatMap((id) => {
    const company = selectedById.get(id)
    return company ? [toOption(company)] : []
  })

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
      multiple={multiple}
      disabled={disabled}
      required={required}
      items={options}
      value={multiple ? selectedOptions : (selectedOptions[0] ?? null)}
      onValueChange={(next: CompanySelectOption | CompanySelectOption[] | null) => {
        if (props.multiple) {
          props.onChange(Array.isArray(next) ? next.map((option) => option.value) : [])
          setSearchQuery("")

          return
        }

        const selected = Array.isArray(next) ? next[0] : next
        props.onChange(selected?.value ?? "")
      }}
      inputValue={multiple || open ? searchQuery : (selectedOptions[0]?.label ?? "")}
      onInputValueChange={(next) => {
        if (!multiple && !open) {
          return
        }

        setSearchQuery(next)
      }}
      itemToStringLabel={(item: CompanySelectOption) => item.label}
      isItemEqualToValue={(a: CompanySelectOption, b: CompanySelectOption) => a.value === b.value}
      autoHighlight={multiple}
    >
      {multiple ? (
        <ComboboxChips ref={anchor} className="w-full cursor-text p-1">
          <ComboboxValue>
            {(selected: CompanySelectOption[]) => (
              <>
                {selected.map((item) => (
                  <ComboboxChip key={item.value}>{item.label}</ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={id}
                  placeholder={selected.length === 0 ? placeholder : undefined}
                  aria-invalid={invalid ? true : undefined}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
      ) : (
        <ComboboxInput
          placeholder={isSelectedCompaniesLoading ? "Henter bedrift..." : placeholder}
          showClear={!required}
          aria-invalid={invalid ? true : undefined}
        />
      )}
      <ComboboxContent anchor={multiple ? anchor : undefined}>
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
