import { StudyYearAliases } from "@dotkomonline/types"
import { Avatar, AvatarFallback, AvatarImage, Icon, cn } from "@dotkomonline/ui"
import { type NextPage } from "next"
import { type User } from "next-auth"
import StudentProgress from "@/components/molecules/StudentProgress/StudentProgress"

interface FormInputProps {
  name: string
  children?: JSX.Element
  addMore?: string
  clickable?: boolean
}

const FormInput: React.FC<FormInputProps> = ({ name, children, addMore, clickable = true }) => (
  <div className="my-10">
    <div className="ml-4">
      <label>{name}</label>
    </div>
    <hr className="border-slate-12 w-full opacity-50" />
    <div className="ml-10 space-y-3 max-md:ml-1.5">
      <div
        className={cn(
          "mt-3 flex items-center justify-between rounded-lg pl-2",
          clickable && "hover:bg-slate-3 hover:cursor-pointer"
        )}
      >
        {children}
        {clickable ? <Icon icon="simple-line-icons:arrow-right" width={10} /> : ""}
      </div>
      <p className="text-blue-10 text-sm hover:cursor-pointer ">{addMore && `+ ${addMore}`}</p>
    </div>
  </div>
)

const Landing: NextPage<{ user: User }> = ({ user }) => (
  <div className="flex w-full flex-col">
    <p className="text-slate-10">Administrer dine kontoinnstillinger</p>
    <FormInput name="Profil">
      <div className="sp flex items-center space-x-5">
        <Avatar className="h-[90px] w-[90px]">
          <AvatarImage
            src={
              user.image
                ? user.image
                : "https://www.nicepng.com/png/detail/9-92047_pickle-rick-transparent-rick-and-morty-pickle-rick.png"
            }
            alt="@UserAvatar"
          />
          <AvatarFallback>USER</AvatarFallback>
        </Avatar>
        <p>{user.name ? user.name : "Ingen registrert navn"}</p>
      </div>
    </FormInput>
    <FormInput name="Epost">
      <div>{user.email ? user.email : "Ingen registrert epostadresse"}</div>
    </FormInput>
    <FormInput name="Telefon">
      <div> (+47) 482 49 100 </div>
    </FormInput>
    <FormInput name="Studie" clickable={false}>
      <div className=" relative w-full space-y-8">
        <div className="flex">
          <p>Klassetrinn:</p>
          {/* TODO - Get study year from User */}
          <div className="flex w-full justify-center">{StudyYearAliases[0]}</div>
        </div>
        <div className="flex w-full">
          <p>Startår:</p>
        </div>
        <div className="flex w-full items-center">
          <p>Studieløp:</p>
          <div className="flex w-full justify-center">
            {/* TODO - Get study years from User */}
            <StudentProgress year={0} />
          </div>
        </div>
      </div>
    </FormInput>
  </div>
)

export default Landing
