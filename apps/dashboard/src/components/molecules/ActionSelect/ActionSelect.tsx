import { Button, ButtonProps, Combobox, ComboboxProps, useCombobox } from "@mantine/core"
import { FC } from "react"

interface ActionSelectProps extends ComboboxProps {
  data: { value: string; label: string }[]
  onChange?: (value: string) => void
  buttonProps?: ButtonProps
}

export const ActionSelect: FC<ActionSelectProps> = ({ data, onChange, buttonProps, ...comboBoxProps }) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const options = data.map((item, i) => (
    // static list => using index as key is ok
    <Combobox.Option value={item.value} key={i}>
      {item.label}
    </Combobox.Option>
  ))

  return (
    <Combobox
      {...comboBoxProps}
      store={combobox}
      position="bottom-start"
      onOptionSubmit={(val) => {
        combobox.closeDropdown()
        if (onChange) onChange(val)
      }}
    >
      <Combobox.Target>
        <Button onClick={() => combobox.toggleDropdown()} color="green" {...buttonProps}>
          Bruk mal
        </Button>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
