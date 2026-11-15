"use client"

import { Link } from "@/components/link"
import { useTRPC } from "@/utils/trpc/client"
import { useFullPathname } from "@/utils/use-full-pathname"
import { getInterestGroupCommentsUrl, type Group, type InterestGroupComment } from "@dotkomonline/rpc/group"
import type { User } from "@dotkomonline/rpc/user"
import { Button, Text, Title } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
  buildCommentThreads,
  getThreadLastActivityDate,
  sortCommentThreadsByRecentActivity,
} from "./interest-group-comment-utils"
import { InterestGroupCommentCard } from "./InterestGroupCommentCard"
import { InterestGroupCommentInput } from "./InterestGroupCommentInput"

const PREVIEW_COUNT = 3

interface Props {
  interestGroup: Group
  comments: InterestGroupComment[]
  user?: User
  isMember: boolean
  onJoin: () => void
}

export const InterestGroupCommentSection = ({ interestGroup, comments, user, isMember, onJoin }: Props) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const fullPathname = useFullPathname()

  const [isCreatePending, setIsCreatePending] = useState(false)

  const threads = sortCommentThreadsByRecentActivity(buildCommentThreads(comments))
  const threadsToShow = threads.slice(0, PREVIEW_COUNT)

  const create = useMutation(
    trpc.group.createInterestGroupComment.mutationOptions({
      onMutate: () => {
        setIsCreatePending(true)
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.group.findManyInterestGroupComments.queryKey(interestGroup.slug),
        })
      },
      onSettled: () => {
        setIsCreatePending(false)
      },
    })
  )

  const handleCreateComment = async (body: string) => {
    await create.mutateAsync({
      interestGroupId: interestGroup.slug,
      data: {
        body,
      },
    })
  }

  if (user === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <Title>Samtaler</Title>
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 dark:border-stone-700 dark:bg-stone-850">
          <Text className="text-sm text-muted-foreground font-medium">Logg inn for å se og delta i samtaler</Text>
          <Button
            element={Link}
            href={createAuthorizeUrl({ returnTo: fullPathname })}
            size="sm"
            variant="default"
            onClick={onJoin}
          >
            Logg inn
          </Button>
        </div>
      </div>
    )
  }

  const allConversationsLabel = threads.length === 1 ? "Se alle samtaler (1)" : `Se alle samtaler (${threads.length})`

  return (
    <div className="flex flex-col gap-4">
      <Title>Samtaler</Title>
      <InterestGroupCommentInput
        user={user}
        isMember={isMember}
        onSubmit={handleCreateComment}
        isPending={isCreatePending}
      />

      {threadsToShow.length === 0 ? (
        <Text className="text-muted-foreground">Ingen samtaler ennå. Start den første!</Text>
      ) : (
        <div className="flex flex-col gap-2">
          {threadsToShow.map((thread) => (
            <InterestGroupCommentCard
              key={thread.comment.id}
              comment={thread.comment}
              slug={interestGroup.slug}
              replyCount={thread.replies.length}
              date={getThreadLastActivityDate(thread)}
              href={getInterestGroupCommentsUrl(interestGroup.slug, thread.comment.id)}
              bodyClassName="line-clamp-2"
            />
          ))}
        </div>
      )}

      {threads.length > threadsToShow.length && (
        <Button
          element={Link}
          href={getInterestGroupCommentsUrl(interestGroup.slug)}
          variant="outline"
          className="w-fit"
        >
          {allConversationsLabel}
        </Button>
      )}
    </div>
  )
}
