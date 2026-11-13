"use client"

import { useTRPC } from "@/utils/trpc/client"
import { useFullPathname } from "@/utils/use-full-pathname"
import { useUser } from "@auth0/nextjs-auth0/client"
import type { Group } from "@dotkomonline/rpc/group"
import { getInterestGroupCommentsUrl } from "@dotkomonline/rpc/group"
import { Button, cn, Text } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconArrowLeft, IconMessage, IconPlus, IconUserPlus } from "@tabler/icons-react"
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { redirect, useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { useInterestGroupView } from "../../use-interest-group-view"
import { InterestGroupCommentCard } from "../components/InterestGroupCommentCard"
import { InterestGroupCommentInput } from "../components/InterestGroupCommentInput"
import {
  buildCommentThreads,
  getThreadLastActivityDate,
  sortCommentThreadsByRecentActivity,
} from "../components/interest-group-comment-utils"

interface Props {
  interestGroup: Group
}

export const InterestGroupCommentsPage = ({ interestGroup }: Props) => {
  const trpc = useTRPC()
  const router = useRouter()
  const queryClient = useQueryClient()
  const fullPathname = useFullPathname()
  const { user: sessionUser, isLoading: isSessionLoading } = useUser()
  const params = useParams<{ commentId?: string }>()
  const commentId = typeof params.commentId === "string" ? params.commentId : undefined
  const hasSelection = commentId !== undefined
  const [isNewThread, setIsNewThread] = useState(false)
  const showsThread = hasSelection || isNewThread
  const threadScrollerRef = useRef<HTMLDivElement>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  const [commentsQuery, membersQuery] = useQueries({
    queries: [
      trpc.group.findManyInterestGroupComments.queryOptions(interestGroup.slug),
      trpc.group.getMembers.queryOptions(interestGroup.slug),
    ],
  })
  const threads = useMemo(
    () => sortCommentThreadsByRecentActivity(buildCommentThreads(commentsQuery.data ?? [])),
    [commentsQuery.data]
  )

  const { user, isMember, toggleMembership } = useInterestGroupView({ interestGroup, groupMembers: membersQuery.data })
  const selectedThread = useMemo(() => threads.find((thread) => thread.comment.id === commentId), [threads, commentId])
  const replyCount = selectedThread?.replies.length ?? 0

  const createCommentMutation = useMutation(
    trpc.group.createInterestGroupComment.mutationOptions({
      onSuccess: async (comment, input) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.group.findManyInterestGroupComments.queryKey(interestGroup.slug),
        })

        if (input.data.parentId === null) {
          setIsNewThread(false)
          router.push(getInterestGroupCommentsUrl(interestGroup.slug, comment.id))
        }
      },
    })
  )

  const handleCreateComment = async (body: string) => {
    await createCommentMutation.mutateAsync({
      interestGroupId: interestGroup.slug,
      data: {
        body,
        parentId: selectedThread?.comment.id ?? null,
      },
    })
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to scroll to the bottom of the thread when the commentId changes
  useEffect(() => {
    const threadScroller = threadScrollerRef.current
    if (threadScroller === null) {
      return
    }

    threadScroller.scrollTop = threadScroller.scrollHeight
  }, [commentId, replyCount])

  if (!isSessionLoading && sessionUser === null) {
    redirect(createAuthorizeUrl({ returnTo: fullPathname }))
  }

  const isNewConversation = !hasSelection
  const showsNewConversationGate = isNewConversation && !membersQuery.isPending && !isMember
  const threadTitle = showsNewConversationGate || (isNewConversation && isNewThread) ? "Ny samtale" : "Tråd"

  return (
    <div
      className={cn(
        "flex flex-col",
        "md:h-[calc(100dvh-var(--navbar-height)-10rem)] md:flex-row md:overflow-hidden",
        "rounded-lg border border-gray-200 dark:border-stone-700"
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-col",
          "md:w-86 md:shrink-0 md:border-r md:border-gray-200 dark:md:border-stone-700",
          showsThread && "max-md:hidden"
        )}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 flex-row items-center justify-between gap-2 px-4",
            "border-b border-gray-200 dark:border-stone-700"
          )}
        >
          <Text className="text-sm font-medium tabular-nums">
            {commentsQuery.isPending ? (
              <span className="mr-1 inline-block h-4 w-4 animate-pulse rounded bg-gray-200 align-middle dark:bg-stone-700" />
            ) : (
              threads.length
            )}{" "}
            {threads.length === 1 ? "samtale" : "samtaler"}
          </Text>
          <Button
            element={Link}
            variant="outline"
            size="sm"
            className="w-fit"
            icon={<IconPlus className="size-3.5" />}
            href={getInterestGroupCommentsUrl(interestGroup.slug)}
            onClick={() => {
              flushSync(() => {
                setIsNewThread(true)
              })
              commentInputRef.current?.focus()
            }}
          >
            Ny samtale
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {commentsQuery.isPending ? (
            <CommentListSkeleton />
          ) : (
            threads.map((thread) => (
              <InterestGroupCommentCard
                key={thread.comment.id}
                comment={thread.comment}
                slug={interestGroup.slug}
                replyCount={thread.replies.length}
                date={getThreadLastActivityDate(thread)}
                variant="row"
                isSelected={thread.comment.id === commentId}
                href={getInterestGroupCommentsUrl(interestGroup.slug, thread.comment.id)}
                className={cn("border-b border-b-gray-200 dark:border-b-stone-700", "last:border-b-0")}
                bodyClassName="line-clamp-4"
              />
            ))
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          !showsThread && "max-md:hidden",
          showsThread && "max-md:min-h-[calc(100dvh-var(--navbar-height)-14rem)]"
        )}
      >
        <div
          className={cn(
            "flex h-14 shrink-0 flex-row items-center gap-2 px-4",
            "border-b border-gray-200 dark:border-stone-700"
          )}
        >
          <Button
            element={Link}
            href={getInterestGroupCommentsUrl(interestGroup.slug)}
            variant="ghost"
            size="sm"
            icon={<IconArrowLeft className="size-4" />}
            className="w-fit md:hidden"
            onClick={() => {
              setIsNewThread(false)
            }}
          >
            Tilbake
          </Button>
          <Text className="text-sm font-medium">{threadTitle}</Text>
          {selectedThread !== undefined && (
            <Text className="text-xs text-muted-foreground">Startet av {selectedThread.comment.author.name}</Text>
          )}
        </div>

        {showsNewConversationGate ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
            <IconMessage className="size-10 text-muted-foreground" strokeWidth={1.5} />
            <div className="flex flex-col gap-1.5">
              <Text className="text-base font-medium">Vil du starte en samtale?</Text>
              <Text className="text-sm text-muted-foreground">
                Du må være medlem av gruppen for å opprette nye tråder.
              </Text>
            </div>
            <Button
              variant="default"
              className="w-fit"
              icon={<IconUserPlus className="size-4" />}
              onClick={() => {
                toggleMembership(interestGroup)
              }}
            >
              Bli medlem
            </Button>
          </div>
        ) : (
          <>
            <div ref={threadScrollerRef} className={cn("min-h-0 flex-1 overflow-y-auto", "max-md:overflow-visible")}>
              {commentsQuery.isPending ? (
                <CommentListSkeleton />
              ) : (
                selectedThread !== undefined && (
                  <>
                    <InterestGroupCommentCard
                      comment={selectedThread.comment}
                      slug={interestGroup.slug}
                      variant="row"
                    />

                    {selectedThread.replies.length > 0 && (
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="h-px flex-1 bg-gray-200 dark:bg-stone-700" />
                        <Text className="shrink-0 text-xs text-muted-foreground tabular-nums">
                          {selectedThread.replies.length} svar
                        </Text>
                        <div className="h-px flex-1 bg-gray-200 dark:bg-stone-700" />
                      </div>
                    )}

                    {selectedThread.replies.map((reply) => (
                      <InterestGroupCommentCard
                        key={reply.id}
                        comment={reply}
                        slug={interestGroup.slug}
                        variant="row"
                      />
                    ))}
                  </>
                )
              )}
            </div>

            <InterestGroupCommentInput
              key={selectedThread?.comment.id ?? "new"}
              user={user}
              isMember={isMember}
              placeholder={isNewConversation ? "Start en samtale…" : "Skriv et svar…"}
              ref={commentInputRef}
              autoFocus={isNewConversation}
              className={cn(
                "shrink-0 rounded-none border-0 border-t",
                "border-gray-200 bg-gray-50 hover:bg-gray-100 focus-within:bg-gray-50",
                "dark:border-stone-700 dark:bg-stone-800 dark:hover:bg-stone-700",
                "dark:focus-within:border-stone-600 dark:focus-within:bg-stone-800",
                "max-md:sticky max-md:bottom-0 max-md:z-10"
              )}
              onSubmit={handleCreateComment}
              isPending={createCommentMutation.isPending}
            />
          </>
        )}
      </div>
    </div>
  )
}

const CommentSkeleton = () => {
  return (
    <div className="h-20 animate-pulse border-b border-gray-200 bg-gray-100 dark:border-stone-700 dark:bg-stone-800" />
  )
}

const CommentListSkeleton = () => {
  return (
    <div className="flex flex-col">
      <CommentSkeleton />
      <CommentSkeleton />
      <CommentSkeleton />
    </div>
  )
}
