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

export function EventDescription({ description }: { description: string }) {
  return (
    <MDXEditor
      trim
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
