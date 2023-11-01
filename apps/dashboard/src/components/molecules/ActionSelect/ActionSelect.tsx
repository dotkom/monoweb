import { Button, ButtonProps, Combobox, ComboboxProps, useCombobox } from "@mantine/core"

interface ActionSelectProps extends ComboboxProps {
  data: { value: string; label: string }[]
  onChange?: (value: string) => void
  buttonProps?: ButtonProps
}

export function ActionSelect({ data, ...props }: ActionSelectProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const options = data.map((item, i) => (
    <Combobox.Option value={item.value} key={i + item.label}>
      {item.label}
    </Combobox.Option>
  ))

  return (
    <Combobox
      {...props}
      store={combobox}
      position="bottom-start"
      onOptionSubmit={(val) => {
        combobox.closeDropdown()
        if (props.onChange) props.onChange(val)
      }}
    >
      <Combobox.Target>
        <Button onClick={() => combobox.toggleDropdown()} color="green" {...props.buttonProps}>
          Bruk mal
        </Button>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
