import * as RadixDropdownMenu from "@radix-ui/react-dropdown-menu"
import { ComponentProps, FC, ReactNode, useState } from "react"
import { css, keyframes, styled } from "../../config/stitches.config"
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5"

// TODO: replace with asChild and Button component
const DropdownTrigger = styled(RadixDropdownMenu.Trigger, {
  backgroundColor: "$gray12",
  border: "none",
  borderRadius: "$2",
  cursor: "pointer",
  fontSize: "$md",
  fontWeight: 600,
  px: "16px",
  py: "10px",
  display: "inline-flex",
  gap: 8,
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: "$gray11",
  },
  "&:disabled": {
    backgroundColor: "$gray12",
    cursor: "not-allowed",
  },
})

const DropdownContent = styled(RadixDropdownMenu.Content, {
  minWidth: 200,
  backgroundColor: "$white",
  boxShadow: "0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
  marginTop: "$2",
  padding: "$2",
  variants: {
    loading: {
      true: {
        minWidth: 0,
        width: 64,
      },
    },
  },
})

const spin = keyframes({
  to: {
    transform: "rotate(360deg)",
  },
})

export type DropdownMenuProps = ComponentProps<typeof RadixDropdownMenu.Root> & {
  disabled?: boolean
  label: string
} & (
    | {
        isLoading: true
        children?: undefined
      }
    | {
        isLoading?: undefined
        children: ReactNode
      }
  )

const DropdownMenu: FC<DropdownMenuProps> = ({ disabled = false, isLoading, label, children, ...props }) => {
  // TODO: find out if there is a more convenient way to synchronize state here
  //  Radix does not support refs onto the root :(
  const [expanded, setExpanded] = useState(props.open)
  // Proxy through the component to synchronize state
  const onRootStateChange = (state: boolean) => {
    setExpanded(state)
    props.onOpenChange?.(state)
  }

  return (
    <RadixDropdownMenu.Root {...props} open={props.open} onOpenChange={onRootStateChange}>
      <DropdownTrigger disabled={disabled}>
        {label}
        {expanded ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
      </DropdownTrigger>
      <DropdownContent loading={isLoading}>
        {isLoading ? (
          <div className={styles.loading()}>
            <div className={styles.spinner()} />
          </div>
        ) : (
          children
        )}
      </DropdownContent>
    </RadixDropdownMenu.Root>
  )
}

export default DropdownMenu

const styles = {
  spinner: css({
    display: "inline-block",
    width: 32,
    height: 32,
    border: "2px solid",
    borderRadius: "$radii$round",
    borderColor: "white white white $blue1",
    animation: `${spin} .6s linear infinite`,
  }),
  loading: css({
    height: 64,
    width: 64,
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
  }),
}
