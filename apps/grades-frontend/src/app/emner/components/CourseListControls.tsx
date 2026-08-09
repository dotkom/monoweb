"use client"

import { CourseFilterParsers } from "@/app/emner/course-filter-parsers"
import { useTRPC } from "@/utils/trpc/client"
import type { CourseRouter } from "@dotkomonline/grades-backend"
import type { CourseFilterQuery } from "@dotkomonline/grades-backend/course"
import { Text } from "@dotkomonline/ui"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { createSerializer } from "nuqs"
import { useEffect, useMemo, useRef } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { useDebounce, useDebouncedCallback } from "use-debounce"
import { CourseFilterChips } from "./CourseFilterChips"
import { CourseFilters } from "./CourseFilters"
import { CourseList } from "./CourseList"
import { CourseListToolbar } from "./CourseListToolbar"

const serialize = createSerializer(CourseFilterParsers)

type FindCoursesOutput = CourseRouter.FindCoursesOutput

type Props = {
  defaultValues: CourseFilterQuery
  initialPage: FindCoursesOutput
}

export function CourseListControls({ defaultValues, initialPage }: Props) {
  const router = useRouter()
  const form = useForm<CourseFilterQuery>({ defaultValues })
  const lastUrlRef = useRef(`/emner${serialize(defaultValues)}`)
  const skipUrlPushRef = useRef(false)
  const t = useTranslations("CourseListToolbar")
  const trpc = useTRPC()

  const values = useWatch({ control: form.control })
  const [debouncedSearch] = useDebounce(values.bySearch ?? "", 300)

  const filter = useMemo(
    () => ({
      ...values,
      bySearch: debouncedSearch,
    }),
    [values, debouncedSearch]
  )

  const pushUrl = useDebouncedCallback((next: CourseFilterQuery) => {
    const url = `/emner${serialize(next)}`
    if (lastUrlRef.current === url) {
      return
    }
    lastUrlRef.current = url
    router.push(url, { scroll: false })
  }, 300)

  // Sync form when URL changes externally
  useEffect(() => {
    const url = `/emner${serialize(defaultValues)}`
    if (lastUrlRef.current === url) {
      return
    }
    lastUrlRef.current = url
    skipUrlPushRef.current = true
    pushUrl.cancel()
    form.reset(defaultValues)
  }, [defaultValues, form, pushUrl])

  // Push form changes to the URL
  useEffect(() => {
    const subscription = form.watch(() => {
      if (skipUrlPushRef.current) {
        skipUrlPushRef.current = false
        return
      }
      pushUrl(form.getValues())
    })
    return () => subscription.unsubscribe()
  }, [form, pushUrl])

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isFetching } = useInfiniteQuery(
    trpc.course.findCourses.infiniteQueryOptions(
      { filter, cursor: 0, limit: 20 },
      {
        placeholderData: (previousData) => previousData ?? { pages: [initialPage], pageParams: [0] },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  )

  const courses = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  const totalCount = data?.pages[0].totalCount ?? 0

  return (
    <FormProvider {...form}>
      <div className="w-full flex flex-col md:flex-row gap-6">
        <CourseFilters />
        <div className="flex w-full flex-col gap-2 md:max-w-xl">
          <CourseListToolbar />
          <div className="flex min-h-7 flex-row gap-4 items-end">
            <div className="min-w-0 flex-1">
              <CourseFilterChips />
            </div>

            {totalCount > 0 && (
              <Text className="text-sm text-neutral-500 dark:text-stone-400 shrink-0 mb-1">
                {t("totalCount", { totalCount })}
              </Text>
            )}
          </div>
          <CourseList
            courses={courses}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            isFetching={isFetching}
          />
        </div>
      </div>
    </FormProvider>
  )
}
