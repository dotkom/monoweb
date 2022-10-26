import { css, theme } from "@dotkomonline/ui"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"

interface ProfileMenuItemProps {
  menuItem: {
    title: string
    slug: string
  }
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ menuItem }) => {
  const router = useRouter()

  const { title, slug } = menuItem

  const [isCurrent, setCurrent] = useState(router.query.slug == slug ? styles.textBlack() : styles.textGray())

  const handleChange = () => {
    router.push(`/profile/${slug}`)
  }

  useEffect(() => {
    setCurrent(router.query.slug == slug ? styles.textBlack() : styles.textGray())
  }, [router.query.slug, slug])

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
