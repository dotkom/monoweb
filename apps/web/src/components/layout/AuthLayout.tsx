import { FC, PropsWithChildren } from "react"

export const AuthLayout: FC<PropsWithChildren> = ({ children }) => {
  return <div className="bg-slate-1 grid h-full w-full place-content-center">{children}</div>
}
