import DropdownMenu from "./DropdownMenu";
import DropdownText from "./DropdownText";

export default {
  title: "molecules/DropdownMenu",
  component: DropdownMenu,
}

export const DefaultWithTextOptions = () => (
  <DropdownMenu label="Adjust filters">
    <DropdownText label="Apple" />
    <DropdownText label="Banana" />
    <DropdownText label="Orange" />
  </DropdownMenu>
)

export const DefaultWithLoading = () => (
  <DropdownMenu label="Adjust filters" isLoading />
)
