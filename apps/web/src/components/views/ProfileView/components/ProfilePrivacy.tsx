import { useEffect, useState } from "react"
import PrivacyModule from "./ProfilePrivacyModule"

const ProfilePrivacy = () => {
  const [checked] = useState(false)

  useEffect(() => {
    console.log(checked)
  }, [checked])

  return (
    <div className="flex w-full flex-col">
      <h2 className="mb-2 w-full flex-auto p-1">Personvern</h2>
      <p className="m-0 w-full flex-auto p-1 text-lg font-normal not-italic">
        Her kan du endre personverninnstillingene koblet til profilen din.
      </p>
      <PrivacyModule />
    </div>
  )
}
export default ProfilePrivacy
