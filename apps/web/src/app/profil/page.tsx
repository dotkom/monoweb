import { auth } from "@/auth"
import { server } from "@/utils/trpc/server"
import { Text } from "@dotkomonline/ui"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await auth.getServerSession()

  if (session === null) {
    redirect("/")
  }

  const user = await server.user.getMe.query()

  return (
    <section className="flex flex-col gap-8 w-full">
      <div className="flex flex-col">
        <Text>address: {user.address}</Text>
        <Text>allergies: {user.allergies}</Text>
        <Text>biography: {user.biography}</Text>
        <Text>compiled: {user.compiled}</Text>
        <Text>displayName: {user.displayName}</Text>
        <Text>email: {user.email}</Text>
        <Text>flags: {user.flags}</Text>
        <Text>gender: {user.gender}</Text>
        <Text>image: {user.image}</Text>
        <Text>membership: {JSON.stringify(user.membership, null, 2)}</Text>
        <Text>phone: {user.phone}</Text>
        <Text>rfid: {user.rfid}</Text>
      </div>

      <div>ed</div>
    </section>
  )
}
