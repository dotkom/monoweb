import { FC } from "react"
import { Company, Event } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"

interface IndividualCompanyViewProps {
  company: Company
  events: Event[]
  isLoadingEvents: boolean
}

export const IndividualCompanyView: FC<IndividualCompanyViewProps> = (props: IndividualCompanyViewProps) => {
  const { name, description, phone, email, website, location, type, image } = props.company

  return (
    <div className="mx-auto mb-20 flex w-11/12 max-w-6xl flex-col gap-y-8">
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

      <div className="grid grid-cols-[24rem_minmax(200px,_1fr)] gap-x-12">
        <div className="border-blue-7 h-fit rounded-lg border-none">
          {image && (
            <div className="mb-4 h-fit w-full overflow-hidden rounded-lg bg-[#fff]">
              <a href={website} target="_blank">
                <img src={image} alt="Company logo" className="w-full" />
              </a>
            </div>
          )}

          {/* <div className="w-full h-fit">
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fugiat quasi totam libero consectetur, reprehenderit rem aut id sunt soluta magnam? Quo fugit unde qui? Similique nostrum quae soluta ratione pariatur.
                    </div> */}
          <div className="text-blue-12 flex flex-col gap-y-2 px-1 text-lg [&>*]:flex [&>*]:items-center [&>*]:gap-x-2">
            <div>
              <Icon icon="ph:globe" width="28"></Icon>
              <a className="text-blue-11 hover:text-blue-10" href={website}>Website</a>
            </div>

            <div>
              <Icon icon="material-symbols:location-on" width="28"></Icon>
              <span>{location}</span>
            </div>

            <div>
              <Icon icon="material-symbols:mail-outline" width="28"></Icon>
              {/* <a className="text-blue-11 hover:text-blue-10" href={`mailto:${email}`}>{email}</a> */}
              <span>{email}</span>
            </div>

            <div>
              <Icon icon="material-symbols:phone-enabled-outline" width="28"></Icon>
              <span>{phone}</span>
            </div>

            


            {/* {lines.map((line) => (
              <div className="text-blue-12 flex items-center gap-x-2 text-lg">
                <Icon icon={line.icon} className="" width="28"></Icon>
                {line.isLink ? (
                  <a className="text-blue-11 hover:text-blue-10" href={line.value}>
                    Website
                  </a>
                ) : (
                  <span>{line.value}</span>
                )}
              </div>
            ))} */}
          </div>
        </div>
        <div>
          <p>
            {description}
            {description}
            {description}
            {description}
            {description}
            {description}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="border-none">Kommende arrangementer med {name}</h2>
        <ul className="mt-4 list-none">
          {/* {[...Array(10)].map((_, i: number) => (
            <li key={i.toString()} className="border-blue-7 hover:bg-blue-2 grid h-10 w-full grid-cols-[1fr_10fr_1fr] content-center border-b px-1 py-6 text-lg hover:cursor-pointer">
              <span className="text-green-11 font-bold">Sosialt</span>
              <p className="text-blue-12 text-lg">Labyrinten med Bekk!</p>
              <span className="text-end">1/10</span>
            </li>
          ))} */}
          {props.isLoadingEvents ? (
            <p>Loading...</p>
          ) : (
            props.events.map((event) => (
              <li key={event.id} className="border-blue-7 hover:bg-blue-2 grid h-10 w-full grid-cols-[1fr_10fr_1fr] content-center border-b px-1 py-6 text-lg hover:cursor-pointer">
                <span className="text-green-11 font-bold">{event.type}</span>
                <p className="text-blue-12 text-lg">{event.title}</p>
                <span className="text-end">1/10</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
