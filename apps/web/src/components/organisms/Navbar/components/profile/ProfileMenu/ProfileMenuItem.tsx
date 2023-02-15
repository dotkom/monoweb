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

  const [isCurrent, setCurrent] = useState(router.query.slug == slug ? "black" : "gray")

  const handleChange = () => {
    router.push(`/profile/${slug}`)
  }

  // useEffect(() => {
  //   setCurrent(router.query.slug == slug ? styles.textBlack() : styles.textGray())
  // }, [router.query.slug, slug])

  return (
    <div onClick={handleChange}>
      <p className={isCurrent}>{title}</p>
    </div>
  )
}

// const styles = {
//   textBlack: css({
//     color: theme.colors.black,
//   }),
//   textGray: css({
//     color: theme.colors.gray6,
//   }),
//   heading: css({
//     color: theme.colors.gray6,
//     padding: "10px 0px 10px 3px",
//     maxWidth: "150px",
//     "&:hover": {
//       cursor: "pointer",
//     },
//   }),
// }

export default ProfileMenuItem
