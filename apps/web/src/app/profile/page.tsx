import ProfilePoster from "@/components/views/ProfileView"
import { useTRPC } from "@/utils/trpc/client"
import { server } from "@/utils/trpc/server"
import { Button } from "@dotkomonline/ui"
import { useMutation, useQuery } from "@tanstack/react-query"

const ProfilePage = async () => {
  const user = await server.user.getMe.query()

  return (
    <ProfilePoster user={user} />
  )
}

export default ProfilePage
