import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu"
import { ComponentProps, FC } from "react"
import { styled } from "../../config/stitches.config"

const DropdownItem = styled(RadixDropdownMenu.Item, {
  padding: "$1",
  borderRadius: "$2",
  fontSize: "$md",
  fontFamily: "$body",
  "&:hover": {
    outline: "none",
    backgroundColor: "$gray12",
  },
})

export type DropdownTextProps = ComponentProps<typeof RadixDropdownMenu.Item> & {
  label: string
}

const DropdownText: FC<DropdownTextProps> = ({ label }) => {
  return (
    <>
      <DropdownItem>{label}</DropdownItem>
    </>
  )
}

export default DropdownText
