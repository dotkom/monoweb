import type { NextPage } from "next"
import type { Session } from "next-auth"

const ProfilePoster: NextPage<{ user: Session["user"] }> = ({ user }) => {
  return <div className="w-full p-3 mt-3 flex justify-center border-2 rounded-lg">ProfilePoster</div>
}

export default ProfilePoster
