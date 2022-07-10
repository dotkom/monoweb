import React from "react"
import { Indicator, Root, CheckedState, CheckboxProps as PrimitiveProps } from "@radix-ui/react-checkbox"
import { FC } from "react"
import { Label } from "@radix-ui/react-label"
import { IoCheckmarkSharp } from "react-icons/io5"
import { css, styled } from "../../config/stitches.config"

// Your app...
export interface CheckboxProps extends PrimitiveProps {
  label: string
}

const CheckboxIndicator = styled(Indicator, {
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
})

const Checkbox: FC<CheckboxProps> = ({ label, ...props }) => (
  <div className={styles.container()}>
    <Root className={styles.checkbox({ checked: !!props.checked, disabled: !!props.disabled })} {...props}>
      <CheckboxIndicator>
        <IoCheckmarkSharp />
      </CheckboxIndicator>
    </Root>
    <Label htmlFor={props.id} className={styles.label()}>
      {label}
    </Label>
  </div>
)

const styles = {
  container: css({
    display: "flex",
    alignItems: "center",
  }),
  label: css({
    lineHeight: 1,
    userSelect: "none",
    paddingLeft: "$2",
  }),
  checkbox: css({
    all: "unset",
    backgroundColor: "white",
    color: "$white",
    width: 25,
    height: 25,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transitionVariant: "colors",
    border: `2px solid $colors$gray11`,
    variants: {
      checked: {
        true: {
          color: "$white",
          borderColor: "$blue3",
          backgroundColor: "$blue3",
        },
      },
      disabled: {
        true: {
          cursor: "not-allowed",
          backgroundColor: "$gray10",
          color: "$gray6",
        },
      },
    },
  }),
}

export default Checkbox
