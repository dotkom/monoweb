import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { type Membership, getMembershipTypeName, getSpecializationName } from "@dotkomonline/types"
import { cn, Text } from "@dotkomonline/ui"
import { createAuthorizeUrl, getStudyGrade, isMembershipActiveUntilNextSemesterStart } from "@dotkomonline/utils"
import { IconArrowUpRight, IconIdOff } from "@tabler/icons-react"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { PropsWithChildren } from "react"

interface MembershipDisplayProps {
  activeMembership: Membership | null
  hasFeideConnection?: boolean | null
  name: string | null
}

export const MembershipDisplay = ({ activeMembership, hasFeideConnection = null, name }: MembershipDisplayProps) => {
  const pathname = usePathname()
  const isMembershipPage = isPathnameMembershipPage(pathname)

  let actionText: string | null = null
  if (hasFeideConnection) {
    actionText = "Logg inn med FEIDE"
  } else if (!isMembershipPage) {
    actionText = "Gå til medlemskapssiden"
  }

  if (!activeMembership) {
    return (
      <MembershipDisplayShell activeMembership={activeMembership} hasFeideConnection={hasFeideConnection}>
        <IconIdOff className="shrink-0 size-8 text-red-500 dark:text-red-700" />

        <div className="flex flex-col gap-0.5">
          <Text className="font-medium">Ingen aktivt medlemskap</Text>

          {actionText && <Text className="text-xs">{actionText}</Text>}
        </div>
      </MembershipDisplayShell>
    )
  }

  const grade = activeMembership.semester !== null ? getStudyGrade(activeMembership.semester) : null
  const membershipActiveUntilNextSemesterStart =
    activeMembership.end !== null ? isMembershipActiveUntilNextSemesterStart(activeMembership.end) : null
  const isMembershipIndefinite = activeMembership.end === null

  let membershipValidUntilText = null

  if (isMembershipIndefinite) {
    membershipValidUntilText = "Livstidsmedlemskap"
  } else if (membershipActiveUntilNextSemesterStart) {
    membershipValidUntilText = "Gyldig til starten av neste semester"
  } else if (activeMembership.end) {
    membershipValidUntilText = `Gyldig til ${formatDate(activeMembership.end, "dd. MMMM yyyy", { locale: nb })}`
  }

  return (
    <MembershipDisplayShell
      activeMembership={activeMembership}
      hasFeideConnection={hasFeideConnection}
      className="bg-brand/5 border-transparent"
    >
      <OnlineIcon className="shrink-0 size-8 mx-1" />

      <div className="flex flex-1 flex-col gap-2 min-w-0">
        {name && <Text className="w-full text-[0.675rem] truncate">{name}</Text>}

        <div className="flex flex-col gap-0.5">
          <Text className="text-xl font-semibold">{getMembershipTypeName(activeMembership.type)}</Text>
          {activeMembership.specialization && (
            <Text className="text-sm">{getSpecializationName(activeMembership.specialization)}</Text>
          )}
          {grade !== null ? <Text className="text-sm">{grade}. klasse</Text> : null}
        </div>

        <Text className="text-[0.675rem] text-gray-500 dark:text-stone-500">{membershipValidUntilText}</Text>
      </div>
    </MembershipDisplayShell>
  )
}

type MembershipDisplayShellProps = Omit<MembershipDisplayProps, "name"> &
  PropsWithChildren<{
    className?: string
  }>

const MembershipDisplayShell = ({
  activeMembership,
  hasFeideConnection = null,
  className,
  children,
}: MembershipDisplayShellProps) => {
  const pathname = usePathname()
  const isMembershipPage = isPathnameMembershipPage(pathname)

  let href: string | null = null

  if (activeMembership === null && hasFeideConnection) {
    href = createAuthorizeUrl({ connection: "FEIDE", redirectAfter: pathname })
  } else if (!isMembershipPage) {
    href = "/innstillinger/medlemskap"
  }

  const shellClassName = cn(
    "flex flex-row w-fit max-w-full min-w-64 gap-4 items-center p-4 rounded-lg",
    "dark:bg-stone-800 border border-gray-200 dark:border-stone-800"
  )

  if (href === null) {
    return <div className={cn(shellClassName, className)}>{children}</div>
  }

  return (
    <Link
      href={href}
      prefetch={hasFeideConnection === true ? false : undefined}
      className={cn(
        shellClassName,
        "border-gray-300 transform transition-colors hover:bg-gray-50 dark:hover:bg-stone-700",
        className
      )}
    >
      {children}

      <IconArrowUpRight className="ml-auto size-5 text-gray-500 dark:text-stone-500" />
    </Link>
  )
}

function isPathnameMembershipPage(pathname: string) {
  return pathname.startsWith("/innstillinger/medlemskap")
}
