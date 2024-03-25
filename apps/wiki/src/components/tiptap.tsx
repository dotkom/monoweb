"use client"

import { useEditor, EditorContent, JSONContent } from "@tiptap/react"
import { FC, useState } from "react"
import { Color } from "@tiptap/extension-color"
import ListItem from "@tiptap/extension-list-item"
import TextStyle from "@tiptap/extension-text-style"
import StarterKit from "@tiptap/starter-kit"
import React from "react"

interface TiptapProps {
  json: JSONContent
  access: boolean
}

export const Tiptap: FC<TiptapProps> = ({ json, access }) => {
  const extensions = [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.configure({ types: [ListItem.name] }),
    StarterKit.configure({}),
  ]

  const editor = useEditor({
    extensions: extensions,
    editorProps: {
      attributes: {
        class:
          "prose-h-96 max-w-none rounded-lg border-2 border-slate-5 p-4 prose-ul:pl-4 prose-ul:list-disc prose-ol:pl-4 prose-ol:list-decimal",
      },
    },
    content: json,
    editable: access,
  })

  const [text, setText] = useState<JSONContent>()

  const handleSubmit = () => {
    //Add posting of data here

    console.log(editor?.getJSON())
    setText(editor?.getJSON())
  }

  if (!editor) {
    return null
  }
  return (
    <>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "font-bold" : ""}
        >
          bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "font-bold" : ""}
        >
          italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "font-bold" : ""}
        >
          strike
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "font-bold" : ""}
        >
          code
        </button>
        <button type="button" onClick={() => editor.chain().focus().unsetAllMarks().run()}>
          clear marks
        </button>
        <button type="button" onClick={() => editor.chain().focus().clearNodes().run()}>
          clear nodes
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive("paragraph") ? "font-bold" : ""}
        >
          paragraph
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "font-bold" : ""}
        >
          h1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "font-bold" : ""}
        >
          h2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? "font-bold" : ""}
        >
          h3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editor.isActive("heading", { level: 4 }) ? "font-bold" : ""}
        >
          h4
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editor.isActive("heading", { level: 5 }) ? "font-bold" : ""}
        >
          h5
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={editor.isActive("heading", { level: 6 }) ? "font-bold" : ""}
        >
          h6
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "font-bold" : ""}
        >
          bullet list
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "font-bold" : ""}
        >
          ordered list
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "font-bold" : ""}
        >
          code block
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "font-bold" : ""}
        >
          blockquote
        </button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          horizontal rule
        </button>
        <button type="button" onClick={() => editor.chain().focus().setHardBreak().run()}>
          hard break
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          undo
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          redo
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setColor("#958DF1").run()}
          className={editor.isActive("textStyle", { color: "#958DF1" }) ? "font-bold" : ""}
        >
          purple
        </button>
      </div>
      <EditorContent editor={editor} />
      <button type="submit" className="bg-blue-9 my-3 px-6 py-2 text-white rounded-lg" onClick={() => handleSubmit()}>
        Submit
      </button>
    </>
  )
}
