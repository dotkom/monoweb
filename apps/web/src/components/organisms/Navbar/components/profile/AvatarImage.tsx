import { styled } from "@stitches/react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { css } from "@theme"

const AvatarImage = () => (
  <Avatar>
    <Image
      alt="Colm Tuite"
      src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dXNlcnxlbnwwfHwwfHw%3D&w=1000&q=80"
    />
    <Fallback delayMs={500}>CT</Fallback>
  </Avatar>
)

const styles = {
  avatar: css({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    verticalAlign: "middle",
    overflow: "hidden",
    userSelect: "none",
    width: 40,
    height: 40,
    borderRadius: "100%",
    transition: "all 0.5s",
    "&:hover": {
      transform: "scale(1.1)",
    },
  }),
  image: css({
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "inherit",
  }),
  fallback: css({
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "$blue3",
    "&:hover": {
      backgroundColor: "$blue5",
    },
    color: "white",
    fontSize: 15,
    lineHeight: 1,
    fontWeight: 500,
  }),
}

const Avatar = styled(AvatarPrimitive.Root, styles.avatar)

const Image = styled(AvatarPrimitive.Image, styles.image)

const Fallback = styled(AvatarPrimitive.Fallback, styles.fallback)

export default AvatarImage
