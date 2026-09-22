import { server } from "@/utils/trpc/server"
import { isTrpcErrorCode } from "@/utils/trpc-errors"
import { Button, Stripes, Text } from "@dotkomonline/ui"
import { createAuthorizeUrl, getCurrentUTC } from "@dotkomonline/utils"
import { IconLogin2 } from "@tabler/icons-react"
import { type Interval, isWithinInterval } from "date-fns"
import Image from "next/image"
import type { ReactNode } from "react"
import { BirthdayPartyDoomFace } from "./birthday-party-doom-face"
import { BirthdayPartyWinnerPlate } from "./birthday-party-winner-plate"

const WINNER_USER_ID = "auth0|66ba0204b8f6b1059f21007c"
const ACTUAL_NON_STOP_COUNT = 1586
const WINNER_GUESS = 1590

export const BirthdayPartyNotice = async ({
  currentUserId,
  ...interval
}: Interval & { currentUserId: string | null }) => {
  if (!isWithinInterval(getCurrentUTC(), interval)) {
    return null
  }

  const isLoggedIn = currentUserId !== null

  let content = (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-col gap-0.5">
        <Text className="text-sm font-medium text-black">Det er en vinner av Non Stop-krukka</Text>
        <Text className="text-2xl font-medium text-black">Logg inn for å se hvem</Text>
      </div>

      <Button
        element="a"
        href={createAuthorizeUrl({ returnTo: "/" })}
        variant="default"
        className="w-full sm:w-fit"
        icon={<IconLogin2 className="size-4" />}
      >
        Logg inn
      </Button>
    </div>
  )

  if (isLoggedIn) {
    let winner: Awaited<ReturnType<typeof server.user.get.query>> | null = null
    let birthdayPartyGuess: Awaited<ReturnType<typeof server.user.getBirthdayPartyGuess.query>> | null = null

    try {
      winner = await server.user.get.query(WINNER_USER_ID)
    } catch (error) {
      if (!isTrpcErrorCode(error, "NOT_FOUND")) {
        console.error("Failed to fetch birthday party winner", error)
      }
    }

    try {
      birthdayPartyGuess = await server.user.getBirthdayPartyGuess.query()
    } catch (error) {
      console.error("Failed to fetch birthday party guess", error)
    }

    const formattedActualCount = ACTUAL_NON_STOP_COUNT.toLocaleString("nb-NO")
    const formattedWinnerGuess = WINNER_GUESS.toLocaleString("nb-NO")
    const winnerDistance = Math.abs(WINNER_GUESS - ACTUAL_NON_STOP_COUNT)

    let guessSummary = null
    if (birthdayPartyGuess !== null) {
      const distance = Math.abs(birthdayPartyGuess.guess - ACTUAL_NON_STOP_COUNT)
      const formattedGuess = birthdayPartyGuess.guess.toLocaleString("nb-NO")
      guessSummary = `Du gjettet ${formattedGuess} (${distance.toLocaleString("nb-NO")} Non Stop unna).`
    }

    let winnerPlate: ReactNode = (
      <Text className="text-sm text-black">
        Vinneren gjettet {formattedWinnerGuess}, bare {winnerDistance} Non Stop unna.
      </Text>
    )
    if (winner !== null) {
      winnerPlate = (
        <div className="flex flex-col gap-2">
          <Text className="text-sm text-black">
            Vinneren, som gjettet {formattedWinnerGuess} (bare {winnerDistance} unna), er 🎉
          </Text>
          <BirthdayPartyWinnerPlate user={winner} isCurrentUser={winner.id === currentUserId} />
        </div>
      )
    }

    content = (
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-col gap-1">
            <Text className="text-sm font-medium text-black">Det var</Text>
            <Text className="text-3xl font-medium text-black">{formattedActualCount}</Text>
            <Text className="text-sm font-medium text-black">Non Stop i krukka</Text>
          </div>

          <Image
            src="/birthday-jar.png"
            alt="Krukka med Non Stop som var på kontoret"
            width={180}
            height={220}
            className="h-24 w-auto shrink-0"
          />
        </div>

        {winnerPlate}

        {guessSummary && <Text className="text-sm text-black">{guessSummary}</Text>}

        <div className="flex flex-col gap-1">
          <Text className="text-sm text-muted-foreground">
            115 personer gjettet, og gjennomsnittet var 1 056 Non Stop.
          </Text>
          <Text className="text-sm text-muted-foreground">Bare to andre var innenfor 100 Non Stop.</Text>
          <Text className="text-sm text-muted-foreground">
            Tre gjettet 67, to gjettet 6767, og to gjettet 420. INGEN gjettet 69. Skjerp dere 👺
          </Text>
        </div>
      </div>
    )
  }

  return (
    <div className="relative pt-14">
      <div className="pointer-events-none absolute -top-8 right-0">
        <BirthdayPartyDoomFace />
      </div>

      <Stripes
        colorA="bg-linear-to-b from-[#dbaed7]/50 to-[#8cbfe2]/50"
        colorB="bg-white/8"
        stripeWidth={16}
        animated
        className="relative z-1 rounded-lg bg-white p-4"
      >
        {content}
      </Stripes>
    </div>
  )
}
