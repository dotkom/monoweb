import { Text } from "@dotkomonline/ui"
import { IconBookOff } from "@tabler/icons-react"
import { getTranslations } from "next-intl/server"
import Link from "next/link"

export async function CourseNotFound() {
  const t = await getTranslations("CoursePage.notFound")

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg text-center" role="status">
      <div className="flex size-11 items-center justify-center rounded-full bg-neutral-200 dark:bg-stone-700">
        <IconBookOff className="size-5 text-neutral-400 dark:text-stone-400" stroke={1.75} aria-hidden />
      </div>

      <div className="flex max-w-sm flex-col gap-1">
        <Text element="h1" className="text-base font-medium text-neutral-800 dark:text-stone-100">
          {t("title")}
        </Text>
        <Text className="text-sm text-neutral-500 dark:text-stone-400">
          {t.rich("hint", {
            link: (chunks) => (
              <Link href="/emner" className="underline underline-offset-2">
                {chunks}
              </Link>
            ),
          })}
        </Text>
      </div>
    </div>
  )
}
