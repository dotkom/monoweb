import { OnlineIcon } from "@/components/atoms/OnlineIcon"
import { Button, Text, Title, cn } from "@dotkomonline/ui"
import { cookies } from "next/headers"
import Link from "next/link"

export type CompanySplashProps = {
  className?: string
}

export async function CompanySplash({ className }: CompanySplashProps) {
  if ((await cookies()).has("companysplashdismissed")) {
    return null
  }
  return (
    <div className={cn("flex justify-between mb-10 border-b border-slate-6", className)}>
      <div className="w-full">
        <Title className="text-5xl tracking-tight font-semibold lg:text-6xl dark:text-white">
          Online,&nbsp;linjeforeningen
          <br />
          for&nbsp;Informatikk&nbsp;ved&nbsp;NTNU
        </Title>
        <Text className="py-4 max-w-[80ch]">
          Online er en linjeforening for Informatikkstudentene ved NTNU Gløshaugen. Informatikkstudiet hører til
          Institutt for datateknologi og informatikk (IDI). Dette innebærer blant annet å lære om utvikling, forbedring,
          evaluering og bruk av datasystemer. For mer informasjon om studiet, se NTNU sine offisielle nettsider for
          bachelor og master.
        </Text>
        <Link href="https://interesse.online.ntnu.no">
          <Button>Bedriftskontakt</Button>
        </Link>
      </div>
      <div className="flex place-content-end">
        <OnlineIcon size={80} className="size-80" />
      </div>
    </div>
  )
}
