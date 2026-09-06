"use client"

import { Link } from "@/i18n/navigation"
import type { CreditReductionDetail } from "@dotkomonline/grades-backend/course"
import { pickLocalized } from "@dotkomonline/grades-backend/course"
import { cn, Text } from "@dotkomonline/ui"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { useState } from "react"

const MAX_CREDIT_REDUCTIONS_TO_SHOW = 3

interface Props {
  creditReductions: CreditReductionDetail[]
}

export const CreditReductionsList = ({ creditReductions }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations("CoursePage.CourseAbout.CreditReductions")
  const tCommon = useTranslations("Common")
  const locale = useLocale()
  const format = useFormatter()

  const numberOfExtraItems = creditReductions.length - MAX_CREDIT_REDUCTIONS_TO_SHOW
  const hasExtraItems = numberOfExtraItems > 0

  return (
    <>
      <ul className={cn("flex flex-col p-3 sm:p-5 pt-0!", hasExtraItems && "pb-0!")} id="credit-reductions-list">
        {creditReductions.map(({ overlapCourseId, overlapCourse, reductionAmount }, index) => {
          const isHidden = index >= MAX_CREDIT_REDUCTIONS_TO_SHOW && !isOpen

          return (
            <li key={overlapCourseId} className={isHidden ? "hidden" : undefined} aria-hidden={isHidden}>
              <Link
                href={`/emner/${encodeURIComponent(overlapCourse.code)}`}
                className="flex items-baseline gap-4 rounded-md -mx-1 px-2 py-3 hover:bg-neutral-200/60 dark:hover:bg-stone-700 focus-visible:outline-none focus-visible:bg-neutral-200/60 dark:focus-visible:bg-stone-700 "
              >
                <div className="min-w-0 flex-1">
                  <Text element="span" className="block text-[13px] text-neutral-500 dark:text-stone-400 tabular-nums">
                    {overlapCourse.code}
                  </Text>
                  <Text element="span" className="block text-[13px] text-neutral-900 dark:text-stone-200" lang={locale}>
                    {pickLocalized(locale, overlapCourse.nameNo, overlapCourse.nameEn) ?? overlapCourse.nameNo}
                  </Text>
                </div>

                <div className="flex shrink-0 flex-col items-end">
                  <Text element="span" className="text-[13px] text-neutral-900 dark:text-stone-200 tabular-nums">
                    {tCommon.rich("credits", {
                      credits: format.number(-reductionAmount, { maximumFractionDigits: 1 }),
                      unit: (chunks) => (
                        <span className="font-normal text-xs text-neutral-500 dark:text-stone-400">{chunks}</span>
                      ),
                    })}
                  </Text>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
      {hasExtraItems && (
        <div className="border-t border-neutral-200 dark:border-stone-700">
          <button
            type="button"
            className="w-full text-center text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-stone-400 dark:hover:text-stone-200 px-4 py-2.5 sm:px-6"
            aria-expanded={isOpen}
            aria-controls="credit-reductions-list"
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? t("showLess") : t("seeMore", { count: numberOfExtraItems })}
          </button>
        </div>
      )}
    </>
  )
}
