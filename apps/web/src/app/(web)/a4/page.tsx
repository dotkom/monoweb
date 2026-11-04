import { RedirectType, permanentRedirect } from "next/navigation"

const SettingsPage = () => {
  permanentRedirect("/a4/om-a4", RedirectType.replace)
}

export default SettingsPage
