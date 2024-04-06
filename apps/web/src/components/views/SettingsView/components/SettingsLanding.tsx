import { TextInput, Textarea, cn } from "@dotkomonline/ui"
import { type NextPage } from "next"
import { type User } from "next-auth"
import AvatarImgChange from "@/app/settings/components/ChangeAvatar"
import { CountryCodeSelect } from "@/app/settings/components/CountryCodeSelect"

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

const Landing: NextPage<{ user: User }> = ({ user }) => {
  const uNameList = user.name.split(" ")
  const firstName = uNameList.slice(0, -1).join(" ")
  const lastName = uNameList.slice(-1).join(" ")

  return (
    <div className="flex w-full flex-col space-y-4">
      <div className="flex flex-col items-center justify-evenly space-y-4 mb-4">
        <AvatarImgChange {...user} />
      </div>
      <FormInput title="Navn">
        <div className="w-full flex flex-wrap justify-center ">
          <TextInput width="flex-1 mb-2 mx-1" placeholder="Fornavn" defaultValue={firstName} />
          <TextInput width="flex-1 mx-1" placeholder="Etternavn" defaultValue={lastName} />
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

export default Landing
