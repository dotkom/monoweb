import { type Event } from "@dotkomonline/types"

export function SecondaryEvent({ event }: { event: Event }) {
  return (
    <div className="border-slate-10 mb-[18.5px] flex flex-row gap-4 rounded-lg border bg-[#FFFFFF] p-4 shadow-md">
      <div className="flex items-center justify-center">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="border-slate-10 max-h-20 rounded-lg border bg-[#FFFFFF] shadow-md"
        />
      </div>
      <div className="flex flex-col justify-start">
        <h3 className="mt-0">{event.title}</h3>
        <p>{event.description}</p>
      </div>
    </div>
  )
}
