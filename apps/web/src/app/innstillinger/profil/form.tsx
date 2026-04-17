"use client"

import { useUserFileUploadMutation } from "@/app/innstillinger/mutations"
import { useTRPC } from "@/utils/trpc/client"
import { USER_IMAGE_MAX_SIZE_KIB, type User, type UserWrite, UserWriteSchema } from "@dotkomonline/types"
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
import { IconAlertTriangle, IconArrowUpRight, IconCheck, IconLoader, IconX } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { secondsToMilliseconds } from "date-fns"
import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"

export type FormUserWrite = Omit<UserWrite, "workspaceUserId" | "name" | "email">

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
    username: user.username,
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
    clearErrors,
    trigger,
    formState: { errors, isDirty },
    handleSubmit,
  } = useForm<FormUserWrite>({
    defaultValues,
    mode: "onTouched",
    reValidateMode: "onBlur",
    resolver: zodResolver(UserWriteSchema.omit({ workspaceUserId: true, name: true, email: true })),
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

  const fileUpload = useUserFileUploadMutation()

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

    if (file.size > USER_IMAGE_MAX_SIZE_KIB * 1024) {
      setError("imageUrl", {
        type: "manual",
        message: `Filen er for stor. Maks filstørrelse er ${USER_IMAGE_MAX_SIZE_KIB / 1024} MiB.`,
      })
      return
    }

    clearErrors("imageUrl")

    const result = await fileUpload(file).catch(() => null)

    if (!result) {
      setError("imageUrl", {
        type: "manual",
        message: "Opplasting av profilbilde feilet.",
      })
      return
    }

    onChange(result)

    await trigger("imageUrl")
  }

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
          <TextInput label="E-post" value={user.email || "<Tom e-post>"} disabled />
          <Text className="text-xs font-medium text-amber-600 dark:text-orange-300">
            E-post har flyttet til{" "}
            <Link href="/innstillinger/bruker" className="inline-flex items-center gap-0.5">
              Min bruker
              <IconArrowUpRight className="size-3.5" />
            </Link>
          </Text>
        </div>

        <Controller
          control={control}
          name="imageUrl"
          render={({ field: { onChange, value } }) => (
            <div className="w-full flex flex-col gap-1">
              <Label htmlFor="pfp" className="text-base">
                Profilbilde
              </Label>
              <Text className="text-xs text-gray-500 dark:text-stone-500">
                Maksstørrelse er {USER_IMAGE_MAX_SIZE_KIB / 1024} MiB.
              </Text>
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
                <Image
                  src={value}
                  alt="Profilbilde"
                  className="mt-2 min-w-24 w-72 max-w-[50%] aspect-square rounded-sm object-cover border border-gray-200 dark:border-stone-600"
                  width={0}
                  height={0}
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
