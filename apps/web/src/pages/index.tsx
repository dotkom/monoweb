import React, { useEffect } from "react"
import { useSession } from "next-auth/react"
import ImageCarousel from "@/components/molecules/ImageCarousel/ImageCarousel"
import { trpc } from "@/utils/trpc"

const Home: React.FC = () => {
  const { data: offlines = [], ...query } = trpc.offline.all.useQuery({ take: 999 })
  const auth = useSession()
  const offlinePdfs = offlines.map((pdfs) => pdfs.fileUrl)
  const offlineImgs = offlines.map((imgs) => imgs.imageUrl)

  return (
    <div>
      <p>Homepage</p>
      <pre>{JSON.stringify(auth, null, 2)}</pre>
      <ImageCarousel images={offlineImgs} pdfs={offlinePdfs} />
    </div>
  )
}

export default Home
