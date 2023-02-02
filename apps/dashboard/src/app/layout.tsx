import type { PropsWithChildren } from "react"
import "../main.css"
import { Sidebar } from "../components/Sidebar"
import { AuthProvider } from "./AuthProvider"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "../pages/api/auth/[...nextauth]"
import { QueryProvider } from "./QueryProvider"

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await unstable_getServerSession(authOptions)

  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <div className="bg-background flex">
          <AuthProvider session={session}>
            <QueryProvider>
              <Sidebar />
              <main className="min-h-screen w-full bg-slate-50">{children}</main>
            </QueryProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}
