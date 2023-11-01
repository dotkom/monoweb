import { useState } from "react"
import { Button, Icon, cn } from "@dotkomonline/ui"
import { Avatar } from "@radix-ui/react-avatar"
import { type NextPage } from "next"
import { type User } from "next-auth"
import StudentProgress from "@/components/molecules/StudentProgress/StudentProgress"

interface IFormInput {
  name: string
  children?: JSX.Element
  addMore?: string
  clickable?: boolean
}

const FormInput: React.FC<IFormInput> = ({ name, children, addMore, clickable = true }) => {
  const [extraFields, setExtraFields] = useState<JSX.Element | null>(null)

  const addExtraField = (fieldType: "email" | "tel", placeholder: string) => {
    if (!extraFields) {
      const newField = (
        <div>
          <input type={fieldType} className="my-2 rounded border p-1" placeholder={placeholder} />
          <Button color="blue" variant="solid" size="sm" className="ml-2">
            Legg til
          </Button>
        </div>
      )
      setExtraFields(newField)
    }
  }

  const handleClick = () => {
    if (addMore === "Legg til epostadresse") {
      addExtraField("email", "Ny epost")
    } else if (addMore === "Legg til telefonnummer") {
      addExtraField("tel", "Nytt telefonnummer")
    }
  }

  return (
    <div>
      <div className="my-10 ">
        <div className="ml-4">
          <label>{name}</label>
        </div>
        <hr className="border-slate-12 w-full opacity-50" />
        <div className="ml-10 w-2/3 space-y-3 ">
          <div
            className={cn(
              "mt-3 flex items-center justify-between rounded-lg pl-2",
              clickable && "hover:bg-slate-3 hover:cursor-pointer"
            )}
          >
            {children}
            {clickable ? <Icon icon="simple-line-icons:arrow-right" width={10} /> : ""}
          </div>
          <button onClick={handleClick}>
            <p className="text-blue-10 text-sm hover:cursor-pointer">
              {addMore ? `+ ${addMore}` : ""}
            </p>
          </button>
          {extraFields}
        </div>
      </div>
      <hr className="border-slate-12 w-full opacity-50" />
      <div className="ml-10 w-2/3 space-y-3 ">
        <div
          className={cn(
            "mt-3 flex items-center justify-between rounded-lg pl-2",
            clickable && "hover:bg-slate-3 hover:cursor-pointer"
          )}
        >
          {children}
          {clickable ? <Icon icon="simple-line-icons:arrow-right" width={10} /> : ""}
        </div>
        <p className="text-blue-10 text-sm hover:cursor-pointer ">{addMore ? `+ ${addMore}` : ""}</p>
      </div>
    </div>
  )
}

const Landing: NextPage<{ user: User }> = ({ user }) => (
  <div className="my-8 w-full">
    <div className="flex w-full flex-col">
      <div className="ml-7 mt-4">
        <p className="text-4xl">Profil</p>
        <p className="opacity-70">Administrer dine kontoinnstillinger</p>
        <FormInput name="Profil">
          <div>
            <Avatar></Avatar>
            {user.name || "Ingen registrerte navn"}
          </div>
        </FormInput>
        <FormInput name="Epost" addMore="Legg til epostadresse">
          <div>{user.email || "Ingen registrerte eposter"}</div>
        </FormInput>
        <FormInput name="Telefon" addMore="Legg til telefonnummer">
          <div> (+47) 482 49 100</div>
        </FormInput>
        <FormInput name="Studie" clickable={false}>
          <div className="space-y-8">
            <div>
              <p>Klassetrinn: </p>
            </div>
            <div>
              <p>Startår:</p>
            </div>
            <div className="flex items-center space-x-10 ">
              <p>Studieløp:</p>
              <StudentProgress year={0} />
            </div>
          </div>
        </FormInput>
      </div>
      <FormInput name="Epost" addMore="Add Email Address">
        <div>{user.email}</div>
      </FormInput>
      <FormInput name="Telefon" addMore="Add Phone Number">
        <div> (+47) 482 49 100</div>
      </FormInput>
      <FormInput name="Studie" clickable={false}>
        <div className="space-y-8">
          <div>
            <p>Klassetrinn: </p>
          </div>
          <div>
            <p>Startår:</p>
          </div>
          <div className="flex items-center space-x-10 ">
            <p>Studieløp:</p>
            <StudentProgress year={0} />
          </div>
        </div>
      </FormInput>
    </div>
  </div>
)


export default Landing
