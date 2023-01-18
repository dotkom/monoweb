import type { PropsWithChildren } from "react"
import "../main.css"
import "@tremor/react/dist/esm/tremor.css"
import { Sidebar } from "../components/Sidebar"

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <div className="bg-background flex">
          <Sidebar />
          <main className="min-h-screen w-full bg-slate-50">{children}</main>
        </div>
      </body>
    </html>
  )
}
