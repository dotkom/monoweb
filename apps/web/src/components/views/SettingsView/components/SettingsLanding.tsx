import { ReactCountryFlag, CountryCodes as CountryCodeProps } from "@fadi-ui/react-country-flag"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
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
import { useState } from "react"
import { CountryCodes } from "@/utils/countryCodes"
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
      <div className="flex flex-col items-center justify-evenly space-y-4 mb-4">
        <AvatarImgDropDown {...user} />
      </div>
      <FormInput title="Navn">
        <div className="w-full flex flex-wrap justify-center ">
          <TextInput width="flex-1 mb-2 mx-1" placeholder="Fornavn" defaultValue={firstName && firstName} />
          <TextInput width="flex-1 mx-1" placeholder="Etternavn" defaultValue={lastName && lastName} />
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

const AvatarImgDropDown = (user: User) => (
  <DropdownMenu>
    <DropdownMenuTrigger className="relative border-[1px] rounded-full">
      <Avatar className="w-40 h-auto">
        <AvatarImage src={user.image} alt="UserAvatar" />
        <AvatarFallback>You</AvatarFallback>
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

export const CountryCodeSelect = () => {
  const [currentCountry, setCurrentCountry] = useState<CountryCodeProps>("NO")
  return (
    <Select onValueChange={(value) => setCurrentCountry(value as CountryCodeProps)}>
      <SelectTrigger className="w-fit">
        <ReactCountryFlag countryCode={currentCountry} width={20} />
        <SelectValue placeholder="+47" defaultValue={"NO"} defaultChecked />
        <SelectIcon className="max-sm:hidden" />
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
