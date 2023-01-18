import { Toggle } from "@dotkomonline/ui"
import { useEffect, useState } from "react"

const ProfilePrivacy = () => {
  const [checked, setIsChecked] = useState(false)

  useEffect(() => {
    console.log(checked)
  }, [checked])

  return (
    <div>
      <Toggle label="Default toggle" isChecked={checked} setIsChecked={() => setIsChecked(!checked)} />
    </div>
  )
}
export default ProfilePrivacy
