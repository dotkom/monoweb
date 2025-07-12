"use client"

import type { User } from "@dotkomonline/types"
import { Avatar, AvatarFallback, AvatarImage, Button } from "@dotkomonline/ui"
import Link from "next/link"
import type { FC } from "react"

type PersonalInfoProps = {
  user: User
  className?: string
}

export const PersonalInfo: FC<PersonalInfoProps> = ({ user, className }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Avatar className="w-40 h-auto opacity-60">
        <AvatarImage src={user.image ?? undefined} alt="UserAvatar" />
        <AvatarFallback className="w-40 h-40">
          {user.firstName?.[0]}
          {user.lastName?.[0]}
        </AvatarFallback>
      </Avatar>
      <p className="text-lg text-slate-900">{user.email}</p>
      <Button color="brand" className="self-auto">
        <Link href="/settings">Profilinnstillinger</Link>
      </Button>
      {/* <ChangeAvatar {...user} /> */}
    </div>
  )
}
