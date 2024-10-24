import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import PrivacyModule from "./SettingsPrivacyModule"

const PrivacyPage = async () => {
  const session = await getServerSession()

  if (session === null) {
    redirect("/")
  }

  return <>
    <h2>Personvern</h2>
    <p className="m-0 w-full flex-auto p-1 text-lg font-normal not-italic">
      Her kan du endre personverninnstillingene koblet til profilen din.
    </p>

    <PrivacyModule />
  </>
}

export default PrivacyPage
