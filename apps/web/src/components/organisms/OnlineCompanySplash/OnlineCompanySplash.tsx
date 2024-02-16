import Link from "next/link"
import React from "react"

export function OnlineCompanySplash() {
  return (
    <div className="text-accent flex h-screen flex-col bg-[#143e75] p-10 sm:h-[70vh] md:px-40">
      <div className="flex h-1/2 w-full">
        <div className="w-full sm:w-2/3 md:w-1/2">
          <h1
            className="text-3xl font-bold text-[#FAB759] sm:text-5xl md:text-6xl"
            style={{ textShadow: "3px 3px 0 #775628", lineHeight: "1.35" }}
          >
            Online,&nbsp;Linjeforeningen
            <br />
            for&nbsp;Informatikk
          </h1>
          <p className="text-xl font-semibold">
            Making curiosity a priority. It's a trademark of all learners, and we believe there is no point in doing
            anything without it.
          </p>
        </div>
      </div>
      {/* this section will occupy 2/3 of the screen from the right below the first section */}
      <div className="flex h-1/2 w-full">
        <div className="w-0 sm:w-1/3 md:w-1/2" />
        <div className="w-2/3 md:w-1/2">
          <p className="text-xl font-semibold">
            Online arbeider for å skape kontakt mellom studentene og næringslivet. Vi tilbyr bedrifter en unik mulighet
            til å komme i direkte kontakt med våre studenter.
          </p>
          <br />
          <Link href={"/company-info"} className="text-brand font-semibol my-2 rounded-lg bg-[#FAB759] p-2">
            Se hva vi tilbyr
          </Link>
        </div>
      </div>
    </div>
  )
}
