import { FC, PropsWithChildren } from "react"

export const AuthLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="bg-slate-1 sm:bg-background h-full w-full pt-16">
      <div className="bg-slate-1 mx-auto my-0 w-full max-w-[400px] rounded-md pt-16">{children}</div>
    </div>
  )
}
