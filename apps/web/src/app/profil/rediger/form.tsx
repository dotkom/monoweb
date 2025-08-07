import { useUploadFile } from "@/lib/uploadFile"
import type { User, UserWrite } from "@dotkomonline/types"
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
  cn,
} from "@dotkomonline/ui"
import { slugify } from "@dotkomonline/utils"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"

interface FormProps {
  user: User
  onSubmit: (selections: UserWrite) => void
}

export function ProfileForm({ user, onSubmit }: FormProps) {
  const {
    control,
    trigger,
    formState: { errors },
    handleSubmit,
  } = useForm<UserWrite>({
    defaultValues: user,
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  // This validates the default values without the user having to interact with the form
  useEffect(() => {
    trigger()
  }, [trigger])

  const upload = useUploadFile()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Controller
        control={control}
        name={"profileSlug"}
        rules={{
          required: "Du må velge et brukernavn",
          minLength: { value: 3, message: "Brukernavnet må være minst 3 tegn lang" },
          maxLength: { value: 32, message: "Brukernavnet kan ikke være lengre enn 32 tegn" },
          validate: (value) => {
            // TODO: add debounce and check for uniqueness
            return value !== "rediger"
          },
        }}
        render={({ field: { onChange, value } }) => (
          <div className="w-full flex flex-col gap-1">
            <TextInput
              label="Brukernavn"
              required
              value={value}
              onChange={(event) => onChange(slugify(event.target.value))}
              placeholder="supermann99"
            />
            {errors.profileSlug && (
              <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
                {errors.profileSlug?.message ?? "En feil oppstod"}
              </Text>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"name"}
        rules={{ required: "Du må skrive inn et navn" }}
        render={({ field: { onChange, value } }) => (
          <div className="w-full flex flex-col gap-1">
            <TextInput
              label="Fullt navn"
              required
              value={value ?? undefined}
              onChange={onChange}
              placeholder="Ola Nordmann"
            />
            {errors.name && (
              <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
                {errors.name?.message ?? "En feil oppstod"}
              </Text>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"email"}
        rules={{ required: "Du må skrive en e-post" }}
        render={({ field: { onChange, value } }) => (
          <div className="w-full flex flex-col gap-1">
            <TextInput label="E-post" required value={value ?? ""} onChange={onChange} placeholder={"supermann99"} />
            {errors.email && (
              <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
                {errors.email?.message ?? "En feil oppstod"}
              </Text>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"imageUrl"}
        render={({ field: { onChange, value } }) => (
          <div className="w-full flex flex-col gap-1">
            <Label htmlFor="pfp" className="text-base">
              Profilbilde
            </Label>
            <div className="flex flex-row items-center gap-2 w-full [&>div:last-child]:grow">
              <input
                id="pfp"
                type="file"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) {
                    return
                  }
                  const result = await upload(file)
                  onChange(result)
                }}
                placeholder={"https://example.com/image.jpg"}
                className="text-body px-3 py-2 border border-gray-200 rounded-md text-sm text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <TextInput value={value ?? ""} onChange={onChange} placeholder={"https://..."} />
            </div>
            {errors.imageUrl && (
              <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
                {errors.imageUrl?.message ?? "En feil oppstod"}
              </Text>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"biography"}
        render={({ field: { onChange, value } }) => (
          <div className="w-full flex flex-col gap-1">
            <TextInput
              label="Biografi"
              value={value ?? ""}
              onChange={onChange}
              placeholder="Skriv noe om deg selv..."
            />
            {errors.biography && (
              <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
                {errors.biography?.message ?? "En feil oppstod"}
              </Text>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"phone"}
        render={({ field: { onChange, value } }) => (
          <div className="w-full flex flex-col gap-1">
            <TextInput label="Telefonnummer" value={value ?? ""} onChange={onChange} placeholder={"+47 999 88 777"} />
            {errors.phone && (
              <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
                {errors.phone?.message ?? "En feil oppstod"}
              </Text>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"gender"}
        rules={{ validate: (value) => (value ? ["Mann", "Kvinne", "Annet", "Ikke oppgitt"].includes(value) : true) }}
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

      <Controller
        control={control}
        name={"dietaryRestrictions"}
        render={({ field: { onChange, value } }) => (
          <div className="w-full flex flex-col gap-1">
            <TextInput
              label="Kostholdsrestriksjoner"
              value={value ?? ""}
              onChange={onChange}
              placeholder={"Ingen kostholdsrestriksjoner"}
            />
            {errors.dietaryRestrictions && (
              <Text className="text-red-600 dark:text-red-400 text-xs text-left transition-all fade-in fade-out">
                {errors.dietaryRestrictions?.message ?? "En feil oppstod"}
              </Text>
            )}
          </div>
        )}
      />

      <Button type="submit" className="w-fit">
        Oppdater
      </Button>
    </form>
  )
}
