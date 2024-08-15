"use client"
import AvatarImgChange from "@/app/settings/components/ChangeAvatar"
import { trpc } from "@/utils/trpc/client"
import type { UserWrite } from "@dotkomonline/types"
import { Button, PhoneInput, TextInput, Textarea, isValidPhoneNumber } from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import type { NextPage } from "next"
import type { User } from "next-auth"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const nameSchema = z
  .string()
  .min(2, "Navn må være minst 2 bokstaver")
  .max(50, "Navn kan maks være 50 bokstaver")
  .regex(/^[a-zA-ZæøåÆØÅ\s'-]+$/, "Navn kan ikke inneholde tall eller spesialtegn bortsett fra - og '")
  .toLowerCase()
  .trim()
  .transform((v) =>
    v
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  )

const updateUserSchema = z.object({
  givenName: nameSchema,
  familyName: nameSchema,
  email: z.string().email("Ikke en gyldig epost"),
  phone: z
    .string()
    .refine((v) => isValidPhoneNumber(v), "Ikke et gyldig telefonnummer")
    .optional(),
  allergies: z.array(z.string()).optional(),
  picture: z.string().optional(),
})

const Landing: NextPage<{ user: User }> = ({ user }) => {
  const [allergies, setAllergies] = useState<string>()
  const updateUser = trpc.user.update.useMutation()
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, dirtyFields, isSubmitting },
  } = useForm<UserWrite>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      ...user,
    },
  })

  const formatAllergies = (allergies: string) => {
    setAllergies(
      allergies
        .toLowerCase()
        .replace(/[\s,]+/g, ",")
        .replace(/(^\w|,\w)/g, (match) => match.toUpperCase())
    )
  }

  const onSubmit = async (data: UserWrite) => {
    const [firstName, ...rest] = data.givenName.split(" ")
    const middleName = rest.join(" ") || null
    const fakePopulatedData = {
      ...data,
      givenName: firstName,
      middleName: middleName,
      name: `${data.givenName} ${data.familyName}`,

      /* Add fake data as the session token does not currently give a full user */
      phone: data.phone || null,
      auth0Id: "auth0|c75f2ffa-4b07-41c2-b173-273a2b443c6d",
      gender: "male" as const,
      studyYear: 2,
      picture: "https://example.com/image.jpg",
      lastSyncedAt: new Date(),
    }
    await updateUser.mutateAsync(
      { data: fakePopulatedData },
      {
        onSuccess: (data) => {
          // change to toast when toast-functionality is implemented and remove console.log and alert
          console.log("Success:", data)
          alert("Endringer lagret")
        },
        onError: (error) => {
          // change to toast when toast-functionality is implemented and remove console.log and alert
          console.log("Error:", error)
          alert("Noe gikk galt, prøv igjen")
        },
      }
    )
  }

  return (
    <div className="flex w-full flex-col space-y-4 py-2">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col items-center justify-evenly mb-4">
          <AvatarImgChange {...user} />
        </div>
        <FormInputContainer title="Navn" required>
          <div className="w-full flex flex-wrap justify-center h-full ">
            <TextInput
              width="flex-1 mb-2 mx-1"
              placeholder="Fornavn"
              defaultValue={user.givenName}
              {...register("givenName")}
              error={errors.givenName?.message}
            />
            <TextInput
              width="flex-1 mx-1"
              placeholder="Etternavn"
              defaultValue={user.familyName}
              {...register("familyName")}
              error={errors.familyName?.message}
            />
          </div>
        </FormInputContainer>
        <FormInputContainer title="Epost" required>
          <TextInput
            width="flex-1"
            placeholder="Epost"
            defaultValue={user.email}
            {...register("email")}
            error={errors.email?.message}
          />
        </FormInputContainer>
        <FormInputContainer title="Telefon">
          <PhoneInput
            width="w-full"
            placeholder="Telefonnummer"
            defaultValue={user.phone || undefined}
            onChange={(value: string) => {
              setValue("phone", value, { shouldDirty: true })
              trigger("phone")
            }}
            error={errors.phone?.message}
          />
        </FormInputContainer>
        <FormInputContainer title="Allergier">
          <Textarea
            spellCheck="false"
            placeholder="Dine allergier"
            defaultValue={user.allergies?.join(",")}
            value={allergies}
            {...register("allergies", {
              onChange: (e) => {
                formatAllergies(e.target.value)
              },
              setValueAs: (v: string) => (v ? v.split(",").filter((a) => a.length > 0) : []),
            })}
          />
        </FormInputContainer>
        {Object.keys(dirtyFields).length > 0 && (
          <Button type="submit" className="w-full my-2 fade-in-25" loading={isSubmitting}>
            Lagre
          </Button>
        )}
      </form>
    </div>
  )
}
interface FormInputContainerProps {
  title: string
  children?: JSX.Element
  required?: boolean
}

const FormInputContainer: React.FC<FormInputContainerProps> = ({ title, children, required }) => (
  <div className="w-full border-t-[1px] border-slate-7 flex pt-12 justify-between px-4">
    <div className="w-1/4">
      {title}:{required && "*"}
    </div>
    <div className="flex-1 flex min-h-24 justify-center">{children}</div>
  </div>
)

export default Landing
