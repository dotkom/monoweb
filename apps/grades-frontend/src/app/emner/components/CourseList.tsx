"use client"

import { useTRPC } from "@/utils/trpc/client"
import type { CourseRouter } from "@dotkomonline/grades-backend"
import type { CourseFilterQuery } from "@dotkomonline/grades-backend/course"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useRef } from "react"
import { CourseCard } from "../../components/CourseCard/CourseCard"
import { CourseCardSkeleton } from "../../components/CourseCard/CourseCardSkeleton"

type FindCoursesOutput = CourseRouter.FindCoursesOutput

interface Props {
  initialPage: FindCoursesOutput
  filter: CourseFilterQuery
}

export const CourseList = ({ initialPage, filter }: Props) => {
  const trpc = useTRPC()

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isFetching } = useInfiniteQuery(
    trpc.course.findCourses.infiniteQueryOptions(
      { filter, cursor: 0, limit: 20 },
      {
        placeholderData: (previousData) => previousData ?? { pages: [initialPage], pageParams: [0] },
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  )

  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        root: null,
        // Fetch next page slightly before the last card is visible
        rootMargin: "600px 0px",
        threshold: 0,
      }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const courses = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])

  return (
    <section className="flex w-full flex-col gap-4" aria-busy={isFetchingNextPage || isFetching}>
      {courses.map((course) => (
        <CourseCard key={course.code} course={course} />
      ))}

      {isFetchingNextPage && <CourseListSkeleton />}
      <div ref={loaderRef} />
    </section>
  )
}

const CourseListSkeleton = () => {
  const NEXT_PAGE_SKELETONS = 5
  return Array.from({ length: NEXT_PAGE_SKELETONS }, (_, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: index is fine for non-reordering skeleton list
    <CourseCardSkeleton key={i} aria-hidden="true" />
  ))
}
