"use client"

import { getGroupDisplayName, type Group, type GroupMembership } from "@dotkomonline/rpc/group"
import {
  Button,
  cn,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@dotkomonline/ui"
import { IconChevronDown, IconX } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { InterestGroupList } from "./InterestGroupList"

interface Props {
  interestGroups: Group[]
  currentUserInterestGroups: Group[]
  currentUserGroupMemberships: GroupMembership[]
  selectedInterestGroup: Group | null
  onSelectInterestGroup: (interestGroup: Group | null) => void
  onMembershipToggle: (interestGroupId: string) => void
  isLoggedIn: boolean
}

export const InterestGroupEventMobileFilters = ({
  interestGroups,
  currentUserInterestGroups,
  currentUserGroupMemberships,
  selectedInterestGroup,
  onSelectInterestGroup,
  onMembershipToggle,
  isLoggedIn,
}: Props) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const onChange = () => {
      if (mediaQuery.matches) {
        setIsDrawerOpen(false)
      }
    }
    onChange()
    mediaQuery.addEventListener("change", onChange)
    return () => mediaQuery.removeEventListener("change", onChange)
  }, [])

  const label = selectedInterestGroup !== null ? getGroupDisplayName(selectedInterestGroup) : "Alle arrangementer"

  return (
    <div className="lg:hidden min-w-0 shrink-0">
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} modal={true}>
        <DrawerTrigger
          render={
            <Button
              variant="unstyled"
              className="flex h-9 min-w-0 max-w-[50vw] items-center gap-1.5 p-0 text-sm font-medium"
            />
          }
        >
          <span className="min-w-0 truncate">{label}</span>
          <span
            className={cn(
              "inline-flex shrink-0 motion-safe:transition-transform motion-safe:duration-200",
              isDrawerOpen && "rotate-180"
            )}
          >
            <IconChevronDown className="size-4" />
          </span>
        </DrawerTrigger>
        <DrawerContent handleClassName="dark:bg-stone-500" className="dark:bg-stone-900 h-fit max-h-[85dvh]">
          <DrawerHeader>
            <div className="flex items-center justify-between gap-4">
              <DrawerTitle>Velg interessegruppe</DrawerTitle>
              <DrawerClose render={<Button variant="unstyled" aria-label="Lukk" />}>
                <IconX className="size-5" stroke={1.8} />
              </DrawerClose>
            </div>
          </DrawerHeader>

          <section className="px-4 pb-6 overflow-y-auto">
            <InterestGroupList
              interestGroups={interestGroups}
              currentUserInterestGroups={currentUserInterestGroups}
              currentUserGroupMemberships={currentUserGroupMemberships}
              selectedInterestGroup={selectedInterestGroup}
              onSelectInterestGroup={(interestGroup) => {
                onSelectInterestGroup(interestGroup)
                setIsDrawerOpen(false)
              }}
              onMembershipToggle={onMembershipToggle}
              isLoggedIn={isLoggedIn}
            />
          </section>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
