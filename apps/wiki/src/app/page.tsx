import { Tiptap } from "../components/tiptap"

export default function Page() {
  return (
    <>
      <div className="p-20">
        <Tiptap
          access={true}
          json={{
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: {
                  level: 1,
                },
                content: [
                  {
                    type: "text",
                    text: "Hello World! 🌎️",
                  },
                ],
              },
              {
                type: "paragraph",
                attrs: {
                  level: 1,
                },
                content: [
                  {
                    type: "text",
                    text: "Test",
                  },
                ],
              },
            ],
          }}
        />
      </div>
    </>
  )
}
