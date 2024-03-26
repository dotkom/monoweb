import { Editor } from "@tiptap/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Modal = ({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: any;
}) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  return (
    <div>
      {showModal ? (
        // Overlay with backdrop
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex justify-center items-center">
          <div className="bg-[#FFFFFF] rounded-lg shadow-xl p-5 m-4 max-w-md max-h-full overflow-y-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-semibold">New Page</h1>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setTitle(e.target.value)}
              />
              <button
                className="mt-4 px-4 py-2 bg-blue-9 text-white rounded-md hover:bg-blue-63"
                onClick={() => {
                  setShowModal(false);
                  router.push(`/wiki/${title}`);
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Toolbar = ({ editor }: { editor: Editor }) => {
  const [showModal, setShowModal] = useState(false);
  return (
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
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
      >
        clear marks
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().clearNodes().run()}
      >
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
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        horizontal rule
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHardBreak().run()}
      >
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
        className={
          editor.isActive("textStyle", { color: "#958DF1" }) ? "font-bold" : ""
        }
      >
        purple
      </button>
      <button type="button" onClick={() => setShowModal(true)}>
        New Page
      </button>
      <Modal showModal={showModal} setShowModal={setShowModal} />
    </div>
  );
};

export default Toolbar;
