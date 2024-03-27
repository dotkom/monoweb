import { useSession } from "next-auth/react"
import { Tiptap } from "src/components/tiptap"

type PathParams = {
  params: {
    path: string[]
  }
}

export default function WikiPage({ params }: PathParams) {
  const path = params?.path?.join("/")

  return <>
  <h1>This is the page for {path}</h1>
  <Tiptap access={true} json=''/>
  </>

}
