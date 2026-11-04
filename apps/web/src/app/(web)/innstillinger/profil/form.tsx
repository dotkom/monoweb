"use client"

import { useTRPC } from "@/utils/trpc/client"
import { GenderSchema, type User, UserWriteSchema, getGenderName } from "@dotkomonline/rpc/user"
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Text,
  TextInput,
  Textarea,
  cn,
} from "@dotkomonline/ui"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconAlertTriangle, IconCheck, IconLoader, IconX } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { secondsToMilliseconds } from "date-fns"
import { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"
import type { z } from "zod"

const GENDER_OPTIONS = GenderSchema.options.map((option) => ({
  label: getGenderName(option),
  value: option,
}))

const ProfileFormSchema = UserWriteSchema.omit({
  workspaceUserId: true,
  name: true,
  email: true,
  imageUrl: true,
})

export type FormUserWrite = z.output<typeof ProfileFormSchema>
type FormUserWriteInput = z.input<typeof ProfileFormSchema>

function getProfileFormValues(user: User): FormUserWrite {
  return {
    username: user.username,
    biography: user.biography ?? null,
    phone: user.phone ?? null,
    gender: user.gender,
    dietaryRestrictions: user.dietaryRestrictions ?? null,
  }
}

interface FormProps {
  user: User
  onSubmit: (data: FormUserWrite) => void
  isSaving?: boolean
  saveSuccess?: boolean
  saveError?: string | null
  resetSaveState?: () => void
}

export function ProfileForm({ user, onSubmit, isSaving, saveSuccess, saveError, resetSaveState }: FormProps) {
  const savedValues = getProfileFormValues(user)

  const {
    register,
    control,
    reset,
    formState: { errors, isDirty },
    handleSubmit,
  } = useForm<FormUserWriteInput, unknown, FormUserWrite>({
    defaultValues: savedValues,
    mode: "onTouched",
    reValidateMode: "onBlur",
    resolver: zodResolver(ProfileFormSchema),
  })

  const username = useWatch({ control, name: "username" })
  const [debouncedSlug] = useDebounce(username, 500)

  const trpc = useTRPC()

  const isUsernameChanged = Boolean(debouncedSlug && debouncedSlug !== user.username)

  const { data: fetchedUser, isFetching: isUserFetching } = useQuery(
    trpc.user.findByUsername.queryOptions(debouncedSlug, {
      enabled: isUsernameChanged,
    })
  )

  useEffect(() => {
    if (isDirty) {
      return
    }

    reset(getProfileFormValues(user))
  }, [user, isDirty, reset])

  // Clear the success/error message after x seconds
  useEffect(() => {
    if (!saveSuccess) {
      return
    }

    reset(getProfileFormValues(user))

    const timeout = setTimeout(() => resetSaveState?.(), secondsToMilliseconds(2.5))

    return () => clearTimeout(timeout)
  }, [saveSuccess, resetSaveState, user, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <div className="w-full flex flex-col gap-1">
          <TextInput
            description={`Dette brukes i din profil-URL: https://online.ntnu.no/profil/${username || "..."}`}
            label="Brukernavn"
            placeholder="supermann99"
            required
            {...register("username")}
          />
          {errors.username && (
            <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
              {errors.username?.message ?? "En feil oppstod"}
            </Text>
          )}
          {!errors.username &&
            ((isUserFetching && (
              <div className="flex items-center gap-1 text-slate-500 dark:text-stone-400">
                <IconLoader className="animate-spin size-4" />
                <Text className="text-xs">Sjekker tilgjengelighet...</Text>
              </div>
            )) || (
              <>
                {fetchedUser !== null && isUsernameChanged && (
                  <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <IconX className="size-4" />
                    <Text className="text-xs">Brukernavnet er opptatt</Text>
                  </div>
                )}
                {fetchedUser === null && (
                  <div className="flex items-center gap-1 text-slate-500 dark:text-stone-400">
                    <IconCheck className="size-4" />
                    <Text className="text-xs">Brukernavnet er ledig</Text>
                  </div>
                )}
              </>
            ))}
        </div>

        <div className="w-full flex flex-col gap-1">
          <TextInput
            label="Fullt navn"
            description="Dersom navnet ditt er feil, kontakt hovedstyret@online.ntnu.no."
            value={user.name || "<Tomt navn>"}
            disabled
          />
        </div>

        <div className="w-full flex flex-col gap-1">
          <Textarea label="Biografi" placeholder="Skriv noe om deg selv..." {...register("biography")} rows={10} />
          {errors.biography && (
            <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
              {errors.biography?.message ?? "En feil oppstod"}
            </Text>
          )}
        </div>

        <div className="w-full flex flex-col gap-1">
          <TextInput label="Telefonnummer" placeholder="+47 999 88 777" {...register("phone")} />
          {errors.phone && (
            <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
              {errors.phone?.message ?? "En feil oppstod"}
            </Text>
          )}
        </div>

        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <div className="w-full flex flex-col gap-1">
              <Label htmlFor="gender" className="text-sm">
                Kjønn
              </Label>

              <Select value={value ?? undefined} onValueChange={onChange} items={GENDER_OPTIONS}>
                <SelectTrigger id="gender">
                  <SelectValue
                    placeholder={user.gender ?? "Velg kjønn"}
                    className={cn(
                      "placeholder:text-gray-500 transition-all",
                      errors.gender && "text-red-600 dark:text-red-400"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kjønn</SelectLabel>
                    {GenderSchema.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {getGenderName(option)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.gender && (
                <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
                  {errors.gender?.message ?? "En feil oppstod"}
                </Text>
              )}
            </div>
          )}
        />

        <div className="w-full flex flex-col gap-1">
          <TextInput
            label="Kostholdsrestriksjoner"
            placeholder="Ingen kostholdsrestriksjoner"
            {...register("dietaryRestrictions")}
          />
          {errors.dietaryRestrictions && (
            <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
              {errors.dietaryRestrictions?.message ?? "En feil oppstod"}
            </Text>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <Button
            type="submit"
            className="w-fit"
            variant="default"
            disabled={isUserFetching || Boolean(fetchedUser && fetchedUser.id !== user.id) || !isDirty}
          >
            Oppdater
          </Button>

          <Button type="button" disabled={!isDirty} onClick={() => reset()} variant="outline" className="w-fit">
            Tilbakestill
          </Button>
        </div>

        {isSaving && (
          <div className="flex items-center gap-1 text-slate-600 dark:text-stone-300 fade-in transition-all">
            <IconLoader className="animate-spin size-4" />
            <Text className="text-sm">Lagrer</Text>
          </div>
        )}
        {!isSaving && saveSuccess && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 fade-out transition-all">
            <IconCheck className="size-4" />
            <Text className="text-sm">Profil oppdatert</Text>
          </div>
        )}
        {!isSaving && Boolean(saveError) && (
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400 fade-out transition-all">
            <IconAlertTriangle className="size-4" />
            <Text className="text-sm">Kunne ikke oppdatere: {saveError}</Text>
          </div>
        )}
      </div>
    </form>
  )
}
