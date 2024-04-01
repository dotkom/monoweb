import { Button, cn } from "@dotkomonline/ui"
import Link from "next/link"
import { ComponentPropsWithoutRef } from "react"
import { cookies } from "next/headers"

export default async (props: ComponentPropsWithoutRef<"div">) => {
  if (cookies().has("companysplashdismissed")) {
    return null
  }
  return (
    <div {...props} className={cn("flex justify-between pb-10", props.className)}>
      <div className="w-full">
        <h1 className="text-5xl font-semibold lg:text-6xl">
          Online,&nbsp;linjeforeningen
          <br />
          for&nbsp;Informatikk&nbsp;ved&nbsp;NTNU
        </h1>
        <p className="py-4 pr-20">
          Online er en linjeforening for Informatikkstudentene ved NTNU Gløshaugen. Informatikkstudiet hører til
          Institutt for datateknologi og informatikk (IDI). Dette innebærer blant annet å lære om utvikling, forbedring,
          evaluering og bruk av datasystemer. For mer informasjon om studiet, se NTNU sine offisielle nettsider for
          bachelor og master.
        </p>
        <Link href="/company-info">
          <Button>Bedriftskontakt</Button>
        </Link>
      </div>
      <div className="flex place-content-end">
        <img src="/online-logo.svg" alt="Logo Online Linjeforening NTNU Trondheim" className="h-80 w-80" />
      </div>
    </div>
  )
}
