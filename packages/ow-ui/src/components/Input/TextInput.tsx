import { Label } from "@radix-ui/react-label"
import { FC, forwardRef } from "react"
import { css } from "../../config/stitches.config"

export interface InputProps extends React.HTMLProps<HTMLInputElement> {
  variant?: "brand"
  placeholder?: string
  label?: string
  withAsterisk?: boolean
  error?: boolean | string
}

export const TextInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, withAsterisk, error, variant, ...props }, ref) => {
    return (
      <div className={styles.container()}>
        {label && (
          <Label htmlFor={props.id} className={styles.label()}>
            {label} {withAsterisk && <span className={styles.asterisk()}>*</span>}
          </Label>
        )}
        <input
          type="text"
          {...props}
          ref={ref}
          className={styles.input({ variant: variant, error: !!error, disabled: props.disabled })}
        />
        {typeof error === "string" && <span className={styles.error()}>{error}</span>}
      </div>
    )
  }
)

const styles = {
  container: css({
    display: "flex",
    flexDirection: "column",
  }),
  label: css({
    margin: "$1 0",
  }),
  asterisk: css({
    color: "$red0",
  }),
  input: css({
    padding: "$2 $2",
    border: "1px solid $gray10",
    borderRadius: "$1",
    transition: "border-color 0.3s ease-out",
    outline: "none",
    "&:focus": {
      borderColor: "$info3",
    },
    variants: {
      variant: {
        brand: {
          borderColor: "$blue3",
          borderWidth: "2px"
        },
      },
      error: {
        true: {
          color: "$red3",
          borderColor: "$red3",
        },
      },
      disabled: {
        true: {
          backgroundColor: "$gray12",
          cursor: "not-allowed",
          color: "$gray7",
        },
      },
    },
  }),
  error: css({
    fontSize: "$xs",
    color: "$red3",
  }),
}
