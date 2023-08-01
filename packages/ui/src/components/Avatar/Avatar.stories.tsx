import { Avatar, AvatarFallback, AvatarImage } from "./Avatar"

export default {
  title: "Avatar",
  component: Avatar,
}

export function AvatarDemo() {
  return (
    <Avatar>
      <AvatarImage
        src="https://www.nicepng.com/png/detail/9-92047_pickle-rick-transparent-rick-and-morty-pickle-rick.png"
        alt="@rick"
      />
      <AvatarFallback>PR</AvatarFallback>
    </Avatar>
  )
}
