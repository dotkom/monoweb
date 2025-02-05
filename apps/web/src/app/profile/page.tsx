"use client"

import ProfilePoster from "@/components/views/ProfileView"
import { useTRPC } from "@/utils/trpc/client"
import { Button } from "@dotkomonline/ui"
import {useMutation} from "@tanstack/react-query";

const ProfilePage = () => {
  const trpc = useTRPC();
  const { data: user } = useQuery(trpc.user.getMe.queryOptions())
  const { mutate: refreshMembership, isLoading, data: membership } = useMutation(trpc.user.refreshMembership.mutationOptions())

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
