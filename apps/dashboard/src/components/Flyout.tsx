import * as RadixDialog from "@radix-ui/react-dialog"
import { createContext, FC, useContext, useState } from "react"

type FlyoutContextState = {
  isOpen: boolean
  setOpen: (state: boolean) => void
}

export const useFlyout = (Component: FC) => {
  const [isOpen, setOpen] = useState(false)
  const FlyoutContext = createContext<FlyoutContextState | null>(null)
  const useFlyoutContext = () => {
    const ctx = useContext(FlyoutContext)
    if (ctx === null) {
      throw new Error("useFlyout called without FlyoutContext provider in tree")
    }
    return ctx
  }

  const FlyoutChild: FC = () => {
    const { isOpen, setOpen } = useFlyoutContext()
    return (
      <RadixDialog.Root open={isOpen} onOpenChange={setOpen}>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="fixed inset-0 bg-zinc-900/75" />
          <RadixDialog.Content className="fixed top-0 right-0 z-50 h-full w-3/5 border-l bg-slate-50 shadow">
            <Component />
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    )
  }

  const Flyout: FC = () => {
    return (
      <FlyoutContext.Provider value={{ isOpen, setOpen }}>
        <FlyoutChild />
      </FlyoutContext.Provider>
    )
  }

  return {
    Flyout,
    isOpen,
    close: () => setOpen(false),
    open: () => setOpen(true),
  }
}
