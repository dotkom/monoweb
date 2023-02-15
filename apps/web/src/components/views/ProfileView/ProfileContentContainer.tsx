import { profileItems } from "@/utils/profileLinks"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

const ProfileContentContainer = () => {
  const [name, setName] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (typeof router.query.slug === "string") {
      setName(router.query.slug)
    }
  }, [router.query.slug])

  const page = profileItems.find((page) => page.slug === name)

  if (!page) return <>No page found</>

  return <div className="mx-5 min-w-[600px]">{page?.component}</div>
}

export default ProfileContentContainer
