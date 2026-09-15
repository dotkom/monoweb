"use client"

import { Link } from "@/components/link"
import { useTRPC } from "@/utils/trpc/client"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { useFullPathname } from "@/utils/use-full-pathname"
import { findActiveMembership } from "@dotkomonline/rpc/user"
import { Button, Text, TextInput, Title, cn } from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { IconArrowUpRight, IconCheck, IconLoader2, IconLogin2, IconPencil } from "@tabler/icons-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { secondsToMilliseconds } from "date-fns"
import { type ReactNode, useEffect, useId, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { BirthdayPartyDoomFace } from "./birthday-party-doom-face"
import { OnlineIcon } from "../atoms/OnlineIcon"
import { GroupLogoAvatar } from "../atoms/GroupLogo"

const SAVED_MESSAGE_DURATION_MS = secondsToMilliseconds(2)

const MAX_GUESS = 999999
const GUESS_ERROR_MESSAGE = "Skriv inn et heltall mellom 1 og 999 999"

const GuessFormSchema = z.object({
  guess: z
    .string()
    .trim()
    .min(1, GUESS_ERROR_MESSAGE)
    .regex(/^[1-9]\d*$/, GUESS_ERROR_MESSAGE)
    .transform((value) => Number.parseInt(value, 10))
    .pipe(z.int().positive().max(MAX_GUESS, GUESS_ERROR_MESSAGE)),
})

type GuessFormInput = z.input<typeof GuessFormSchema>
type GuessFormOutput = z.output<typeof GuessFormSchema>

type GuessView = "loading" | "unauthenticated" | "no-membership" | "form" | "submitted"

function AnimatedReveal({ isOpen, children }: { isOpen: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        isOpen
          ? "grid-rows-[1fr] opacity-100 translate-y-0"
          : "pointer-events-none grid-rows-[0fr] opacity-0 translate-y-1"
      )}
      aria-hidden={!isOpen}
      inert={!isOpen}
    >
      <div className="overflow-hidden min-h-0">{children}</div>
    </div>
  )
}

