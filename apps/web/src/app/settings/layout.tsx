import SettingsLayout from "@/components/layout/SettingsLayout"
import type { PropsWithChildren } from "react"

export default function SettingsPageLayout({ children }: PropsWithChildren) {
  return <SettingsLayout>{children}</SettingsLayout>
}
