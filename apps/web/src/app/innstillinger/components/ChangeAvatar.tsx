"use client"

import type { Session } from "@dotkomonline/oauth2/session"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  Icon,
} from "@dotkomonline/ui"
import type { FC } from "react"

export type AvatarImgChangeProps = {
  session: Session
}

export const AvatarImgChange: FC<AvatarImgChangeProps> = ({ session }) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="relative border-[1px] rounded-full">
      <Avatar className="w-40 h-auto">
        <AvatarImage src={session.picture ?? undefined} alt="UserAvatar" />
        <AvatarFallback className="w-40 h-40">{session.name}</AvatarFallback>
      </Avatar>
      <div className=" bg-slate-50 absolute top-0 w-full h-full rounded-full opacity-60 flex justify-center items-center hover:cursor-pointer">
        <Icon icon={"tabler:pencil"} className="text-3xl" />
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent>
        <DropdownMenuItem className="hover:cursor-pointer">Last opp bilde...</DropdownMenuItem>
        <DropdownMenuItem className="hover:cursor-pointer">Fjern bilde</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenu>
)
