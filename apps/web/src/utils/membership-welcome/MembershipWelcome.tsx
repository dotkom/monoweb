import { hasWelcomeCookie } from "./cookie"
import { MembershipWelcomeCard } from "./MembershipWelcomeCard"

export async function MembershipWelcome() {
  const shouldWelcome = await hasWelcomeCookie()

  return <MembershipWelcomeCard initialVisible={shouldWelcome} />
}
