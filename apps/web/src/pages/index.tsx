import React from "react"
import { useSession } from "next-auth/react"
import ImageCarousel from "@/components/molecules/ImageCarousel/ImageCarousel"

const Home: React.FC = () => {
  const auth = useSession()
  return (
    <div>
      <p>Homepage</p>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
      <ImageCarousel images={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]} />
    </div>
  )
}

export default Home
