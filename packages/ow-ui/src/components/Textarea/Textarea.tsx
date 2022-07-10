import { ComponentPropsWithoutRef, forwardRef } from "react"
import * as Label from "@radix-ui/react-label"
import { styled } from "../../config/stitches.config"
import { AlertIcon } from "../Alert"

const BaseTextarea = styled("textarea", {
  outline: "none",
  resize: "none",
  padding: "$2",
  border: "2px solid $gray10",
  font: "$body",
  borderRadius: "$1",
  backgroundColor: "$gray12",
  "&:disabled": {
    backgroundColor: "$gray11",
    cursor: "not-allowed",
  },
  "&:focus": {
    borderColor: "$info4",
  },
  variants: {
    status: {
      danger: {
        borderColor: "$red4",
      },
      success: {
        borderColor: "$green4",
      },
    },
  },
})

const InputContainer = styled("div", {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: "$1",
})

const MessageContainer = styled("div", {
  fontSize: "$md",
  display: "flex",
  alignItems: "center",
})

const Message = styled("span", {
  variants: {
    status: {
      danger: {
        color: "$red4",
      },
      success: {
        color: "$green4",
      },
    },
  },
})

const InputLabel = styled(Label.Root, {
  fontWeight: "bold",
  fontFamily: "$body",
})

export type TextareaProps = ComponentPropsWithoutRef<typeof BaseTextarea> & {
  label?: string
} & (
    | {
        status: "success" | "danger"
        message: string
      }
    | {
        status: undefined
        message: undefined
      }
  )

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  const { message, label, status, ...rest } = props
  // TODO: replace with React 18 useId() when storybook wants to work
  const id = "foobar"

  return (
    <InputContainer>
      {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
      <BaseTextarea ref={ref} status={status} id={id} {...rest} />
      {message && status && (
        <MessageContainer>
          <AlertIcon status={status} />
          <Message status={status}>{message}</Message>
        </MessageContainer>
      )}
    </InputContainer>
  )
})

export default Textarea
