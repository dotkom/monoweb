import { useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup"

export default {
  title: "ToggleGroup",
}

const options = ["Sosialt", "Bedpres", "Kurs", "Utflukt"]

export const Default = () => (
  <ToggleGroup defaultValue={["week"]}>
    <ToggleGroupItem value="week">Uke</ToggleGroupItem>
    <ToggleGroupItem value="month">Måned</ToggleGroupItem>
  </ToggleGroup>
)

export const Segmented = () => (
  <ToggleGroup defaultValue={["week"]} spacing={0} color="blue">
    <ToggleGroupItem value="week">Uke</ToggleGroupItem>
    <ToggleGroupItem value="month">Måned</ToggleGroupItem>
    <ToggleGroupItem value="list">Liste</ToggleGroupItem>
  </ToggleGroup>
)

export const CheckIndicator = () => {
  const [value, setValue] = useState<string[]>(["Bedpres"])

  return (
    <ToggleGroup multiple variant="outline" color="blue" className="flex-wrap" value={value} onValueChange={setValue}>
      {options.map((option) => (
        <ToggleGroupItem key={option} value={option} indicator="check">
          {option}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
