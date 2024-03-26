import { useSession } from "next-auth/react"
import { getServerSession } from "next-auth"

export default async function App() {
  const auth = await getServerSession();
  return (
    <div>
      <p>Homepage</p>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
    </div>
  )
}