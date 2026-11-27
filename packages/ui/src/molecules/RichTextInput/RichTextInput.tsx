"use client"

import { Separator } from "#components/separator"
import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconBold,
  IconClearFormatting,
  IconCode,
  IconCodeblock,
  IconH2,
  IconH3,
  IconH4,
  IconItalic,
  IconLink,
  IconList,
  IconListNumbers,
  IconPhotoPlus,
  IconSeparator,
  IconStrikethrough,
  IconUnderline,
  IconUnlink,
} from "@tabler/icons-react"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { Button } from "../../atoms/Button/Button"
import { Checkbox } from "../../atoms/Checkbox/Checkbox"
import { TextInput } from "../../atoms/Input/TextInput"
import { Popover, PopoverContent, PopoverTrigger } from "../../atoms/Popover/Popover"
import { cn } from "../../utils"
import { ImageUploadModal } from "../ImageUploadModal/ImageUploadModal"
import { richTextInputClasses, richTextSharedClasses } from "../RichText/rich-text-classes"
import "./tiptap-image-styling.css"

const DEFAULT_IMAGE_WIDTH_IN_PIXELS = 710

export type RichTextInputProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  isEmail?: boolean
  onFileUpload?: (file: File) => Promise<string>
}

function ToolbarControl({
  "aria-label": ariaLabel,
  title,
  active,
  disabled,
  onClick,
  children,
}: {
  "aria-label": string
  title: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="size-8 shrink-0 p-0 aria-pressed:bg-muted"
      aria-label={ariaLabel}
      aria-pressed={active}
      title={title}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={(event) => event.preventDefault()}
    >
      {children}
    </Button>
  )
}

function ToolbarSeparator() {
  return <Separator orientation="vertical" className="mx-0 h-6 self-center" />
}

function EditorToolbar({
  editor,
  isEmail,
  onInsertImage,
}: {
  editor: Editor
  isEmail: boolean
  onInsertImage?: () => void
}) {
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBoldActive: editor.isActive("bold"),
      isItalicActive: editor.isActive("italic"),
      isUnderlineActive: editor.isActive("underline"),
      isStrikethroughActive: editor.isActive("strike"),
      isInlineCodeActive: editor.isActive("code"),
      isCodeBlockActive: editor.isActive("codeBlock"),
      isHeadingTwoActive: editor.isActive("heading", { level: 2 }),
      isHeadingThreeActive: editor.isActive("heading", { level: 3 }),
      isHeadingFourActive: editor.isActive("heading", { level: 4 }),
      isBulletListActive: editor.isActive("bulletList"),
      isOrderedListActive: editor.isActive("orderedList"),
    }),
  })

  return (
    <div className="sticky top-[var(--rich-text-toolbar-top,0px)] z-10 flex flex-wrap items-center gap-0.5 border-b border-field-border bg-background p-1">
      <ToolbarControl
        aria-label="Undo"
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <IconArrowBackUp className="size-5" />
      </ToolbarControl>
      <ToolbarControl
        aria-label="Redo"
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <IconArrowForwardUp className="size-5" />
      </ToolbarControl>
      <ToolbarControl
        aria-label="Clear formatting"
        title="Clear formatting"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
      >
        <IconClearFormatting className="size-5" />
      </ToolbarControl>

      <ToolbarSeparator />

      <ToolbarControl
        aria-label="Bold"
        title="Bold"
        active={toolbarState.isBoldActive}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <IconBold className="size-5" />
      </ToolbarControl>
      <ToolbarControl
        aria-label="Italic"
        title="Italic"
        active={toolbarState.isItalicActive}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <IconItalic className="size-5" />
      </ToolbarControl>
      <ToolbarControl
        aria-label="Underline"
        title="Underline"
        active={toolbarState.isUnderlineActive}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <IconUnderline className="size-5" />
      </ToolbarControl>
      <ToolbarControl
        aria-label="Strikethrough"
        title="Strikethrough"
        active={toolbarState.isStrikethroughActive}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <IconStrikethrough className="size-5" />
      </ToolbarControl>

      <LinkToolbarControl editor={editor} />
      <ToolbarControl
        aria-label="Unlink"
        title="Unlink"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
      >
        <IconUnlink className="size-5" />
      </ToolbarControl>

      <ToolbarSeparator />

      <ToolbarControl
        aria-label="Inline code"
        title="Inline code"
        active={toolbarState.isInlineCodeActive}
        disabled={toolbarState.isCodeBlockActive}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <IconCode aria-hidden="true" className="size-5" />
      </ToolbarControl>
      {!isEmail && (
        <ToolbarControl
          aria-label="Code block"
          title="Code block"
          active={toolbarState.isCodeBlockActive}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <IconCodeblock aria-hidden="true" className="size-5" />
        </ToolbarControl>
      )}

      <ToolbarSeparator />

      <ToolbarControl
        aria-label="Heading 2"
        title="Heading 2"
        active={toolbarState.isHeadingTwoActive}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <IconH2 className="size-5" />
      </ToolbarControl>
      <ToolbarControl
        aria-label="Heading 3"
        title="Heading 3"
        active={toolbarState.isHeadingThreeActive}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <IconH3 className="size-5" />
      </ToolbarControl>
      <ToolbarControl
        aria-label="Heading 4"
        title="Heading 4"
        active={toolbarState.isHeadingFourActive}
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      >
        <IconH4 className="size-5" />
      </ToolbarControl>
      <ToolbarControl
        aria-label="Bullet list"
        title="Bullet list"
        active={toolbarState.isBulletListActive}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <IconList className="size-5" />
      </ToolbarControl>
      <ToolbarControl
        aria-label="Ordered list"
        title="Ordered list"
        active={toolbarState.isOrderedListActive}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <IconListNumbers className="size-5" />
      </ToolbarControl>
      {!isEmail && (
        <ToolbarControl
          aria-label="Horizontal rule"
          title="Horizontal rule"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <IconSeparator className="size-5" />
        </ToolbarControl>
      )}

      {onInsertImage && (
        <>
          <ToolbarSeparator />
          <ToolbarControl aria-label="Insert image" title="Insert image" onClick={onInsertImage}>
            <IconPhotoPlus className="size-5" />
          </ToolbarControl>
        </>
      )}
    </div>
  )
}

