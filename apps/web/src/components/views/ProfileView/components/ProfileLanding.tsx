import AvatarImage from "@/components/organisms/Navbar/components/profile/AvatarImage"
import { Button, TextInput } from "@dotkomonline/ui"
import { Session } from "next-auth"
import { useSession } from "next-auth/react"
import { useContext, useEffect, useState } from "react"
import { ProfileContext } from "../context/ProfileContext"

interface IFormInput {
  name: string
}

const FormInput: React.FC<IFormInput> = ({ name }) => {
  const { editMode } = useContext(ProfileContext)

  useEffect(() => {
    console.log("edit mode changed")
  }, [editMode])

  return (
    <>
      <div className="flex w-[450px] items-center justify-between">
        <label>{name}</label>
        {editMode ? <TextInput placeholder={name} className="w-full" /> : <p className="text-slate">{name}</p>}
      </div>
      <hr className="border-slate-12 my-5 w-full" />
    </>
  )
}

const isAuthenticated = (data: Session | null) => {
  return data != null && data?.user.id
}

const Landing = () => {
  const { data } = useSession()

  if (!isAuthenticated(data)) {
    // Some logic to redirect user
    console.log("User is not authenticated")
  }

  const { editMode } = useContext(ProfileContext)
  const ctx = useContext(ProfileContext)
  const toggleEditMode = () => {
    ctx.setEditMode(!editMode)
  }

  const { id, email, image, name } = data?.user || {}

  // Handler for when profile values are saved
  const handleSaveProfile = () => {
    // Do some data validation and store in DB
    // someDBCall()

    toggleEditMode()
  }

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
            {editMode ? (
              <>
                <Button variant={"subtle"} color="slate" onClick={toggleEditMode}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>Save</Button>{" "}
              </>
            ) : (
              <Button onClick={toggleEditMode}>Edit</Button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-12">
        <p className="text-slate text-[28px] font-medium tracking-[-0.06em]">Kontakt</p>
        <FormInput name="Brukernavn" />
        <FormInput name="Telefon" />
        <FormInput name="Epost" />
      </div>
      <div className="mt-12">
        <p className="text-slate text-[28px] font-medium tracking-[-0.06em]">Studie</p>
        <FormInput name="Klassetrinn" />
        <FormInput name="Startår" />
        <p className="text-slate text-center font-bold">Insert studieløp progress</p>
      </div>
      <div className="mt-12">
        <p className="text-slate text-[28px] font-medium tracking-[-0.06em]">Eksterne sider</p>
        <FormInput name="GitHub" />
        <FormInput name="LinkedIn" />
        <FormInput name="Hjemmeside" />
      </div>
    </div>
  )
}

export default Landing
