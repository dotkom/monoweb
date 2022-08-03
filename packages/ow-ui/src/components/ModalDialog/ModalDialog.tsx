import React, { ReactNode } from "react"
import { styled, keyframes } from "@stitches/react"
import { Button } from "../Button"
import { blackA } from "@radix-ui/colors"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

const overlayShow = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
})

const contentShow = keyframes({
  "0%": { opacity: 0, transform: "translate(-50%, -48%) scale(.96)" },
  "100%": { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
})

const StyledOverlay = styled(AlertDialogPrimitive.Overlay, {
  backgroundColor: blackA.blackA9,
  position: "fixed",
  inset: 0,
  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  },
})

const StyledContent = styled(AlertDialogPrimitive.Content, {
  backgroundColor: "white",
  borderRadius: 6,
  boxShadow: "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  maxWidth: "500px",
  maxHeight: "85vh",
  padding: 25,
  "@media (prefers-reduced-motion: no-preference)": {
    animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  },
  "&:focus": { outline: "none" },
})

interface ContentProps {
  children: ReactNode
}

const Content: React.FC<ContentProps> = ({ children, ...props }) => {
  return (
    <AlertDialogPrimitive.Portal>
      <StyledOverlay />
      <StyledContent {...props}>{children}</StyledContent>
    </AlertDialogPrimitive.Portal>
  )
}

const StyledTitle = styled(AlertDialogPrimitive.Title, {
  margin: 0,
  color: "$gray1",
  fontSize: 20,
  fontWeight: 500,
})

const StyledDescription = styled(AlertDialogPrimitive.Description, {
  marginBottom: 20,
  color: "$gray2",
  fontSize: 14,
  fontWeight: 400,
  lineHeight: 1.5,
})

// Exports
export const AlertDialogRoot = AlertDialogPrimitive.Root
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger
export const AlertDialogContent = Content
export const AlertDialogTitle = StyledTitle
export const AlertDialogDescription = StyledDescription
export const AlertDialogAction = AlertDialogPrimitive.Action
export const AlertDialogCancel = AlertDialogPrimitive.Cancel

const Flex = styled("div", { display: "flex" })

export interface AlertDialogProps {
  triggerBtnColor?: "green" | "gray" | "blue" | "red" | "orange" | "info"
  triggerBtnContent: string
  title: string
  content: string
  actionText: string
  action: () => void
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  triggerBtnColor,
  triggerBtnContent,
  title,
  content,
  actionText,
  action,
}) => (
  <AlertDialogRoot>
    <AlertDialogTrigger asChild>
      <Button color={triggerBtnColor} variant="solid">
        {triggerBtnContent}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogTitle>{title}</AlertDialogTitle>
      <AlertDialogDescription>{content}</AlertDialogDescription>
      <Flex css={{ justifyContent: "flex-end" }}>
        <AlertDialogCancel asChild>
          <Button color="gray" variant="light" css={{ marginRight: 25 }}>
            Avbryt
          </Button>
        </AlertDialogCancel>
        <AlertDialogAction asChild>
          <Button onClick={action} color="red" variant="solid">
            {actionText}
          </Button>
        </AlertDialogAction>
      </Flex>
    </AlertDialogContent>
  </AlertDialogRoot>
)

export default AlertDialog
