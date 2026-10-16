"use client"

import { useCompactRelativeTime } from "@/utils/countdown/use-compact-relative-time"
import { getInterestGroupCommentsUrl, type InterestGroupComment } from "@dotkomonline/rpc/group"
import { Avatar, AvatarFallback, AvatarImage, cn, Text } from "@dotkomonline/ui"
import { getCurrentUTC } from "@dotkomonline/utils"
import { IconArrowRight, IconUser } from "@tabler/icons-react"
import { differenceInSeconds } from "date-fns"
import Link from "next/link"
interface Props {
  comment: InterestGroupComment
  slug: string
  replyCount?: number
  date?: Date
  variant?: "card" | "row"
  isSelected?: boolean
  href?: string
  className?: string
  bodyClassName?: string
}

export const InterestGroupCommentCard = ({
  comment,
  slug,
  replyCount,
  date,
  variant = "card",
  isSelected = false,
  href,
  bodyClassName,
  className,
}: Props) => {
  const displayedDate = date ?? comment.createdAt
  const timeSinceDisplayedDate = differenceInSeconds(getCurrentUTC(), displayedDate)
  const relativeDisplayedDate = useCompactRelativeTime(displayedDate)
  const dateLabel = timeSinceDisplayedDate < 60 ? "Nå" : relativeDisplayedDate

  const authorProfileHref = `/profil/${comment.author.username}`

  const showArrow = variant === "card"

  const CardContent = (
    <InterestGroupCommentCardContent
      body={comment.body}
      replyCount={replyCount}
      showArrow={showArrow}
      bodyClassName={bodyClassName}
    />
  )

  const isHoverable = href !== undefined

  return (
    <div
      className={cn(
        "group flex flex-row gap-2 items-start relative px-4 py-3",
        variant === "card" && "rounded-lg border border-gray-200 dark:border-stone-700",
        isHoverable && "hover:bg-gray-50 dark:hover:bg-stone-800",
        isSelected && "bg-blue-50/80 shadow-[inset_3px_0_0_0_var(--color-brand)] dark:bg-stone-800/90",
        className
      )}
    >
      <Link href={authorProfileHref} prefetch={false} className="relative z-10 rounded-full">
        <Avatar className="size-8 shrink-0">
          <AvatarImage src={comment.author.imageUrl ?? undefined} />
          <AvatarFallback>
            <IconUser className="size-4" />
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex flex-col gap-1 items-start flex-1">
        <div className="flex flex-row justify-between gap-2 items-center w-full">
          <Link
            href={authorProfileHref}
            prefetch={false}
            className="relative z-10 truncate text-sm font-semibold hover:underline"
          >
            {comment.author.name}
          </Link>
          <Text className="shrink-0 text-xs text-muted-foreground">{dateLabel}</Text>
        </div>

        {href !== undefined ? (
          <Link
            href={href ?? getInterestGroupCommentsUrl(slug, comment.id)}
            className={cn(
              "flex flex-col gap-4 text-left w-full",
              "outline-none focus-visible:outline-none",
              "after:absolute after:inset-0 after:z-0 after:rounded-lg",
              "focus-visible:after:ring-2 focus-visible:after:ring-ring/30"
            )}
            onClick={() => {
              window.scrollTo({ top: 0, left: 0 })
            }}
          >
            {CardContent}
          </Link>
        ) : (
          <div className="flex flex-col gap-4 text-left w-full">{CardContent}</div>
        )}
      </div>
    </div>
  )
}

export const InterestGroupCommentCardContent = ({
  body,
  replyCount,
  showArrow = true,
  bodyClassName,
}: {
  body: string
  replyCount?: number
  showArrow?: boolean
  bodyClassName?: string
}) => {
  return (
    <>
      <Text className={cn("text-sm whitespace-pre-wrap", bodyClassName)}>{body}</Text>

      {(replyCount !== undefined || showArrow) && (
        <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs justify-between w-full">
          {replyCount !== undefined && (
            <Text className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {replyCount > 0 ? `${replyCount} svar` : "Ingen svar ennå"}
            </Text>
          )}

          {showArrow && (
            <IconArrowRight
              aria-hidden
              className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform"
            />
          )}
        </span>
      )}
    </>
  )
}
