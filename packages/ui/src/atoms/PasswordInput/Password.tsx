"use client"

import { Label } from "@radix-ui/react-label"
import { cva } from "cva"
import { type ComponentPropsWithRef, type FC, useState } from "react"
import { Icon } from "../Icon/Icon"

export type PasswordInputProps = ComponentPropsWithRef<"input"> & {
  placeholder?: string
  label?: string
  withAsterisk?: boolean
  error?: boolean | string
  inputInfo?: string
  eyeColor: "default" | "gray" | "slate"
}

export const PasswordInput: FC<PasswordInputProps> = ({
  label,
  withAsterisk,
  error,
  inputInfo,
  eyeColor,
  ref,
  ...props
}) => {
  const [visible, setVisible] = useState(false)
  const InputType = visible ? "text" : "password"

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Label htmlFor={props.id} className="mb-1">
          {label} {withAsterisk && <span className="text-red-11">*</span>}
        </Label>
      )}
      <p>{inputInfo}</p>
      <div className="relative">
        <input type={InputType} {...props} ref={ref} className={input({ error: Boolean(error) })} />
        <div>
          <span className={eye({ color: eyeColor })}>
            <Icon
              width={24}
              icon={visible ? "tabler:eye-check" : "tabler:eye-off"}
              onClick={() => setVisible((visibility) => !visibility)}
            />
          </span>
        </div>
      </div>
      {typeof error === "string" && <span className="text-red-11 mt-1 text-xs">{error}</span>}
    </div>
  )
}

const input = cva("border-solid border outline-none focus:border-blue-7 bg-slate-3 rounded-md p-2 w-full ", {
  variants: {
    error: {
      true: "text-slate-12 border-red-7",
      false: "text-slate-12 border-slate-6",
    },
  },
})

const eye = cva("absolute top-2 right-2 flex hover: cursor-pointer", {
  variants: {
    color: {
      default: "text-solid",
      slate: "text-slate-7",
      gray: "text-slate-11",
    },
  },
})
