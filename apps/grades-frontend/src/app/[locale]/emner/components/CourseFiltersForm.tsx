"use client"

import {
  CourseCampusSchema,
  MinLetterGradeFilterSchema,
  SemesterSchema,
  TeachingLanguageSchema,
  type CourseFilterQuery,
} from "@dotkomonline/grades-backend/course"
import {
  Checkbox,
  cn,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  Text,
} from "@dotkomonline/ui"
import { useTranslations } from "next-intl"
import type { PropsWithChildren } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { CourseSortSelect } from "./CourseSortSelect"

const MIN_GRADE_OPTIONS_ALL = "ALL"

const semesterOptions = SemesterSchema.options.filter((s) => s !== "SUMMER")

const FIELD_TRIGGER_CLASS =
  "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-white focus-visible:border-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-stone-800 dark:border-stone-700 dark:hover:bg-stone-800 dark:hover:border-stone-600 dark:focus-visible:border-stone-500"

const SELECT_ITEM_CLASS =
  "cursor-pointer p-2 hover:bg-neutral-100 data-highlighted:bg-neutral-100 dark:hover:bg-stone-700 dark:data-highlighted:bg-stone-700"

const FIELD_LABEL_CLASS = "font-body text-sm leading-none font-medium select-none text-neutral-600 dark:text-stone-300"

type Props = {
  idPrefix: string
  showSort?: boolean
  className?: string
}

export function CourseFiltersForm({ idPrefix, showSort = false, className }: Props) {
  const t = useTranslations()
  const { control, setValue } = useFormContext<CourseFilterQuery>()

  const bySemester = useWatch({ control, name: "bySemester" }) ?? []
  const byTeachingLanguage = useWatch({ control, name: "byTeachingLanguage" }) ?? []
  const byCampus = useWatch({ control, name: "byCampus" }) ?? []
  const byMinGrade = useWatch({ control, name: "byMinGrade" })

  const fieldId = (name: string) => `${idPrefix}-${name}`

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {showSort && (
        <Field label={t("CourseFilters.sortBy")} labelFor={fieldId("sortBy")}>
          <CourseSortSelect id={fieldId("sortBy")} className="w-full" />
        </Field>
      )}

      <Field label={t("Common.Semester")}>
        <div className="flex flex-col gap-2">
          {semesterOptions.map((semester) => (
            <MultiSelectCheckboxRow
              key={semester}
              id={fieldId(semester)}
              value={bySemester}
              option={semester}
              onChange={(next) => setValue("bySemester", next)}
              label={t(`Enums.Semester.${semester}`)}
            />
          ))}
        </div>
      </Field>

      <Field label={t("CourseFilters.teachingLanguage")}>
        <div className="flex flex-col gap-2">
          {TeachingLanguageSchema.options.map((language) => (
            <MultiSelectCheckboxRow
              key={language}
              id={fieldId(language)}
              value={byTeachingLanguage}
              option={language}
              onChange={(next) => setValue("byTeachingLanguage", next)}
              label={t(`Enums.TeachingLanguage.${language}`)}
            />
          ))}
        </div>
      </Field>

      <Field label={t("CourseFilters.campus")}>
        <div className="flex flex-col gap-2">
          {CourseCampusSchema.options.map((campus) => (
            <MultiSelectCheckboxRow
              key={campus}
              id={fieldId(campus)}
              value={byCampus}
              option={campus}
              onChange={(next) => setValue("byCampus", next)}
              label={t(`Enums.Campus.${campus}`)}
            />
          ))}
        </div>
      </Field>

      <Field label={t("CourseFilters.minGrade")} labelFor={fieldId("byMinGrade")}>
        <Select
          id={fieldId("byMinGrade")}
          onValueChange={(val) => {
            if (val === MIN_GRADE_OPTIONS_ALL) {
              setValue("byMinGrade", null)
            } else {
              setValue("byMinGrade", val as NonNullable<CourseFilterQuery["byMinGrade"]>)
            }
          }}
          value={byMinGrade ?? MIN_GRADE_OPTIONS_ALL}
        >
          <SelectTrigger className={FIELD_TRIGGER_CLASS}>
            <SelectValue>
              {byMinGrade ? t(`CourseFilters.minGradeOptions.${byMinGrade}`) : t("CourseFilters.minGradeOptions.ALL")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="dark:bg-stone-800 dark:border-stone-700">
            <SelectScrollUpButton />

            <SelectItem className={SELECT_ITEM_CLASS} value={MIN_GRADE_OPTIONS_ALL}>
              {t("CourseFilters.minGradeOptions.ALL")}
            </SelectItem>

            {MinLetterGradeFilterSchema.options.map((option) => (
              <SelectItem className={SELECT_ITEM_CLASS} key={option} value={option}>
                {t(`CourseFilters.minGradeOptions.${option}`)}
              </SelectItem>
            ))}
            <SelectScrollDownButton />
          </SelectContent>
        </Select>
      </Field>
    </div>
  )
}

type FieldProps = PropsWithChildren<{
  label: string
  labelFor?: string
}>

function Field({ label, labelFor, children }: FieldProps) {
  const labelClassName = FIELD_LABEL_CLASS

  if (labelFor) {
    return (
      <div className="flex flex-col gap-3">
        <Label htmlFor={labelFor} className={labelClassName}>
          {label}
        </Label>
        {children}
      </div>
    )
  }

  return (
    <fieldset className="m-0 flex min-w-0 flex-col border-0 p-0">
      <legend className={cn(labelClassName, "p-0 mb-3")}>{label}</legend>
      {children}
    </fieldset>
  )
}

type MultiSelectCheckboxRowProps<T extends string> = {
  id: string
  label: string
  value: T[]
  option: T
  onChange: (next: T[]) => void
}

function MultiSelectCheckboxRow<T extends string>({
  id,
  label,
  value,
  option,
  onChange,
}: MultiSelectCheckboxRowProps<T>) {
  const isChecked = value.includes(option)

  return (
    <Label htmlFor={id} className="flex w-full cursor-pointer items-center gap-3 group">
      <Checkbox
        id={id}
        className={cn(
          "border-neutral-200 dark:bg-stone-800 dark:border-stone-700",
          "not-data-checked:group-hover:bg-neutral-100 dark:not-data-checked:group-hover:bg-stone-800",
          "not-data-checked:group-hover:border-neutral-300 dark:not-data-checked:group-hover:border-stone-600"
        )}
        checked={isChecked}
        onCheckedChange={(checked) => {
          if (checked) {
            onChange(isChecked ? value : [...value, option])
            return
          }

          onChange(value.filter((v) => v !== option))
        }}
      />
      <Text
        element="span"
        className="flex-1 text-sm select-none font-normal text-neutral-700 dark:text-stone-200 group-hover:text-neutral-900 dark:group-hover:text-stone-100"
      >
        {label}
      </Text>
    </Label>
  )
}
