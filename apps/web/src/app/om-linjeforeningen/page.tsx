import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { server } from "@/utils/trpc/server"
import type { Group } from "@dotkomonline/types"
import { Text, Title } from "@dotkomonline/ui"
import Image from "next/image"
import Link from "next/link"
import type { FC } from "react"

export default async function AboutOnlinePage() {
  const nodeCommittees = await server.group.allByType.query("NODECOMMITTEE")
  const committees = await server.group.allByType.query("COMMITTEE")

  return (
    <div>
      <div className="flex flex-col items-center sm:text-center rounded-xl bg-blue-3 dark:bg-transparent p-8">
        <Title size="xl" element="h1" className="mb-10">
          Bli kjent med{" "}
          <span className="relative inline-block">
            Online linjeforening
            <span className="absolute left-0 -bottom-6 h-4 w-full bg-blue-7 dark:bg-blue-8 rounded-2xl" />
          </span>
        </Title>
        <Text>
          Nysjerrig på hva de ulike delene av Online <em>egentlig</em> er?
          <br />
          Har du noen gang lurt på hvordan alt henger sammen?
          <br />
          Her får du et innblikk til linjeforeningens struktur - komiteer, grupper og hovedstyret!
        </Text>
      </div>
      <div className="flex flex-col items-center text-center mt-7">
        <Title size={"lg"} element="h2" className="border-b border-slate-6 pb-1 w-full mb-4">
          Generalforsamlingen
        </Title>

        <div className="flex flex-col md:flex-row w-full justify-center sm:px-12 items-center">
          <div className="w-full md:w-1/2 max-w-md md:mr-10">
            <Image
              src="/genfors-banner.jpeg"
              alt="Genfors banner"
              className="object-contain rounded-2xl w-full h-auto"
              width={600}
              height={300}
            />
          </div>
          <div className="text-left max-w-md mt-4 md:mt-0">
            <Text>
              <Link href="https://wiki.online.ntnu.no/generalforsamlinger/" className="hover:underline text-blue-8">
                Generalforsamlingen
              </Link>{" "}
              er den høyeste besluttende myndighet i Online.
            </Text>
            <Text className="mt-3">
              Det betyr at den største beslutningsevnen ligger i hendene på alle våre kjære Onlinere.
            </Text>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center text-center mt-7">
        <Title size={"lg"} element="h2" className="border-b border-slate-6 pb-1 w-full mb-4">
          Komiteer
        </Title>
        <Text className="md:w-2/3 lg:w-1/2 sm:mx-12 text-left md:text-center">
          Foreningen har et bredt spekter av komiteer som tar for seg alt fra det sosiale til det faglige. Her er en
          oversikt over noen av komiteene som bidrar til å skape et levende studentmiljø for informatikkstudentene:
        </Text>
        <GroupList groups={committees} />
      </div>
      <div className="flex flex-col items-center text-center mt-7">
        <Title size={"lg"} element="h2" className="border-b border-slate-6 pb-1 w-full mb-4">
          Nodekomiteer
        </Title>
        <Text className="md:w-2/3 lg:w-1/2 sm:mx-12 text-left md:text-center">
          Nodekomiteer er underkomiteer til kjernekomiteene i Online, eller direkte underlagt Hovedstyret.
        </Text>
        <GroupList groups={nodeCommittees} />
      </div>
    </div>
  )
}

type GroupListProps = {
  groups: Group[]
}

const GroupList: FC<GroupListProps> = ({ groups }: GroupListProps) => {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6 sm:px-12 pt-8">
      {groups.map(
        (group) =>
          group.image && (
            <Card key={group.id} imageUrl={group.image} title={group.name} description={group.description} />
          )
      )}
    </ul>
  )
}

type CardProps = {
  imageUrl: string | null
  title: string
  description: string
}

const Card: FC<CardProps> = ({ imageUrl, title, description }: CardProps) => {
  return (
    <li className="flex items-center text-left">
      <div className="w-[150px] mr-4 flex-shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            className="object-contain h-auto rounded-full dark:invert"
            width={150}
            height={150}
          />
        ) : (
          <OnlineIcon width={150} height={150} />
        )}
      </div>
      <div className="flex-1">
        <Title>{title}</Title>
        <Text className="line-clamp-4">{description}</Text>
      </div>
    </li>
  )
}