export const BirthdayPartyGuessForm = ({
  doomReactionKey,
  onGuessSubmit,
}: {
  doomReactionKey: number
  onGuessSubmit: () => void
}) => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const fullPathname = useFullPathname()
  const guessInputId = useId()
  const { sessionUser, dbUser, isLoading: isAuthLoading } = useAuthenticatedUser()

  const [isEditing, setIsEditing] = useState(false)
  const [savedMessageShownAt, setSavedMessageShownAt] = useState<number | null>(null)

  const {
    register,
    reset,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<GuessFormInput, unknown, GuessFormOutput>({
    resolver: zodResolver(GuessFormSchema),
    defaultValues: {
      guess: "",
    },
    mode: "onSubmit",
  })

  const hasActiveMembership = dbUser !== null && findActiveMembership(dbUser) !== null
  const isGuessQueryEnabled = Boolean(sessionUser) && hasActiveMembership && !isAuthLoading

  const guessQuery = useQuery({
    ...trpc.user.getBirthdayPartyGuess.queryOptions(),
    enabled: isGuessQueryEnabled,
    retry: false,
  })

  const updateGuessMutation = useMutation(
    trpc.user.updateBirthdayPartyGuess.mutationOptions({
      onSuccess: async (birthdayPartyGuess) => {
        await queryClient.invalidateQueries(trpc.user.getBirthdayPartyGuess.queryOptions())
        reset({ guess: String(birthdayPartyGuess.guess) })
        setIsEditing(false)
        setSavedMessageShownAt(Date.now())
      },
    })
  )

  const storedGuess = updateGuessMutation.data ?? guessQuery.data ?? null

  useEffect(() => {
    if (storedGuess === null) {
      return
    }

    reset({ guess: String(storedGuess.guess) })
  }, [storedGuess, reset])

  useEffect(() => {
    if (savedMessageShownAt === null) {
      return
    }

    const timeout = setTimeout(() => {
      setSavedMessageShownAt(null)
    }, SAVED_MESSAGE_DURATION_MS)

    return () => clearTimeout(timeout)
  }, [savedMessageShownAt])

  const isCheckmarkVisible = savedMessageShownAt !== null

  const isGuessLoading = isAuthLoading || (isGuessQueryEnabled && guessQuery.isLoading)
  const isSessionMissing = sessionUser === null || sessionUser === undefined

  let view: GuessView = "form"
  if (isGuessLoading) {
    view = "loading"
  } else if (isSessionMissing) {
    view = "unauthenticated"
  } else if (!hasActiveMembership) {
    view = "no-membership"
  } else if (storedGuess !== null && !isEditing) {
    view = "submitted"
  }

  let submitLabel = "Send inn"
  if (updateGuessMutation.isPending) {
    submitLabel = "Lagrer"
  } else if (storedGuess !== null) {
    submitLabel = "Oppdater"
  }

  const submitIcon = updateGuessMutation.isPending ? <IconLoader2 className="size-4 animate-spin" /> : undefined

  const submitGuess = handleSubmit((data) => {
    onGuessSubmit()
    updateGuessMutation.mutate({ guess: data.guess })
  })

  const startEditing = () => {
    setIsEditing(true)
    setSavedMessageShownAt(null)
    clearErrors()
  }

  const cancelEditing = () => {
    setIsEditing(false)
    clearErrors()

    if (storedGuess !== null) {
      reset({ guess: String(storedGuess.guess) })
    }
  }

  let checkmark = null
  if (isCheckmarkVisible) {
    checkmark = (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-200">
        <IconCheck className="size-4" />
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2 items-start justify-between px-3 pb-1.5 pt-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Title className="text-base md:text-lg font-semibold dark:text-black">
            Online feirer ett år med OnlineWeb 5!
          </Title>

          <Text className="text-sm dark:text-black">
            OnlineWeb 5 er denne versjonen av online.ntnu.no. Du kan lese om{" "}
            <Link
              href="/grupper/dotkom"
              className="inline-flex items-center gap-1 align-middle whitespace-nowrap transition-colors bg-white/15 hover:bg-white/33 rounded-full pr-1.5"
            >
              <GroupLogoAvatar
                src="https://onlineweb4-prod.s3.eu-north-1.amazonaws.com/media/images/responsive/0990ab67-0f5b-4c4d-95f1-50a5293335a5.png"
                alt="OW5"
                size="sm"
                className="p-0.5 border-none"
              />
              Dotkoms
            </Link>{" "}
            historie på{" "}
            <Link
              href="https://wiki.online.ntnu.no/historie/komiteer/dotkom/#historie"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 align-middle whitespace-nowrap underline"
            >
              Online Wiki-en
              <IconArrowUpRight className="size-3.5" />
            </Link>
            .
          </Text>
        </div>

        <div className="flex flex-col gap-0.5 items-center max-lg:hidden">
          <Text className="text-xs font-semibold text-black dark:text-black text-nowrap">OnlineWeb 5 er</Text>

          <div className="flex flex-row flex-nowrap items-center gap-2 p-1 pr-5 bg-linear-to-r from-white via-white to-white/0 rounded-l-full rounded-r-md">
            <OnlineIcon size={24} variant="light" />
            <Text element="span" className="text-base font-medium font-mono dark:text-black text-nowrap">
              1 år
            </Text>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -top-22 -right-4 md:right-24 hidden min-[70rem]:block">
          <BirthdayPartyDoomFace reactionKey={doomReactionKey} />
        </div>

        <div className="relative z-1 flex flex-col p-3 bg-background rounded-sm">
          <AnimatedReveal isOpen={view === "loading"}>
            <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
              <div className="h-10 w-full rounded-lg bg-white/40 animate-pulse" />
              <div className="h-10 w-32 rounded-lg bg-white/40 animate-pulse" />
            </div>
          </AnimatedReveal>

          <AnimatedReveal isOpen={view === "unauthenticated"}>
            <Button
              element="a"
              href={createAuthorizeUrl({ returnTo: fullPathname })}
              variant="default"
              className="w-full sm:w-fit"
              icon={<IconLogin2 className="size-4" />}
            >
              Logg inn for å delta
            </Button>
          </AnimatedReveal>

          <AnimatedReveal isOpen={view === "no-membership"}>
            <div className="flex flex-col gap-3">
              <Text className="text-sm">Du må være medlem for å sende inn en gjetning.</Text>
              <Button element={Link} href="/innstillinger/medlemskap" variant="default" className="w-full sm:w-fit">
                Gå til medlemskap
              </Button>
            </div>
          </AnimatedReveal>

          <AnimatedReveal isOpen={view === "form"}>
            <div className="flex flex-col gap-2">
              <Title className="text-base md:text-lg font-semibold">Hvor mange Non Stop er i krukka på kontoret?</Title>

              <Text className="text-sm">
                Nærmeste gjett vil vinne hele krukka og enda en god premie! Det er ikke lov å åpne krukka 👺
              </Text>

              <form onSubmit={submitGuess} className="flex flex-col gap-3">
                <TextInput
                  id={guessInputId}
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Gjett et antall Non Stop"
                  disabled={updateGuessMutation.isPending}
                  error={errors.guess?.message}
                  className="border-gray-300 dark:border-white/16 dark:bg-white/8 rounded-sm"
                  {...register("guess")}
                />

                <div className="flex flex-row items-center gap-2">
                  <Button
                    type="submit"
                    variant="default"
                    disabled={updateGuessMutation.isPending}
                    className="transition-transform duration-300 ease-out enabled:active:scale-[0.98] rounded-sm"
                    icon={submitIcon}
                  >
                    {submitLabel}
                  </Button>

                  {storedGuess !== null && (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={updateGuessMutation.isPending}
                      onClick={cancelEditing}
                    >
                      Avbryt
                    </Button>
                  )}
                </div>

                {updateGuessMutation.isError && (
                  <Text className="text-red-700 dark:text-red-300 text-xs">
                    Noe gikk galt. Prøv igjen om et øyeblikk.
                  </Text>
                )}
              </form>
            </div>
          </AnimatedReveal>

          <AnimatedReveal isOpen={view === "submitted"}>
            <div className="flex flex-col items-start gap-3">
              <Title className="text-base font-semibold">Antall Non Stop du har gjettet er</Title>

              <div className="flex flex-row items-center gap-2" aria-live="polite">
                <Text className="text-3xl font-medium tabular-nums">{storedGuess?.guess}</Text>
                <div className="flex flex-row items-center gap-2">
                  {checkmark}
                  {checkmark !== null && (
                    <Text element="span" className="text-sm font-medium">
                      Lagret
                    </Text>
                  )}
                </div>
              </div>

              <Button type="button" variant="outline" onClick={startEditing} icon={<IconPencil className="size-4" />}>
                Endre gjetning
              </Button>
            </div>
          </AnimatedReveal>
        </div>
      </div>
    </div>
  )
}
