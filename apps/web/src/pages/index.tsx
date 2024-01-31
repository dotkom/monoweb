import React from "react"
import { useSession } from "next-auth/react"
import ImageCarousel from "@/components/molecules/ImageCarousel/ImageCarousel"

const Home: React.FC = () => {
  const auth = useSession()
  return (
    <div>
      <p>Homepage</p>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
      <ImageCarousel images="hei" />
      hei
    </div>
  )
}

export default Home
