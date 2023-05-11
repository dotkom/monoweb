import StudentProgress from "@/components/molecules/StudentProgress/StudentProgress"
import { useUser } from "@clerk/nextjs"
import { Avatar } from "@radix-ui/react-avatar"
import { NextPage } from "next"

interface IFormInput {
  name: string
  value?: string | null | undefined
}

const FormInput: React.FC<IFormInput> = ({ name, value }) => {
  return (
    <>
      <div className="flex w-[450px] items-center justify-between">
        <label>{name}</label>
        <p className="text-slate-12 flex min-h-[37px] items-center">{value ?? name}</p>
      </div>
      <hr className="border-slate-12 my-5 w-full" />
    </>
  )
}

const Landing: NextPage = () => {
  const { user } = useUser()

  return (
    <div className="w-full">
      <div className="flex w-full items-end">
        <Avatar></Avatar>
        <div className="ml-8 flex w-full justify-between">
          <div>
            <p className="text-slate-12 text-[32px] font-medium tracking-[-0.06em]">{user?.username}</p>
            <p className="text-slate-12 text-[14px]">Update your photo and personal details</p>
          </div>
          <div className="flex items-center gap-2"></div>
        </div>
      </div>
      <div className="mt-12">
        <p className="text-slate-12 text-[28px] font-medium tracking-[-0.06em]">Kontakt</p>
        <FormInput name="Brukernavn" value={user?.username} />
        <FormInput name="Telefon" />
        <FormInput name="Epost" value={user?.primaryEmailAddress?.emailAddress} />
      </div>
      <div className="mt-12">
        <p className="text-slate-12 text-[28px] font-medium tracking-[-0.06em]">Studie</p>
        <FormInput name="Klassetrinn" />
        <FormInput name="Startår" />
      </div>
      {/* !!!Trenger mer funksjonalitet (year er satt manuelt her)!!! */}
      <div className="mt-12">
        <StudentProgress year={0} />
      </div>
      {/* !!!-------------!!! */}
      <div className="mt-12">
        <p className="text-slate-12 text-[28px] font-medium tracking-[-0.06em]">Eksterne sider</p>
        <FormInput name="GitHub" />
        <FormInput name="LinkedIn" />
        <FormInput name="Hjemmeside" />
      </div>
    </div>
  )
}

export default Landing
