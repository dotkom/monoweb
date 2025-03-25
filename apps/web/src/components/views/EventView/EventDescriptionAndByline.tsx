"use client"

import type { Company, Event, Group } from "@dotkomonline/types"
import { frontmatterPlugin, headingsPlugin, linkDialogPlugin, linkPlugin, listsPlugin, MDXEditor, thematicBreakPlugin } from "@mdxeditor/editor"
import Image from "next/image"
import React, { type FC } from "react"

interface Props {
  event: Event
  groups: Group[]
  companies: Company[]
}

const mapToImageAndName = (item: Group | Company) => (
  <div key={item.name} className="flex flex-row gap-2 items-center">
    {item.image && <Image src={item.image} alt={item.name} width={25} height={25} />}
    <p>{item.name}</p>
  </div>
)

export const EventDescriptionAndByline: FC<Props> = ({ event, groups, companies }) => {
  const groupList = groups.map(mapToImageAndName)
  const companyList = companies.map(mapToImageAndName)

  return (
    <div className="mr-10 w-full flex flex-col gap-8 md:w-[60%]">
      <div className="flex flex-row gap-8">{[...groupList, ...companyList]}</div>
            <MDXEditor
              readOnly
              markdown={event.description || ""}
              plugins={[
                listsPlugin(),
                headingsPlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                thematicBreakPlugin(),
                frontmatterPlugin(),
              ]}
            />
      <p className="bg-slate-2 p-5 text-[18px] rounded-2xl">
      </p>
    </div>
  )
}

export const SkeletonEventDescriptionAndByline = () => <div className="mr-10 w-full flex flex-col gap-8 md:w-[60%]" /> 