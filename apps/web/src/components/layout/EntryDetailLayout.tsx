import type { FC, PropsWithChildren } from "react"

export interface EntryDetailLayoutProps {
  title: string
}

export const EntryDetailLayout: FC<PropsWithChildren<EntryDetailLayoutProps>> = ({
  children,
  title
}) => {

  return (
    <div className="mx-auto mb-20 flex w-[90vw] max-w-screen-lg flex-col gap-y-16">
      <div className="flex flex-col gap-y-7">
        <div className={"flex w-full items-end justify-between gap-x-2 pb-2 font-bold"}>
          <h1>{title}</h1>
        </div>
        {children}
      </div>
    </div>
  )
}
