import { Editor } from "@tiptap/react"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { getArticleBySlug } from "src/hooks/get-article-by-slug"
import { createArticle } from "src/hooks/create-article"

const Modal = ({
  showModal,
  setShowModal,
  editor,
  handleSubmit,
}: {
  showModal: boolean
  setShowModal: (value: boolean) => void
  editor: Editor
  handleSubmit: () => void
}) => {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const pathname = usePathname()
  const [slug, setSlug] = useState(`${pathname}/`)
  const [showSlugWarning, setShowSlugWarning] = useState(false)

  if (pathname === null) {
    return null
  }

  function parseTitleToSlug(value: string) {
    return `${pathname}/${value.toLowerCase().replace(/ /g, "-")}`
  }

  function parseSlug(value: string) {
    if (value.startsWith(`${pathname}/` || "")) {
      return value.toLowerCase().replace(/ /g, "-")
    }
    return `${pathname}/`
  }

  return (
    <div>
      {showModal ? (
        // Overlay with backdrop
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex justify-center items-center">
          <div className="bg-[#FFFFFF] rounded-lg shadow-xl p-5 m-4 max-w-md max-h-full overflow-y-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-semibold">New Page</h1>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 rounded-md hover:bg-gray-100">
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 flex flex-col w-96 gap-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  setTitle(e.target.value)
                  setSlug(parseTitleToSlug(e.target.value))
                  setShowSlugWarning(false)
                }}
              />
              <input
                type="text"
                placeholder={slug}
                value={slug}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  setSlug(parseSlug(e.target.value))
                  setShowSlugWarning(false)
                }}
              />
              {showSlugWarning ? <p className="text-red-10 text-sm">A page with this slug already exists</p> : null}
              <button
                className="mt-4 px-4 py-2 bg-blue-9 text-white rounded-md hover:bg-blue-63"
                type="submit"
                onClick={async () => {
                  if (await getArticleBySlug(slug)) {
                    setShowSlugWarning(true)
                    return
                  }
                  setShowModal(false)
                  await createArticle({
                    Title: title,
                    Slug: slug,
                    ParentId: "<root>",
                  })
                  handleSubmit()
                  router.push(`${slug}`)
                }}
              >
                Go to new page
              </button>
              <button
                className="mt-4 px-4 py-2 bg-blue-9 text-white rounded-md hover:bg-blue-63"
                type="submit"
                onClick={async () => {
                  if (await getArticleBySlug(slug)) {
                    setShowSlugWarning(true)
                    return
                  }
                  setShowModal(false)
                  createArticle({
                    Title: title,
                    Slug: slug,
                    ParentId: "<root>",
                  })
                  handleSubmit()
                  editor.commands.insertContent(`<a href="${slug}">${title}</a>`)
                }}
              >
                Continue writing
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default Modal
