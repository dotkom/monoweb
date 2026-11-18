import type { InterestGroupComment } from "@dotkomonline/rpc/group"
import { compareAsc, compareDesc } from "date-fns"

export type CommentThread = {
  comment: InterestGroupComment
  replies: InterestGroupComment[]
}

export function buildCommentThreads(comments: InterestGroupComment[]): CommentThread[] {
  const parentComments = comments.filter((c) => c.parentId === null)

  return parentComments.map((comment) => ({
    comment,
    replies: comments
      .filter((reply) => reply.parentId === comment.id)
      .toSorted((left, right) => compareAsc(left.createdAt, right.createdAt)),
  }))
}

export function getThreadLastActivityDate(thread: CommentThread): Date {
  return thread.replies.at(-1)?.createdAt ?? thread.comment.createdAt
}

export function sortCommentThreadsByRecentActivity(threads: CommentThread[]): CommentThread[] {
  return threads.toSorted((left, right) =>
    compareDesc(getThreadLastActivityDate(left), getThreadLastActivityDate(right))
  )
}
