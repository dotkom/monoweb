"use client"

import ProfilePoster from "@/components/views/ProfileView"
import { trpc } from "@/utils/trpc/client"
import { Button } from "@dotkomonline/ui"

const ProfilePage = () => {
  const { data: user } = trpc.user.getMe.useQuery()
  const {
    mutate: refreshMembership,
    data: membership,
  } = trpc.user.refreshMembership.useMutation();

  return (
    <>
      {user && <ProfilePoster user={user} />}
      <Button className="mt-8" onClick={() => refreshMembership()}>
        Oppdater medlemsskap
      </Button>
      <pre>{JSON.stringify(membership, null, 2)}</pre>
      <div className="h-screen" />
    </>
  )
}

export default ProfilePage
