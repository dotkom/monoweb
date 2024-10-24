"use client"

import { trpc } from "@/utils/trpc/client"
import { UserEditableFields, type User } from "@dotkomonline/types"
import { Button, TextInput, Textarea } from "@dotkomonline/ui"
import type { NextPage } from "next"
import { useForm } from "react-hook-form"
import { SettingsField } from "../components/SettingsField"

const SettingsProfile: NextPage<{ user: User }> = ({ user }) => {
  const defaultValues = {
    phone: user.phone,
    allergies: user.allergies,
    biography: user.biography,
    gender: user.gender
  }
  const { register, handleSubmit, getValues } = useForm<UserEditableFields>({
    defaultValues
  });

  const updateMutation = trpc.user.updateMe.useMutation()

  const onSubmit = async (data: UserEditableFields) => {
    await updateMutation.mutateAsync(data)

    return false
  }

  return (
    <>
      <h2>{user.givenName} {user.familyName}</h2>
      <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <SettingsField title="Epost">
          <TextInput disabled width="flex-1" placeholder="Epost" defaultValue={user.email} />
        </SettingsField>
        <SettingsField title="Telefon">
          <TextInput width="w-full" defaultValue={user.phone} maxLength={8} {...register("phone", { 
            pattern: {
              value: /^\d{8}$/,
              message: "Telefonnummeret må være 8 siffer"
            }
          })} />
        </SettingsField>
        <SettingsField title="Bio">
          <Textarea defaultValue={user.biography} placeholder="Din råkule bio" {...register("biography")} />
        </SettingsField>
        <SettingsField title="Allergier">
          <Textarea defaultValue={user.allergies} placeholder="Dine allergier" {...register("allergies")} />
        </SettingsField>
        <div>
          <Button
            className="px-8"
            loading={updateMutation.isLoading}
            disabled={updateMutation.isLoading}
            >Lagre</Button>
        </div>
      </form>
    </>
  )
}

export default SettingsProfile
