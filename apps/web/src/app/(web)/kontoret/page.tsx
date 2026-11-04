import { RedirectType, permanentRedirect } from "next/navigation"

const SettingsPage = () => {
  permanentRedirect("/kontoret/om-kontoret", RedirectType.replace)
}

export default SettingsPage
