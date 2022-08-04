import { Indicator, Root, CheckboxProps as PrimitiveProps } from "@radix-ui/react-checkbox"
import { forwardRef } from "react"
import { Label } from "@radix-ui/react-label"
import { IoCheckmarkSharp } from "react-icons/io5"
import { css } from "../../config/stitches.config"

export interface CheckboxProps extends PrimitiveProps {
  label: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, ...props }, ref) => (
  <div className={styles.container()}>
    <Root ref={ref} className={styles.checkbox({ checked: !!props.checked, disabled: !!props.disabled })} {...props}>
      <Indicator className={styles.indicator()}>
        <IoCheckmarkSharp />
      </Indicator>
    </Root>
    <Label htmlFor={props.id} className={styles.label()}>
      {label}
    </Label>
  </div>
))

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
  indicator: css({
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
    "&:focus": {
      boxShadow: "$ring0",
    },
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
