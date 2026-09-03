import { Text, cn } from "@dotkomonline/ui"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"

const GITHUB_URL = "https://github.com/dotkom/monoweb"
const CONTACT_EMAIL = "dotkom@online.ntnu.no"
const ONLINE_URL = "https://online.ntnu.no"

export const Footer = async () => {
  const t = await getTranslations("Footer")

  return (
    <footer className="mt-16 border-t border-neutral-200 dark:border-stone-700">
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 lg:px-12",
          "text-sm text-neutral-500 dark:text-stone-400"
        )}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <Text className="text-sm text-neutral-600 dark:text-stone-300">{t("tagline")}</Text>
            <Text className="text-sm">
              {t.rich("madeBy", {
                online: (chunks) => (
                  <Link
                    href={ONLINE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-neutral-300 underline-offset-2 transition-colors hover:text-neutral-800 hover:decoration-neutral-500 dark:decoration-stone-600 dark:hover:text-stone-200 dark:hover:decoration-stone-400"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </Text>
          </div>

          <nav className="flex flex-row flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-neutral-800 dark:hover:text-stone-200"
            >
              {t("github")}
            </Link>
            <Link
              href={`mailto:${CONTACT_EMAIL}`}
              className="transition-colors hover:text-neutral-800 dark:hover:text-stone-200"
            >
              {t("contact")}
            </Link>
          </nav>
        </div>

        <Text className="text-xs text-neutral-500 dark:text-stone-400">{t("dataSources")}</Text>
      </div>
    </footer>
  )
}
