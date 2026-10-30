"use client"

import { useUserQuery } from "@admin/brukere/queries"
import { Avatar, AvatarFallback, AvatarImage, Text } from "@dotkomonline/ui"

export function PersonAvatar({ name, imageUrl }: { name: string | null; imageUrl: string | null }) {
  return (
    <Avatar size="sm">
      {imageUrl && <AvatarImage src={imageUrl} alt="" />}
      <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
    </Avatar>
  )
}

export function SavedRecipientDetails({ userId }: { userId: string }) {
  const { data: user, isLoading } = useUserQuery(userId)

  return (
    <>
      <PersonAvatar name={user?.name ?? null} imageUrl={user?.imageUrl ?? null} />
      <Text className="text-sm">{user?.name ?? (isLoading ? "Laster..." : "Ukjent")}</Text>
    </>
  )
}
