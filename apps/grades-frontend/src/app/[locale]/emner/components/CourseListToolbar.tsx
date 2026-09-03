"use client"

import { SearchInput } from "@/app/[locale]/components/SearchInput"
import type { CourseFilterQuery } from "@dotkomonline/grades-backend/course"
import { cn } from "@dotkomonline/ui"
import { useTranslations } from "next-intl"
import { Controller, useFormContext } from "react-hook-form"
import { CourseSortSelect } from "./CourseSortSelect"
import { MobileCourseFilters } from "./CourseMobileFilters"

type Props = {
  className?: string
}

export function CourseListToolbar({ className }: Props) {
  const t = useTranslations()
  const { control } = useFormContext<CourseFilterQuery>()

  return (
    <div className={cn("flex flex-row items-center gap-2 w-full", className)}>
      <Controller
        name="bySearch"
        control={control}
        render={({ field }) => (
          <SearchInput
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            placeholder={t("CourseListToolbar.searchPlaceholder")}
            autoComplete="off"
            className="flex-1"
            inputClassName="text-sm h-9"
          />
        )}
      />

      <CourseSortSelect className="hidden md:flex w-48 shrink-0" />
      <MobileCourseFilters />
    </div>
  )
}
