import { CountryCodeSelect } from "@/app/settings/components/CountryCodeSelect"
import { type FeideDocumentation, type Membership, type User } from "@dotkomonline/types"
import { Button, Select, SelectContent, SelectGroup, SelectIcon, SelectLabel, SelectPortal, SelectTrigger, SelectValue, SelectViewport, TextInput, Textarea } from "@dotkomonline/ui"
import type { NextPage } from "next"

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

const SettingsProfile: NextPage<{ user: User, membership?: Membership }> = ({ user }) => {
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
        <Textarea placeholder="Din råkule bio" value={""} />
      </FormInput>
      <FormInput title="Allergier">
        <Textarea placeholder="Dine allergier" value={user.allergies} />
      </FormInput>
      <h2>Medlemskap</h2>
      <FormInput title="Studieretning">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Studieretning" />
            <SelectIcon />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent>
              <SelectViewport>
                <SelectGroup>
                  <SelectLabel>Landskode</SelectLabel>
                </SelectGroup>
              </SelectViewport>
            </SelectContent>
          </SelectPortal>
        </Select>
      </FormInput>
      <FormInput title="Årstrinn">
        <TextInput placeholder="Studieretning" />
      </FormInput>
    </div>
  )
}

export default SettingsProfile
