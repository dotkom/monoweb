"use client"

import { useState } from "react"
import { Button, Card, Text } from "@dotkomonline/ui"
import { IconBrandDiscord, IconBrandFacebook, IconBrandInstagram, IconBrandSlack, IconX } from "@tabler/icons-react"
import { removeWelcomeCookie } from "./cookie"

export function MembershipWelcomeCard({ initialVisible }: { initialVisible: boolean }) {
  const [visible, setVisible] = useState(initialVisible)

  if (!visible) {
    return null
  }

  const handleClose = async () => {
    setVisible(false)
    await removeWelcomeCookie()
  }

  return (
    <Card className="flex relative items-center bg-brand/50">
      <Button className="absolute right-2 top-2 size-8" icon={<IconX />} onClick={handleClose}></Button>

      <div className="flex flex-col items-center max-w-xl gap-3">
        <div className="flex flex-row justify-center gap-3">
          <Text className="font-bold text-2xl">Velkommen til Online!</Text>
          <div className="transform translate-y-[12.5%] shrink-0">
            <div className="animate-bounce text-xl">🤗</div>
          </div>
        </div>

        <Text className="text-wrap text-center">
          Gratulerer med å komme inn på Informatikk her på NTNU, her er noen lure ting som vil hjelpe deg å komme i gang
          i linjeforeingen
        </Text>

        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-3 justify-center">
            <a href="https://slack.com">
              <IconBrandSlack width={25} height={25} />
            </a>
            <a href="idk">
              <IconBrandDiscord width={25} height={25} />
            </a>
            <a href="https://instagram.com">
              <IconBrandInstagram width={25} height={25} />
            </a>
            <a href="https://facebook.com">
              <IconBrandFacebook width={25} height={25} />
            </a>
          </div>
        </div>
      </div>
    </Card>
  )
}
