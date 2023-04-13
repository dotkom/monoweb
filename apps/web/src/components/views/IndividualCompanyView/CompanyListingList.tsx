import { Event } from "@dotkomonline/types"
import { FC } from "react"

interface CompanyListingListProps {
  events: Event[]
  isLoading: boolean
	title: string
}

export const CompanyListingList: FC<CompanyListingListProps> = (props: CompanyListingListProps) => {
  return (
    <div>
      <h2 className="border-none">{props.title}</h2>
      <ul className="mt-4 list-none">
        {/* {[...Array(10)].map((_, i: number) => (
            <li key={i.toString()} className="border-blue-7 hover:bg-blue-2 grid h-10 w-full grid-cols-[1fr_10fr_1fr] content-center border-b px-1 py-6 text-lg hover:cursor-pointer">
              <span className="text-green-11 font-bold">Sosialt</span>
              <p className="text-blue-12 text-lg">Labyrinten med Bekk!</p>
              <span className="text-end">1/10</span>
            </li>
          ))} */}
        {props.isLoading ? (
          <p>Loading...</p>
        ) : (
          props.events.map((event) => (
            <li
              key={event.id}
              className="border-blue-7 hover:bg-blue-2 grid h-10 w-full grid-cols-[1fr_10fr_1fr] content-center border-b px-1 py-6 text-lg hover:cursor-pointer"
            >
              <span className="text-green-11 font-bold">{event.type}</span>
              <p className="text-blue-12 text-lg">{event.title}</p>
              <span className="text-end">1/10</span>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
