"use client";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import { FC, useState } from "react";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import clsx from "clsx";
import Toolbar from "./toolbar";

interface TiptapProps {
  json: JSONContent;
  access: boolean;
}

export const Tiptap: FC<TiptapProps> = ({ json, access }) => {
  const extensions = [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.configure(),
    StarterKit.configure({}),
  ];

  const editor = useEditor({
    extensions: extensions,
    editorProps: {

      attributes: {
        class:
        clsx(
            //general styling for the editor
            "prose prose-xl max-w-none rounded-lg border-2 border-slate-5 p-4",
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
            "prose-code:pl-4 prose-code:pr-4 prose-code:bg-slate-1 prose-code:text-slate-11 prose-code:rounded-lg",
            //styling for inline code
            "prose-code-inline:bg-slate-1 prose-code-inline:text-slate-11 prose-code-inline:rounded-lg",
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
  });

  const [text, setText] = useState<JSONContent>();

  const handleSubmit = () => {
    //Add posting of data here

    console.log(editor?.getJSON());
    setText(editor?.getJSON());
  };

  if (!editor) {
    return null;
  }
  return (
    <>
        <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <button
        type="submit"
        className="bg-blue-9 my-3 px-6 py-2 text-white rounded-lg"
        onClick={() => handleSubmit()}
      >
        Submit
      </button>
    </>
  );
};
