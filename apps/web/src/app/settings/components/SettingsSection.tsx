import { cn } from '@dotkomonline/ui'
import React, { HTMLProps, PropsWithChildren } from 'react'


export const SettingsSection: React.FC<PropsWithChildren & HTMLProps<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn(
      "w-full border-b-[1px] last-of-type:border-b-0 border-slate-7 flex py-8 justify-items-end",
      className
    )}
    {...props}
    >
    { children }
  </div>
)

