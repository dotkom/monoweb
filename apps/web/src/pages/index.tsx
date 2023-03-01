import { useSession } from "next-auth/react"
import React from "react"

const Home: React.FC = () => {
  const { data } = useSession()
  return (
    <div>
      <p>Homepage</p>
      <pre>{JSON.stringify(data)}</pre>
    </div>
  )
}

export default Home