export function RichTextInput({
  value,
  onChange,
  disabled = false,
  className,
  onFileUpload,
  isEmail = false,
}: RichTextInputProps) {
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false)
  const editorRef = useRef<Editor | null>(null)
  const imageInsertionSelectionRef = useRef<{ from: number; to: number } | null>(null)

  const editor = useEditor({
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        codeBlock: isEmail ? false : undefined,
        horizontalRule: isEmail ? false : undefined,
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      ...(isEmail
        ? []
        : [
            Image.configure({
              inline: false,
              resize: disabled
                ? { enabled: false }
                : {
                    enabled: true,
                    minWidth: 25,
                    minHeight: 25,
                    alwaysPreserveAspectRatio: true,
                  },
            }),
          ]),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: richTextSharedClasses,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? "" : editor.getHTML())
    },
  })

  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  useEffect(() => {
    editor?.setEditable(!disabled)
  }, [disabled, editor])

  useEffect(() => {
    if (!editor) {
      return
    }

    const currentHtml = editor.getHTML()
    if (value !== currentHtml) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  const openImageUploadModal = () => {
    if (!editor) {
      return
    }

    const { from, to } = editor.state.selection
    imageInsertionSelectionRef.current = { from, to }
    setIsImageUploadModalOpen(true)
  }

  const handleImageModalOpenChange = (open: boolean) => {
    setIsImageUploadModalOpen(open)

    if (!open) {
      imageInsertionSelectionRef.current = null
    }
  }

  const handleImageSubmit = (imageUrl: string, alt: string, title: string | undefined) => {
    const currentEditor = editorRef.current

    if (!currentEditor || currentEditor.isDestroyed) {
      return
    }

    const commandChain = currentEditor.chain()
    const imageInsertionSelection = imageInsertionSelectionRef.current

    if (imageInsertionSelection) {
      commandChain.setTextSelection(imageInsertionSelection)
    }

    commandChain
      .focus()
      .setImage({
        src: imageUrl,
        alt,
        title,
        width: DEFAULT_IMAGE_WIDTH_IN_PIXELS,
      })
      .run()

    imageInsertionSelectionRef.current = null
  }

  if (!editor) {
    return null
  }

  return (
    <div className={cn("overflow-clip rounded-md border border-field-border bg-background", className)}>
      {!disabled && (
        <EditorToolbar
          editor={editor}
          isEmail={isEmail}
          onInsertImage={onFileUpload ? openImageUploadModal : undefined}
        />
      )}
      <EditorContent editor={editor} className={cn(richTextInputClasses, disabled && "opacity-60")} />

      {!isEmail && onFileUpload !== undefined && (
        <ImageUploadModal
          open={isImageUploadModalOpen}
          onOpenChange={handleImageModalOpenChange}
          onSubmit={handleImageSubmit}
          onFileUpload={onFileUpload}
        />
      )}
    </div>
  )
}

function LinkToolbarControl({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const [href, setHref] = useState("")
  const [openInNewTab, setOpenInNewTab] = useState(false)

  const apply = () => {
    const url = href.trim()

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({
          href: url,
          target: openInNewTab ? "_blank" : null,
          rel: openInNewTab ? "noopener noreferrer" : null,
        })
        .run()
    }

    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          const attributes = editor.getAttributes("link")
          setHref(typeof attributes.href === "string" ? attributes.href : "")
          setOpenInNewTab(attributes.target === "_blank")
        }

        setOpen(next)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn("size-8 shrink-0 p-0", editor.isActive("link") && "bg-muted")}
          aria-label="Link"
          title="Link"
          onMouseDown={(event) => event.preventDefault()}
        >
          <IconLink className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-2">
        <TextInput
          label="URL"
          value={href}
          placeholder="https://"
          onChange={(event) => setHref(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              apply()
            }
          }}
        />
        <Checkbox
          id="open-in-new-tab"
          label="Åpne i ny fane"
          checked={openInNewTab}
          onCheckedChange={(checked) => setOpenInNewTab(checked === true)}
        />
        <div className="flex justify-end gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Avbryt
          </Button>
          <Button type="button" variant="default" size="sm" onClick={apply}>
            Lagre
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
