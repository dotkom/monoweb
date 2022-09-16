import { Label } from "@radix-ui/react-label"
import { FC, forwardRef } from "react"
import { css } from "../../config/stitches.config"

export interface InputProps {
  id?: string
  placeholder?: string
  label?: string
  withAsterisk?: boolean
  disabled?: boolean
}

export const TextInput = forwardRef<HTMLInputElement, InputProps>(({ label, withAsterisk, ...props }, ref) => {
  return (
    <div className={styles.container()}>
      {label && (
        <Label htmlFor={props.id} className={styles.label()}>
          {label} {withAsterisk && <span className={styles.asterisk()}>*</span>}
        </Label>
      )}
      <input type="text" {...props} ref={ref} className={styles.input()} />
    </div>
  )
})

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
    "&:focus": {
      borderColor: "$blue10"
    }
  }),
}
