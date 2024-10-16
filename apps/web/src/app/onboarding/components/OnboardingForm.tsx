"use client"

import { Button, Select, SelectContent, SelectGroup, SelectIcon, SelectItem, SelectLabel, SelectPortal, SelectTrigger, SelectValue, SelectViewport, TextInput, Textarea } from "@dotkomonline/ui"
import { FeideDocumentation, UserEditableFields } from "@dotkomonline/types";
import { forwardRef, PropsWithChildren } from "react";
import { NextPage } from "next";
import { Controller, useForm } from "react-hook-form";
import { trpc } from "@/utils/trpc/client";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";

const SimpleSelect = forwardRef<HTMLButtonElement, { options: { label: string, value: string }[] } & React.ComponentProps<typeof Select>>(
  ({ options, value, onValueChange, ...props }, ref) => <Select {...props} value={value} onValueChange={e => onValueChange?.(e)}>
    <SelectTrigger ref={ref} value={value}>
      <SelectValue placeholder="Velg" />
      <SelectIcon />
    </SelectTrigger>
    <SelectPortal>
      <SelectContent>
        <SelectViewport>
          <SelectGroup>
            {options.map(option => (
              <SelectItem key={option.value} label={option.label} value={option.value} />
            ))}
          </SelectGroup>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </Select>
)

const SignupSection = ({ children, label, reason }: PropsWithChildren<{label: string, reason: string}>) => (
  <div className="flex flex-col py-2">
    <label htmlFor="phone">{label}:</label>
    <div className="w-full flex space-x-2 mb-1">
      {children}
    </div>
    <p className="text-xs text-slate-9">{reason}</p>
  </div>
)

export const OnboardingForm: NextPage<{ session: Session, feideDocumentationJWT: string }> = ({ feideDocumentationJWT, session }) => {
  const { register, control, handleSubmit } = useForm<UserEditableFields>({
    defaultValues: {
      phone: "",
      allergies: "",
      gender: undefined,
      biography: "",
    }
  })

  const router = useRouter();

  const signupMutation = trpc.user.signup.useMutation();
  const membershipMutation = trpc.membership

  const onSubmit = async (data: UserEditableFields) => {
    console.log("data:", data)
    const result = await signupMutation.mutateAsync({
      signupInformation: data,
      feideDocumentationJWT: feideDocumentationJWT
    })
    router.push("/");
  }
  
  return <div className="flex w-full flex-col space-y-4">
    <form onSubmit={handleSubmit(onSubmit)}>
      <SignupSection label="Telefonnummer" reason="Dette vil bli brukt til å kontakte deg om arrangementer og lignende.">
        <TextInput required width="w-full" maxLength={8} {...register("phone")} />
      </SignupSection>

      <SignupSection label="Allergier" reason="Dette vil bli brukt til å tilpasse mat på arrangementer.">
        <TextInput width="w-full" {...register("allergies")} />
      </SignupSection>

      <SignupSection label="Kjønn" reason="Dette brukes til å føre statistikk. ">
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <SimpleSelect
              options={[
                { label: "Kvinne", value: "female" },
                { label: "Mann", value: "male"},
                { label: "Annet", value: "other" },
              ]}
              value={field.value}
              onValueChange={field.onChange}
              required
            />
          )}
        />
      </SignupSection>

      <SignupSection label="Bio" reason="Dette vil bli vist på din profil.">
        <Textarea {...register("biography")} />
      </SignupSection>

      <Button color="green" variant="solid" className="text-white px-6" loading={signupMutation.isLoading && !signupMutation.isPaused}>
        Fullfør profil
      </Button>
    </form>
  </div>
}
