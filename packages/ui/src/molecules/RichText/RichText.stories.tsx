import { useState } from "react"
import { RichText } from "./RichText"

export default {
  title: "RichText",
  component: RichText,
}

export const Default = () => {
  const [content, setContent] = useState(
    "<h2>This is rich text!</h2>\n" + "<p>Content passed here will be safely sanitized and rendered as HTML. </p>"
  )

  return (
    <div>
      <textarea value={content} onChange={(newContent) => setContent(newContent.target.value)} />

      <RichText content={content} />
    </div>
  )
}
