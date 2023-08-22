import React from "react"

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
