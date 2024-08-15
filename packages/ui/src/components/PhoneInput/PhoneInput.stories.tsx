import { useState } from "react"
import { PhoneInput } from "./PhoneInput"

export default {
  title: "PhoneInput",
}
export const Default = () => {
  const [phoneValue, setPhoneValue] = useState()
  return <PhoneInput onChange={() => setPhoneValue} value={phoneValue} />
}
