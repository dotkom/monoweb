"use client"

import { CourseFilterParsers } from "@/app/emner/course-filter-parsers"
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
} from "@dotkomonline/ui"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { createSerializer } from "nuqs"
import { useEffect, type PropsWithChildren } from "react"
import { Controller, useForm } from "react-hook-form"
import { useDebouncedCallback } from "use-debounce"

const serialize = createSerializer(CourseFilterParsers)

const MIN_GRADE_OPTIONS_ALL = "ALL"

const semesterOptions = SemesterSchema.options.filter((s) => s !== "SUMMER")

type Props = {
  defaultValues: CourseFilterQuery
  className?: string
}

export function CourseFiltersForm({ defaultValues, className }: Props) {
  const t = useTranslations()
  const router = useRouter()

  const form = useForm<CourseFilterQuery>({ defaultValues })

  const updateUrl = useDebouncedCallback((values: CourseFilterQuery) => {
    const queryString = serialize(values)
    router.push(`/emner${queryString}`)
  }, 300)

  useEffect(() => {
    const sub = form.watch((values) => {
      updateUrl(values)
    })

    return () => sub.unsubscribe()
  }, [form, updateUrl])

  return (
    <form onSubmit={form.handleSubmit(updateUrl)} className={cn("flex flex-col gap-6", className)}>
      <Field label={t("Common.Semester")} labelFor="bySemester">
        <Controller
          name="bySemester"
          control={form.control}
          render={({ field: { value = [], onChange } }) => (
            <div className="flex flex-col gap-2">
              {semesterOptions.map((semester) => (
                <MultiSelectCheckboxRow
                  key={semester}
                  id={semester}
                  value={value}
                  option={semester}
                  onChange={onChange}
                  label={t(`Enums.Semester.${semester}`)}
                />
              ))}
            </div>
          )}
        />
      </Field>

      <Field label={t("CourseFilters.teachingLanguage")} labelFor="byTeachingLanguage">
        <Controller
          name="byTeachingLanguage"
          control={form.control}
          render={({ field: { value = [], onChange } }) => (
            <div className="flex flex-col gap-2">
              {TeachingLanguageSchema.options.map((language) => (
                <MultiSelectCheckboxRow
                  key={language}
                  id={language}
                  value={value}
                  option={language}
                  onChange={onChange}
                  label={t(`Enums.TeachingLanguage.${language}`)}
                />
              ))}
            </div>
          )}
        />
      </Field>

      <Field label={t("CourseFilters.campus")} labelFor="byCampus">
        <Controller
          name="byCampus"
          control={form.control}
          render={({ field: { value = [], onChange } }) => (
            <div className="flex flex-col gap-2">
              {CourseCampusSchema.options.map((campus) => (
                <MultiSelectCheckboxRow
                  key={campus}
                  id={campus}
                  value={value}
                  option={campus}
                  onChange={onChange}
                  label={t(`Enums.Campus.${campus}`)}
                />
              ))}
            </div>
          )}
        />
      </Field>

      <Field label={t("CourseFilters.minGrade")} labelFor="byMinGrade">
        <Controller
          name="byMinGrade"
          control={form.control}
          render={({ field }) => (
            <Select
              onValueChange={(val) => {
                if (val === MIN_GRADE_OPTIONS_ALL) {
                  field.onChange(undefined)
                } else {
                  field.onChange(val)
                }
              }}
              value={field.value ?? MIN_GRADE_OPTIONS_ALL}
            >
              <SelectTrigger className="focus:ring-neutral-950 dark:focus:ring-stone-200">
                <SelectValue>
                  {field.value
                    ? t(`CourseFilters.minGradeOptions.${field.value}`)
                    : t("CourseFilters.minGradeOptions.ALL")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectScrollUpButton />

                <SelectItem value={MIN_GRADE_OPTIONS_ALL}>{t("CourseFilters.minGradeOptions.ALL")}</SelectItem>

                {MinLetterGradeFilterSchema.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {t(`CourseFilters.minGradeOptions.${option}`)}
                  </SelectItem>
                ))}
                <SelectScrollDownButton />
              </SelectContent>
            </Select>
          )}
        />
      </Field>
    </form>
  )
}

type FieldProps = PropsWithChildren<{
  label: string
  labelFor: string
}>

function Field({ label, labelFor, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={labelFor} className="text-neutral-600 dark:text-stone-300 font-medium">
        {label}
      </Label>
      {children}
    </div>
  )
}

type MultiSelectCheckboxRowProps = {
  id: string
  label: string
  value: string[]
  option: string
  onChange: (next: string[]) => void
}

function MultiSelectCheckboxRow({ id, label, value, option, onChange }: MultiSelectCheckboxRowProps) {
  const isChecked = value.includes(option)

  return (
    <div className="flex items-center gap-3">
      <Checkbox
        id={id}
        checked={isChecked}
        onCheckedChange={(checked) => {
          if (checked) {
            onChange(isChecked ? value : [...value, option])
            return
          }

          onChange(value.filter((v) => v !== option))
        }}
        label={label}
        labelClassName="text-sm"
      />
    </div>
  )
}
