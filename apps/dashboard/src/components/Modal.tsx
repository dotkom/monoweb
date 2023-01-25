"use client"

import * as RadixDialog from "@radix-ui/react-dialog"
import { createContext, FC, useContext, useState } from "react"

type ModalContextState = {
  isOpen: boolean
  open: () => void
  close: () => void
}

type UseModalContext = () => ModalContextState
export type ModalChildProps = {
  close: () => void
}

export const useModal = (Component: FC<ModalChildProps>) => {
  const [isOpen, setOpen] = useState(false)
  const ModalContext = createContext<ModalContextState | null>(null)
  const useModalContext: UseModalContext = () => {
    const ctx = useContext(ModalContext)
    if (ctx === null) {
      throw new Error("useModal called without ModalContext provider in tree")
    }
    return ctx
  }

  const ModalChild: FC = () => {
    const { isOpen, open, close } = useModalContext()
    return (
      <RadixDialog.Root open={isOpen} onOpenChange={(s) => (s ? open() : close())}>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="fixed inset-0 bg-zinc-900/75" />
          <RadixDialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[80vh] w-[90vw] max-w-[900px] -translate-x-1/2 -translate-y-1/2 border-l bg-slate-50 shadow">
            <Component close={close} />
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>
    )
  }

  const Modal: FC = () => {
    return (
      <ModalContext.Provider value={{ isOpen, open: () => setOpen(true), close: () => setOpen(false) }}>
        <ModalChild />
      </ModalContext.Provider>
    )
  }

  return {
    Modal,
    isOpen,
    open: () => setOpen(true),
    close: () => setOpen(false),
  }
}
