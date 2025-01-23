"use client"
import { trpc } from "@/utils/trpc/client"
import type { User } from "@dotkomonline/types"
import { Button, TextInput, Textarea } from "@dotkomonline/ui"
import type { NextPage } from "next"
import { useForm } from "react-hook-form"

interface FormInputProps {
  title: string
  children?: JSX.Element
}

const FormInput: React.FC<FormInputProps> = ({ title, children }) => (
  <div className="w-full border-t-[1px] first-of-type:border-0 first-of-type:pt-0 border-slate-7 flex pt-16 justify-between px-4">
    <div className="w-1/4">{title}:</div>
    <div className="flex-1 flex justify-center">{children}</div>
  </div>
)

type EditableFields = Pick<User, "firstName" | "lastName" | "biography" | "allergies" | "gender" | "phone">

const Landing: NextPage<{ user: User }> = ({ user }) => {
  const { register, handleSubmit } = useForm<EditableFields>({
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      biography: user.biography,
      allergies: user.allergies,
      gender: user.gender,
      phone: user.phone,
    },
  })

  const updateUserMutation = trpc.user.update.useMutation()

  function handleSubmitForm(data: EditableFields) {
    updateUserMutation.mutate({
      id: user.id,
      input: data,
    })

    return false
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="flex flex-col space-y-4 pb-4">
      {/*
      <div className="flex flex-col items-center justify-evenly space-y-4 mb-4">
        <AvatarImgChange {...user} />
      </div>
      */}
      <FormInput title="Epost">
        <TextInput width="flex-1" placeholder="Epost" defaultValue={user.email} disabled />
      </FormInput>
      <FormInput title="Navn">
        <div className="w-full flex flex-wrap justify-center ">
          <TextInput
            width="flex-1 mb-2 mx-1"
            placeholder="Fornavn"
            defaultValue={user.firstName}
            {...register("firstName")}
          />
          <TextInput
            width="flex-1 mx-1"
            placeholder="Etternavn"
            defaultValue={user.lastName}
            {...register("lastName")}
          />
        </div>
      </FormInput>
      <FormInput title="Telefon">
        <div className="w-full flex space-x-2">
          <TextInput
            width="w-full"
            maxLength={12}
            placeholder="Telefon"
            defaultValue={user.phone}
            {...register("phone")}
          />
        </div>
      </FormInput>
      {/*
      <FormInput title="Bio">
        <Textarea placeholder="Din råkule bio" {...register("biography")} />
      </FormInput>
      */}
      <FormInput title="Allergier">
        <Textarea placeholder="Dine allergier" {...register("allergies")} />
      </FormInput>
      <FormInput title="Kjønn">
        <div className="w-full">
          <select {...register("gender")} defaultValue={user.gender} className="px-4 py-2">
            <option value="male">Mann</option>
            <option value="female">Kvinne</option>
            <option value="other">Annet</option>
          </select>
        </div>
      </FormInput>
      <Button type="submit" className="px-8" loading={updateUserMutation.isLoading}>
        Lagre
      </Button>
    </form>
  )
}

export default Landing
