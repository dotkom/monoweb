type PathParams = {
  params: {
    path: string[]
  }
}

export default function CreatePage({ params }: PathParams) {
  const path = params?.path?.join("/")
  return <h1>This is the create page for {path}</h1>
}
