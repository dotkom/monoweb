import { Tiptap } from "src/components/tiptap"
import { getArticle } from "src/hooks/get-article"
import { core } from "src/server/core"

type PathParams = {
  params: {
    path: string[]
  }
}

export default async function WikiPage({ params }: PathParams) {
  const path = params?.path?.join("/")
  const article = getArticle(path)
  return <>
  <h1>This is the page for {path}</h1>
  <Tiptap access={true} json=''/>
  {path ? article : null}
  </>

}
