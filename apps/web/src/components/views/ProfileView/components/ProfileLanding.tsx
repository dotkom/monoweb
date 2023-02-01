import AvatarImage from "@/components/organisms/Navbar/components/profile/AvatarImage"
import { Button, TextInput } from "@dotkomonline/ui"
import { useSession } from "next-auth/react"

interface IFormInput {
  name: string
}

const FormInput: React.FC<IFormInput> = ({ name }) => {
  return (
    <>
      <div className="flex w-[450px] items-center justify-between">
        <label>{name}</label>
        <TextInput placeholder={name} className="w-full" />
      </div>
      <hr className="border-slate-12 my-5 w-full" />
    </>
  )
}

const Landing = () => {
  const { data } = useSession()

  const { id, email, image, name } = data?.user || {}

  return (
    <div className="w-full">
      <div className="flex w-full items-end">
        <AvatarImage src={image} radius="128px" />
        <div className="ml-8 flex w-full justify-between">
          <div>
            <p className="text-slate text-[32px] font-medium tracking-[-0.06em]">{name}</p>
            <p className="text-slate text-[14px]">Update your photo and personal details</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={"subtle"} color="slate">
              Cancel
            </Button>
            <Button>Save</Button>
          </div>
        </div>
      </div>
      <div className="mt-12">
        <p className="text-slate text-[28px] font-medium tracking-[-0.06em]">Kontakt</p>
        <FormInput name="Username" />
        <FormInput name="Telephone" />
      </div>
    </div>
  )
}

export default Landing
