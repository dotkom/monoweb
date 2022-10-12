import { styled, theme, css } from "@dotkom/ui"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

interface ProfileMenuItemProps {
  title: string
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ title }) => {
  const router = useRouter()
  const [isCurrent, setCurrent] = useState(router.query.state == title ? styles.textBlack() : styles.textGray())

  const handleChange = () => {
    router.query.state = title
    router.push(router)
  }
  console.log(router.query.state)
  useEffect(() => {
    setCurrent(router.query.state == title ? styles.textBlack() : styles.textGray())
  }, [router.query.state])

  return (
    <div className={styles.heading()} onClick={handleChange}>
      <p className={isCurrent}>{title}</p>
    </div>
  )
}

const styles = {
  textBlack: css({
    color: theme.colors.black,
  }),
  textGray: css({
    color: theme.colors.gray6,
  }),
  heading: css({
    color: theme.colors.gray6,
    padding: "0px 0px 5px 3px",
    "&:hover": {
      cursor: "pointer",
    },
  }),
}

export default ProfileMenuItem
