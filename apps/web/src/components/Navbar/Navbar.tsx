import { getAuthenticatedUser } from "@/utils/get-authenticated-user"
import { NavbarContent } from "./NavbarContent"

export type { MenuIcon, MenuItem, MenuLink } from "./NavbarContent"

export async function Navbar() {
  const initialAuthState = await getAuthenticatedUser()

  return <NavbarContent initialAuthState={initialAuthState} />
}
