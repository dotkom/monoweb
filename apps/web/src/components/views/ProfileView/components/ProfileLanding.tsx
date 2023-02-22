import { Button, TextInput } from "@dotkomonline/ui"
import { Avatar } from "@radix-ui/react-avatar"
import { NextPage } from "next"
import { User } from "next-auth"
import { useSession } from "next-auth/react"
import { useContext, useEffect, useState } from "react"
import { ProfileContext } from "../context/ProfileContext"

interface IFormInput {
  name: string
  value?: string | null | undefined
}

const FormInput: React.FC<IFormInput> = ({ name, value }) => {
  const { editMode, profileDetails, setProfileDetails } = useContext(ProfileContext)

  return (
    <>
      <div className="flex w-[450px] items-center justify-between">
        <label>{name}</label>
        {editMode ? (
          <TextInput
            placeholder={name}
            value={value ?? ""}
            onChange={(e) => setProfileDetails({ ...profileDetails, email: e.target.value })}
            className="w-full"
          />
        ) : (
          <p className="text-slate-12 flex min-h-[37px] items-center">{value ?? name}</p>
        )}
      </div>
      <hr className="border-slate-12 my-5 w-full" />
    </>
  )
}

const Landing: NextPage = () => {
  const { data } = useSession()
  const profileContext = useContext(ProfileContext)
  const { editMode, setEditMode } = profileContext
  const toggleEditMode = () => setEditMode(!editMode)

  const { id, email, image, name } = data?.user || {}

  // Handler for when profile values are saved
  const handleSaveProfile = () => {
    // Do some data validation and store in DB
    // someDBCall()

    toggleEditMode()
  }

  const [tempDetails, setTempDetails] = useState<User | null>()

  profileContext.profileDetails = tempDetails
  profileContext.setProfileDetails = setTempDetails

  useEffect(() => {
    setTempDetails({
      id,
      email,
      image,
      name,
    })
  }, [id, email, image, name])

  return (
    <div className="w-full">
      <div className="flex w-full items-end">
        <Avatar></Avatar>
        <div className="ml-8 flex w-full justify-between">
          <div>
            <p className="text-slate-12 text-[32px] font-medium tracking-[-0.06em]">{name}</p>
            <p className="text-slate-12 text-[14px]">Update your photo and personal details</p>
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
        <p className="text-slate-12 text-[28px] font-medium tracking-[-0.06em]">Kontakt</p>
        <FormInput name="Brukernavn" value={name} />
        <FormInput name="Telefon" />
        <FormInput name="Epost" value={email} />
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
        <FormInput name="Hjemmeside" />
      </div>
    </div>
  )
}

export default Landing
