"use client"

import * as RadixDialog from "@radix-ui/react-dialog"
import { createContext, FC, useContext, useState } from "react"

type FlyoutContextState<T> = {
  isOpen: boolean
  open: (data: T) => void
  close: () => void
  data: T | null
}

type UseFlyoutContext<T> = () => FlyoutContextState<T>
export type FlyoutChildProps<T> = {
  close: () => void
  payload: T
}

export const useFlyout = <T,>(Component: FC<FlyoutChildProps<T>>) => {
  const [isOpen, setOpen] = useState(false)
  const [payload, setPayload] = useState<T | null>(null)
  const FlyoutContext = createContext<FlyoutContextState<T> | null>(null)
  const useFlyoutContext: UseFlyoutContext<T> = () => {
    const ctx = useContext(FlyoutContext)
    if (ctx === null) {
      throw new Error("useFlyout called without FlyoutContext provider in tree")
    }
    return ctx
  }

  const FlyoutChild: FC = () => {
    const { isOpen, open, close } = useFlyoutContext()
    if (!payload) {
      throw new Error("Illegal state, payload cannot be null when opened")
    }
    return (
      <RadixDialog.Root open={isOpen} onOpenChange={(s) => (s ? open(payload) : close())}>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="fixed inset-0 bg-zinc-900/75" />
          <RadixDialog.Content className="fixed top-0 right-0 z-50 h-full w-3/5 border-l bg-slate-50 shadow">
            <Component close={close} payload={payload} />
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    )
  }

  const openFlyout = (data: T) => {
    setOpen(true)
    setPayload(data)
  }
  const closeFlyout = () => setOpen(false)

  const Flyout: FC = () => {
    return (
      <FlyoutContext.Provider
        value={{
          isOpen,
          open: openFlyout,
          close: closeFlyout,
          data: null,
        }}
      >
        <FlyoutChild />
      </FlyoutContext.Provider>
    )
  }

  return {
    Flyout,
    isOpen,
    open: openFlyout,
    close: closeFlyout,
  }
}
