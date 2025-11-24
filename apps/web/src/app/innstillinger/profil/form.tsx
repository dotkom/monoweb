"use client"

import { useCreateAvatarUploadURL } from "@/s3"
import { useTRPC } from "@/utils/trpc/client"
import { type User, type UserWrite, UserWriteSchema } from "@dotkomonline/types"
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

type FormUserWrite = Omit<UserWrite, "workspaceUserId" | "name">

interface FormProps {
  user: User
  onSubmit: (data: FormUserWrite) => void
  isSaving?: boolean
  saveSuccess?: boolean
  saveError?: string | null
  resetSaveState?: () => void
}

export function ProfileForm({ user, onSubmit, isSaving, saveSuccess, saveError, resetSaveState }: FormProps) {
  const defaultValues: FormUserWrite = {
    profileSlug: user.profileSlug,
    email: user.email ?? null,
    imageUrl: user.imageUrl ?? null,
    biography: user.biography ?? null,
    phone: user.phone ?? null,
    gender: user.gender ?? null,
    dietaryRestrictions: user.dietaryRestrictions ?? null,
  }

  const {
    register,
    control,
    reset,
    setError,
    formState: { errors, isDirty },
    handleSubmit,
  } = useForm<FormUserWrite>({
    defaultValues,
    mode: "onTouched",
    reValidateMode: "onBlur",
    resolver: zodResolver(UserWriteSchema.omit({ workspaceUserId: true, name: true })),
  })

  const profileSlug = useWatch({ control, name: "profileSlug" })
  const [debouncedSlug] = useDebounce(profileSlug, 500)

  const trpc = useTRPC()

  const isProfileSlugChanged = Boolean(debouncedSlug && debouncedSlug !== user.profileSlug)

  const { data: fetchedUser, isFetching: isUserFetching } = useQuery(
    trpc.user.findByProfileSlug.queryOptions(debouncedSlug, {
      enabled: isProfileSlugChanged,
    })
  )

  const avatarUpload = useCreateAvatarUploadURL()

  // Clear the success/error message after x seconds
  useEffect(() => {
    if (!saveSuccess) {
      return
    }

    const timeout = setTimeout(() => resetSaveState?.(), secondsToMilliseconds(2.5))

    return () => clearTimeout(timeout)
  }, [saveSuccess, resetSaveState])

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const result = await avatarUpload(file).catch(() => null)

    if (!result) {
      setError("imageUrl", {
        type: "manual",
        message: "Opplasting av profilbilde feilet. Maksstørrelse er 500 KB.",
      })
      return
    }

    onChange(result)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <div className="w-full flex flex-col gap-1">
          <TextInput
            description={`Dette brukes i din profil-URL: https://online.ntnu.no/profil/${profileSlug || "..."}`}
            label="Brukernavn"
            placeholder="supermann99"
            required
            {...register("profileSlug")}
          />
          {errors.profileSlug && (
            <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
              {errors.profileSlug?.message ?? "En feil oppstod"}
            </Text>
          )}
          {!errors.profileSlug &&
            ((isUserFetching && (
              <div className="flex items-center gap-1 text-slate-500 dark:text-stone-400">
                <IconLoader className="animate-spin size-4" />
                <Text className="text-xs">Sjekker tilgjengelighet...</Text>
              </div>
            )) || (
              <>
                {fetchedUser !== null && isProfileSlugChanged && (
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
            description="Dersom dette navnet er feil, kontakt hovedstyret@online.ntnu.no."
            value={user.name || "<Tomt navn>"}
            disabled
          />
        </div>

        <div className="w-full flex flex-col gap-1">
          <TextInput label="E-post" placeholder="ola.nordmann@epost.no" required {...register("email")} />
          {errors.email && (
            <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
              {errors.email?.message ?? "En feil oppstod"}
            </Text>
          )}
        </div>

        <Controller
          control={control}
          name="imageUrl"
          render={({ field: { onChange, value } }) => (
            <div className="w-full flex flex-col gap-1">
              <Label htmlFor="pfp" className="text-base">
                Profilbilde
              </Label>
              <input
                id="pfp"
                type="file"
                accept="image/*"
                onChange={(event) => onFileChange(event, onChange)}
                placeholder="https://example.com/image.jpg"
                className="text-body px-3 py-2 border border-gray-200 rounded-md text-sm text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.imageUrl && (
                <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
                  {errors.imageUrl?.message ?? "En feil oppstod"}
                </Text>
              )}
              {value && (
                <img
                  src={value}
                  alt="Profilbilde"
                  className="mt-2 min-w-24 w-72 max-w-[50%] aspect-square rounded-sm object-cover border border-gray-200 dark:border-stone-600"
                />
              )}
            </div>
          )}
        />

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
              <Label htmlFor="gender" className="text-base">
                Kjønn
              </Label>

              <Select value={value ?? undefined} onValueChange={onChange}>
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
                    <SelectItem value="Mann">Mann</SelectItem>
                    <SelectItem value="Kvinne">Kvinne</SelectItem>
                    <SelectItem value="Annet">Annet</SelectItem>
                    <SelectItem value="Ikke oppgitt">Ikke oppgitt</SelectItem>
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
            disabled={isUserFetching || Boolean(fetchedUser && fetchedUser.id !== user.id) || !isDirty}
          >
            Oppdater
          </Button>

          <Button type="button" disabled={!isDirty} onClick={() => reset(user)} variant="outline" className="w-fit">
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
