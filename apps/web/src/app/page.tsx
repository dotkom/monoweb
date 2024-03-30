import { getServerClient } from "@/utils/trpc/serverClient"
import { getServerSession } from "next-auth"

export default async function App() {
  const serverClient = await getServerClient();
  const events = await serverClient.event.all();
  const auth = await getServerSession();

  return (
    <div>
      <h1>Auth:</h1>
      <pre>{JSON.stringify(auth, null, 4)}</pre>
      <h1>Events:</h1>
      <pre>{JSON.stringify(events, null, 4)}</pre>
    </div>
  )
}