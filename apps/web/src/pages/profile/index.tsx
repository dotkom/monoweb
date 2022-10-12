import ProfileMenuContainer from "@/components/organisms/Navbar/components/profile/ProfileMenu/ProfileMenuContainer"
import { css, styled, theme } from "@dotkom/ui"
import React from "react"

interface ProfileProps {}

const index: React.FC<ProfileProps> = ({}) => {
  return (
    <Container>
      <Heading>Profil</Heading>
      <HorizontalLine />
      <ProfileMenuContainer />
    </Container>
  )
}

const styles = {
  container: css({
    maxWidth: "1000px",
    margin: "100px auto",
  }),
  heading: css({
    fontSize: theme.fontSizes["3xl"],
    fontWeight: theme.fontWeights.medium,
  }),
  horizontalLine: css({
    border: "0.5px solid",
    borderColor: theme.colors.gray12,
  }),
}

const Container = styled("div", styles.container)
const Heading = styled("h1", styles.heading)
const HorizontalLine = styled("hr", styles.horizontalLine)

export default index
