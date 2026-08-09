"use client"

import type { Course } from "@dotkomonline/grades-backend/course"
import { useEffect, useRef } from "react"
import { CourseCard } from "../../components/CourseCard/CourseCard"
import { CourseCardSkeleton } from "../../components/CourseCard/CourseCardSkeleton"

interface Props {
  courses: Course[]
  fetchNextPage: () => void
  isFetchingNextPage: boolean
  hasNextPage: boolean
  isFetching: boolean
}

export const CourseList = ({ courses, fetchNextPage, isFetchingNextPage, hasNextPage, isFetching }: Props) => {
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
