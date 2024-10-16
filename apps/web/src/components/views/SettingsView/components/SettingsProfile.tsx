"use client"

import { CountryCodeSelect } from "@/app/settings/components/CountryCodeSelect"
import { trpc } from "@/utils/trpc/client"
import { UserEditableFields, type FeideDocumentation, type Membership, type User } from "@dotkomonline/types"
import { Button, Select, SelectContent, SelectGroup, SelectIcon, SelectLabel, SelectPortal, SelectTrigger, SelectValue, SelectViewport, TextInput, Textarea } from "@dotkomonline/ui"
import clsx from "clsx"
import { cva } from "cva"
import type { NextPage } from "next"
import { useForm } from "react-hook-form"

interface FormInputProps {
  title: string
  children?: JSX.Element
}

const FormInput: React.FC<FormInputProps> = ({ title, children }) => (
  <div className="w-full border-b-[1px] last-of-type:border-b-0 border-slate-7 flex py-8 justify-between">
    <div className="w-1/4">{title}:</div>
    <div className="flex-1 flex justify-center">{children}</div>
  </div>
)

const SettingsProfile: NextPage<{ user: User, membership?: Membership }> = ({ user }) => {
  const { register, handleSubmit } = useForm<UserEditableFields>({
    defaultValues: {
      phone: user.phone,
      allergies: user.allergies,
      biography: user.biography,
      gender: user.gender
    },
  });

  const updateMutation = trpc.user.updateMe.useMutation()

  const onSubmit = async (data: UserEditableFields) => {
    await updateMutation.mutateAsync(data)

    return false
  }

  return (
    <div className="flex w-full flex-col space-y-4">
      <h2>{user.givenName} {user.familyName}</h2>
      <form className="flex flex-col space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <FormInput title="Epost">
          <TextInput disabled width="flex-1" placeholder="Epost" defaultValue={user.email} />
        </FormInput>
        <FormInput title="Telefon">
          <div className="w-full flex space-x-2">
            <TextInput width="w-full" maxLength={8} {...register("phone", { 
              pattern: {
                value: /^\d{8}$/,
                message: "Telefonnummeret må være 8 siffer"
              }
            })} />
          </div>
        </FormInput>
        <FormInput title="Bio">
          <Textarea placeholder="Din råkule bio" {...register("biography")} />
        </FormInput>
        <FormInput title="Allergier">
          <Textarea placeholder="Dine allergier" {...register("allergies")} />
        </FormInput>
        <div>
          <Button
            className="px-8"
            loading={updateMutation.isLoading}>Lagre</Button>
        </div>
      </form>

      <h2>Medlemskap</h2>
      <FormInput title="Studieretning">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Studieretning" />
            <SelectIcon />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent>
              <SelectViewport>
                <SelectGroup>
                  <SelectLabel>Landskode</SelectLabel>
                </SelectGroup>
              </SelectViewport>
            </SelectContent>
          </SelectPortal>
        </Select>
      </FormInput>
      <FormInput title="Årstrinn">
        <TextInput placeholder="Studieretning" />
      </FormInput>
    </div>
  )
}

export default SettingsProfile
