"use client"

import { CourseFilterParsers } from "@/app/[locale]/emner/course-filter-parsers"
import { Link, useRouter } from "@/i18n/navigation"
import { useTRPC } from "@/utils/trpc/client"
import type { CourseFilterQuery } from "@dotkomonline/grades-backend/course"
import { cn, Popover, PopoverAnchor, PopoverContent, Text } from "@dotkomonline/ui"
import { IconArrowRight } from "@tabler/icons-react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { createSerializer } from "nuqs"
import { useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { useDebounce } from "use-debounce"
import { SearchInput } from "../SearchInput"
import { CourseAutocompleteSuggestionSkeleton } from "./CourseAutocompleteSuggestionSkeleton"
import { CourseAutocompleteSuggestions } from "./CourseAutocompleteSuggestions"

const serialize = createSerializer(CourseFilterParsers)

interface Props {
  className?: string
  inputClassName?: string
  placeholder?: string
  defaultValues: CourseFilterQuery
}

export const CourseAutocomplete = ({ className, inputClassName, placeholder, defaultValues }: Props) => {
  const trpc = useTRPC()
  const router = useRouter()
  const t = useTranslations("CourseAutocomplete")

  const [isOpen, setIsOpen] = useState(false)
  const anchorRef = useRef<HTMLDivElement | null>(null)

  const { register, handleSubmit, getValues, watch } = useForm<CourseFilterQuery>({
    defaultValues,
  })

  const searchValue = watch("bySearch")?.trim() ?? ""
  const [debouncedSearch] = useDebounce(searchValue, 200)

  const { data: suggestionsPage, isLoading } = useQuery(
    trpc.course.findCourses.queryOptions(
      {
        filter: {
          bySearch: debouncedSearch,
          sortBy: ["CANDIDATE_COUNT"],
          orderBy: "desc",
        },
        limit: 5,
      },
      {
        placeholderData: keepPreviousData,
      }
    )
  )

  const suggestions = useMemo(() => suggestionsPage?.items ?? undefined, [suggestionsPage])

  const resolvedPlaceholder = placeholder ?? t("placeholder")

  const onSubmit = () => {
    const values = getValues()
    const queryString = serialize(values)
    router.push(`/emner${queryString}`)
    setIsOpen(false)
  }

  return (
    <Popover
      open={isOpen}
      onOpenChange={(nextOpen, details) => {
        if (!nextOpen) {
          if (details.reason === "focus-out") {
            details.cancel()
            return
          }

          if (details.reason === "outside-press") {
            const target = details.event.target

            if (target instanceof Node && anchorRef.current?.contains(target)) {
              details.cancel()
              setIsOpen(true)
              return
            }
          }
        }

        setIsOpen(nextOpen)
      }}
      modal={false}
    >
      <PopoverAnchor asChild>
        <form onSubmit={handleSubmit(onSubmit)} className={className}>
          <div ref={anchorRef}>
            <SearchInput
              {...register("bySearch")}
              placeholder={resolvedPlaceholder}
              autoComplete="off"
              onFocus={() => setIsOpen(true)}
              onPointerDown={() => setIsOpen(true)}
              inputClassName={cn("h-8", inputClassName)}
            />
          </div>
        </form>
      </PopoverAnchor>

      <PopoverContent
        className="min-w-36 gap-0 flex flex-col p-1 bg-white border border-neutral-200 shadow-md dark:border-stone-700 dark:bg-stone-800 w-[calc(var(--available-width)-2rem)] mx-4 sm:mx-0 sm:w-96"
        align="start"
        side="bottom"
        positionMethod="fixed"
        collisionPadding={0}
        aria-busy={isLoading}
        initialFocus={false}
        finalFocus={false}
      >
        {isLoading || suggestions === undefined ? (
          <CourseAutocompleteSkeleton />
        ) : suggestions.length > 0 ? (
          <>
            <CourseAutocompleteSuggestions courses={suggestions} onItemClick={() => setIsOpen(false)} />

            <Link
              href={`/emner?bySearch=${searchValue}`}
              className="text-sm flex gap-1 px-2 py-3 border-t border-neutral-200 dark:border-stone-700 rounded-b-lg group outline-none transition-colors hover:bg-neutral-100 dark:hover:bg-stone-700 focus:bg-neutral-100 dark:focus:bg-stone-700"
              onClick={() => setIsOpen(false)}
            >
              <Text className="leading-none text-neutral-500 dark:text-stone-400 group-hover:text-black group-focus:text-black dark:group-hover:text-stone-200 dark:group-focus:text-stone-200">
                {t("seeAllResults")}
              </Text>
              <IconArrowRight
                size={16}
                className="motion-safe:transition-transform motion-safe:group-hover:translate-x-1 motion-safe:group-focus:translate-x-1 text-neutral-500 dark:text-stone-400 group-hover:text-black group-focus:text-black dark:group-hover:text-stone-200 dark:group-focus:text-stone-200"
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
      <div
        aria-hidden
        className="flex items-center px-2 py-3 border-t border-neutral-200 dark:border-stone-700 rounded-b-lg"
      >
        <div className="h-4 w-36 rounded bg-neutral-200 dark:bg-stone-600 motion-safe:animate-pulse" />
      </div>
    </>
  )
}

const CourseAutocompleteNoResults = () => {
  const t = useTranslations("CourseAutocomplete")

  return <Text className="text-sm text-neutral-500 dark:text-stone-400 p-2">{t("noResults")}</Text>
}
