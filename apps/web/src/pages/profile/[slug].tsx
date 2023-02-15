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
    <Container>
      <Heading>Profil</Heading>
      <HorizontalLine />
      <ContentWrapper>
        <ProfileMenuContainer />
        <ProfileContext.Provider value={{ user, editMode, setEditMode }}>
          <ProfileContentContainer />
        </ProfileContext.Provider>
      </ContentWrapper>
    </Container>
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

// const styles = {
//   container: css({
//     maxWidth: "1000px",
//     margin: "100px auto",
//   }),
//   heading: css({
//     fontSize: theme.fontSizes["3xl"],
//     fontWeight: theme.fontWeights.medium,
//     color: "$black",
//   }),
//   horizontalLine: css({
//     border: "0.5px solid",
//     borderColor: theme.colors.gray12,
//   }),
//   contentWrapper: css({
//     display: "flex",
//     flexDirection: "row",
//     width: "100%",
//     marginTop: "42.5px",
//   }),
// }
//
// const Container = styled("div", styles.container)
// const Heading = styled("h1", styles.heading)
// const HorizontalLine = styled("hr", styles.horizontalLine)
// const ContentWrapper = styled("div", styles.contentWrapper)

export default index
