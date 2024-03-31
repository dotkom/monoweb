"use client"

import { useEditor, EditorContent, JSONContent } from "@tiptap/react"
import { FC, useState } from "react"
import { Color } from "@tiptap/extension-color"
import ListItem from "@tiptap/extension-list-item"
import TextStyle from "@tiptap/extension-text-style"
import Link from "@tiptap/extension-link"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import React from "react"
import clsx from "clsx"
import Toolbar from "./toolbar"
import { getArticle } from "src/hooks/get-article"
import { usePathname } from "next/navigation"
import { updateArticleContent } from "src/hooks/update-article-content"

interface TiptapProps {
  json: JSONContent | string
  access: boolean
  updateContent?: { func: typeof updateArticleContent; id: string }
}

export const Tiptap: FC<TiptapProps> = ({ json, access, updateContent }) => {
  const extensions = [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.configure(),
    StarterKit.configure({}),
    Image.configure({
      inline: true,
      allowBase64: true,
    }),
    Link.configure({
      protocols: ["ftp", "mailto"],
    }),
  ]

  const editor = useEditor({
    extensions: [...extensions],
    editorProps: {
      attributes: {
        class: clsx(
          //general styling for the editor
          "prose prose-slate prose-xl max-w-none rounded-lg border-2 border-slate-5 p-4",
          //styling for list items
          "prose-ul:pl-4 prose-ul:list-disc prose-ol:pl-4 prose-ol:list-decimal",
          //styling for headings
          "prose-h1:text-5xl prose-h1:font-bold",
          "prose-h2:text-3xl prose-h2:font-semibold",
          "prose-h3:text-2xl prose-h3:font-medium",
          "prose-h4:text-xl prose-h4:font-normal",
          "prose-h5:text-lg prose-h5:font-normal",
          "prose-h6:text-base prose-h6:font-normal",
          //styling for blockquotes
          "prose-blockquote:pl-4 prose-blockquote:border-l prose-blockquote:border-slate-5 prose-blockquote:text-slate-11",
          //styling for code blocks
          "prose-code:text-slate-5 prose-code:rounded-lg",
          //styling for inline code
          " prose-code-inline:text-slate-5 prose-code-inline:rounded-lg",
          //styling for horizontal rules
          "prose-hr:border-t prose-hr:border-slate-5 prose-hr:my-4",
          //styling for links
          "prose-a:text-blue-9 prose-a:underline prose-a:hover:no-underline",
          //styling for images
          "prose-img:rounded-lg prose-img:my-4 prose-img:shadow-lg",

          {
            "prose-h-96": !access,
          }
        ),
      },
    },
    content: json,
    editable: access,
  })

  const handleSubmit = () => {
    if (updateContent) {
      updateContent.func(updateContent.id, JSON.stringify(editor?.getJSON()))
    }
  }

  if (!editor) {
    return null
  }
  return (
    <div className="flex flex-col gap-3">
      {access && <Toolbar editor={editor} handleSubmit={handleSubmit} />}
      <EditorContent editor={editor} />
      {access && (
        <button
          type="submit"
          className="bg-blue-10 my-3 py-4 text-[#FFF] rounded-lg flex  w-full justify-center hover:bg-blue-9"
          onClick={() => handleSubmit()}
        >
          Submit
        </button>
      )}
    </div>
  )
}
