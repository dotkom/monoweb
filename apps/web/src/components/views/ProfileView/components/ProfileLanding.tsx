import AccountIcon from "@/components/icons/ProfileIcons/AccountIcon"
import { AvatarImage, Icon } from "@dotkomonline/ui"
import { Avatar } from "@radix-ui/react-avatar"
import { NextPage } from "next"
import { User } from "next-auth"

interface IFormInput {
  name: string
  children?: JSX.Element
  addMore?: string
}

const FormInput: React.FC<IFormInput> = ({ name, children, addMore }) => {
  return (
    <div className="my-10 ">
      <div className="ml-4">
        <label>{name}</label>
      </div>
      <hr className="border-slate-12 w-full opacity-50" />
      <div className="w-2/3 ml-10 space-y-3 ">
        <div className="mt-3 pl-2 flex items-center rounded-lg justify-between hover:cursor-pointer hover:bg-slate-3">
          {children}
          <Icon icon="simple-line-icons:arrow-right" width={10} />
        </div>
        <p className="text-blue-10 text-sm ">{addMore? "+ " + addMore : ""}</p>
      </div>
    </div>
  )
}

const Landing: NextPage<{ user: User }> = ({ user }) => {
  return (
    <div className="w-full my-8">
      <div className="flex flex-col w-full">
        <div className="ml-7 mt-4">
          <p className="text-4xl">Profil</p>
          <p className="opacity-70">Administrer dine kontoinnstillinger</p>
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
            <div>482 49 100</div>
          </FormInput>
          <FormInput name="Studie"></FormInput>
        </div>
        {/* <Avatar></Avatar>
        <div className="ml-8 flex w-full justify-between">
          <div>
            <p className="text-slate-12 text-[32px] font-medium tracking-[-0.06em]">{user.name}</p>
            <p className="text-slate-12 text-[14px]">Update your photo and personal details</p>
          </div>
          <div className="flex items-center gap-2"></div>
        </div>
      </div>
      <div className="mt-12">
        <p className="text-slate-12 text-[28px] font-medium tracking-[-0.06em]">Kontakt</p>
        <FormInput name="Telefon" />
        <FormInput name="Epost" value={user.email} />
      </div>
      <div className="mt-12">
        <p className="text-slate-12 text-[28px] font-medium tracking-[-0.06em]">Studie</p>
        <FormInput name="Klassetrinn" />
        <FormInput name="Startår" />
        <p className="text-slate text-center font-bold">Insert studieløp progress</p>
      </div>
      <div className="mt-12">
        <p className="text-slate-12 text-[28px] font-medium tracking-[-0.06em]">Eksterne sider</p>
        <FormInput name="GitHub" />
        <FormInput name="LinkedIn" />
        <FormInput name="Hjemmeside" /> */}
      </div>
    </div>
  )
}

export default Landing
