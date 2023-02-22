import { GetServerSideProps } from "next"
import { Session } from "next-auth"
import { getSession } from "next-auth/react"
import { FC, PropsWithChildren, useState } from "react"
import ProfileMenuContainer from "../organisms/Navbar/components/profile/ProfileMenu/ProfileMenuContainer"
import { ProfileContext } from "../views/ProfileView/context/ProfileContext"

const ProfileLayout: FC<PropsWithChildren> = ({ user, children }) => {
  const [editMode, setEditMode] = useState(false)

  return (
    <div className="m-x-auto max-w-[1000px]">
      <h1>Profil</h1>
      <hr />
      <div className="mt-[42.5px] flex w-full flex-row">
        <ProfileMenuContainer />
        <ProfileContext.Provider value={{ user, editMode, setEditMode }}>
          <div className="mx-5 min-w-[600px]">{children}</div>
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

export default ProfileLayout
