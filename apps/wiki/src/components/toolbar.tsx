import { Editor } from "@tiptap/react";
import { useRef, useState } from "react";
import Modal from "./new-page-modal";
import { Icon } from "@iconify/react";

const Toolbar = ({ editor }: { editor: Editor }) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="flex gap-4 pb-8">
      {/* OUT OF THE BOX FEATURES */}

      <button
        type="button"
        title="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive("bold") ? "font-bold" : ""}
      >
        <Icon icon="tabler:bold" width={24} />
      </button>
      <button
        type="button"
        title="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive("italic") ? "font-bold" : ""}
      >
        <Icon icon="tabler:italic" width={24} />
      </button>
      <button
        type="button"
        title="Strike"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive("strike") ? "font-bold" : ""}
      >
        <Icon icon="tabler:strikethrough" width={24} />
      </button>
      <button
        type="button"
        title="Code"
        onClick={() => editor.chain().focus().toggleCode().run()}
        disabled={!editor.can().chain().focus().toggleCode().run()}
        className={editor.isActive("code") ? "font-bold" : ""}
      >
        <Icon icon="tabler:code" width={24} />
      </button>

      <button
        type="button"
        title="Clear Formatting"
        onClick={() => {
          editor.chain().focus().unsetAllMarks().run(),
            editor.chain().focus().clearNodes().run();
        }}
      >
        <Icon icon="tabler:clear-formatting" width={24} />
      </button>
      <button
        type="button"
        title="Paragraph"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={editor.isActive("paragraph") ? "font-bold" : ""}
      >
        P
      </button>
      <button
        type="button"
        title="Heading 1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive("heading", { level: 1 }) ? "font-bold" : ""}
      >
        H1
      </button>
      <button
        type="button"
        title="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive("heading", { level: 2 }) ? "font-bold" : ""}
      >
        H2
      </button>
      <button
        type="button"
        title="Heading 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive("heading", { level: 3 }) ? "font-bold" : ""}
      >
        H3
      </button>
      <button
        type="button"
        title="Heading 4"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={editor.isActive("heading", { level: 4 }) ? "font-bold" : ""}
      >
        H4
      </button>
      <button
        type="button"
        title="Heading 5"
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={editor.isActive("heading", { level: 5 }) ? "font-bold" : ""}
      >
        H5
      </button>
      <button
        type="button"
        title="Heading 6"
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={editor.isActive("heading", { level: 6 }) ? "font-bold" : ""}
      >
        H6
      </button>
      <button
        type="button"
        title="Bullet List"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive("bulletList") ? "font-bold" : ""}
      >
        <Icon icon="gravity-ui:list-ul" width={24} />
      </button>
      <button
        type="button"
        title="Ordered List"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "font-bold" : ""}
      >
        <Icon icon="gravity-ui:list-ol" width={24} />
      </button>
      <button
        type="button"
        title="Code Block"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive("codeBlock") ? "font-bold" : ""}
      >
        <Icon icon="tabler:code-plus" width={24} />
      </button>
      <button
        type="button"
        title="Blockquote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive("blockquote") ? "font-bold" : ""}
      >
        <Icon icon="tabler:blockquote" width={24} />
      </button>
      <button
        type="button"
        title="Horizontal Rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Icon icon="material-symbols:horizontal-rule" width={24} />
      </button>
      <button
        type="button"
        title="Hard Break"
        onClick={() => editor.chain().focus().setHardBreak().run()}
      >
        <Icon icon="tabler:page-break" width={24} />
      </button>
      <button
        type="button"
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <Icon icon="material-symbols:undo" width={24} />
      </button>
      <button
        type="button"
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <Icon icon="material-symbols:redo" width={24} />
      </button>
      <button type="button" onClick={() => setShowModal(true)}>
        New Page
      </button>
      <div className="relative">
        <Modal
          showModal={showModal}
          setShowModal={setShowModal}
          editor={editor}
        />
      </div>
    </div>
  );
};

export default Toolbar;
