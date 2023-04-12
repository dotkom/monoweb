import { FC } from "react"
import { Company } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"
import { link } from "fs"

interface IndividualCompanyViewProps {
  company: Company
}

export const IndividualCompanyView: FC<IndividualCompanyViewProps> = (props: IndividualCompanyViewProps) => {
  const { name, description, phone, email, website, location, type, image } = props.company

  const lines = [
    {
      value: website,
      icon: "ph:globe",
      isLink: true,
    },
    {
      value: email,
      icon: "material-symbols:mail-outline",
    },
    {
      value: phone,
      icon: "material-symbols:phone-enabled-outline",
    },
    // {
    //     value: location,
    //     icon: BedpressIcon,
    // },
    {
      value: location,
      icon: "material-symbols:location-on",
    },
  ]

  return (
    <div className="mb-20 flex w-[1000px] flex-col gap-y-8">
      {/* <div className="h-48 w-full bg-blue-3 rounded-t-2xl"></div> */}
      {/* <div className="h-48 bg-white flex items-center justify-center overflow-hidden rounded-lg">
                <img className="h-full" src={image} alt="Company image" />
            </div> */}

      <div className="border-blue-8 flex w-full items-end justify-between border-b-2 pb-2">
        <h1>{name}</h1>
        <div className="text-blue-11 text-2xl">{type}</div>
      </div>

      {/* <div className="h-12 rounded-sm bg-blue-3 mb-4 flex flex-row gap-x-8 justify-between px-4">
                {lines.map((line) => (
                    <div className="flex text-white text-lg items-center gap-x-2">
                        <Icon icon={line.icon} className="" width="32"></Icon>
                        <span className="">{line.value}</span>
                    </div>
                ))}
            </div> */}

      <div className="grid grid-cols-[24rem_minmax(400px,_1fr)] gap-x-12">
        <div className="border-blue-7 h-fit rounded-lg border-none">
          {image && (
            <div className="mb-4 h-fit w-full overflow-hidden rounded-lg bg-white px-8">
              <a href={website} target="_blank">
                <img src={image} alt="Company logo" className="w-full bg-white" />
              </a>
            </div>
          )}

          {/* <div className="w-full h-fit">
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fugiat quasi totam libero consectetur, reprehenderit rem aut id sunt soluta magnam? Quo fugit unde qui? Similique nostrum quae soluta ratione pariatur.
                    </div> */}
          <div className="px-1">
            {lines.map((line) => (
              <div className="text-blue-12 flex items-center gap-x-2 text-lg">
                <Icon icon={line.icon} className="" width="32"></Icon>
                {line.isLink ? (
                  <a className="text-blue-11 hover:text-blue-10" href={line.value}>
                    Website
                  </a>
                ) : (
                  <span>{line.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="">
          <p>
            {description}
            {description}
            {description}
            {description}
            <br />
            <br />
            {description}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="border-none">Kommende arrangementer med {name}</h2>
        <ul className="mt-4 list-none">
          {[...Array(10)].map(() => (
            <li className="border-blue-7 hover:bg-blue-2 grid h-10 w-full grid-cols-[1fr_10fr_1fr] content-center border-b px-1 py-6 text-lg hover:cursor-pointer">
              <span className="text-green-11 font-bold">Sosialt</span>
              <p className="text-blue-12 text-lg">Labyrinten med Bekk!</p>
              <span className="text-end">1/10</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
