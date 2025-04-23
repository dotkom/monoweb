"use client"

import {
  MDXEditor,
  frontmatterPlugin,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  thematicBreakPlugin,
} from "@mdxeditor/editor"

export function EventDescription({ description }: { description: string }) {
  return (
    <div className="prose prose-headings:font-fraunces prose-headings:font-bold prose-headings:text-slate-12 dark:prose-headings:text-slate-1">
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
          markdownShortcutPlugin(),
        ]}
      />
    </div>
  )
}
