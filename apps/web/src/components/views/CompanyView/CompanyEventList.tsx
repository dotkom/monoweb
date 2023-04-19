import { Event } from "@dotkomonline/types"
import Link from "next/link"
import { FC } from "react"

interface CompanyEventListProps {
  events?: Event[]
  isLoading: boolean
  title: string
}

export const CompanyEventList: FC<CompanyEventListProps> = (props: CompanyEventListProps) => {
  return (
    <div className="w-full">
      <h2 className="border-none">{props.title}</h2>
      <ul className="mt-4 flex list-none flex-col gap-y-2">
        {props.isLoading ? (
          <p>Loading...</p>
        ) : (
          (props.events || []).map((event) => (
            <li key={event.id}>
              <Link
                href={`/events/${event.id}`}
                className="bg-blue-3 text-blue-12 hover:bg-blue-4 flex w-full cursor-pointer flex-row gap-x-2 rounded-md px-3 py-2"
              >
                <div className="flex flex-row gap-x-4">
                  <span className="text-green-11 font-bold">{event.type}</span>
                  <p>{event.title}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-end">1/10</span>
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
