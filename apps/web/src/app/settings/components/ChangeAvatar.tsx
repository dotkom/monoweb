"use client"
import { Avatar, AvatarImage, AvatarFallback, Icon } from "@dotkomonline/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu"
import { User } from "next-auth"

const AvatarImgChange = (user: User) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="relative border-[1px] rounded-full">
      <Avatar className="w-40 h-auto">
        <AvatarImage src={user.image} alt="UserAvatar" />
        <AvatarFallback className="w-40 h-40">{user.name}</AvatarFallback>
      </Avatar>
      <div className=" bg-slate-1 absolute top-0 w-full h-full rounded-full opacity-60 flex justify-center items-center hover:cursor-pointer">
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

export default AvatarImgChange
