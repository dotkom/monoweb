import { cva } from "cva"
import { forwardRef, HTMLInputTypeAttribute, ReactComponentElement, ReactElement, useState } from "react"
import { Label } from "@radix-ui/react-label"
import { IconEyeCheck, IconEyeOff} from "@tabler/icons"



export interface InputProps extends React.HTMLProps<HTMLInputElement> {
    placeholder?: string
    label?: string
    withAsterisk?: boolean
    error?: boolean | string
    inputInfo?: string
    eyeColor: "default" | "slate" | "gray"
  }

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(({label, withAsterisk, error, inputInfo, eyeColor, ...props}, ref) => {
  const [visible,setVisibility] = useState(false)
  const Icon = visible ? <IconEyeOff onClick={() => setVisibility(visibility => !visibility)}/> : <IconEyeCheck onClick={() => setVisibility(visibility => !visibility)}/>;
  const InputType = visible ? "text" : "password";
  
  return (
        <div className="flex flex-col">
            {label && (
            <Label htmlFor={props.id} className="mb-2">
              {label} {withAsterisk && <span className="text-red-11">*</span>}
            </Label>
            )}
            <span className="text-xs">{inputInfo}</span>
            <div className="relative">
              <input type={InputType} {...props} ref={ref} className={input({error: !!error})} />
                <div>
                    <span className={eye({color: eyeColor})}>{Icon}</span>
                </div>
            </div>
            {typeof error === "string" && <span className="text-red-11 mt-1 text-xs">{error}</span>}
        </div>
    )
  })
 

  const input = cva("border-solid border outline-none focus:border-blue-7 bg-slate-3 rounded-md p-2 w-full ", {
    variants: {
      error: {
        true:"text-slate-12 border-red-7",
        false: "text-slate-12 border-slate-6",
      },
    },
  })

  const eye = cva("absolute top-2 right-2 hover: cursor-pointer", {
    variants: {
        color: {
            default: "text-solid",
            slate: "text-slate-7",
            gray: "text-slate-11" 
        }
    }
  })