import { FC, PropsWithChildren } from "react"

import { cn } from "@dotkomonline/ui"

export interface ProcessPaymentButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean
}

const ProcessPaymentButton: FC<PropsWithChildren<ProcessPaymentButtonProps>> = ({
  isLoading,
  children,
  ...rest
}: ProcessPaymentButtonProps) => {
  return (
    <button
      className={cn("flex h-10 w-full items-center justify-center rounded-lg bg-[#6840d8] text-white hover:bg-[#5c35c8]", props.className)}
      {...rest}
    >
      {isLoading ? (
        <div className="flex flex-row gap-x-3">
          <svg
            className="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="font-bold">Processing...</span>
        </div>
      ) : (
        <div className="h-full flex items-center">
          {children}
        </div>
      )}
    </button>
  )
}

export default ProcessPaymentButton
