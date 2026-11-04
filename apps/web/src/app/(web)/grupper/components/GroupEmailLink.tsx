"use client"

import { useCopyToClipboard } from "@/utils/use-copy-to-clipboard"
import { Button, Text, cn } from "@dotkomonline/ui"
import { IconCheck, IconMail } from "@tabler/icons-react"

export function GroupEmailLink({ email }: { email: string }) {
  const { icon, copy } = useCopyToClipboard()
  const hasCopied = icon === "check"

  return (
    <Button
      type="button"
      variant="unstyled"
      aria-label={`Kopier e-postadresse: ${email}`}
      onClick={() => copy(email)}
      className={cn(
        "group flex flex-row w-fit items-center gap-1 px-1.5 py-1 rounded-md transition-colors",
        "bg-slate-50 hover:bg-slate-100 hover:text-gray-700",
        "dark:bg-stone-800 dark:hover:bg-stone-700 dark:hover:text-stone-300"
      )}
    >
      {hasCopied ? (
        <IconCheck aria-hidden className="shrink-0 size-4 text-green-600 dark:text-green-400" />
      ) : (
        <IconMail aria-hidden className="shrink-0 size-4 text-gray-500 dark:text-stone-400" />
      )}

      <Text element="span" className="inline-grid justify-items-start" aria-hidden>
        <span className="invisible col-start-1 row-start-1 whitespace-nowrap">{email}</span>
        <span className="col-start-1 row-start-1 whitespace-nowrap">{hasCopied ? "Kopiert" : email}</span>
      </Text>

      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {hasCopied ? "E-postadressen er kopiert til utklippstavlen." : ""}
      </span>
    </Button>
  )
}
