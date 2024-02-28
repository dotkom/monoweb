import { Icon } from "@iconify/react";
import {
  Button,
  type ButtonProps,
  Combobox,
  type ComboboxProps,
  useCombobox,
  Box,
} from "@mantine/core";
import { type FC } from "react";

import React from "react";
import type { SVGProps } from "react";

interface ActionSelectProps extends ComboboxProps {
  data: { value: string; label: string }[];
  onChange?(value: string): void;
  buttonProps?: ButtonProps;
  label: string;
}

export const ActionSelect: FC<ActionSelectProps> = ({
  data,
  onChange,
  buttonProps,
  label,
  ...comboBoxProps
}) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const options = data.map((item) => (
    <Combobox.Option value={item.value} key={item.value}>
      {item.label}
    </Combobox.Option>
  ));

  return (
    <Combobox
      {...comboBoxProps}
      store={combobox}
      position="bottom-start"
      onOptionSubmit={(val) => {
        combobox.closeDropdown();
        if (onChange) {
          onChange(val);
        }
      }}
    >
      <Combobox.Target>
        <Button
          onClick={() => combobox.toggleDropdown()}
          color="green"
          {...buttonProps}
        >
          <Box
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box mr="md">{label}</Box>
            <Icon icon="tabler:chevron-down" />
          </Box>
        </Button>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};
