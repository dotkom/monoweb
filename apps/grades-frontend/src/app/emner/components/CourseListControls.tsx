"use client"

import { CourseFilterParsers } from "@/app/emner/course-filter-parsers"
import type { CourseRouter } from "@dotkomonline/grades-backend"
import type { CourseFilterQuery } from "@dotkomonline/grades-backend/course"
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

  return (
    <FormProvider {...form}>
      <div className="w-full flex flex-col md:flex-row gap-6">
        <CourseFilters />
        <div className="flex w-full flex-col gap-4 md:max-w-xl">
          <div className="flex flex-col gap-2">
            <CourseListToolbar />
            <CourseFilterChips />
          </div>
          <CourseList initialPage={initialPage} filter={filter} />
        </div>
      </div>
    </FormProvider>
  )
}
