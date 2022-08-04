import { useState } from "react"
import { Toggle } from "./Toggle"
export default {
  title: "atoms/Toggle",
  component: Toggle,
}

export const Default = () => {
  const [checked, setIsChecked] = useState(false)
  return <Toggle label="Default toggle" isChecked={checked} setIsChecked={() => setIsChecked} />
}
export const Disabled = () => {
  const [checked, setIsChecked] = useState(true)
  return <Toggle label="Disabled toggle" disabled={true} isChecked={checked} setIsChecked={() => setIsChecked} />
}
