import { styled, theme, css } from "@dotkom/ui"
import { useRouter } from "next/router"
import React from "react"

interface ProfileMenuItemProps {
  item: {
    title: string
    link: string
  }
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ item: { title, link } }) => {
  const router = useRouter()

  const isCurrent = router.pathname == link ? styles.textBlack() : ""

  return <div className={`${isCurrent} ${styles.heading()}`}>{title}</div>
}

const styles = {
  textBlack: css({
    color: theme.colors.black,
  }),
  heading: css({
    color: theme.colors.gray6,
    padding: "10px 0 10px 3px",
  }),
}

export default ProfileMenuItem
