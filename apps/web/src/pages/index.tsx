import React from "react"
import { useSession } from "next-auth/react"
import { OnlineCompanySplash } from "@/components/organisms/OnlineCompanySplash/OnlineCompanySplash"
import { EventsPane } from "@/components/organisms/EventsPane"

const Home: React.FC = () => {
  const auth = useSession()

  return (
    <div>
      {auth.status === "unauthenticated" && <OnlineCompanySplash />}
      <EventsPane />
    </div>
  )
}

export default Home
