"use client"

import {
  MDXEditor,
  frontmatterPlugin,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  thematicBreakPlugin,
} from "@mdxeditor/editor"

export default function EventDescription({ description }: { description: string }) {
  return (
    <MDXEditor
      readOnly
      markdown={description}
      plugins={[
        listsPlugin(),
        headingsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        thematicBreakPlugin(),
        frontmatterPlugin(),
      ]}
    />
  )
}
