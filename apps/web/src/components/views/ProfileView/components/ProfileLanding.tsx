import { Icon, cn } from "@dotkomonline/ui"
import StudentProgress from "@/components/molecules/StudentProgress/StudentProgress"
import { Avatar } from "@radix-ui/react-avatar"
import { NextPage } from "next"
import { User } from "next-auth"

interface FormInputProps {
  name: string
  children?: JSX.Element
  addMore?: string
  clickable?: boolean
}

const FormInput: React.FC<FormInputProps> = ({ name, children, addMore, clickable = true }) => {
  return (
    <div className="my-10 ">
      <div className="ml-4">
        <label>{name}</label>
      </div>
      <hr className="border-slate-12 opacity-50" />
      <div className="mt-1 w-full space-y-3">
        <div
          className={cn(
            "flex items-center justify-between rounded-lg pl-2",
            clickable && "hover:bg-slate-3 hover:cursor-pointer"
          )}
        >
          {children}
          {clickable ? <Icon icon="simple-line-icons:arrow-right" width={10} /> : ""}
        </div>
        <p className="text-blue-10 text-sm hover:cursor-pointer ">{addMore ? "+ " + addMore : ""}</p>
      </div>
    </div>
  )
}

const Landing: NextPage<{ user: User }> = ({ user }) => {
  return (
    <div className="flex w-full flex-col">
      <p className="text-slate-10">Administrer dine kontoinnstillinger</p>
      <FormInput name="Profil">
        <div>
          <Avatar></Avatar>
          {user.name ?? "No registred name"}
        </div>
      </FormInput>
      <FormInput name="Epost" addMore="Add Email Address">
        <div>{user.email ?? "No registred email"}</div>
      </FormInput>
      <FormInput name="Telefon" addMore="Add Phone Number">
        <div> (+47) 482 49 100</div>
      </FormInput>
      <FormInput name="Studie" clickable={false}>
        <div className="w-full space-y-8">
          <div>
            <p>Klassetrinn: </p>
          </div>
          <div>
            <p>Startår:</p>
          </div>
          <div className="flex w-full items-center space-x-10 max-sm:space-x-1 ">
            <p>Studieløp:</p>
            <StudentProgress year={0} />
          </div>
        </div>
      </FormInput>
    </div>
  )
}

export default Landing
