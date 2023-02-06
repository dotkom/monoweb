import { Avatar, AvatarFallback, AvatarImage, Button, cn, Icon } from "@dotkomonline/ui"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { navigationMenuTriggerStyle } from "./NavigationMenu"

export const ProfileMenu = () => {
  const router = useRouter()
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <Icon icon="tabler:loader-2" className="animate-spin" />
  }

  if (status === "unauthenticated") {
    return (
      <>
        <Button
          variant="subtle"
          className={cn(navigationMenuTriggerStyle(), "hover:translate-y-0 active:translate-y-0")}
          onClick={() => signIn("onlineweb")}
        >
          Log in
        </Button>
        <Button
          variant="gradient"
          className={cn(navigationMenuTriggerStyle(), "ml-3 hover:translate-y-0 active:translate-y-0")}
          onClick={() => router.push("/auth/signup")}
        >
          Sign up
        </Button>
      </>
    )
  }

  return (
    <div>
      <Avatar>
        <AvatarImage
          src="https://www.nicepng.com/png/detail/9-92047_pickle-rick-transparent-rick-and-morty-pickle-rick.png"
          alt="@rick"
        />
        <AvatarFallback>PR</AvatarFallback>
      </Avatar>
    </div>
  )
}
