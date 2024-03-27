import { Editor } from "@tiptap/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const Modal = ({
  showModal,
  setShowModal,
  editor,
}: {
  showModal: boolean;
  setShowModal: any;
  editor: Editor;
}) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const pathname  = usePathname();
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
                Go to new page
              </button>
              <button
                className="mt-4 px-4 py-2 bg-blue-9 text-white rounded-md hover:bg-blue-63"
                onClick={() => {
                  setShowModal(false);
                  // make new page in db and add link to current page
                
                  editor.commands.insertContent('<a href="/wiki/' + title + '">' + title + '</a>');
                  
                }}
              >
                Continue writing
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Modal;
