import AvatarImgChange from "@/app/settings/components/ChangeAvatar"
import { CountryCodeSelect } from "@/app/settings/components/CountryCodeSelect"
import type { User } from "@dotkomonline/types"
import { Button, TextInput, Textarea } from "@dotkomonline/ui"
import jwt from "jsonwebtoken"
import type { NextPage } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { z } from "zod"

interface FormInputProps {
  title: string
  children?: JSX.Element
}

const FormInput: React.FC<FormInputProps> = ({ title, children }) => (
  <div className="w-full border-b-[1px] last-of-type:border-b-0 border-slate-7 flex py-8 justify-between">
    <div className="w-1/4">{title}:</div>
    <div className="flex-1 flex justify-center">{children}</div>
  </div>
)

const OnboardingProfile: NextPage = () => {
  return (
    <div className="flex w-full flex-col space-y-4">
      <h2>Fullfør profil</h2>
      <div>
        <Link href="/feide">
          <Button>Bekreft med Feide</Button>
        </Link>
      </div>
    </div>
  )
}

const ExistingProfile: NextPage<{ user: User }> = ({ user }) => {
  return (
    <div className="flex w-full flex-col space-y-4">
      <h2>{user.givenName} {user.familyName}</h2>
      <FormInput title="Epost">
        <TextInput disabled width="flex-1" placeholder="Epost" defaultValue={user.email} />
      </FormInput>
      <FormInput title="Telefon">
        <div className="w-full flex space-x-2">
          <CountryCodeSelect />
          <TextInput width="w-full" maxLength={8} />
        </div>
      </FormInput>
      <FormInput title="Bio">
        <Textarea placeholder="Din råkule bio" />
      </FormInput>
      <FormInput title="Allergier">
        <Textarea placeholder="Dine allergier" />
      </FormInput>
    </div>
  )
}

const SettingsProfile: NextPage<{ user: User | null }> = ({ user }) => {
  return user ? <ExistingProfile user={user} /> : <OnboardingProfile />
}

export default SettingsProfile
