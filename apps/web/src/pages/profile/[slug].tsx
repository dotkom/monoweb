import ProfileMenuContainer from "@/components/organisms/Navbar/components/profile/ProfileMenu/ProfileMenuContainer"
import { ProfileContext } from "@/components/views/ProfileView/context/ProfileContext"
import ProfileContentContainer from "@/components/views/ProfileView/ProfileContentContainer"
import { GetServerSideProps } from "next"
import { Session } from "next-auth"
import { getSession } from "next-auth/react"
import React, { useState } from "react"

const index: React.FC = ({ user }) => {
  const [editMode, setEditMode] = useState(false)

  return (
    <div className="m-y-[100px] m-x-auto max-w-[1000px]">
      <h1>Profil</h1>
      <hr />
      <div className="mt-[42.5px] flex w-full flex-row">
        <ProfileMenuContainer />
        <ProfileContext.Provider value={{ user, editMode, setEditMode }}>
          <ProfileContentContainer />
        </ProfileContext.Provider>
      </div>
    </div>
  )
}
export const isAuthenticated = (data: Session | null) => {
  return data != null && data?.user.id
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx)
  return {
    props: {
      user: session?.user,
    },
  }
}

export default index
