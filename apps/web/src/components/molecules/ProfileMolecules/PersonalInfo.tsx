"use client"

import { User } from "@dotkomonline/types"
import { Avatar, AvatarFallback, AvatarImage, Button } from "@dotkomonline/ui"
import Link from "next/link"
import type { FC } from "react"

type PersonalInfoProps = {
  user: User
  className?: string
}

const PersonalInfo: FC<PersonalInfoProps> = ({ user, className }) => {
  console.log("PersonalInfo")
  console.log(user)
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Avatar className="w-40 h-auto opacity-60">
        <AvatarImage src={user.image ?? undefined} alt="UserAvatar" />
        <AvatarFallback className="w-40 h-40">{user.image}</AvatarFallback>
      </Avatar>
      <p className="text-lg">{user.image}</p>
      <p className="text-lg text-slate-10">{user.email}</p>
      <Button color="gradient" className="self-auto">
        <Link href="/settings">Profil Innstillinger</Link>
      </Button>
      {/* <ChangeAvatar {...user} /> */}
    </div>
  )
}

export default PersonalInfo
