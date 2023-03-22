import React from "react"
import { useAuth } from "@clerk/nextjs"

const Home: React.FC = () => {
  const auth = useAuth()
  return (
    <div>
      <p>Homepage</p>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
    </div>
  )
}

export default Home
