import { type Event } from "@dotkomonline/types"

function formatDate(date: Date): string {
  const day = date.getDate()
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${day}. ${month} ${year}`
}

export function MainEventPane({ event }: { event: Event }) {
  const tags = ["📌Festet", "Arrangementer"]
  return (
    <div className="border-slate-10 gap-4 rounded-lg border bg-[#FFFFFF] p-4 shadow-md">
      <img src={event.imageUrl} alt={event.title} />
      <div>
        <div className="mt-3">
          {tags.map((tag) => (
            <span key={tag} className="bg-blue-11 text-gray mr-2 rounded-full px-2 py-1 text-xs dark:bg-gray-800">
              {tag}
            </span>
          ))}
        </div>
        <h2 className="mt-5">{event.title}</h2>
        <p>{formatDate(event.start)}</p>
      </div>
    </div>
  )
}
