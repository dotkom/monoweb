import { cn } from "@dotkomonline/ui"
import type { ReactNode } from "react"
import { FormProvider, type FieldValues, type SubmitHandler, type UseFormReturn } from "react-hook-form"

export function Form<TFieldValues extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
}: {
  form: UseFormReturn<TFieldValues>
  onSubmit: SubmitHandler<TFieldValues>
  children: ReactNode
  className?: string
}) {
  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className={cn("flex flex-col gap-5", className)}>
        {children}
      </form>
    </FormProvider>
  )
}
