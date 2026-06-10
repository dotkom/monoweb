"use client"

import { CourseFilterParsers } from "@/app/emner/course-filter-parsers"
import { useTRPC } from "@/utils/trpc/client"
import type { CourseFilterQuery } from "@dotkomonline/grades-backend/course"
import { Popover, PopoverAnchor, PopoverContent, Text } from "@dotkomonline/ui"
import { IconArrowRight } from "@tabler/icons-react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createSerializer } from "nuqs"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useDebounce } from "use-debounce"
import { SearchInput } from "../SearchInput"
import { CourseAutocompleteSuggestionSkeleton } from "./CourseAutocompleteSuggestionSkeleton"
import { CourseAutocompleteSuggestions } from "./CourseAutocompleteSuggestions"

const serialize = createSerializer(CourseFilterParsers)

interface Props {
  className?: string
  placeholder?: string
  defaultValues: CourseFilterQuery
}

export const CourseAutocomplete = ({ className, placeholder, defaultValues }: Props) => {
  const trpc = useTRPC()
  const router = useRouter()
  const t = useTranslations("CourseAutocomplete")

  const [isOpen, setIsOpen] = useState(false)
  const [shouldResetSuggestions, setShouldResetSuggestions] = useState(true)
  const formRef = useRef<HTMLFormElement | null>(null)

  const { register, handleSubmit, getValues, watch } = useForm<CourseFilterQuery>({
    defaultValues,
  })

  const searchValue = watch("bySearch")?.trim() ?? ""
  const [debouncedSearch] = useDebounce(searchValue, 300)

  useEffect(() => {
    if (searchValue.length === 0) {
      setShouldResetSuggestions(true)
    }
  }, [searchValue])

  const { data: suggestions } = useQuery(
    trpc.course.findCourses.queryOptions(
      {
        filter: {
          bySearch: debouncedSearch,
        },
        limit: 5,
      },
      {
        enabled: debouncedSearch.length > 0,
        placeholderData: shouldResetSuggestions ? undefined : keepPreviousData,
      }
    )
  )

  useEffect(() => {
    if (debouncedSearch.length > 0 && suggestions !== undefined) {
      setShouldResetSuggestions(false)
    }
  }, [debouncedSearch, suggestions])

  const shouldShowPopover = isOpen && searchValue.length > 0
  const resolvedPlaceholder = placeholder ?? t("placeholder")

  const onSubmit = () => {
    const values = getValues()
    const queryString = serialize(values)
    router.push(`/emner${queryString}`)
    setIsOpen(false)
  }

  const isLoading = suggestions === undefined

  return (
    <Popover
      open={shouldShowPopover}
      onOpenChange={(open, eventDetails) => {
        if (!open && eventDetails.reason === "outside-press") {
          const target = (eventDetails.event as Event | undefined)?.target

          if (target instanceof Node && formRef.current?.contains(target)) {
            return
          }
        }

        setIsOpen(open)
      }}
      modal={false}
    >
      <PopoverAnchor asChild>
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className={className}>
          <SearchInput
            {...register("bySearch")}
            placeholder={resolvedPlaceholder}
            autoComplete="off"
            onFocus={() => setIsOpen(true)}
            onPointerDown={() => setIsOpen(true)}
          />
        </form>
      </PopoverAnchor>

      <PopoverContent
        className="min-w-36 flex flex-col p-1 bg-white border border-neutral-200 shadow-md dark:border-stone-600 dark:bg-[color-mix(in_srgb,theme(colors.stone.700),theme(colors.stone.800))] w-96"
        align="start"
        side="bottom"
        aria-busy={isLoading}
        initialFocus={false}
      >
        {isLoading || suggestions === undefined ? (
          <CourseAutocompleteSkeleton />
        ) : suggestions.length > 0 ? (
          <>
            <CourseAutocompleteSuggestions courses={suggestions} onItemClick={() => setIsOpen(false)} />

            <Link
              href={`/emner?bySearch=${searchValue}`}
              className="mt-1 text-sm flex gap-1 p-3 font-medium border-t border-neutral-200 text-neutral-700 hover:text-neutral-900 rounded-b-lg group outline-none focus:ring-1 focus:ring-neutral-300 ring-inset focus:text-neutral-900 transition-colors hover:bg-neutral-50 dark:hover:bg-stone-600 focus:bg-neutral-50 dark:focus:bg-stone-600"
              onClick={() => setIsOpen(false)}
            >
              <Text className="leading-none text-neutral-900 dark:text-stone-300 group-hover:text-black dark:group-hover:text-stone-200">
                {t("seeAllResults")}
              </Text>
              <IconArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1 text-neutral-900 dark:text-stone-300 group-hover:text-black dark:group-hover:text-stone-200"
              />
            </Link>
          </>
        ) : (
          <CourseAutocompleteNoResults />
        )}
      </PopoverContent>
    </Popover>
  )
}

const CourseAutocompleteSkeleton = () => {
  return (
    <>
      <div className="flex flex-col">
        <CourseAutocompleteSuggestionSkeleton />
        <CourseAutocompleteSuggestionSkeleton />
        <CourseAutocompleteSuggestionSkeleton />
        <CourseAutocompleteSuggestionSkeleton />
        <CourseAutocompleteSuggestionSkeleton />
      </div>
      <div aria-hidden className="mt-1 flex p-3 border-t border-neutral-200 text-neutral-700 rounded-b-lg">
        <div className="h-4 w-1/4 rounded bg-neutral-200 dark:bg-stone-600 motion-safe:animate-pulse" />
      </div>
    </>
  )
}

const CourseAutocompleteNoResults = () => {
  const t = useTranslations("CourseAutocomplete")

  return <Text className="text-sm text-neutral-500 dark:text-stone-400 p-2">{t("noResults")}</Text>
}
