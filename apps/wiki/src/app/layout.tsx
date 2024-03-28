import { type Metadata } from "next"
import { type PropsWithChildren } from "react"
import "@dotkomonline/config/tailwind.css"
import "../root.css"
import NavBar from "../components/nav"
import { AuthProvider } from "./auth-provider"
import { getServerSession } from "next-auth"

export const metadata: Metadata = {
  title: "Wiki",
  description: "Wiki for Online NTNU",
}

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await getServerSession()
  return (
    <html lang="en">
      <body>
        <AuthProvider session={session}>
          <NavBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
