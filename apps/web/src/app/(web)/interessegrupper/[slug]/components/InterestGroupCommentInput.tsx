"use client"

import type { User } from "@dotkomonline/rpc/user"
import { Avatar, AvatarFallback, AvatarImage, Button, cn, InputGroupTextarea, Label, Text } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconSend, IconUser } from "@tabler/icons-react"
import { useState, type Ref } from "react"
import { useFullPathname } from "src/utils/use-full-pathname"

interface InterestGroupCommentInputProps {
  user?: User
  isMember: boolean
  placeholder?: string
  className?: string
  onSubmit: (body: string) => Promise<void>
  isPending: boolean
  autoFocus?: boolean
  ref?: Ref<HTMLTextAreaElement>
}

export const InterestGroupCommentInput = ({
  user,
  isMember,
  placeholder,
  className,
  onSubmit,
  isPending,
  autoFocus = false,
  ref,
}: InterestGroupCommentInputProps) => {
  const [body, setBody] = useState("")
  const fullPathname = useFullPathname()
  const authorizeUrl = createAuthorizeUrl({ returnTo: fullPathname })

  const trimmedBody = body.trim()

  const handleSubmit = async () => {
    if (trimmedBody === "") {
      return
    }

    await onSubmit(trimmedBody)
    setBody("")
  }

  if (user === undefined) {
    return (
      <a
        href={authorizeUrl}
        className={cn(
          "flex w-full flex-row items-center gap-2.5 rounded-lg px-4 py-3 transition-colors",
          "border border-gray-200 hover:bg-gray-50 dark:border-stone-700",
          "focus-within:border-primary/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10",
          className
        )}
      >
        <Avatar className="size-8 shrink-0 self-start">
          <AvatarFallback className="bg-gray-200 dark:bg-stone-600">
            <IconUser className="size-4" />
          </AvatarFallback>
        </Avatar>
        <Text className="text-sm">Logg inn for å starte en samtale</Text>
      </a>
    )
  }

  if (!isMember) {
    return (
      <div className="flex w-full items-center rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-stone-700 dark:bg-stone-850">
        <Text className="flex min-h-8 items-center text-sm font-medium text-muted-foreground">
          Bli medlem for å delta i samtaler
        </Text>
      </div>
    )
  }

  return (
    <Label
      htmlFor="comment-input"
      className={cn(
        "flex w-full cursor-text flex-row items-end gap-2.5 rounded-lg px-4 py-3 transition-colors",
        "border border-gray-200 hover:bg-gray-50 dark:border-stone-700",
        "focus-within:border-primary/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10",
        className
      )}
    >
      <Avatar className="size-8 shrink-0 self-start">
        <AvatarImage src={user.imageUrl ?? undefined} />
        <AvatarFallback className="bg-gray-200 dark:bg-stone-600">
          <IconUser className="size-4" />
        </AvatarFallback>
      </Avatar>

      <InputGroupTextarea
        id="comment-input"
        ref={ref}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder ?? "Lyst til å finne på noe? Spør her"}
        rows={1}
        autoFocus={autoFocus}
        disabled={isPending}
        className={cn(
          "min-h-8 max-h-44 min-w-0 flex-1 resize-none bg-transparent px-0 py-1.5",
          "border-0 text-sm leading-5 font-normal shadow-none focus-visible:ring-0"
        )}
        onClick={(event) => event.stopPropagation()}
      />

      <Button
        size="sm"
        variant="default"
        icon={<IconSend className="size-3.5" />}
        className={cn("h-8 shrink-0 self-end", trimmedBody === "" && "hidden")}
        disabled={isPending}
        onClick={(event) => {
          event.stopPropagation()
          void handleSubmit()
        }}
      >
        Send
      </Button>
    </Label>
  )
}
