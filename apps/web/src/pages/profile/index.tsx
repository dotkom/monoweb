import { useRouter } from "next/router"
import { useEffect } from "react"

const ProfileIndex = () => {
  const router = useRouter()

      console.log("hello")

  useEffect(() => {
    router.push("/profile/me")
  }, [router])
}

export default ProfileIndex
