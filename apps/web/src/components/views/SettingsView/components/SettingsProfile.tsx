import AvatarImgChange from "@/app/settings/components/ChangeAvatar"
import { CountryCodeSelect } from "@/app/settings/components/CountryCodeSelect"
import type { User } from "@dotkomonline/types"
import { Button, TextInput, Textarea } from "@dotkomonline/ui"
import type { NextPage } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import jwt from "jsonwebtoken"
import { z } from "zod"

interface FormInputProps {
  title: string
  children?: JSX.Element
}

const FormInput: React.FC<FormInputProps> = ({ title, children }) => (
  <div className="w-full border-t-[1px] border-slate-7 flex py-8 justify-between px-4">
    <div className="w-1/4">{title}:</div>
    <div className="flex-1 flex justify-center">{children}</div>
  </div>
)

const JWTSchema = z.object({
  name: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  ntnu_username: z.string(),
  subjects: z.array(z.object({code: z.string(), name: z.string()})),
  studyPrograms: z.array(z.object({code: z.string(), name: z.string()})),
})

const OnboardingProfile: NextPage = () => {
  const feideProfileJWT = cookies().get("FeideProfileJWT")
  const profile = feideProfileJWT ? JWTSchema.parse(jwt.decode(feideProfileJWT.value)) : null

  return (
    <div className="flex w-full flex-col space-y-4">
      <h2>Fullfør profil</h2>
      <div>
        <Link href="/feide">
          <Button>Bekreft med Feide</Button>
        </Link>

        {
          profile &&
          <div className="flex flex-col">
            <h3>Navn</h3>
            <div className="flex flex-row gap-1">
              <div>{profile.firstName}</div>
              <div>{profile.lastName}</div>
            </div>

            <h3>NTNU-brukernavn</h3>
            <div>{
              profile.ntnu_username
            }</div>

            <h3>Emner</h3>
            <table>
              <thead>
                <tr>
                  <th className="text-left">Kode</th>
                  <th className="text-left">Navn</th>
                </tr>
              </thead>
              <tbody>
                {
                  profile.subjects.map((subject) => (
                    <tr key={subject.code}>
                      <td>{subject.code}</td>
                      <td>{subject.name}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>

            <h3>Studier</h3>
            <table>
              <thead>
                <tr>
                  <th className="text-left">Kode</th>
                  <th className="text-left">Navn</th>
                </tr>
              </thead>
              <tbody>
                {
                  profile.studyPrograms.map((program) => (
                    <tr key={program.code}>
                      <td>{program.code}</td>
                      <td>{program.name}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  )
}

const ExistingProfile: NextPage<{ user: User}> = ({ user }) => {
  return (
    <div className="flex w-full flex-col space-y-4">
      <div className="flex flex-col items-center justify-evenly space-y-4 mb-4">
        <AvatarImgChange {...user} />
      </div>
      <FormInput title="Navn">
        <div className="w-full flex flex-wrap justify-center ">
          <TextInput width="flex-1 mb-2 mx-1" placeholder="Fornavn" defaultValue={user.givenName} />
          <TextInput width="flex-1 mx-1" placeholder="Etternavn" defaultValue={user.familyName} />
        </div>
      </FormInput>
      <FormInput title="Epost">
        <TextInput width="flex-1" placeholder="Epost" defaultValue={user.email} />
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
