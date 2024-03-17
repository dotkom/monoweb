import { StudyYearAliases } from "@dotkomonline/types"
import { ReactCountryFlag, CountryCodes as CountryCodeProps } from "@fadi-ui/react-country-flag"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Icon,
  Select,
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectLabel,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  TextInput,
  Textarea,
  cn,
} from "@dotkomonline/ui"
import { type NextPage } from "next"
import { type User } from "next-auth"
import StudentProgress from "@/components/molecules/StudentProgress/StudentProgress"
import { useState } from "react"
import { CountryCodes } from "@/utils/countryCodes"
import { c } from "vitest/dist/reporters-5f784f42"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const uNameList = user.name.split(" ")
  const firstName = uNameList.slice(0, -1).join(" ")
  const lastName = uNameList.slice(-1).join(" ")

  return (
    <div className="flex w-full flex-col space-y-4">
      <div className="flex items-center justify-evenly mb-4">
        <Avatar className="w-1/4 h-auto">
          <AvatarImage src={user.image} alt="@UserAvatar" />
          <AvatarFallback>USER</AvatarFallback>
        </Avatar>
        <Button onClick={() => router.push("/profile")}>Se min profil</Button>
      </div>
      <FormInput title="Navn">
        <div className="w-full flex flex-wrap justify-center  space-x-4">
          <TextInput width="flex-1" placeholder="Fornavn" defaultValue={firstName && firstName} />
          <TextInput width="flex-1" placeholder="Etternavn" defaultValue={lastName && lastName} />
        </div>
      </FormInput>
      <FormInput title="Epost">
        <TextInput width="flex-1" placeholder="Epost" defaultValue={user.email} />
      </FormInput>
      <FormInput title="Telefon">
        <div className="w-full flex space-x-2">
          <CountryCodeSelect />
          <TextInput width="flex-1" maxLength={8} />
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

const CountryCodeSelect = () => {
  const [currentCountry, setCurrentCountry] = useState<CountryCodeProps>("NO")
  return (
    <Select onValueChange={(value) => setCurrentCountry(value as CountryCodeProps)}>
      <SelectTrigger>
        <ReactCountryFlag countryCode={currentCountry} width={20} />
        <SelectValue placeholder="+ 47" defaultValue={"NO"} defaultChecked />
        <SelectIcon />
      </SelectTrigger>

      <SelectPortal>
        <SelectContent>
          <SelectScrollUpButton />
          <SelectViewport>
            <SelectGroup>
              <SelectLabel>Landskode</SelectLabel>
              {CountryCodes.sort((a, b) => a.dial_code.localeCompare(b.dial_code)).map((country) => (
                <div className="flex flex-row items-center justify-between">
                  <SelectItem
                    label={country.dial_code}
                    value={country.code}
                    onClick={() => {
                      setCurrentCountry(country.code as CountryCodeProps)
                      console.log(currentCountry)
                    }}
                  />
                  <ReactCountryFlag countryCode={country.code as CountryCodeProps} width={20} />
                </div>
              ))}
            </SelectGroup>
          </SelectViewport>
          <SelectScrollDownButton />
        </SelectContent>
      </SelectPortal>
    </Select>
  )
}

export default Landing
