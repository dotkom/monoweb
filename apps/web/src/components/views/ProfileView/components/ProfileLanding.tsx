import { Icon, cn } from "@dotkomonline/ui"
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

const FormInput: React.FC<IFormInput> = ({ name, children, addMore, clickable = true }) => (
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
      <p className="text-blue-10 text-sm hover:cursor-pointer ">{addMore ? `+ ${addMore}` : ""}</p>
    </div>
  </div>
)

const Landing: NextPage<{ user: User }> = ({ user }) => (
  <div className="w-full">
    <div className="flex w-full flex-col">
      <p className="text-slate-10">Administrer dine kontoinnstillinger</p>
      <FormInput name="Profil">
        <div>
          <Avatar></Avatar>
          {user.name}
        </div>
      </FormInput>
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
