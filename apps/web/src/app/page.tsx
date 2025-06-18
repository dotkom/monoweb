import { ArticleListItem } from "@/components/molecules/ArticleListItem"
import { EventCard } from "@/components/molecules/ComingEvent/ComingEvent"
import { CompanySplash } from "@/components/molecules/CompanySplash/CompanySplash"
import { server } from "@/utils/trpc/server"
import { Button } from "@dotkomonline/ui"
import Link from "next/link"

export default async function App() {
  const events = await server.event.all.query()
  const featuredArticles = (await server.article.featured.query()).slice(0, 6)

  return (
    <section className="w-full">
      <CompanySplash />
      <div className="flex scroll-m-20 justify-between pb-1 tracking-tight transition-colors">
        <Link href="/events" className="text-3xl font-semibold hover:underline">
          Arrangementer
        </Link>
        <Link href="/events" className="hidden sm:block">
          <Button>Flere arrangementer</Button>
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {events.map((eventDetail) => (
          <EventCard eventDetail={eventDetail} key={eventDetail.event.id} />
        ))}
      </div>
      <div className="flex scroll-m-20 justify-between pb-1 tracking-tight transition-colors mt-16">
        <Link href="/artikler" className="text-3xl font-semibold hover:underline">
          Artikler
        </Link>
        <Link href="/artikler" className="hidden sm:block">
          <Button>Flere artikler</Button>
        </Link>
      </div>
      <div className="grid gap-4 mt-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {featuredArticles.map((article) => (
          <ArticleListItem article={article} key={article.id} orientation="vertical" />
        ))}
      </div>
    </section>
  )
}
