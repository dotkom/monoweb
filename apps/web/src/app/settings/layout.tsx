import SettingsLayout from "@/components/layout/SettingsLayout"
import { PropsWithChildren } from "react";

export default function SettingsPageLayout({ children }: PropsWithChildren) {
  return <SettingsLayout>{children}</SettingsLayout>
}
