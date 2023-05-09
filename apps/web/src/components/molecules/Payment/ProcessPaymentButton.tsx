import { FC, PropsWithChildren } from "react"

export interface StripeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ProcessPaymentButton: FC<PropsWithChildren<StripeButtonProps>> = (
  props: PropsWithChildren<StripeButtonProps>
) => {
  return (
    <button
      className="flex h-10 w-full items-center justify-center rounded-lg bg-[#6840d8] text-white hover:bg-[#5c35c8] "
      {...props}
    >
      {true ? (
        <div className="flex flex-row gap-x-2">
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
          <span>Processing...</span>
        </div>
      ) : (
        <div>{props.children}</div>
      )}
    </button>
  )
}

export default ProcessPaymentButton
