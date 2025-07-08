"use client"

import { useTRPC } from "@/utils/trpc/client"
import type { User } from "@dotkomonline/types"
import {
  Button,
  Icon,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  TextInput,
  Textarea,
} from "@dotkomonline/ui"
import { useMutation } from "@tanstack/react-query"
import type { NextPage } from "next"
import type { FC, PropsWithChildren } from "react"
import { useForm } from "react-hook-form"

type FormInputProps = {
  title: string
} & PropsWithChildren

type EditableFields = Pick<User, "firstName" | "lastName" | "biography" | "allergies" | "gender" | "phone">

const FormInput: FC<FormInputProps> = ({ title, children }) => (
  <div className="flex flex-col gap-1 w-full">
    <div className="uppercase text-xs font-bold tracking-wide">{title}</div>
    {children}
  </div>
)

export const Landing: NextPage<{ user: User }> = ({ user }) => {
  const trpc = useTRPC()
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

  const updateUserMutation = useMutation(trpc.user.update.mutationOptions())

  function handleSubmitForm(data: EditableFields) {
    updateUserMutation.mutate({
      id: user.id,
      input: data,
    })

    return false
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="flex flex-col gap-4">
      {/*
      <div className="flex flex-col items-center justify-evenly space-y-4 mb-4">
        <AvatarImgChange {...user} />
      </div>
      */}

      <FormInput title="E-post">
        <TextInput width="flex-1" placeholder="E-post" defaultValue={user.email} disabled />
      </FormInput>

      <FormInput title="Navn">
        <div className="flex flex-row w-full gap-2">
          <TextInput
            width="flex-grow"
            placeholder="Fornavn"
            defaultValue={user.firstName ?? undefined}
            {...register("firstName")}
          />
          <TextInput
            width="flex-grow"
            placeholder="Etternavn"
            defaultValue={user.lastName ?? undefined}
            {...register("lastName")}
          />
        </div>
      </FormInput>

      <FormInput title="Telefon">
        <TextInput
          width="w-full"
          maxLength={12}
          placeholder="Telefon"
          defaultValue={user.phone ?? undefined}
          {...register("phone")}
        />
      </FormInput>

      <FormInput title="Bio">
        <Textarea placeholder="Din råkule bio" {...register("biography")} />
      </FormInput>

      <FormInput title="Allergier">
        <Textarea placeholder="Dine allergier" {...register("allergies")} />
      </FormInput>

      <FormInput title="Kjønn">
        <div className="w-full">
          <Select {...register("gender")}>
            <SelectTrigger className="max-w-48">
              <SelectValue placeholder="Kjønn" className="placeholder:text-slate-8 transition-all" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Velg kjønn</SelectLabel>
                <SelectItem value="male">Mann</SelectItem>
                <SelectItem value="female">Kvinne</SelectItem>
                <SelectItem value="other">Annet</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </FormInput>

      <Button type="submit" className="px-8">
        {updateUserMutation.isPending ? <Icon icon="tabler:loader-2" className="animate-spin" /> : "Lagre"}
      </Button>
    </form>
  )
}
